import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/uiframework/DropdownMenu';
import { UnfoldMoreIcon } from '@hugeicons/core-free-icons';
import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@components/uiframework/Sidebar';
import { useTranslation } from '@components/i18n/useTranslation.ts';

type TenantItem = {
  link?: string;
  name: string;
  plan: string;
  url?: string;
};

type TenantSwitcherProps = {
  tenants: TenantItem[];
};

export const TenantSwitcher = ({ tenants }: TenantSwitcherProps) => {
  const { t } = useTranslation(`./TenantSwitcher.i18n.ts`);
  const activeTenant = tenants[0];
  const renderTenantTarget = (tenant: TenantItem) => {
    if (tenant.url) {
      return (
        <a href={tenant.url}>
          <span>{tenant.name}</span>
          <span className="ml-auto text-xs text-muted-foreground">{t(tenant.plan)}</span>
        </a>
      );
    }

    if (tenant.link) {
      return (
        <Link className="flex w-full items-center gap-2" to={tenant.link as never}>
          <span>{tenant.name}</span>
          <span className="ml-auto text-xs text-muted-foreground">{t(tenant.plan)}</span>
        </Link>
      );
    }

    return (
      <>
        <span>{tenant.name}</span>
        <span className="ml-auto text-xs text-muted-foreground">{t(tenant.plan)}</span>
      </>
    );
  };

  if (!activeTenant) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="cursor-pointer" size="lg">
              <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                {activeTenant.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTenant.name}</span>
                <span className="truncate text-xs text-muted-foreground">{t(activeTenant.plan)}</span>
              </div>
              <HugeiconsIcon className="ml-auto size-4" icon={UnfoldMoreIcon} strokeWidth={2} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {tenants.map((tenant) => (
              <DropdownMenuItem asChild={Boolean(tenant.url || tenant.link)} key={tenant.name}>
                {renderTenantTarget(tenant)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
