import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { LearningTopic } from "@/types/validation";
import { addTopic, updateTopicStatus, editTopic, deleteTopic } from "@/services/validationService";
import { Plus, Check, Clock, Play, Edit2, Trash2, X, Map } from "lucide-react";
import toast from "react-hot-toast";

interface TopicCardProps {
  topic: LearningTopic;
  currentUserId: string;
  readOnly?: boolean;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, currentUserId, readOnly }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(topic.title);
  const [desc, setDesc] = useState(topic.description);
  const [week, setWeek] = useState(topic.week || 1);
  const [order, setOrder] = useState(topic.order || 1);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (status: "pending" | "in-progress" | "completed") => {
    try {
      await updateTopicStatus(topic.id, status, currentUserId);
      toast.success("Topic status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    try {
      await editTopic(topic.id, title, desc, week, order);
      setIsEditing(false);
      toast.success("Topic updated");
    } catch {
      toast.error("Failed to update topic");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this topic?")) return;
    try {
      await deleteTopic(topic.id);
      toast.success("Topic deleted");
    } catch {
      toast.error("Failed to delete topic");
    }
  };

  if (isEditing) {
    return (
      <GlassCard className="border border-violet-500/30 p-4">
        <form onSubmit={handleEdit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Week</label>
              <input type="number" min="1" value={week} onChange={e => setWeek(Number(e.target.value))} required className="w-full px-3 py-2 text-xs rounded-lg glass-input mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Order</label>
              <input type="number" min="1" value={order} onChange={e => setOrder(Number(e.target.value))} required className="w-full px-3 py-2 text-xs rounded-lg glass-input mt-1" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Topic Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-3 py-2 text-xs rounded-lg glass-input mt-1" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-3 py-2 text-xs rounded-lg glass-input mt-1" rows={2} />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200">Cancel</button>
            <GradientButton type="submit" loading={loading} className="text-xs py-1.5 px-4">Save Changes</GradientButton>
          </div>
        </form>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4 border border-white/5 flex justify-between items-center group">
      <div className="flex gap-4 items-center">
        <div className="flex flex-col items-center justify-center bg-slate-900/80 rounded-lg p-2 min-w-[3rem] border border-white/5">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Wk {topic.week || 1}</span>
          <span className="text-sm font-bold text-slate-200">#{topic.order || 1}</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-100">{topic.title}</h4>
          <p className="text-xs text-slate-400 mt-1">{topic.description}</p>
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          {topic.status === "completed" ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md uppercase tracking-wider">
              <Check className="w-3 h-3" /> Completed
            </span>
          ) : topic.status === "in-progress" ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md uppercase tracking-wider">
              <Play className="w-3 h-3" /> In Progress
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-500/10 px-2 py-1 rounded-md uppercase tracking-wider">
              <Clock className="w-3 h-3" /> Pending
            </span>
          )}
          
          <div className="flex gap-1 ml-2">
            {!readOnly && topic.status !== "completed" && (
              <>
                {topic.status === "pending" && (
                  <button onClick={() => handleStatusChange("in-progress")} className="p-1.5 bg-blue-500/20 text-blue-400 rounded-md hover:bg-blue-500/30" title="Start">
                    <Play className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => handleStatusChange("completed")} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-md hover:bg-emerald-500/30" title="Complete">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={() => setIsEditing(true)} className="p-1 text-slate-400 hover:text-blue-400" title="Edit Topic">
               <Edit2 className="w-3.5 h-3.5" />
             </button>
             <button onClick={handleDelete} className="p-1 text-slate-400 hover:text-red-400" title="Delete Topic">
               <Trash2 className="w-3.5 h-3.5" />
             </button>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

interface LearningRoadmapProps {
  roomId: string;
  topics: LearningTopic[];
  currentUserId: string;
  learnerId: string;
  targetSkill: string;
  readOnly?: boolean;
}

export const LearningRoadmap: React.FC<LearningRoadmapProps> = ({ roomId, topics, currentUserId, learnerId, targetSkill, readOnly }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [week, setWeek] = useState(1);
  const [order, setOrder] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    try {
      await addTopic(roomId, title, desc, week, order, currentUserId, learnerId, targetSkill);
      setTitle("");
      setDesc("");
      setWeek(week);
      setOrder(order + 1);
      setIsAdding(false);
      toast.success("Topic added successfully");
    } catch {
      toast.error("Failed to add topic");
    } finally {
      setLoading(false);
    }
  };

  // Group topics by week
  const topicsByWeek = topics.reduce((acc, topic) => {
    const w = topic.week || 1;
    if (!acc[w]) acc[w] = [];
    acc[w].push(topic);
    return acc;
  }, {} as Record<number, LearningTopic[]>);

  const weeks = Object.keys(topicsByWeek).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-white/5">
        <div>
          <h3 className="text-lg font-bold text-slate-100">Learning Roadmap</h3>
          <p className="text-sm text-slate-400 mt-1">Structured learning topics and milestones.</p>
        </div>
        {!readOnly && (
          <GradientButton onClick={() => setIsAdding(!isAdding)} className="text-sm py-2 px-4">
            {isAdding ? <><X className="w-4 h-4 mr-1" /> Cancel</> : <><Plus className="w-4 h-4 mr-1" /> Create Topic</>}
          </GradientButton>
        )}
      </div>

      {isAdding && (
        <GlassCard className="border border-violet-500/30 p-5 shadow-lg shadow-violet-500/10">
          <h4 className="text-sm font-bold text-slate-100 mb-4">Create New Topic</h4>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Week</label>
                <input type="number" min="1" value={week} onChange={e => setWeek(Number(e.target.value))} required className="w-full px-3 py-2 text-sm rounded-lg glass-input mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Order in Week</label>
                <input type="number" min="1" value={order} onChange={e => setOrder(Number(e.target.value))} required className="w-full px-3 py-2 text-sm rounded-lg glass-input mt-1" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Topic Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-3 py-2 text-sm rounded-lg glass-input mt-1" placeholder="e.g. React Hooks" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg glass-input mt-1" rows={2} placeholder="Explain what will be covered" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
              <GradientButton type="submit" loading={loading} className="text-sm py-2 px-6">Save Topic</GradientButton>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="space-y-6">
        {topics.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/30 text-slate-500 text-sm border border-dashed border-white/10 rounded-2xl">
            <Map className="w-12 h-12 mx-auto mb-3 opacity-20" />
            No topics created yet. Click &quot;Create Topic&quot; to build your roadmap!
          </div>
        ) : (
          weeks.map(w => (
            <div key={w} className="space-y-3">
              <h4 className="text-sm font-bold text-violet-400 flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded text-xs">Week {w}</span>
              </h4>
              <div className="space-y-3 pl-2">
                {topicsByWeek[w].map(topic => (
                  <TopicCard key={topic.id} topic={topic} currentUserId={currentUserId} readOnly={readOnly} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
