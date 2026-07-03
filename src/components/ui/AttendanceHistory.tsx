"use client";
import React from "react";
import { Attendance } from "@/types/attendance";
import { Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export function AttendanceHistory({ history }: { history: Attendance[] }) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-slate-500" />
        </div>
        <p className="text-slate-400 font-medium">No sessions attended yet.</p>
        <p className="text-sm text-slate-500 mt-2">Join a learning room meeting to track your hours!</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-5">
      <h3 className="text-lg font-bold text-white mb-4">Recent Sessions</h3>
      <div className="space-y-3">
        {history.slice(0, 5).map((session, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            key={session.id} 
            className="flex justify-between items-center bg-slate-800/40 p-3 rounded-lg border border-slate-700/30"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-500/10 p-2 rounded-md">
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">Learning Session</p>
                <p className="text-xs text-slate-500">
                  {session.attendedAt?.toDate ? session.attendedAt.toDate().toLocaleDateString() : 'Recent'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-emerald-400">+{session.durationMinutes} min</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
