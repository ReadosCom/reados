import type { ApplicationIcon } from '@components/application/application.navigation.ts';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTranslation } from '@components/i18n/useTranslation.ts';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@components/uiframework/Collapsible';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@components/uiframework/Sidebar';

type NavMainItem = {
  title: string;
  url: string;
  icon?: ApplicationIcon;
  isActive?: boolean;
  items?: Array<{
    title: string;
    url: string;
    icon?: ApplicationIcon;
  }>;
};

type NavMainProps = {
  items: NavMainItem[];
};

export const NavMain = ({ items }: NavMainProps) => {
  const { t } = useTranslation(`./NavMain.i18n.ts`);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('Main')}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            item.items?.length ? (
              <Collapsible defaultOpen={item.isActive} key={item.title} asChild>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={t(item.title)}>
                      {item.icon ? <HugeiconsIcon icon={item.icon} strokeWidth={2} /> : null}
                      <span>{t(item.title)}</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              {subItem.icon ? <HugeiconsIcon icon={subItem.icon} strokeWidth={2} /> : null}
                              <span>{t(subItem.title)}</span>
                            </a>
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
                  <a href={item.url}>
                    {item.icon ? <HugeiconsIcon icon={item.icon} strokeWidth={2} /> : null}
                    <span>{t(item.title)}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
