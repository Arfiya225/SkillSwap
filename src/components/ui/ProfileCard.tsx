"use client";

import React from "react";
import { DbUser } from "@/types/user";
import { GlassCard } from "./GlassCard";
import { SkillChip } from "./SkillChip";
import { Globe, GraduationCap, User } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/BrandIcons";

interface ProfileCardProps {
  profile: DbUser;
  className?: string;
  actions?: React.ReactNode;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  className = "",
  actions,
}) => {
  return (
    <GlassCard animateHover className={`border border-white/5 flex flex-col gap-5 ${className}`}>
      {/* Header Info */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center shrink-0">
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-slate-500" />
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-100 leading-tight">{profile.name}</h3>
          
          {(profile.college || profile.degree) && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <GraduationCap className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span className="truncate">
                {profile.degree}
                {profile.degree && profile.college ? " • " : ""}
                {profile.college}
              </span>
            </div>
          )}
          
          {/* Social Links */}
          <div className="flex items-center gap-2.5 pt-1">
            {profile.github && (
              <a
                href={profile.github.startsWith("http") ? profile.github : `https://${profile.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-200 transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            )}
            {profile.linkedin && (
              <a
                href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://${profile.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-200 transition-colors"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            )}
            {profile.portfolio && (
              <a
                href={profile.portfolio.startsWith("http") ? profile.portfolio : `https://${profile.portfolio}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-200 transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed bg-slate-950/20 p-3 rounded-xl border border-white/5">
          {profile.bio}
        </p>
      )}

      {/* Skills Layout */}
      <div className="space-y-3.5 flex-1">
        {/* Can Teach */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
            Skills offered
          </span>
          <div className="flex flex-wrap gap-1.5">
            {profile.skillsCanTeach.length === 0 ? (
              <span className="text-xs text-slate-500 italic">None specified</span>
            ) : (
              profile.skillsCanTeach.map((skill, index) => (
                <SkillChip
                  key={index}
                  name={skill.skillName}
                  level={skill.experienceLevel}
                  type="teach"
                />
              ))
            )}
          </div>
        </div>

        {/* Want to Learn */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-pink-400">
            Skills wanted
          </span>
          <div className="flex flex-wrap gap-1.5">
            {profile.skillsWantToLearn.length === 0 ? (
              <span className="text-xs text-slate-500 italic">None specified</span>
            ) : (
              profile.skillsWantToLearn.map((skill, index) => (
                <SkillChip
                  key={index}
                  name={skill.skillName}
                  level={skill.targetLevel}
                  type="learn"
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Card Actions */}
      {actions && (
        <div className="pt-2 border-t border-slate-800/40">
          {actions}
        </div>
      )}
    </GlassCard>
  );
};
