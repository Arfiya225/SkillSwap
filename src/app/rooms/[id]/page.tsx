"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { getLearningRoom } from "@/services/room";
import { LearningRoomWithDetails } from "@/types/room";
import { Resource, ResourceType } from "@/types/resource";
import { Task } from "@/types/task";
import { Activity as ActivityType } from "@/types/activity";

// New Types
import { Meeting } from "@/types/meeting";
import { StudyPlan } from "@/types/studyPlan";
import { SessionSummary } from "@/types/sessionSummary";

// Reusable components
import { NotesEditor } from "@/components/ui/NotesEditor";
import { ResourceCard } from "@/components/ui/ResourceCard";
import { TaskCard } from "@/components/ui/TaskCard";
import { ProgressWidget } from "@/components/ui/ProgressWidget";
import { ActivityFeed } from "@/components/ui/ActivityFeed";

// New UI Components
import { MeetingCard } from "@/components/ui/MeetingCard";
import { MeetingScheduler } from "@/components/ui/MeetingScheduler";
import { StudyPlanCard } from "@/components/ui/StudyPlanCard";
import { SessionSummaryCard } from "@/components/ui/SessionSummaryCard";
import { ChatPanel } from "@/components/ui/ChatPanel";
import { WhiteboardContainer } from "@/features/whiteboard/components/WhiteboardContainer";
import { LearningRoadmap } from "@/features/validation/components/LearningRoadmap";
import { AssessmentGenerator } from "@/features/validation/components/AssessmentGenerator";
import { AssessmentCard } from "@/features/validation/components/AssessmentCard";
import { FinalExamCard } from "@/features/validation/components/FinalExamCard";
import { PeerValidationCard } from "@/features/validation/components/PeerValidationCard";
import { CertificateCard } from "@/features/validation/components/CertificateCard";


// Collaboration Services
import {
  subscribeToResources,
  addResource,
  deleteResource,
  uploadResourceFile,
  subscribeToTasks,
  createTask,
  updateTask,
  deleteTask,
  subscribeToActivities,
  logActivity,
} from "@/services/collaboration";

// New Services
import {
  subscribeToMeetings,
  scheduleMeeting,
  cancelMeeting,
} from "@/services/meetings";
import {
  subscribeToStudyPlan,
  generateStudyPlan,
} from "@/services/study-plans";
import {
  subscribeToSessionSummaries,
  generateSessionSummary,
} from "@/services/session-summary";
import {
  subscribeToTopics,
  subscribeToAssessments,
  subscribeToSubmissions,
  subscribeToFinalAssessments,
  subscribeToPeerValidations,
  subscribeToCertificates,
} from "@/services/validationService";
import { completeRoom, archiveRoom, softDeleteRoom, restoreRoom } from "@/services/lifecycle";
import { LearningTopic, Assessment, AssessmentSubmission, FinalAssessment, PeerValidation, Certificate } from "@/types/validation";


import {
  BookOpen,
  Calendar,
  Users,
  FileText,
  Paperclip,
  CheckSquare,
  ArrowLeft,
  Lock,
  ArrowRightLeft,
  Plus,
  Link as LinkIcon,
  Activity,
  ListFilter,
  TrendingUp,
  User,
  X,
  Video,
  Sparkles,
  Map,
  MessageSquare,
  PenTool,
  GraduationCap,
  Award,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { EmptyState } from "@/components/ui/EmptyState";

interface PageProps {
  params: Promise<{ id: string }>;
}

type RoomTab = "overview" | "chat" | "notes" | "resources" | "tasks" | "progress" | "activity" | "meetings" | "study-plan" | "summaries" | "whiteboard" | "roadmap" | "assessments" | "final-exam" | "certificates";

export default function RoomPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center gap-3">
          <BookOpen className="w-10 h-10 text-violet-400 animate-bounce" />
          <p className="text-xs text-slate-400 animate-pulse font-medium">Entering Learning Room...</p>
        </div>
      }
    >
      <RoomWorkspace params={params} />
    </Suspense>
  );
}

