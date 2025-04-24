"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { LogOut, Menu, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { sidebarNavItems } from "../SidebarLayout";

interface MobileNavigationProps {
  onLogout?: () => void;
}

export function MobileNavigation({ onLogout }: MobileNavigationProps) {
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    setOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-background border-b md:hidden">
      <div className="flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold">
          CareerPal
        </Link>
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="p-2 rounded-md hover:bg-gray-100">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="font-josefin bg-black text-white">
            <SheetHeader className="pb-4 border-b">
              <SheetTitle className="text-xl text-white">CareerPal</SheetTitle>
            </SheetHeader>
            
            <div className="mt-6 space-y-4">
              {sidebarNavItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center space-x-3 py-2 px-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <span className="text-gray-300">{item.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-sm text-gray-300">{item.description}</p>
                  </div>
                </Link>
              ))}
              
              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 py-2 px-3 mb-3 w-full text-left rounded-lg bg-red-800/20 hover:bg-red-800/30 border border-red-800/30 transition-colors"
                >
                  <LogOut className="h-5 w-5 text-red-400" />
                  <span className="font-medium text-red-100">Logout</span>
                </button>
                
                <Link 
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center space-x-3 py-2 px-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Settings className="h-5 w-5 text-gray-300" />
                  <span className="font-medium text-white">Settings</span>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
