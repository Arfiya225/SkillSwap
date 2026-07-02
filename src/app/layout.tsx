import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SkillSwap AI - Peer Learning & Skill Exchange",
  description: "Exchange skills with fellow learners. Teach what you know, learn what you need through intelligent, peer-to-peer match-making and collaborative learning rooms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} font-sans bg-[#0F172A] text-slate-200 min-h-screen selection:bg-violet-500/30 antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: "bg-slate-900/90 text-slate-100 border border-slate-800 backdrop-blur-md rounded-xl shadow-2xl",
              style: {
                background: "rgba(15, 23, 42, 0.9)",
                color: "#f8fafc",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(12px)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
