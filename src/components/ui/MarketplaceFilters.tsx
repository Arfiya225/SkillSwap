"use client";
import React from "react";
import { Search } from "lucide-react";

interface MarketplaceFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  experienceFilter: string;
  setExperienceFilter: (lvl: string) => void;
  verificationFilter: string;
  setVerificationFilter: (lvl: string) => void;
}

export const MarketplaceFilters: React.FC<MarketplaceFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  experienceFilter,
  setExperienceFilter,
  verificationFilter,
  setVerificationFilter
}) => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
      <div className="relative flex-grow w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search skills, titles, or descriptions..."
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      
      <div className="flex gap-4 w-full md:w-auto">
        <select 
          value={experienceFilter}
          onChange={(e) => setExperienceFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 md:w-40"
        >
          <option value="all">All Experience</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="expert">Expert</option>
        </select>

        <select 
          value={verificationFilter}
          onChange={(e) => setVerificationFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 md:w-40"
        >
          <option value="all">All Verifications</option>
          <option value="Basic">Basic</option>
          <option value="Verified">Verified</option>
          <option value="Expert">Expert</option>
        </select>
      </div>
    </div>
  );
};
