import React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
  breadcrumbs?: Array<{ href?: string; label: string }>;
  title?: string;
}

export function Layout({ children, breadcrumbs, title }: LayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64">
        <Header breadcrumbs={breadcrumbs} />
        
        <main className="flex-1 overflow-auto bg-gray-100">
          <div className="container mx-auto px-4 py-6">
            {title && (
              <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
