"use client";
import { usePathname } from "next/navigation";
import { SidebarLayout } from "@/components/SidebarLayout";
import { Footer } from "@/components/ui/Footer";
import { ReactNode } from "react";

export function ClientSideWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isAuthPage = ['/login', '/signup', '/forgot-password'].some(route => pathname.startsWith(route));

  // For auth pages, render without footer
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  // For home page, use minimal header and footer
  if (isHomePage) {
    return (
      <>
        {children}
        <Footer />
      </>
    );
  }
  
  // For all other pages, use the full sidebar layout without footer
  return (
    <SidebarLayout>
      {children}
    </SidebarLayout>
  );
} 