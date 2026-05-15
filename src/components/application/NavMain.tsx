import type { NavMainItem, NavigationTarget } from '@components/application/application.navigation.schema.ts';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
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
                      {item.Icon ? <item.Icon stroke={2} /> : null}
                      <span>{t(item.title)}</span>
                      <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" stroke={2} />
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
