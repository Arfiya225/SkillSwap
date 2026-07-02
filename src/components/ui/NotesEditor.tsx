"use client";

import React, { useEffect, useState, useRef } from "react";
import { subscribeToNotes, saveNotes, logActivity } from "@/services/collaboration";
import { Note } from "@/types/note";
import { useAuth } from "@/context/AuthContext";
import {
  Bold,
  Italic,
  Code,
  List,
  Heading1,
  Heading2,
  Heading3,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
} from "lucide-react";
import toast from "react-hot-toast";

interface NotesEditorProps {
  roomId: string;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";
type EditorMode = "edit" | "preview";

export const NotesEditor: React.FC<NotesEditorProps> = ({ roomId }) => {
  const { dbUser } = useAuth();
  const [note, setNote] = useState<Note | null>(null);
  const [localContent, setLocalContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [editorMode, setEditorMode] = useState<EditorMode>("edit");
  const [loading, setLoading] = useState(true);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // 1. Subscribe to notes changes in Firestore
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToNotes(roomId, (remoteNote) => {
      setNote(remoteNote);
      
      if (remoteNote) {
        // If user is not currently typing, update local content with remote state
        if (!isTypingRef.current) {
          setLocalContent(remoteNote.content);
        }
      } else {
        if (!isTypingRef.current) {
          setLocalContent("");
        }
      }
      setLoading(false);
    });

    return () => {
      unsub();
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [roomId]);

  // 2. Perform Debounced Auto-save to Firestore
  const triggerAutoSave = (newContent: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus("saving");
    isTypingRef.current = true;

    saveTimeoutRef.current = setTimeout(async () => {
      if (!dbUser) return;
      try {
        await saveNotes(roomId, newContent, dbUser.uid, dbUser.name);
        setSaveStatus("saved");
        isTypingRef.current = false;
        
        // Log note updated activity occasionally (throttled/simple update activity log)
        await logActivity(
          roomId,
          "note_updated",
          dbUser.uid,
          dbUser.name,
          "updated the shared learning notes",
          dbUser.avatar
        );
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveStatus("error");
        isTypingRef.current = false;
        toast.error("Failed to auto-save notes");
      }
    }, 1200); // 1.2-second debounce
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalContent(val);
    triggerAutoSave(val);
  };

  // 3. Format Toolbar Quick Insert Functions
  const insertFormatting = (syntaxBefore: string, syntaxAfter: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    const replacement = syntaxBefore + (selectedText || "text") + syntaxAfter;

    const updatedValue = text.substring(0, start) + replacement + text.substring(end);
    setLocalContent(updatedValue);
    triggerAutoSave(updatedValue);

    // Reposition cursor and refocus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + syntaxBefore.length,
        start + syntaxBefore.length + (selectedText ? selectedText.length : 4)
      );
    }, 50);
  };

  // 4. Client-side Markdown Parser for Live Preview Tab
  const parseMarkdownToHtml = (text: string): string => {
    if (!text.trim()) {
      return "<p class='text-slate-500 italic text-sm'>No notes content yet. Switch to Edit mode to write something!</p>";
    }

    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headings
    html = html.replace(/^### (.*?)$/gm, "<h3 class='text-base font-bold text-slate-100 mt-4 mb-2'>$1</h3>");
    html = html.replace(/^## (.*?)$/gm, "<h2 class='text-lg font-bold text-slate-100 mt-5 mb-2 border-b border-slate-800 pb-1'>$1</h2>");
    html = html.replace(/^# (.*?)$/gm, "<h1 class='text-xl font-extrabold text-slate-100 mt-6 mb-3 border-b border-slate-700/50 pb-1.5'>$1</h1>");

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Italic
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Strikethrough
    html = html.replace(/~~(.*?)~~/g, "<del>$1</del>");
    
    // Inline code
    html = html.replace(/`(.*?)`/g, "<code class='bg-slate-950/80 text-pink-400 px-1.5 py-0.5 rounded font-mono text-xs border border-white/5'>$1</code>");
    
    // Unordered lists
    html = html.replace(/^\- (.*?)$/gm, "<li class='list-disc ml-5 text-slate-300 text-sm mt-1'>$1</li>");
    html = html.replace(/^\* (.*?)$/gm, "<li class='list-disc ml-5 text-slate-300 text-sm mt-1'>$1</li>");
    
    // Blockquotes
    html = html.replace(/^> (.*?)$/gm, "<blockquote class='border-l-4 border-violet-500 bg-slate-900/30 pl-4 py-1.5 my-3 rounded-r text-slate-400 italic text-sm'>$1</blockquote>");

    // Convert line breaks and group paragraphs
    const lines = html.split("\n");
    const parsedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "<div class='h-3'></div>";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<li") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<div")
      ) {
        return line;
      }
      return `<p class='text-slate-300 text-sm leading-relaxed my-2'>${line}</p>`;
    });

    return parsedLines.join("\n");
  };

  // Format Edit Date
  const lastEditedTime = note?.updatedAt?.toDate
    ? note.updatedAt.toDate().toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }) + `, ${note.updatedAt.toDate().toLocaleDateString()}`
    : "Never";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading notes workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/20 border border-white/5 p-3 rounded-2xl">
        {/* Editor Mode Tabs */}
        <div className="flex gap-1.5 bg-slate-950/45 p-1 rounded-xl border border-white/5 w-fit shrink-0">
          <button
            onClick={() => setEditorMode("edit")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              editorMode === "edit"
                ? "bg-slate-800 text-slate-100 border border-white/10"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Notes</span>
          </button>
          <button
            onClick={() => setEditorMode("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              editorMode === "preview"
                ? "bg-slate-800 text-slate-100 border border-white/10"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
        </div>

        {/* Sync Status Indicator */}
        <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-semibold">
          {saveStatus === "saving" && (
            <div className="flex items-center gap-1.5 text-blue-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving changes...</span>
            </div>
          )}
          {saveStatus === "saved" && (
            <div className="flex items-center gap-1.5 text-emerald-400 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>All changes saved</span>
            </div>
          )}
          {saveStatus === "error" && (
            <div className="flex items-center gap-1.5 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>Auto-save failed</span>
            </div>
          )}
          {saveStatus === "idle" && note && (
            <div className="text-slate-500 text-[10px] sm:text-xs">
              Last edited by <span className="text-slate-400 font-bold">{note.updatedByName}</span> at {lastEditedTime}
            </div>
          )}
        </div>
      </div>

      {/* Editor Body */}
      {editorMode === "edit" ? (
        <div className="border border-white/5 rounded-2xl overflow-hidden bg-slate-950/40">
          {/* Format Toolbar */}
          <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-950/40 border-b border-white/5">
            <button
              onClick={() => insertFormatting("**", "**")}
              title="Bold"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting("*", "*")}
              title="Italic"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting("`", "`")}
              title="Inline Code"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
            >
              <Code className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-800 mx-1" />
            <button
              onClick={() => insertFormatting("# ")}
              title="Heading 1"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting("## ")}
              title="Heading 2"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting("### ")}
              title="Heading 3"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
            >
              <Heading3 className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-800 mx-1" />
            <button
              onClick={() => insertFormatting("- ")}
              title="Bullet List"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Text Area Input */}
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={handleContentChange}
            placeholder="Start drafting shared study notes. Markdown is supported! Use the toolbar to insert formatting."
            rows={15}
            className="w-full p-5 text-sm font-medium font-sans text-slate-200 bg-transparent resize-y min-h-[300px] outline-none leading-relaxed"
          />
        </div>
      ) : (
        /* Live Rendered Markdown Preview */
        <div className="border border-white/5 rounded-2xl p-6 sm:p-8 bg-slate-950/30 min-h-[365px] overflow-y-auto">
          <div
            className="prose prose-invert max-w-none space-y-1"
            dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(localContent) }}
          />
        </div>
      )}
    </div>
  );
};
