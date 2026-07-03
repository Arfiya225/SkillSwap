"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { MarketplaceFilters } from "@/components/ui/MarketplaceFilters";
import { MarketplaceCard } from "@/components/ui/MarketplaceCard";
import { MarketplacePost } from "@/types/marketplace";
import { subscribeToMarketplaceFeed, applyForExchange, createMarketplacePost } from "@/services/marketplace";
import { auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function MarketplacePage() {
  const [posts, setPosts] = useState<MarketplacePost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<MarketplacePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");

  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", description: "", skillOffered: "", skillRequested: "", experienceLevel: "intermediate", availability: "" });

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const unsub = subscribeToMarketplaceFeed((data) => {
      setPosts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let result = posts;
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(lower) || 
        p.description.toLowerCase().includes(lower) ||
        p.skillOffered.toLowerCase().includes(lower) ||
        p.skillRequested.toLowerCase().includes(lower)
      );
    }
    if (experienceFilter !== "all") {
      result = result.filter(p => p.experienceLevel === experienceFilter);
    }
    if (verificationFilter !== "all") {
      result = result.filter(p => p.verificationBadge === verificationFilter);
    }
    setFilteredPosts(result);
  }, [posts, searchQuery, experienceFilter, verificationFilter]);

  const handleApply = async (postId: string, message: string) => {
    if (!userId) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    await applyForExchange(postId, userId, post.createdBy, post.skillOffered, post.skillRequested, message);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    // In a real app we'd fetch the user's actual verification level to stamp it on the post, 
    // for MVP we can default to Basic.
    await createMarketplacePost({
      ...newPost,
      experienceLevel: newPost.experienceLevel as "beginner" | "intermediate" | "expert",
      createdBy: userId,
      verificationBadge: "Basic"
    });
    setShowCreate(false);
    setNewPost({ title: "", description: "", skillOffered: "", skillRequested: "", experienceLevel: "intermediate", availability: "" });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Skill Marketplace</h1>
          <button 
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {showCreate ? "Close" : <><Plus className="w-4 h-4 mr-2" /> Create Listing</>}
          </button>
        </div>

        {showCreate && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 mb-8 overflow-hidden"
          >
            <h2 className="text-xl font-bold text-white mb-4">New Exchange Listing</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Title</label>
                  <input required value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Availability</label>
                  <input required value={newPost.availability} onChange={e => setNewPost({...newPost, availability: e.target.value})} placeholder="e.g. Weekends, Evenings" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Skill Offered</label>
                  <input required value={newPost.skillOffered} onChange={e => setNewPost({...newPost, skillOffered: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Skill Requested</label>
                  <input required value={newPost.skillRequested} onChange={e => setNewPost({...newPost, skillRequested: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea required value={newPost.description} onChange={e => setNewPost({...newPost, description: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white h-24 resize-none" />
              </div>
              <button type="submit" className="w-full md:w-auto px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors">
                Publish Listing
              </button>
            </form>
          </motion.div>
        )}

        <MarketplaceFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          experienceFilter={experienceFilter}
          setExperienceFilter={setExperienceFilter}
          verificationFilter={verificationFilter}
          setVerificationFilter={setVerificationFilter}
        />

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            No listings found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <MarketplaceCard 
                key={post.id} 
                post={post} 
                currentUserId={userId || ""} 
                onApply={handleApply} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
