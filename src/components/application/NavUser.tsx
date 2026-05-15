import { setBrowserLocation } from '@components/application/application.browser.ts';
import { useLogoutAuthenticationSessionMutation } from '@components/authentication/authentication.query.ts';
import { IconSelector } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
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
  const profileItem: {
    link?: string;
    url?: string;
  } = {
    link: `/profile`,
  };

  const onSignOut = async () => {
    try {
      await mutateAsync();
    } finally {
      setBrowserLocation('/authentication');
    }
  };

  const renderProfileNavigationTarget = () => {
    if (profileItem.url) {
      return <a href={profileItem.url}>{t('Profile')}</a>;
    }

    if (profileItem.link) {
      return <Link to={profileItem.link}>{t('Profile')}</Link>;
    }

    return <span>{t('Profile')}</span>;
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="cursor-pointer" size="lg">
              <Avatar size="sm">
                <AvatarFallback>{toInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <IconSelector className="ml-auto size-4" stroke={2} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild={Boolean(profileItem.url || profileItem.link)}>
              {renderProfileNavigationTarget()}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isPending}
              onSelect={(event) => {
                event.preventDefault();
                void onSignOut();
              }}
            >
              {isPending ? t('Signing out...') : t('Sign out')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
