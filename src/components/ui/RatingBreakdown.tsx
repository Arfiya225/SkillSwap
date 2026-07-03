"use client";
import React from "react";
import { RatingBreakdown as BreakdownType } from "@/types/rating";
import { Star } from "lucide-react";

export function RatingBreakdown({ breakdown, totalReviews }: { breakdown: BreakdownType, totalReviews: number }) {
  const metrics = [
    { label: "Teaching", value: breakdown.teaching },
    { label: "Communication", value: breakdown.communication },
    { label: "Reliability", value: breakdown.reliability }
  ];

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-end space-x-3 mb-6">
        <h3 className="text-4xl font-bold text-white">{breakdown.overall.toFixed(1)}</h3>
        <div className="pb-1">
          <div className="flex text-indigo-400 mb-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`w-4 h-4 ${i <= Math.round(breakdown.overall) ? 'fill-indigo-400' : 'text-slate-600'}`} />
            ))}
          </div>
          <p className="text-xs text-slate-400">Based on {totalReviews} reviews</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {metrics.map(m => (
          <div key={m.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">{m.label}</span>
              <span className="text-slate-400">{m.value.toFixed(1)}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full" 
                style={{ width: `${(m.value / 5) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
