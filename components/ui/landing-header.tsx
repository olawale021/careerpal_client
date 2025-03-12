"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { LogOut, Settings, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signOut, signIn } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export default function LandingHeader() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Debug log with more detailed info
  useEffect(() => {
    console.log("Authentication details:", {
      status,
      isAuthenticated: status === 'authenticated',
      session,
      user: session?.user,
      email: session?.user?.email
    });
  }, [session, status]);

  // Handle login
  const handleLogin = async () => {
    await signIn(undefined, { callbackUrl: '/dashboard' });
  };

  // Handle trial signup
  const handleTrial = () => {
    router.push('/login');
  };

  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 bg-white border-b">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-xl font-bold text-blue-600">
          <Link href="/">CareerPal</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
            Pricing
          </Link>
          
          {status === 'loading' ? (
            <span className="text-sm text-gray-500">Loading...</span>
          ) : status === 'authenticated' && session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-8 flex items-center gap-2 px-2"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={session.user.image || ""} />
                    <AvatarFallback>
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block font-medium">
                    {session.user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer w-full">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer w-full">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-gray-900"
                onClick={handleLogin}
              >
                Log in
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleTrial}
              >
                Start free trial
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
