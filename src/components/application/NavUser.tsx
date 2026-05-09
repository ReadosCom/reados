import { setBrowserLocation } from '@components/application/application.browser.ts';
import { useLogoutAuthenticationSessionMutation } from '@components/authentication/authentication.query.ts';
import { Avatar, AvatarFallback } from '@components/uiframework/Avatar';
import { useTranslation } from '@components/i18n/useTranslation.ts';
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
  const { t } = useTranslation(`./NavUser.i18n.ts`);
  const { isPending, mutateAsync } = useLogoutAuthenticationSessionMutation();

  const onSignOut = async () => {
    try {
      await mutateAsync();
    } finally {
      setBrowserLocation('/authentication');
    }
  };

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
            <DropdownMenuItem
              disabled={isPending}
              onSelect={(event) => {
                event.preventDefault();
                void onSignOut();
              }}
            >
              {isPending ? t('Signing out...') : t('Sign out')}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/">{t('Go to home')}</a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
