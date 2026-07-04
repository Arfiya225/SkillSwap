import React, { useEffect, useRef, useState } from "react";
import { ChatMessage as IChatMessage } from "@/types/chat";
import { subscribeToMessages, sendMessage } from "@/services/chat";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { GlassCard } from "./GlassCard";
import { MessageSquare, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { EmptyState } from "./EmptyState";

interface ChatPanelProps {
  roomId: string;
  currentUserId: string;
  currentUserName: string;
  otherParticipants: string[];
}

export function ChatPanel({
  roomId,
  currentUserId,
  currentUserName,
  otherParticipants,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = subscribeToMessages(roomId, (data) => {
      setMessages(data);
      setLoading(false);
    });
    return () => unsub();
  }, [roomId]);

  useEffect(() => {
    // Auto-scroll on new messages
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    try {
      await sendMessage(roomId, text, currentUserId, currentUserName, otherParticipants);
    } catch (err) {
      toast.error("Failed to send message");
      throw err;
    }
  };

  return (
    <GlassCard className="border border-white/5 shadow-xl flex flex-col h-[600px] max-h-[70vh] p-0 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900/60 border-b border-white/5 py-4 px-6 flex items-center gap-3 shrink-0">
        <div className="p-2 bg-violet-500/10 rounded-lg">
          <MessageSquare className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Room Chat</h3>
          <p className="text-[10px] text-slate-400">
            Real-time messaging with your learning partners
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <EmptyState
              icon={MessageSquare}
              title="No messages yet"
              description="Start the conversation by saying hello!"
            />
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isCurrentUser={msg.senderId === currentUserId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0">
        <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
      </div>
    </GlassCard>
  );
}
