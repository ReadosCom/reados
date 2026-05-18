import type { ReactNode } from "react";
import { Outlet } from "@tanstack/react-router";

import { AppSidebar } from "@components/application/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@components/uiframework/Sidebar";
import { TooltipProvider } from "@components/uiframework/Tooltip";

type ApplicationLayoutProps = {
  children?: ReactNode;
};

export const ApplicationLayout = ({ children }: ApplicationLayoutProps) => {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <div className="flex h-full flex-1 flex-col">
            <main className="relative min-h-[100vh] overflow-auto rounded-xl bg-background md:min-h-min">
              <div className="relative h-full w-full p-4">
                {children ?? <Outlet />}
              </div>
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
};
