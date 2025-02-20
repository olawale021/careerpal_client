"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import Header from "@/components/ui/header";
import "@/app/globals.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <SessionProvider>
          <Header /> {/* Header remains on all pages */}
          <main className="container mx-auto p-6">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
