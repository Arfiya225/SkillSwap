"use client";
import React from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";

export function PlatformHealthWidget({ issues = 0 }: { issues?: number }) {
  const isHealthy = issues === 0;

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-5 flex items-center justify-between">
      <div>
        <h3 className="text-white font-medium mb-1">System Health</h3>
        <p className="text-sm text-slate-400">
          {isHealthy ? "All services operational" : `${issues} pending reports need attention`}
        </p>
      </div>
      <div className={`p-3 rounded-full ${isHealthy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
        {isHealthy ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
      </div>
    </div>
  );
}
