"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Session } from "next-auth";

interface ProviderProps {
  children: ReactNode;
  session?: Session | null;
}

export default function Provider({ children, session }: ProviderProps) {
  console.log("SessionProvider initialized with session:", !!session);
  return <SessionProvider session={session}>{children}</SessionProvider>;
} 