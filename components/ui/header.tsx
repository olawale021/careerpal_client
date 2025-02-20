"use client";

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  UserCircle 
} from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { 
  Avatar,
  AvatarFallback,
  AvatarImage 
} from "@/components/ui/avatar";
import {
  Badge
} from "@/components/ui/badge";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <nav className="w-full bg-white border-b fixed top-0 z-50">
      {/* Container with max width and margin */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 flex justify-between items-center">
          {/* Left: Branding */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <h1 className="text-xl font-bold">CareerPal</h1>
            </Link>
          </div>

          {/* Center: Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/upload">
              <Button variant="ghost" size="sm">Upload Resume</Button>
            </Link>
            <Link href="/optimize">
              <Button variant="ghost" size="sm">Optimize Resume</Button>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {status === 'authenticated' ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge 
                    variant="secondary" 
                    className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary p-0 text-[10px] font-medium text-primary-foreground"
                  >
                    2
                  </Badge>
                </Button>

                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-8 flex items-center gap-2 px-2"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={session.user?.image || ""} />
                        <AvatarFallback>
                          {session.user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline-block font-medium">
                        {session.user?.name?.split(" ")[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session.user?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <UserCircle className="mr-2 h-4 w-4" />
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 cursor-pointer"
                      onClick={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/login?tab=register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}