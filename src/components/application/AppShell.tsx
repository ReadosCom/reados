import type { ReactNode } from 'react';

import { AppSidebar } from '@components/application/AppSidebar';
import { SidebarInset, SidebarProvider } from '@components/uiframework/Sidebar';
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
          <div className="flex flex-1 flex-col gap-4 p-4 h-full">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
};
