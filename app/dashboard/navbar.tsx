'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loader2, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const { session, status, logout } = useAuth();
  const isLoading = status === 'loading';
  const user = session?.user;

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold">
            CareerPal
          </Link>
          
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/dashboard" className="px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground">
              Dashboard
            </Link>
            <Link href="/profile" className="px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground">
              Profile
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : user ? (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => logout()}
                className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()} className="md:hidden">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="default" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
} 