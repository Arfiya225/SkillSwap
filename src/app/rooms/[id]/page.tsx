"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { getLearningRoom } from "@/services/room";
import { LearningRoomWithDetails } from "@/types/room";
import { Note } from "@/types/note";
import { Resource, ResourceType } from "@/types/resource";
import { Task, TaskStatus } from "@/types/task";
import { Activity as ActivityType } from "@/types/activity";

// Reusable components
import { NotesEditor } from "@/components/ui/NotesEditor";
import { ResourceCard } from "@/components/ui/ResourceCard";
import { TaskCard } from "@/components/ui/TaskCard";
import { ProgressWidget } from "@/components/ui/ProgressWidget";
import { ActivityFeed } from "@/components/ui/ActivityFeed";

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

import {
  BookOpen,
  Calendar,
  Users,
  FileText,
  Paperclip,
  CheckSquare,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Lock,
  ArrowRightLeft,
  Plus,
  Link as LinkIcon,
  Upload,
  Activity,
  ListFilter,
  Loader2,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { EmptyState } from "@/components/ui/EmptyState";

interface PageProps {
  params: Promise<{ id: string }>;
}

type RoomTab = "overview" | "notes" | "resources" | "tasks" | "progress" | "activity";

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
    if (!roomId || !room) return;

    const unsubResources = subscribeToResources(roomId, (data) => {
      setResources(data);
    });

    const unsubTasks = subscribeToTasks(roomId, (data) => {
      setTasks(data);
    });

    const unsubActivities = subscribeToActivities(roomId, (data) => {
      setActivities(data);
    });

    return () => {
      unsubResources();
      unsubTasks();
      unsubActivities();
    };
  }, [roomId, room]);

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
            {room.swapRequestDetails && (
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

                <GradientButton onClick={() => setIsResourceFormOpen(!isResourceFormOpen)} className="text-xs py-2 px-3.5">
                  {isResourceFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{isResourceFormOpen ? "Close panel" : "Add Resource"}</span>
                </GradientButton>
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

                  <GradientButton onClick={() => setIsTaskFormOpen(!isTaskFormOpen)} className="text-xs py-2 px-3.5">
                    {isTaskFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{isTaskFormOpen ? "Close panel" : "Create Task"}</span>
                  </GradientButton>
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

        </main>
      </div>
    </ProtectedRoute>
  );
}
