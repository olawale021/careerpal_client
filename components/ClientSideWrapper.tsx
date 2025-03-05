"use client";
import { usePathname } from "next/navigation";
import { SidebarLayout } from "@/components/SidebarLayout";
import { ReactNode } from "react";

export function ClientSideWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return isHomePage ? children : <SidebarLayout>{children}</SidebarLayout>;
} 