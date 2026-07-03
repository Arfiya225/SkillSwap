"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { UserManagementTable } from "@/components/ui/UserManagementTable";
import { updateUserStatus } from "@/services/admin";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Loader2 } from "lucide-react";
import { UserStatus } from "@/types/admin";
import Link from "next/link";

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const q = query(collection(db, "Users"), limit(50));
        const snap = await getDocs(q);
        const fetched: any[] = [];
        snap.forEach(doc => {
          const data = doc.data();
          fetched.push({
            id: doc.id,
            name: data.name || "Unknown",
            email: data.email || "No email",
            status: data.status || "Active",
            joinedAt: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : "Unknown",
          });
        });
        setUsers(fetched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleAction = async (userId: string, action: "Suspend" | "Activate" | "Ban") => {
    const statusMap: Record<string, UserStatus> = {
      Suspend: "Suspended",
      Activate: "Active",
      Ban: "Banned"
    };
    const newStatus = statusMap[action];
    
    // Optimistic UI update
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    
    try {
      await updateUserStatus(userId, newStatus);
    } catch (e) {
      console.error(e);
      // Revert if failed (omitted for MVP brevity)
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Link href="/admin" className="text-sm text-indigo-400 hover:text-indigo-300">&larr; Back to Dashboard</Link>
            </div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <UserManagementTable users={users} onAction={handleAction} />
        )}
      </main>
    </div>
  );
}
