"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { AvatarUploader } from "@/components/ui/AvatarUploader";
import { SkillSelector } from "@/components/ui/SkillSelector";
import { updateUserProfile } from "@/services/profile";
import { DbUser, SkillCanTeach, SkillWantToLearn } from "@/types/user";
import { User, Library, Globe, Save } from "lucide-react";
import toast from "react-hot-toast";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import Link from "next/link";

type ProfileTab = "personal" | "skills" | "social";

export default function ProfilePage() {
  const { user, dbUser, refreshDbUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("personal");
  const [loading, setLoading] = useState(false);

  // Local form states
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");
  const [skillsCanTeach, setSkillsCanTeach] = useState<SkillCanTeach[]>([]);
  const [skillsWantToLearn, setSkillsWantToLearn] = useState<SkillWantToLearn[]>([]);
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");

  // Sync state with dbUser once loaded
  useEffect(() => {
    if (dbUser) {
      setName(dbUser.name || "");
      setAvatar(dbUser.avatar || "");
      setBio(dbUser.bio || "");
      setCollege(dbUser.college || "");
      setDegree(dbUser.degree || "");
      setSkillsCanTeach(dbUser.skillsCanTeach || []);
      setSkillsWantToLearn(dbUser.skillsWantToLearn || []);
      setGithub(dbUser.github || "");
      setLinkedin(dbUser.linkedin || "");
      setPortfolio(dbUser.portfolio || "");
    }
  }, [dbUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Saving profile changes...");

    try {
      const updatedProfile: Partial<DbUser> = {
        name: name.trim(),
        avatar,
        bio: bio.trim(),
        college: college.trim(),
        degree: degree.trim(),
        skillsCanTeach,
        skillsWantToLearn,
        github: github.trim(),
        linkedin: linkedin.trim(),
        portfolio: portfolio.trim(),
      };

      await updateUserProfile(user.uid, updatedProfile);
      await refreshDbUser();
      
      toast.success("Profile saved successfully!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save profile changes", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: ProfileTab; label: string; icon: any }[] = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "skills", label: "Skills Exchange", icon: Library },
    { id: "social", label: "Social Links", icon: Globe },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0F172A] flex flex-col">
        <Navbar />
        
        <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
          <PageHeader
            title="Profile Settings"
            description="Manage your personal details, choose the skills you want to teach or learn, and link your online profiles."
            actions={
              <GradientButton
                onClick={handleSave}
                loading={loading}
                className="w-full sm:w-auto px-6"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </GradientButton>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start mt-6">
            {/* Sidebar Tabs Selectors */}
            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 border-b md:border-b-0 border-slate-800 md:col-span-1 shrink-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap md:w-full ${
                      isSelected
                        ? "bg-violet-500/10 text-violet-300 border border-violet-500/20 shadow-[0_0_15px_-3px_rgba(157,124,252,0.15)]"
                        : "text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents Frame */}
            <GlassCard className="md:col-span-3 border border-white/5 shadow-xl">
              <form onSubmit={handleSave} className="space-y-6">
                {activeTab === "personal" && (
                  <div className="space-y-5">
                    <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide border-b border-slate-800 pb-2.5">
                      Personal Information
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
                      <AvatarUploader
                        currentAvatar={avatar}
                        name={name}
                        onUploadSuccess={(url) => setAvatar(url)}
                      />
                      <div className="text-center sm:text-left flex-grow">
                        <p className="text-sm font-bold text-slate-200 mb-2">Profile Photo & Trust</p>
                        <div className="flex items-center justify-center sm:justify-start space-x-3 mb-2">
                          <VerificationBadge level={dbUser?.verificationLevel || "Basic"} showLabel />
                          <Link href="/profile/verification" className="text-xs text-indigo-400 hover:text-indigo-300">
                            Manage Verification
                          </Link>
                        </div>
                        <p className="text-xs text-slate-500 max-w-[240px] mt-1 leading-relaxed">
                          Clear square photo recommended. Max 2MB file size.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-medium"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                          College / University
                        </label>
                        <input
                          type="text"
                          value={college}
                          onChange={(e) => setCollege(e.target.value)}
                          placeholder="State University"
                          className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                          Degree / Major
                        </label>
                        <input
                          type="text"
                          value={degree}
                          onChange={(e) => setDegree(e.target.value)}
                          placeholder="B.S. Computer Science"
                          className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Bio Description
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell peers about yourself, your goals, and what you're hoping to achieve..."
                        rows={4}
                        maxLength={300}
                        className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-medium resize-none leading-relaxed"
                      />
                      <div className="text-right text-[10px] text-slate-500">
                        {bio.length}/300 characters
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "skills" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide border-b border-slate-800 pb-2.5 mb-4">
                        Skills You Can Teach
                      </h3>
                      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                        What skills do you possess that you can confidently share? Specify your experience level and years of practice.
                      </p>
                      <SkillSelector
                        type="teach"
                        skills={skillsCanTeach}
                        onChange={(updated) => setSkillsCanTeach(updated)}
                      />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide border-b border-slate-800 pb-2.5 mb-4 mt-8">
                        Skills You Want To Learn
                      </h3>
                      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                        What areas are you looking to master? Let peers know your target competency levels so they can adapt their sharing.
                      </p>
                      <SkillSelector
                        type="learn"
                        skills={skillsWantToLearn}
                        onChange={(updated) => setSkillsWantToLearn(updated)}
                      />
                    </div>
                  </div>
                )}

                {activeTab === "social" && (
                  <div className="space-y-5">
                    <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide border-b border-slate-800 pb-2.5">
                      Social Accounts
                    </h3>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        GitHub Profile Link
                      </label>
                      <input
                        type="text"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder="github.com/username"
                        className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        LinkedIn Profile Link
                      </label>
                      <input
                        type="text"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="linkedin.com/in/username"
                        className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Portfolio Website
                      </label>
                      <input
                        type="text"
                        value={portfolio}
                        onChange={(e) => setPortfolio(e.target.value)}
                        placeholder="www.portfolio.com"
                        className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* Submit button inside glass pane for mobile view spacing */}
                <div className="pt-4 border-t border-slate-800/40 flex justify-end md:hidden">
                  <GradientButton
                    type="submit"
                    loading={loading}
                    className="w-full py-2.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </GradientButton>
                </div>
              </form>
            </GlassCard>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
