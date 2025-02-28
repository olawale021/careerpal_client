"use client";

import {  Search, Settings, Home, FileEdit, MessageSquare, UserCircle, FileCheck } from "lucide-react";
import { SessionProvider } from "next-auth/react";

const sidebarNavItems = [
  {
    title: "Home",
    icon: <Home className="h-5 w-5" />,
    href: "/dashboards",
    description: "Overview of your job search"
  },
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
    href: "/cover-letters",
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
      <div className="min-h-screen flex font-josefin">
        <aside className="w-64 bg-white border-r hidden md:flex flex-col">
          <div className="p-6 border-b">
            <h1 className="text-3xl font-bold">CareerPal</h1>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {sidebarNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <span className="text-gray-500 group-hover:text-blue-600">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-900">{item.title}</p>
                  <p className="text-base text-gray-500">{item.description}</p>
                </div>
              </a>
            ))}
          </nav>

          <div className="border-t p-4">
            <a
              href="/settings"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-500"><Settings className="h-5 w-5" /></span>
              <span className="text-lg font-medium text-gray-900">Settings</span>
            </a>
          </div>
        </aside>

        <main className="flex-1 bg-gray-50">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
} 