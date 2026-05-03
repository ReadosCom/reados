import { Avatar, AvatarFallback } from '@components/uiframework/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/uiframework/DropdownMenu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@components/uiframework/Sidebar';

type UserItem = {
  name: string;
  email: string;
  avatar: string;
};

type NavUserProps = {
  user: UserItem;
};

const toInitials = (name: string) => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? '')
    .join('');
};

export const NavUser = ({ user }: NavUserProps) => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <Avatar size="sm">
                <AvatarFallback>{toInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <a href="/authentication">Sign out</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/">Go to home</a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
