"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Briefcase, Home, Menu, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="fixed top-4 left-4 z-50">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-white shadow-lg">
        <div className="flex flex-col space-y-6 p-4">
          <h2 className="text-lg font-semibold text-gray-900">CareerPal</h2>

          <nav className="space-y-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link href="/jobs" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
              <Briefcase className="h-5 w-5" />
              Jobs
            </Link>
            <Link href="/settings" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>

          <Button variant="destructive" className="mt-auto flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
