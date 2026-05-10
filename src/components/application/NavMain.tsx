import type { ApplicationIcon } from '@components/application/application.navigation.ts';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
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

type NavMainItem = {
  title: string;
  url?: string;
  link?: string;
  icon?: ApplicationIcon;
  isActive?: boolean;
  items?: Array<{
    title: string;
    url?: string;
    link?: string;
    icon?: ApplicationIcon;
  }>;
};

type NavMainProps = {
  items: NavMainItem[];
};

export const NavMain = ({ items }: NavMainProps) => {
  const { t } = useTranslation(`./NavMain.i18n.ts`);
  const renderNavigationTarget = ({ icon, link, title, url }: { icon?: ApplicationIcon; link?: string; title: string; url?: string }) => {
    if (url) {
      return (
        <a href={url}>
          {icon ? <HugeiconsIcon icon={icon} strokeWidth={2} /> : null}
          <span>{t(title)}</span>
        </a>
      );
    }

    if (link) {
      return (
        <Link to={link as never}>
          {icon ? <HugeiconsIcon icon={icon} strokeWidth={2} /> : null}
          <span>{t(title)}</span>
        </Link>
      );
    }

    return (
      <span>
        {icon ? <HugeiconsIcon icon={icon} strokeWidth={2} /> : null}
        <span>{t(title)}</span>
      </span>
    );
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            item.items?.length ? (
              <Collapsible className="group/collapsible" defaultOpen={item.isActive} key={item.title} asChild>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={t(item.title)}>
                      {item.icon ? <HugeiconsIcon icon={item.icon} strokeWidth={2} /> : null}
                      <span>{t(item.title)}</span>
                      <HugeiconsIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" icon={ArrowRight01Icon} strokeWidth={2} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            {renderNavigationTarget(subItem)}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={t(item.title)}>
                  {renderNavigationTarget(item)}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
