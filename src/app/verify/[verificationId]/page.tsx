"use client";

import React, { useEffect, useState } from "react";
import { getCertificateByVerificationId } from "@/services/validationService";
import { Certificate } from "@/types/validation";
import { CheckCircle, Search, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";

interface PageProps {
  params: Promise<{ verificationId: string }>;
}

export default function VerifyCertificatePage({ params }: PageProps) {
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationId, setVerificationId] = useState("");

  useEffect(() => {
    params.then((p) => {
      setVerificationId(p.verificationId);
      getCertificateByVerificationId(p.verificationId)
        .then((data) => {
          setCert(data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    });
  }, [params]);

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Public Certificate Verification</h1>
            <p className="text-slate-400 mt-2">Verify the authenticity of a SkillSwap certificate.</p>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Search className="w-10 h-10 text-violet-400 animate-pulse mb-4" />
                <p className="text-slate-400 font-medium">Verifying record...</p>
              </div>
            ) : cert ? (
              <div className="space-y-8 relative z-10">
                <div className="flex flex-col items-center text-center pb-8 border-b border-white/10">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-400">Verified Certificate</h2>
                  <p className="text-slate-300 mt-2 font-mono text-sm bg-slate-950/50 px-4 py-1.5 rounded-full border border-white/5">
                    ID: {cert.verificationId}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Student</p>
                    <p className="text-lg font-bold text-white mt-1">{cert.studentName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Mentor</p>
                    <p className="text-lg font-bold text-white mt-1">{cert.mentorName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Skill</p>
                    <p className="text-base font-bold text-emerald-400 mt-1">{cert.skill}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Completed On</p>
                    <p className="text-base text-slate-200 mt-1">
                      {cert.completionDate?.toDate ? cert.completionDate.toDate().toLocaleDateString() : (cert.issuedAt?.toDate ? cert.issuedAt.toDate().toLocaleDateString() : new Date().toLocaleDateString())}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Score</p>
                    <p className="text-base text-slate-200 mt-1">{cert.score.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Level</p>
                    <p className={`text-base font-bold mt-1 ${cert.level === 'Gold' ? 'text-yellow-400' : cert.level === 'Silver' ? 'text-slate-300' : 'text-amber-600'}`}>
                      {cert.level}
                    </p>
                  </div>
                </div>

                <div className="pt-6 flex justify-center">
                  <a
                    href={cert.certificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold shadow-md shadow-violet-500/20 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" /> View Original Certificate
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 relative z-10">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Record Not Found</h3>
                <p className="text-slate-400 mt-2">We couldn&apos;t find a certificate matching this Verification ID.</p>
                <p className="text-slate-500 font-mono text-xs mt-4 bg-slate-950/50 inline-block px-3 py-1 rounded">
                  {verificationId}
                </p>
              </div>
            )}
            
            {/* Background Decor */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
