'use client';

import { applicationSidebarData } from '@components/application/application.navigation.ts';
import { useAuthenticationSessionQuery } from '@components/authentication/authentication.query.ts';
import { NavMain } from '@components/application/NavMain';
import { NavUser } from '@components/application/NavUser';
import { TenantSwitcher } from '@components/application/TenantSwitcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@components/uiframework/Sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: authenticationSession } = useAuthenticationSessionQuery();
  const sidebarUser = authenticationSession?.session
    ? {
        avatar: ``,
        email: authenticationSession.session.email,
        name: authenticationSession.session.displayName,
      }
    : {
        avatar: ``,
        email: ``,
        name: ``,
      };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TenantSwitcher tenants={applicationSidebarData.tenants} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={applicationSidebarData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