function RoomWorkspace({ params }: PageProps) {
  const { user, dbUser } = useAuth();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [roomId, setRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<LearningRoomWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Persistent Active Tab logic
  const activeTab = (searchParams.get("tab") || "overview") as RoomTab;
  const setActiveTab = (tab: RoomTab) => {
    router.push(`${pathname}?tab=${tab}`);
  };

  // Realtime lists state
  const [resources, setResources] = useState<Resource[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);

  // New Realtime lists states
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [summaries, setSummaries] = useState<SessionSummary[]>([]);

  // Validation States
  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<AssessmentSubmission[]>([]);
  const [finalAssessments, setFinalAssessments] = useState<FinalAssessment[]>([]);
  const [peerValidations, setPeerValidations] = useState<PeerValidation[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  
  const [generatingAssessment, setGeneratingAssessment] = useState(false);
  const [evaluatingAssessment, setEvaluatingAssessment] = useState(false);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);

  // Lifecycle States
  const [isCompleting, setIsCompleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);


  // Meetings scheduler overlay state
  const [isMeetingSchedulerOpen, setIsMeetingSchedulerOpen] = useState(false);

  // AI Generation state
  const [generatingStudyPlan, setGeneratingStudyPlan] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [geminiKeyMissing, setGeminiKeyMissing] = useState(false);

  // Local Form states (Create Task & Resource)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);

  const [isResourceFormOpen, setIsResourceFormOpen] = useState(false);
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceType, setResourceType] = useState<ResourceType>("link");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [creatingResource, setCreatingResource] = useState(false);

  // Filters
  const [taskFilterStatus, setTaskFilterStatus] = useState<string>("all");

  // Check if GEMINI_API_KEY is missing on mount
  useEffect(() => {
    async function checkApiKey() {
      try {
        const res = await fetch("/api/study-plan");
        if (res.ok) {
          const data = await res.json();
          setGeminiKeyMissing(!data.keyConfigured);
        }
      } catch (err) {
        console.error("Error checking Gemini API key config:", err);
      }
    }
    checkApiKey();
  }, []);

  // 1. Resolve room ID parameter
  useEffect(() => {
    params.then((p) => {
      setRoomId(p.id);
    });
  }, [params]);

  // 2. Fetch room metadata
  useEffect(() => {
    if (!roomId || !user) return;
    const currentUser = user;

    async function loadRoom() {
      try {
        setLoading(true);
        const data = await getLearningRoom(roomId as string);
        if (data) {
          if (!data.participants.includes(currentUser.uid)) {
            toast.error("Access denied: You are not a participant in this room");
            setRoom(null);
          } else {
            setRoom(data);
            // Default task assignee to the current user
            setTaskAssignedTo(currentUser.uid);
          }
        } else {
          toast.error("Learning room not found");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading learning room");
      } finally {
        setLoading(false);
      }
    }

    loadRoom();
  }, [roomId, user]);

  // 3. Realtime subcollection subscriptions
  useEffect(() => {
    if (!roomId || !room || !user) return;

    const unsubResources = subscribeToResources(roomId, (data) => {
      setResources(data);
    });

    const unsubTasks = subscribeToTasks(roomId, (data) => {
      setTasks(data);
    });

    const unsubActivities = subscribeToActivities(roomId, (data) => {
      setActivities(data);
    });

    const unsubMeetings = subscribeToMeetings(roomId, (data) => {
      setMeetings(data);
    });

    const unsubStudyPlan = subscribeToStudyPlan(roomId, (data) => {
      setStudyPlan(data);
    });

    const unsubSummaries = subscribeToSessionSummaries(roomId, (data) => {
      setSummaries(data);
    });
    
    const unsubTopics = subscribeToTopics(roomId, setTopics);
    const unsubAssessments = subscribeToAssessments(roomId, setAssessments);
    const unsubSubmissions = subscribeToSubmissions(roomId, user.uid, setSubmissions);
    const unsubFinals = subscribeToFinalAssessments(roomId, setFinalAssessments);
    const unsubPeers = subscribeToPeerValidations(roomId, setPeerValidations);
    const unsubCerts = subscribeToCertificates(roomId, setCertificates);

    return () => {
      unsubResources();
      unsubTasks();
      unsubActivities();
      unsubMeetings();
      unsubStudyPlan();
      unsubSummaries();
      unsubTopics();
      unsubAssessments();
      unsubSubmissions();
      unsubFinals();
      unsubPeers();
      unsubCerts();
    };
  }, [roomId, room, user]);

  // ==========================================
  // LIFECYCLE OPERATIONS
  // ==========================================
  const handleCompleteRoom = async () => {
    if (!roomId || !user || !room) return;
    if (room.status === "completed" || room.status === "archived") return;
    if (!confirm("Are you sure you want to mark this learning room as complete?")) return;
    setIsCompleting(true);
    try {
      const isFullyComplete = await completeRoom(roomId, user.uid);
      if (isFullyComplete) {
        toast.success("Room marked as completed!");
      } else {
        toast.success("You marked the room as complete. Waiting for your partner to confirm.");
      }
      const data = await getLearningRoom(roomId);
      setRoom(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete room");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleArchiveRoom = async () => {
    if (!roomId || !user) return;
    if (!confirm("Are you sure you want to archive this room? It will become read-only.")) return;
    setIsArchiving(true);
    try {
      await archiveRoom(roomId);
      toast.success("Room archived");
      const data = await getLearningRoom(roomId);
      setRoom(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to archive room");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleRestoreRoom = async () => {
    if (!roomId || !user) return;
    if (!confirm("Restore this archived learning room?")) return;
    setIsRestoring(true);
    try {
      await restoreRoom(roomId);
      toast.success("Room restored successfully");
      const data = await getLearningRoom(roomId);
      setRoom(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to restore room");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomId || !user) return;
    if (!confirm("Are you sure you want to delete this room? This action cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await softDeleteRoom(roomId, user.uid);
      toast.success("Room deleted");
      router.push("/dashboard/rooms");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete room");
      setIsDeleting(false);
    }
  };

  // ==========================================
  // COLLABORATIVE FLOW ACTIONS
  // ==========================================

  // --- Task Operations ---
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !user || !dbUser) return;
    if (!taskTitle.trim()) {
      toast.error("Task title is required");
      return;
    }

    setCreatingTask(true);
    try {
      const assignedName = room?.participantProfiles?.[taskAssignedTo]?.name || "Participant";
      await createTask(
        roomId,
        taskTitle,
        taskDesc,
        taskAssignedTo,
        assignedName,
        user.uid,
        dbUser.name,
        taskDueDate
      );

      await logActivity(
        roomId,
        "task_created",
        user.uid,
        dbUser.name,
        `created task: "${taskTitle.trim()}" (assigned to ${assignedName})`,
        dbUser.avatar
      );

      toast.success("Task created!");
      setTaskTitle("");
      setTaskDesc("");
      setTaskDueDate("");
      setIsTaskFormOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create task");
    } finally {
      setCreatingTask(false);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!roomId || !user || !dbUser) return;
    try {
      await updateTask(roomId, taskId, updates);
      
      const taskObj = tasks.find((t) => t.id === taskId);
      const title = updates.title || taskObj?.title || "Task";

      if (updates.status) {
        if (updates.status === "completed") {
          await logActivity(
            roomId,
            "task_completed",
            user.uid,
            dbUser.name,
            `completed task: "${title}"`,
            dbUser.avatar
          );
        } else {
          const statusLabel = updates.status === "in_progress" ? "In Progress" : "To Do";
          await logActivity(
            roomId,
            "task_updated",
            user.uid,
            dbUser.name,
            `marked task "${title}" as ${statusLabel}`,
            dbUser.avatar
          );
        }
      } else {
        await logActivity(
          roomId,
          "task_updated",
          user.uid,
          dbUser.name,
          `updated details for task: "${title}"`,
          dbUser.avatar
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!roomId || !user || !dbUser) return;
    try {
      const taskObj = tasks.find((t) => t.id === taskId);
      const title = taskObj?.title || "Task";
      
      await deleteTask(roomId, taskId);

      await logActivity(
        roomId,
        "task_updated",
        user.uid,
        dbUser.name,
        `deleted task: "${title}"`,
        dbUser.avatar
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete task");
    }
  };

  // --- Resource Operations ---
  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !user || !dbUser) return;
    if (!resourceTitle.trim()) {
      toast.error("Resource title is required");
      return;
    }

    setCreatingResource(true);
    const toastId = toast.loading("Adding resource...");
    try {
      let finalUrl = resourceUrl;

      // Handle raw file uploads if needed
      if ((resourceType === "pdf" || resourceType === "document") && resourceFile) {
        finalUrl = await uploadResourceFile(roomId, resourceFile);
      }

      if (!finalUrl.trim()) {
        throw new Error("A valid URL or uploaded file is required");
      }

      await addResource(roomId, resourceTitle, resourceType, finalUrl, user.uid, dbUser.name);

      await logActivity(
        roomId,
        "resource_uploaded",
        user.uid,
        dbUser.name,
        `shared a resource: "${resourceTitle.trim()}" (${resourceType})`,
        dbUser.avatar
      );

      toast.success("Resource shared!", { id: toastId });
      setResourceTitle("");
      setResourceUrl("");
      setResourceFile(null);
      setIsResourceFormOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to share resource", { id: toastId });
    } finally {
      setCreatingResource(false);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!roomId || !user || !dbUser) return;
    try {
      const resObj = resources.find((r) => r.id === resourceId);
      const title = resObj?.title || "Resource";
      
      await deleteResource(roomId, resourceId);

      await logActivity(
        roomId,
        "resource_deleted",
        user.uid,
        dbUser.name,
        `removed shared resource: "${title}"`,
        dbUser.avatar
      );

      toast.success("Resource removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove resource");
    }
  };

  // ==========================================
  // RENDER DYNAMIC SEGMENTS
  // ==========================================

  const dateFormatted = room?.createdAt?.toDate
    ? room.createdAt.toDate().toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center gap-3">
        <BookOpen className="w-10 h-10 text-violet-400 animate-bounce" />
        <p className="text-xs text-slate-400 animate-pulse font-medium">Entering Learning Room...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#0F172A] flex flex-col">
          <Navbar />
          <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Access Denied or Room Not Found</h2>
            <p className="text-sm text-slate-400 max-w-sm mb-6">
              You do not have access to this room, or the swap request is not accepted yet.
            </p>
            <Link href="/dashboard/requests">
              <GradientButton variant="primary">Back to Requests</GradientButton>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Filter tasks based on selected status filter
  const filteredTasks = tasks.filter((t) => {
    if (taskFilterStatus === "all") return true;
    return t.status === taskFilterStatus;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0F172A] flex flex-col">
        <Navbar />

        {/* Room Top Ribbon Info */}
        <div className="bg-slate-950/40 border-b border-white/5 py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/requests"
                className="p-2 bg-slate-900/60 border border-white/5 hover:border-slate-800 rounded-xl hover:text-slate-100 transition-all text-slate-400 cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Active Swap Space
                </span>
                <h1 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2 mt-1">
                  <span>Room:</span>
                  <span className="text-slate-300 font-mono text-xs select-all bg-slate-900 px-2 py-0.5 rounded border border-white/5">
                    {roomId}
                  </span>
                </h1>
              </div>
            </div>

            {/* Swap Skills Ribbon */}
            {room.swapRequestDetails && !room.exchangeSkills && (
              <div className="flex items-center gap-3 bg-slate-900/65 border border-white/5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold max-w-md">
                <span className="text-emerald-400 truncate max-w-[120px]">
                  {room.swapRequestDetails.offeredSkill}
                </span>
                <ArrowRightLeft className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span className="text-pink-400 truncate max-w-[120px]">
                  {room.swapRequestDetails.requestedSkill}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="bg-slate-950/20 border-b border-white/5 py-1 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {([
              { id: "overview", label: "Overview", icon: BookOpen },
              { id: "chat", label: "Chat", icon: MessageSquare },
              { id: "meetings", label: "Meetings", icon: Video },
              { id: "study-plan", label: "AI Study Path", icon: Map },
              { id: "summaries", label: "AI Summaries", icon: Sparkles },
              { id: "whiteboard", label: "Whiteboard", icon: PenTool },
              { id: "roadmap", label: "Roadmap", icon: Map },
              { id: "assessments", label: "Assessments", icon: ClipboardList },
              { id: "final-exam", label: "Final Exam", icon: Award },
              { id: "certificates", label: "Certificates", icon: GraduationCap },
              { id: "notes", label: "Shared Notes", icon: FileText },
              { id: "resources", label: "Resources", icon: Paperclip },
              { id: "tasks", label: "Tasks", icon: CheckSquare },
              { id: "progress", label: "Progress", icon: TrendingUp },
              { id: "activity", label: "Activity Logs", icon: Activity },
            ] as const).map((tab) => {
              const IconComp = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "border-violet-500 text-violet-300 bg-violet-500/5"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Panels Body */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* =================================================== */}
          {/* 1. OVERVIEW TAB */}
          {/* =================================================== */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Left Details */}
              <div className="lg:col-span-1 space-y-6">
                <GlassCard className="border border-white/5">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-violet-400" />
                    <span>Room Specifications</span>
                  </h3>
                  <div className="space-y-3.5 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-slate-900/80">
                      <span className="text-slate-500 text-xs font-bold uppercase">Created On</span>
                      <span className="text-slate-300 font-semibold">{dateFormatted}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-900/80">
                      <span className="text-slate-500 text-xs font-bold uppercase">Access Level</span>
                      <span className="text-slate-300 font-semibold flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-violet-400" /> Private Room
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-900/80">
                      <span className="text-slate-500 text-xs font-bold uppercase">Status</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${
                        room.status === "completed" ? "bg-amber-500/10 text-amber-300 border-amber-500/20" :
                        room.status === "archived" ? "bg-slate-500/10 text-slate-300 border-slate-500/20" :
                        room.status === "deleted" ? "bg-red-500/10 text-red-300 border-red-500/20" :
                        "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      }`}>
                        {room.status === "completed" ? "🏆 Completed" :
                         room.status === "archived" ? "📦 Archived" :
                         room.status === "deleted" ? "🗑 Deleted" :
                         "🟢 Active"}
                      </span>
                    </div>
                  </div>
                </GlassCard>

                {/* Room Settings */}
                <GlassCard className="border border-white/5">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-emerald-400" />
                    <span>Room Settings</span>
                  </h3>
                  <div className="space-y-3">
                    <GradientButton 
                      onClick={handleCompleteRoom}
                      loading={isCompleting}
                      disabled={room.status === "archived" || room.status === "deleted" || (user ? room.completionStatus?.[user.uid] : false)}
                      className="w-full text-xs py-2"
                      variant="primary"
                    >
                      {room.status === "completed" ? "Course Completed" : (user && room.completionStatus?.[user.uid]) ? "Waiting for Partner..." : "Mark Learning Complete"}
                    </GradientButton>

                    {room.status === "archived" ? (
                      <GradientButton 
                        onClick={handleRestoreRoom}
                        loading={isRestoring}
                        disabled={false}
                        className="w-full text-xs py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/30"
                        variant="secondary"
                      >
                        Restore Room
                      </GradientButton>
                    ) : (
                      <GradientButton 
                        onClick={handleArchiveRoom}
                        loading={isArchiving}
                        disabled={room.status === "deleted" || room.status === "completed"}
                        className="w-full text-xs py-2 bg-slate-800 text-slate-300 hover:bg-slate-700"
                        variant="secondary"
                      >
                        Archive Room
                      </GradientButton>
                    )}

                    <GradientButton 
                      onClick={handleDeleteRoom}
                      loading={isDeleting}
                      disabled={room.status === "deleted"}
                      className="w-full text-xs py-2 border-red-500/20 text-red-400 hover:bg-red-500/10"
                      variant="secondary"
                    >
                      Delete Room
                    </GradientButton>
                  </div>
                </GlassCard>

                {/* Participant Details */}
                <GlassCard className="border border-white/5">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>Workspace Partners</span>
                  </h3>
                  <div className="space-y-4">
                    {room.participants.map((uid) => {
                      const profile = room.participantProfiles?.[uid];
                      const isSelf = uid === user?.uid;
                      return (
                        <div key={uid} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/40 border border-white/5">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center shrink-0">
                            {profile?.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-slate-600" />
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                              <span className="truncate">{profile?.name || "Participant"}</span>
                              {isSelf && (
                                <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-normal">
                                  You
                                </span>
                              )}
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate">{profile?.email}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              </div>

              {/* Center Overview & Recents */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Completion Summary Card */}
                {room.status === "completed" && (
                  <GlassCard className="border border-amber-500/30 bg-amber-950/20 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                        <Award className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-amber-400">🎉 Learning Exchange Completed</h3>
                        <p className="text-xs text-amber-200/60">
                          {room.completedAt?.toDate?.()?.toLocaleDateString() || "Recently completed"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                       <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
                         <span className="block text-slate-500 mb-1">Topics Mastered</span>
                         <span className="font-bold text-slate-200">{room.stats?.topicsCompleted || topics.filter(t => t.status === "completed").length}</span>
                       </div>
                       <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
                         <span className="block text-slate-500 mb-1">Certificates Earned</span>
                         <span className="font-bold text-slate-200">{room.stats?.certificatesIssued || certificates.length}</span>
                       </div>
                    </div>
                  </GlassCard>
                )}
                
                {/* Two-Way Learning Path Widget */}
                {room.exchangeSkills && user ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <GlassCard className="border border-emerald-500/20 bg-emerald-950/10">
                      <h3 className="text-xs font-bold uppercase text-emerald-400 tracking-wider mb-4 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>My Learning Path</span>
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-xs">Learning:</span>
                          <span className="text-emerald-300 font-bold text-sm">{room.exchangeSkills[user.uid]?.learnsSkill}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-xs">Progress:</span>
                          <span className="text-slate-200 text-sm">{room.exchangeSkills[user.uid]?.progress || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-xs">Mentor:</span>
                          <span className="text-slate-200 text-sm">
                            {room.participantProfiles?.[room.participants.find(p => p !== user.uid) || ""]?.name || "Participant"}
                          </span>
                        </div>
                      </div>
                    </GlassCard>
                    <GlassCard className="border border-violet-500/20 bg-violet-950/10">
                      <h3 className="text-xs font-bold uppercase text-violet-400 tracking-wider mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>My Teaching Path</span>
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-xs">Teaching:</span>
                          <span className="text-violet-300 font-bold text-sm">{room.exchangeSkills[user.uid]?.teachesSkill}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-xs">Student:</span>
                          <span className="text-slate-200 text-sm">
                            {room.participantProfiles?.[room.participants.find(p => p !== user.uid) || ""]?.name || "Participant"}
                          </span>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                ) : null}

                {/* Visual completion card */}
                <ProgressWidget tasks={tasks} />

                {/* Recent Activities preview card */}
                <GlassCard className="border border-white/5">
                  <div className="flex justify-between items-center border-b border-slate-900/80 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>Recent Workspace Logs</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab("activity")}
                      className="text-xs text-violet-400 hover:text-violet-300 font-bold transition-all cursor-pointer"
                    >
                      View All Logs
                    </button>
                  </div>
                  <ActivityFeed activities={activities.slice(0, 3)} />
                </GlassCard>

              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* 1.5 CHAT TAB */}
          {/* =================================================== */}
          {activeTab === "chat" && user && dbUser && (
            <ChatPanel 
              roomId={room.roomId}
              currentUserId={user.uid}
              currentUserName={dbUser.name}
              otherParticipants={room.participants.filter(p => p !== user.uid)}
              disabled={room.status === "archived" || room.status === "deleted"}
            />
          )}

          {/* =================================================== */}
          {/* 2. SHARED NOTES TAB */}
          {/* =================================================== */}
          {activeTab === "notes" && (
            <GlassCard className="border border-white/5 shadow-xl">
              <NotesEditor roomId={room.roomId} />
            </GlassCard>
          )}

          {/* =================================================== */}
          {/* 3. RESOURCES TAB */}
          {/* =================================================== */}
          {activeTab === "resources" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Learning Materials & Links</h3>
                  <p className="text-xs text-slate-400">Share references, code repositories, or reference guides.</p>
                </div>

                {!((room.status === "archived") || (room.status === "deleted")) && (
                  <GradientButton onClick={() => setIsResourceFormOpen(!isResourceFormOpen)} className="text-xs py-2 px-3.5">
                    {isResourceFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{isResourceFormOpen ? "Close panel" : "Add Resource"}</span>
                  </GradientButton>
                )}
              </div>

              {/* Resource creation panel Form */}
              {isResourceFormOpen && (
                <GlassCard className="border border-white/10 bg-slate-950/20 max-w-xl animate-in fade-in slide-in-from-top-4 duration-200">
                  <form onSubmit={handleAddResource} className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Share a new study resource</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Next.js Best Practices PDF"
                          value={resourceTitle}
                          onChange={(e) => setResourceTitle(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input font-medium"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Type</label>
                        <select
                          value={resourceType}
                          onChange={(e) => {
                            setResourceType(e.target.value as ResourceType);
                            setResourceUrl("");
                            setResourceFile(null);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input font-medium bg-slate-900"
                        >
                          <option value="link">Web Link</option>
                          <option value="github">GitHub Project</option>
                          <option value="pdf">PDF File</option>
                          <option value="document">Doc / Reference file</option>
                        </select>
                      </div>
                    </div>

                    {/* URL link inputs */}
                    {resourceType === "link" || resourceType === "github" ? (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Reference URL</label>
                        <div className="relative">
                          <LinkIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            placeholder={resourceType === "github" ? "github.com/username/project" : "example.com/guide"}
                            value={resourceUrl}
                            onChange={(e) => setResourceUrl(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input font-medium"
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      /* File upload inputs */
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Upload file (Max 2MB)</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept={resourceType === "pdf" ? ".pdf,application/pdf" : ".doc,.docx,.txt,.md,.pdf"}
                            onChange={(e) => {
                              const f = e.target.files?.[0] || null;
                              if (f && f.size > 2 * 1024 * 1024) {
                                toast.error("File exceeds 2MB limit!");
                                setResourceFile(null);
                              } else {
                                setResourceFile(f);
                                if (f && !resourceTitle.trim()) {
                                  // Auto-fill title with file name
                                  setResourceTitle(f.name.substring(0, f.name.lastIndexOf(".")) || f.name);
                                }
                              }
                            }}
                            className="text-xs text-slate-400 file:bg-slate-800 file:hover:bg-slate-700 file:border-0 file:px-3 file:py-1.5 file:rounded-lg file:text-xs file:font-semibold file:text-slate-200 cursor-pointer"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-900">
                      <GradientButton
                        type="submit"
                        loading={creatingResource}
                        className="text-xs py-1.5 px-4 font-bold"
                      >
                        {creatingResource ? "Sharing..." : "Add Resource"}
                      </GradientButton>
                    </div>
                  </form>
                </GlassCard>
              )}

              {/* Grid lists */}
              {resources.length === 0 ? (
                <div className="py-12 border border-white/5 bg-slate-950/20 rounded-2xl">
                  <EmptyState
                    icon={Paperclip}
                    title="No shared resources"
                    description="You haven't uploaded any documents or URLs yet. Add links or files above to make materials available to your swap partner."
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map((res) => (
                    <ResourceCard key={res.id} resource={res} onDelete={handleDeleteResource} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =================================================== */}
          {/* 4. TASKS TAB */}
          {/* =================================================== */}
          {activeTab === "tasks" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Learning Roadmap Tasks</h3>
                  <p className="text-xs text-slate-400">Map out study assignments, tracks, and verify achievements.</p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Filter Select */}
                  <div className="flex items-center gap-2 bg-slate-950/45 px-3 py-1.5 rounded-xl border border-white/5 text-xs text-slate-400">
                    <ListFilter className="w-3.5 h-3.5 text-slate-500" />
                    <select
                      value={taskFilterStatus}
                      onChange={(e) => setTaskFilterStatus(e.target.value)}
                      className="bg-transparent text-slate-300 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Tasks</option>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {!((room.status === "archived") || (room.status === "deleted")) && (
                    <GradientButton onClick={() => setIsTaskFormOpen(!isTaskFormOpen)} className="text-xs py-2 px-3.5">
                      {isTaskFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{isTaskFormOpen ? "Close panel" : "Create Task"}</span>
                    </GradientButton>
                  )}
                </div>
              </div>

              {/* Task Creation Form panel */}
              {isTaskFormOpen && (
                <GlassCard className="border border-white/10 bg-slate-950/20 max-w-xl animate-in fade-in slide-in-from-top-4 duration-200">
                  <form onSubmit={handleCreateTask} className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Create a new roadmap task</h4>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Implement React useFetch hook"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl glass-input font-medium"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Description</label>
                      <textarea
                        placeholder="Describe the tasks specifics, practice parameters, or reading sections..."
                        value={taskDesc}
                        onChange={(e) => setTaskDesc(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl glass-input font-medium resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Assignee</label>
                        <select
                          value={taskAssignedTo}
                          onChange={(e) => setTaskAssignedTo(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input font-medium bg-slate-900"
                        >
                          {room.participants.map((uid) => (
                            <option key={uid} value={uid}>
                              {room.participantProfiles?.[uid]?.name || "Participant"} {uid === user?.uid ? "(You)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Due Date</label>
                        <input
                          type="date"
                          value={taskDueDate}
                          onChange={(e) => setTaskDueDate(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input font-medium bg-slate-900"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-900">
                      <GradientButton
                        type="submit"
                        loading={creatingTask}
                        className="text-xs py-1.5 px-4 font-bold"
                      >
                        {creatingTask ? "Creating..." : "Add Task"}
                      </GradientButton>
                    </div>
                  </form>
                </GlassCard>
              )}

              {/* Grid cards */}
              {filteredTasks.length === 0 ? (
                <div className="py-12 border border-white/5 bg-slate-950/20 rounded-2xl">
                  <EmptyState
                    icon={CheckSquare}
                    title="No tasks found"
                    description={
                      taskFilterStatus !== "all"
                        ? `No tasks match the filter status "${taskFilterStatus}".`
                        : "You haven't setup any roadmap tasks. Establish milestones together to track progress!"
                    }
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      roomParticipants={room.participants}
                      participantProfiles={room.participantProfiles || {}}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =================================================== */}
          {/* 5. PROGRESS TAB */}
          {/* =================================================== */}
          {activeTab === "progress" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-100">Progress Tracker & Metrics</h3>
                <p className="text-xs text-slate-400">Track visual completion ratings and check week-by-week goals.</p>
              </div>

              {tasks.length === 0 ? (
                <div className="py-12 border border-white/5 bg-slate-950/20 rounded-2xl">
                  <EmptyState
                    icon={TrendingUp}
                    title="No progress metrics available"
                    description="Setup roadmap tasks in the Tasks tab to compute real-time analytical metrics."
                  />
                </div>
              ) : (
                <ProgressWidget tasks={tasks} />
              )}
            </div>
          )}

          {/* =================================================== */}
          {/* 6. ACTIVITY LOGS TAB */}
          {/* =================================================== */}
          {activeTab === "activity" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-100">Collaborative Activity Timeline</h3>
                <p className="text-xs text-slate-400">A real-time audit log tracking updates made by you and your study partner.</p>
              </div>

              <ActivityFeed activities={activities} />
            </div>
          )}

          {/* =================================================== */}
          {/* 7. MEETINGS TAB */}
          {/* =================================================== */}
          {activeTab === "meetings" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Live Workspace Sessions</h3>
                  <p className="text-xs text-slate-400">Schedule and manage face-to-face video syncs with your partner.</p>
                </div>
                {!((room.status === "archived") || (room.status === "deleted")) && (
                  <button
                    onClick={() => setIsMeetingSchedulerOpen(true)}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-violet-500/20 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Schedule Meet
                  </button>
                )}
              </div>

              {meetings.length === 0 ? (
                 <div className="py-12 border border-white/5 bg-slate-950/20 rounded-2xl">
                    <EmptyState
                      icon={Video}
                      title="No scheduled meetings"
                      description="Create a live session to sync up, discuss blockers, or review code."
                    />
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {meetings.map((meeting) => (
                    <MeetingCard
                      key={meeting.id}
                      meeting={meeting}
                      currentUserId={user?.uid || ""}
                      participantProfiles={room.participantProfiles || {}}
                      onCancel={async (id) => {
                         await cancelMeeting(roomId!, id);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =================================================== */}
          {/* 8. STUDY PLAN TAB */}
          {/* =================================================== */}
          {activeTab === "study-plan" && (
            <div className="space-y-6">
              <StudyPlanCard
                studyPlan={studyPlan}
                onGenerate={
                  async (skill, currentLevel, targetLevel, weeklyHours) => {
                    if (room.status === "archived" || room.status === "deleted") return;
                    try {
                      setGeneratingStudyPlan(true);
                      await generateStudyPlan(roomId!, user?.uid || "", skill, currentLevel, targetLevel, weeklyHours);
                    } catch (err: any) {
                      console.error(err);
                      toast.error(err.message || "Failed to generate study plan.");
                    } finally {
                      setGeneratingStudyPlan(false);
                    }
                  }
                }
                loading={generatingStudyPlan}
                apiKeyMissing={geminiKeyMissing}
              />
            </div>
          )}

          {/* =================================================== */}
          {/* 9. SUMMARIES TAB */}
          {/* =================================================== */}
          {activeTab === "summaries" && roomId && (
            <div className="space-y-6">
              <SessionSummaryCard
                roomId={roomId}
                summaries={summaries}
                onGenerate={async () => {
                  setGeneratingSummary(true);
                  try {
                    await generateSessionSummary(roomId!);
                  } finally {
                    setGeneratingSummary(false);
                  }
                }}
                loading={generatingSummary}
                apiKeyMissing={geminiKeyMissing}
              />
            </div>
          )}

          {/* =================================================== */}
          {/* 10. WHITEBOARD TAB */}
          {/* =================================================== */}
          {activeTab === "whiteboard" && roomId && (
            <WhiteboardContainer roomId={roomId} />
          )}

          {/* =================================================== */}
          {/* 11. VALIDATION & CERTIFICATES */}
          {/* =================================================== */}
          {activeTab === "roadmap" && roomId && user && (
            <LearningRoadmap 
              roomId={roomId} 
              topics={topics} 
              currentUserId={user.uid} 
              learnerId={room.participants.find(p => p !== user.uid) || ""}
              targetSkill={room.exchangeSkills?.[room.participants.find(p => p !== user.uid) || ""]?.learnsSkill || ""}
              readOnly={room.status === "archived" || room.status === "deleted"}
            />
          )}

          {activeTab === "assessments" && roomId && user && (
            <div className="space-y-6">
              {!((room.status === "archived") || (room.status === "deleted")) && (
                <AssessmentGenerator 
                  roomId={roomId} 
                  isTeacher={true} 
                  loading={generatingAssessment}
                  onGenerate={async (sources) => {
                    setGeneratingAssessment(true);
                    try {
                      const res = await fetch("/api/assessments/generate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ roomId, sources, isFinal: false })
                      });
                      if (!res.ok) throw new Error(await res.text());
                      toast.success("Assessment generated!");
                    } catch (err: any) {
                      toast.error(err.message);
                    } finally {
                      setGeneratingAssessment(false);
                    }
                  }}
                />
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {assessments.map(a => (
                  <AssessmentCard 
                    key={a.id} 
                    assessment={a} 
                    submission={submissions.find(s => s.assessmentId === a.id) || null}
                    loading={evaluatingAssessment}
                    onSubmit={async (answers) => {
                      setEvaluatingAssessment(true);
                      try {
                        const res = await fetch("/api/assessments/evaluate", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ roomId, userId: user.uid, assessmentId: a.id, questions: a.questions, answers })
                        });
                        if (!res.ok) throw new Error(await res.text());
                        toast.success("Assessment submitted!");
                      } catch (err: any) {
                        toast.error(err.message);
                      } finally {
                        setEvaluatingAssessment(false);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === "final-exam" && roomId && user && (
            <div className="space-y-6">
              <FinalExamCard 
                exam={finalAssessments[0] || null}
                submission={submissions.find(s => s.isFinal) || null}
                isTeacher={true}
                loading={generatingAssessment || evaluatingAssessment}
                onGenerate={async () => {
                  setGeneratingAssessment(true);
                  try {
                    const res = await fetch("/api/assessments/generate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ roomId, sources: {}, isFinal: true })
                    });
                    if (!res.ok) throw new Error(await res.text());
                    toast.success("Final Exam generated!");
                  } catch (err: any) {
                    toast.error(err.message);
                  } finally {
                    setGeneratingAssessment(false);
                  }
                }}
                onSubmit={async (answers) => {
                   setEvaluatingAssessment(true);
                   try {
                     const res = await fetch("/api/assessments/evaluate", {
                       method: "POST",
                       headers: { "Content-Type": "application/json" },
                       body: JSON.stringify({ roomId, userId: user.uid, assessmentId: finalAssessments[0].id, questions: finalAssessments[0].questions, answers, isFinal: true })
                     });
                     if (!res.ok) throw new Error(await res.text());
                     toast.success("Final Exam submitted!");
                   } catch (err: any) {
                     toast.error(err.message);
                   } finally {
                     setEvaluatingAssessment(false);
                   }
                }}
                readOnly={room.status === "archived" || room.status === "deleted"}
              />
              <PeerValidationCard 
                roomId={roomId}
                isTeacher={true}
                studentId={user.uid}
                teacherId={user.uid}
                validation={peerValidations[0] || null}
              />
            </div>
          )}

          {activeTab === "certificates" && roomId && user && (
            <CertificateCard 
              certificate={certificates.find(c => c.studentId === user.uid) || null}
              loading={generatingCertificate}
              canGenerate={
                (() => {
                  const passedPeers = peerValidations.filter(p => p.status === "approved").length > 0;
                  const passedFinal = submissions.find(s => s.isFinal && s.score !== undefined && s.score >= 70);
                  const weekly = submissions.filter(s => !s.isFinal && s.score !== undefined);
                  const avg = weekly.length ? (weekly.reduce((acc, s) => acc + (s.score || 0), 0) / weekly.length) : 0;
                  return passedPeers && !!passedFinal && avg >= 70;
                })()
              }
              reason={
                 peerValidations[0]?.status !== "approved" ? "Peer validation pending/rejected" :
                 !submissions.find(s => s.isFinal && s.score !== undefined && s.score >= 70) ? "Final exam not passed" :
                 "Requirements met"
              }
              onGenerate={async () => {
                setGeneratingCertificate(true);
                try {
                   const finalScore = submissions.find(s => s.isFinal)?.score || 0;
                   const level = finalScore >= 90 ? "Gold" : finalScore >= 80 ? "Silver" : "Bronze";
                   const res = await fetch("/api/certificates/generate", {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify({
                       roomId,
                       userId: user.uid,
                       teacherId: user.uid,
                       skill: room?.swapRequestDetails?.offeredSkill || "Skill",
                       score: finalScore,
                       level
                     })
                   });
                   if (!res.ok) throw new Error(await res.text());
                   toast.success("Certificate generated successfully!");
                } catch (err: any) {
                   toast.error(err.message);
                } finally {
                   setGeneratingCertificate(false);
                }
              }}
            />
          )}





        </main>

        {/* Meeting Scheduler Overlay */}
        {isMeetingSchedulerOpen && (
          <MeetingScheduler
            roomParticipants={room.participants}
            participantProfiles={room.participantProfiles || {}}
            onSchedule={async (title, description, startISO, endISO, meetingLink) => {
               await scheduleMeeting(
                 roomId!,
                 title,
                 description,
                 user?.uid || "",
                 room.participants,
                 startISO,
                 endISO,
                 meetingLink
               );
            }}
            onClose={() => setIsMeetingSchedulerOpen(false)}
          />
        )}

      </div>
    </ProtectedRoute>
  );
}
