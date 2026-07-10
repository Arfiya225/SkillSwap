import { NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { uploadFileAdmin } from "@/services/serverStorage";
import { createNotification } from "@/services/notifications";

export async function POST(request: Request) {
  try {
    const { roomId, studentId, mentorId, skill, score, level } = await request.json();

    if (!roomId || !studentId || !mentorId || !skill || score === undefined || !level) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. ELIGIBILITY VALIDATION
    if (score < 70) {
      return NextResponse.json({ error: "Score is below passing threshold" }, { status: 400 });
    }
    
    const tSnap = await getDocs(collection(db, "learningTopics"));
    const incompleteTopics = tSnap.docs.filter(d => 
      d.data().roomId === roomId &&
      (!d.data().learnerId || d.data().learnerId === studentId) &&
      d.data().status !== "completed"
    );
    
    if (incompleteTopics.length > 0) {
      return NextResponse.json({ error: "Not all learning topics are completed" }, { status: 400 });
    }

    // Fetch user names for immutability
    const studentDoc = await getDoc(doc(db, "Users", studentId));
    const mentorDoc = await getDoc(doc(db, "Users", mentorId));
    
    const studentName = studentDoc.exists() ? (studentDoc.data().name || studentDoc.data().displayName || "Student") : "Student";
    const mentorName = mentorDoc.exists() ? (mentorDoc.data().name || mentorDoc.data().displayName || "Mentor") : "Mentor";

    const verificationId = crypto.randomUUID();
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/${verificationId}`;

    // Generate QR Code as Data URI
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 100 });

    // Generate PDF using jsPDF
    const docPdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [800, 600]
    });

    // Background Color
    docPdf.setFillColor(15, 23, 42); // slate-900
    docPdf.rect(0, 0, 800, 600, "F");

    // Decorative Borders
    docPdf.setDrawColor(139, 92, 246); // violet-500
    docPdf.setLineWidth(4);
    docPdf.rect(20, 20, 760, 560);
    
    docPdf.setDrawColor(234, 179, 8); // yellow-500
    docPdf.setLineWidth(1);
    docPdf.rect(25, 25, 750, 550);

    // Title
    docPdf.setTextColor(255, 255, 255);
    docPdf.setFontSize(40);
    docPdf.text("Certificate of Completion", 400, 120, { align: "center" });

    // Subtitle
    docPdf.setFontSize(16);
    docPdf.setTextColor(148, 163, 184); // slate-400
    docPdf.text("This certifies that", 400, 160, { align: "center" });
    
    // Student Name
    docPdf.setFontSize(32);
    docPdf.setTextColor(255, 255, 255);
    docPdf.text(studentName, 400, 200, { align: "center" });
    
    docPdf.setFontSize(16);
    docPdf.setTextColor(148, 163, 184); // slate-400
    docPdf.text(`has successfully demonstrated mastery in`, 400, 230, { align: "center" });

    // Skill
    docPdf.setFontSize(28);
    docPdf.setTextColor(52, 211, 153); // emerald-400
    docPdf.text(skill, 400, 270, { align: "center" });

    // Score & Level
    docPdf.setFontSize(18);
    docPdf.setTextColor(248, 250, 252);
    docPdf.text(`Score: ${score.toFixed(0)}%  |  Level: ${level}`, 400, 320, { align: "center" });
    
    // Mentor Name
    docPdf.setFontSize(14);
    docPdf.setTextColor(148, 163, 184);
    docPdf.text(`Mentored by: ${mentorName}`, 400, 350, { align: "center" });

    // QR Code
    docPdf.addImage(qrDataUrl, "PNG", 350, 400, 100, 100);

    // Verification ID text
    docPdf.setFontSize(10);
    docPdf.setTextColor(100, 116, 139);
    docPdf.text(`Verification ID: ${verificationId}`, 400, 530, { align: "center" });

    // Convert PDF to ArrayBuffer and wrap in a File object
    const pdfArrayBuffer = docPdf.output("arraybuffer");
    const file = new File([pdfArrayBuffer], `${verificationId}.pdf`, { type: "application/pdf" });

    // Upload to Supabase Storage in the existing 'resources' bucket
    const certificateUrl = await uploadFileAdmin("resources", `certificates/${verificationId}.pdf`, file);

    // Save to Firestore
    const certRef = collection(db, "certificates");
    await addDoc(certRef, {
      roomId,
      studentId,
      studentName,
      mentorId,
      mentorName,
      skill,
      score,
      level,
      completionDate: serverTimestamp(),
      verificationId,
      verificationUrl: verifyUrl,
      certificateUrl,
      issuedAt: serverTimestamp()
    });

    // Mark certificateIssued = true in LearningRoom exchangeSkills
    try {
      const roomRef = doc(db, "learningRooms", roomId);
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        const roomData = roomSnap.data();
        if (roomData.exchangeSkills && roomData.exchangeSkills[studentId]) {
          await updateDoc(roomRef, {
            [`exchangeSkills.${studentId}.certificateIssued`]: true
          });
        }
      }
    } catch (updateErr) {
      console.error("Failed to update certificateIssued status:", updateErr);
    }

    try {
      await createNotification(
        studentId,
        "Certificate Issued",
        `Your certificate for ${skill} has been generated!`,
        "certificate_issued",
        `/profile`
      );
    } catch (notifyErr) {
      console.error("Failed to send certificate_issued notification:", notifyErr);
    }

    return NextResponse.json({ success: true, certificateUrl, verificationId });
  } catch (error: any) {
    console.error("Certificate generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
