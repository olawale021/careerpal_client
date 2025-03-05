"use client";

import {  Search, Settings, FileEdit, MessageSquare, UserCircle, FileCheck } from "lucide-react";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";

const sidebarNavItems = [
 
  {
    title: "Job Search",
    icon: <Search className="h-5 w-5" />,
    href: "/dashboard",
    description: "Find and track job opportunities"
  },
  {
    title: "Optimize CV",
    icon: <FileCheck className="h-5 w-5" />,
    href: "/optimize",
    description: "AI-powered CV optimization"
  },
  {
    title: "Cover Letters",
    icon: <FileEdit className="h-5 w-5" />,
    href: "/cover-letter",
    description: "Generate tailored cover letters"
  },
  {
    title: "Interview Prep",
    icon: <MessageSquare className="h-5 w-5" />,
    href: "/interview-prep",
    description: "Practice interview questions"
  },
  {
    title: "Profile",
    icon: <UserCircle className="h-5 w-5" />,
    href: "/profile",
    description: "Manage your profile"
  }
];

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex font-josefin h-screen">
        <aside className="w-64 bg-[#252525] border-r hidden md:flex flex-col h-screen sticky top-0">
          <div className="p-6 border-b">
            <Link href="/">
              <h1 className="text-3xl font-bold text-[#ffffff] hover:text-blue-400 transition-colors cursor-pointer">
                CareerPal
              </h1>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {sidebarNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors group"
              >
                <span className="text-gray-400 group-hover:text-blue-400">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-200">{item.title}</p>
                  <p className="text-base text-gray-400">{item.description}</p>
                </div>
              </a>
            ))}
          </nav>

          <div className="border-t border-gray-700 p-4 sticky bottom-0 bg-[#252525]">
            <a
              href="/settings"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <span className="text-gray-400"><Settings className="h-5 w-5" /></span>
              <span className="text-lg font-medium text-gray-200">Settings</span>
            </a>
          </div>
        </aside>

        <main className="flex-1 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
} 