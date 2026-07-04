import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (text: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSend = async () => {
    if (!text.trim() || disabled || sending) return;
    setSending(true);
    try {
      await onSendMessage(text);
      setText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 bg-slate-900/80 border-t border-slate-800/80 backdrop-blur-md rounded-b-2xl">
      <div className="flex items-end gap-2 bg-slate-950/50 border border-slate-800 rounded-xl p-1.5 focus-within:border-violet-500/50 transition-colors">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled || sending}
          className="flex-grow bg-transparent text-sm text-slate-200 placeholder-slate-500 resize-none px-3 py-2 outline-none max-h-[120px] min-h-[40px]"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={disabled || sending || !text.trim()}
          className="w-10 h-10 rounded-lg bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </div>
      <div className="text-[10px] text-slate-500 text-center mt-2">
        Press <kbd className="bg-slate-800 px-1 py-0.5 rounded border border-slate-700 font-sans">Enter</kbd> to send, <kbd className="bg-slate-800 px-1 py-0.5 rounded border border-slate-700 font-sans">Shift + Enter</kbd> for new line
      </div>
    </div>
  );
}
