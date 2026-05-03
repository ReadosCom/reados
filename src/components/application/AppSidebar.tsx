'use client';

import { applicationSidebarData } from '@components/application/application.navigation.ts';
import { NavMain } from '@components/application/NavMain';
import { NavUser } from '@components/application/NavUser';
import { TenantSwitcher } from '@components/application/TenantSwitcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarTrigger } from '@components/uiframework/Sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <div className="min-w-0 flex-1">
            <TenantSwitcher tenants={applicationSidebarData.tenants} />
          </div>
          <SidebarTrigger className="shrink-0 group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={applicationSidebarData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={applicationSidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
