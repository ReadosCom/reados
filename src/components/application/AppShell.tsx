import type { ReactNode } from 'react';

import { AppSidebar } from '@components/application/AppSidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@components/uiframework/Sidebar';
import { TooltipProvider } from '@components/uiframework/Tooltip';

type AppShellProps = {
  children: ReactNode;
};

export const AppShell = ({ children }: AppShellProps) => {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 h-full">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
};
