"use client";
import React from "react";
import { UserStatus } from "@/types/admin";
import { ShieldAlert, CheckCircle, Ban } from "lucide-react";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  joinedAt: string;
}

interface UserManagementTableProps {
  users: UserInfo[];
  onAction: (userId: string, action: "Suspend" | "Activate" | "Ban") => void;
}

export function UserManagementTable({ users, onAction }: UserManagementTableProps) {
  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "Active": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Suspended": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "Banned": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }
  };

  return (
    <div className="w-full overflow-x-auto bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700">
          <tr>
            <th className="px-6 py-4">User</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Joined</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
              <td className="px-6 py-4">
                <div className="font-medium text-white">{u.name}</div>
                <div className="text-xs text-slate-500">{u.email}</div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(u.status)}`}>
                  {u.status}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-400">{u.joinedAt}</td>
              <td className="px-6 py-4 text-right space-x-2">
                {u.status !== "Active" && (
                  <button onClick={() => onAction(u.id, "Activate")} className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                {u.status !== "Suspended" && (
                  <button onClick={() => onAction(u.id, "Suspend")} className="p-2 text-orange-400 hover:bg-orange-400/10 rounded-lg transition-colors">
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                )}
                {u.status !== "Banned" && (
                  <button onClick={() => onAction(u.id, "Ban")} className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors">
                    <Ban className="w-4 h-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
