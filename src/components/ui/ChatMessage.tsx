import React from "react";
import { ChatMessage as IChatMessage } from "@/types/chat";

interface ChatMessageProps {
  message: IChatMessage;
  isCurrentUser: boolean;
}

export function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  const timeString = message.createdAt
    ? message.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    : "Sending...";

  return (
    <div
      className={`flex flex-col w-full mb-4 ${
        isCurrentUser ? "items-end" : "items-start"
      }`}
    >
      <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
        {!isCurrentUser && (
          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-400">
            {message.senderName.charAt(0).toUpperCase()}
          </div>
        )}
        <div
          className={`flex flex-col ${
            isCurrentUser ? "items-end" : "items-start"
          }`}
        >
          <div className="flex items-baseline gap-2 mb-1">
            {!isCurrentUser && (
              <span className="text-xs font-bold text-slate-300">
                {message.senderName}
              </span>
            )}
            <span className="text-[10px] text-slate-500">{timeString}</span>
          </div>
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
              isCurrentUser
                ? "bg-violet-600/90 text-white rounded-br-sm border border-violet-500/50"
                : "bg-slate-800/80 text-slate-200 rounded-bl-sm border border-slate-700/50 backdrop-blur-sm"
            }`}
          >
            {message.text}
          </div>
        </div>
      </div>
    </div>
  );
}
