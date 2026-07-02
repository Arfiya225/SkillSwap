"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { SkillCanTeach, SkillWantToLearn } from "@/types/user";
import { SkillChip } from "./SkillChip";
import { GradientButton } from "./GradientButton";

interface SkillSelectorProps {
  type: "teach" | "learn";
  skills: any[];
  onChange: (skills: any[]) => void;
}

const COMMON_SKILLS = [
  "Python",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Figma",
  "UI/UX Design",
  "Machine Learning",
  "Data Structures & Algorithms",
  "Calculus",
  "Linear Algebra",
  "Spanish",
  "French",
  "Public Speaking",
  "Product Management",
  "SQL",
  "Docker",
  "Kubernetes",
  "Tailwind CSS",
  "Git & GitHub",
];

export const SkillSelector: React.FC<SkillSelectorProps> = ({
  type,
  skills,
  onChange,
}) => {
  const [skillName, setSkillName] = useState("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "expert">("intermediate");
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAddSkill = () => {
    if (!skillName.trim()) return;

    // Check duplicate
    const isDuplicate = skills.some(
      (s) => s.skillName.toLowerCase() === skillName.trim().toLowerCase()
    );
    if (isDuplicate) {
      setSkillName("");
      return;
    }

    if (type === "teach") {
      const newSkill: SkillCanTeach = {
        skillName: skillName.trim(),
        experienceLevel: level,
        yearsOfExperience: Number(yearsOfExperience),
      };
      onChange([...skills, newSkill]);
    } else {
      const newSkill: SkillWantToLearn = {
        skillName: skillName.trim(),
        targetLevel: level,
      };
      onChange([...skills, newSkill]);
    }

    setSkillName("");
    setShowSuggestions(false);
  };

  const handleRemoveSkill = (indexToRemove: number) => {
    const updatedSkills = skills.filter((_, index) => index !== indexToRemove);
    onChange(updatedSkills);
  };

  const filteredSuggestions = COMMON_SKILLS.filter(
    (s) =>
      s.toLowerCase().includes(skillName.toLowerCase()) &&
      !skills.some((added) => added.skillName.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Skill Input Row */}
      <div className="flex flex-col sm:flex-row gap-3 relative">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={type === "teach" ? "e.g., Python, React" : "e.g., UI/UX, Spanish"}
            value={skillName}
            onChange={(e) => {
              setSkillName(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-medium"
          />

          {/* Autocomplete Dropdown */}
          {showSuggestions && skillName && filteredSuggestions.length > 0 && (
            <div className="absolute z-30 left-0 right-0 mt-1.5 max-h-48 overflow-y-auto bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 backdrop-blur-xl">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={() => {
                    setSkillName(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-violet-500/10 hover:text-violet-300 text-sm rounded-lg transition-colors text-slate-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Level Dropdown */}
        <div className="w-full sm:w-40">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as any)}
            className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-medium bg-slate-900/50 appearance-none cursor-pointer"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        {/* Years of Experience (Teach Only) */}
        {type === "teach" && (
          <div className="w-full sm:w-28">
            <input
              type="number"
              min="0"
              max="50"
              placeholder="Years"
              value={yearsOfExperience || ""}
              onChange={(e) => setYearsOfExperience(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-medium"
            />
          </div>
        )}

        <GradientButton
          variant="secondary"
          onClick={handleAddSkill}
          className="px-4 py-2.5 self-stretch sm:self-auto shrink-0 border-violet-500/20 text-violet-400 hover:text-slate-100"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </GradientButton>
      </div>

      {/* Added Chips List */}
      <div className="flex flex-wrap gap-2.5 p-3 rounded-xl bg-slate-950/20 border border-white/5 min-h-[48px] items-center">
        {skills.length === 0 ? (
          <span className="text-xs text-slate-500 italic px-2">No skills added yet.</span>
        ) : (
          skills.map((skill, index) => (
            <SkillChip
              key={index}
              name={skill.skillName}
              level={type === "teach" ? skill.experienceLevel : skill.targetLevel}
              type={type}
              onDelete={() => handleRemoveSkill(index)}
            />
          ))
        )}
      </div>
    </div>
  );
};
