import type { ApplicationIcon } from '@components/application/application.navigation.ts';
import { HugeiconsIcon } from '@hugeicons/react';
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
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <Collapsible defaultOpen={item.isActive} key={item.title} asChild>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon ? <HugeiconsIcon icon={item.icon} strokeWidth={2} /> : null}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {item.items?.length ? (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              {subItem.icon ? <HugeiconsIcon icon={subItem.icon} strokeWidth={2} /> : null}
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
