import type { NavMainItem, NavigationTarget } from '@components/application/application.navigation.schema.ts';
import { IconChevronRight } from '@tabler/icons-react';
import { Link, useRouterState } from '@tanstack/react-router';
import { useTranslation } from '@components/i18n/useTranslation.ts';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@components/uiframework/Collapsible';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@components/uiframework/Sidebar';

type NavMainProps = {
  items: NavMainItem[];
};

export const NavMain = ({ items }: NavMainProps) => {
  const { t } = useTranslation(`./NavMain.i18n.ts`);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const normalizePath = (path: string) => {
    return path.endsWith(`/`) && path.length > 1 ? path.slice(0, -1) : path;
  };

  const isLinkActive = (link?: string) => {
    if (!link) {
      return false;
    }

    const normalizedCurrentPath = normalizePath(pathname);
    const normalizedLink = normalizePath(link);

    return normalizedCurrentPath === normalizedLink;
  };

  const isItemOpen = (item: NavigationTarget): boolean => {
    if (item.link) {
      const normalizedCurrentPath = normalizePath(pathname);
      const normalizedLink = normalizePath(item.link);
      if (normalizedCurrentPath === normalizedLink || normalizedCurrentPath.startsWith(`${normalizedLink}/`)) {
        return true;
      }
    }

    return item.items?.some((childItem) => isItemOpen(childItem)) ?? false;
  };

  const isItemActive = (item: NavigationTarget): boolean => {
    if (isLinkActive(item.link)) {
      return true;
    }

    return false;
  };

  const renderNavigationTarget = ({ Icon, link, title, url }: NavigationTarget) => {
    if (url) {
      return (
        <a href={url}>
          {Icon ? <Icon stroke={2} /> : null}
          <span>{t(title)}</span>
        </a>
      );
    }

    if (link) {
      return (
        <Link to={link as never}>
          {Icon ? <Icon stroke={2} /> : null}
          <span>{t(title)}</span>
        </Link>
      );
    }

    return (
      <span>
        {Icon ? <Icon stroke={2} /> : null}
        <span>{t(title)}</span>
      </span>
    );
  };

  const renderItem = (item: NavigationTarget, level: number) => {
    const hasChildren = Boolean(item.items?.length);
    const active = isItemActive(item);
    const open = isItemOpen(item);
    const isRoot = level === 0;

    const leaf = renderNavigationTarget(item);
    const branchLabel = (
      <>
        {item.Icon ? <item.Icon stroke={2} /> : null}
        <span>{t(item.title)}</span>
        <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" stroke={2} />
      </>
    );

    if (hasChildren) {
      const ItemWrapper = isRoot ? SidebarMenuItem : SidebarMenuSubItem;

      return (
        <Collapsible className="group/collapsible" key={`${item.title}-${open ? `open` : `closed`}`} defaultOpen={open} asChild>
          <ItemWrapper>
            <CollapsibleTrigger asChild>
              {isRoot ? (
                <SidebarMenuButton isActive={active} tooltip={t(item.title)}>
                  {branchLabel}
                </SidebarMenuButton>
              ) : (
                <SidebarMenuSubButton asChild className="w-full" isActive={active}>
                  <button type="button">{branchLabel}</button>
                </SidebarMenuSubButton>
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub className="mr-0 pr-0">
                {item.items?.map((childItem) => renderItem(childItem, level + 1))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </ItemWrapper>
        </Collapsible>
      );
    }

    if (isRoot) {
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={active} tooltip={t(item.title)}>
            {leaf}
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuSubItem key={item.title}>
        <SidebarMenuSubButton asChild isActive={active}>
          {leaf}
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => renderItem(item, 0))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
