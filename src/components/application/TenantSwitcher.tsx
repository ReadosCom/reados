import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/uiframework/DropdownMenu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@components/uiframework/Sidebar';
import { useTranslation } from '@components/i18n/useTranslation.ts';

type TenantItem = {
  name: string;
  plan: string;
};

type TenantSwitcherProps = {
  tenants: TenantItem[];
};

export const TenantSwitcher = ({ tenants }: TenantSwitcherProps) => {
  const { t } = useTranslation(`./TenantSwitcher.i18n.ts`);
  const activeTenant = tenants[0];

  if (!activeTenant) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                {activeTenant.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTenant.name}</span>
                <span className="truncate text-xs text-muted-foreground">{t(activeTenant.plan)}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {tenants.map((tenant) => (
              <DropdownMenuItem key={tenant.name}>
                <span>{tenant.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{t(tenant.plan)}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
