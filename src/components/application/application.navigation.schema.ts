export type ApplicationIcon = React.ComponentType<{ className?: string; stroke?: number }>;

export type NavigationTarget = {
  title: string;
  url?: string;
  link?: string;
  Icon?: ApplicationIcon;
  items?: NavigationTarget[];
};

export type NavMainItem = NavigationTarget & {
  isActive?: boolean;
};

export type ProjectItem = {
  name: string;
  link: string;
};

export type TenantItem = {
  link?: string;
  name: string;
  plan: string;
  url?: string;
};

export type ApplicationSidebarData = {
  tenants: TenantItem[];
  navMain: NavMainItem[];
  projects: ProjectItem[];
};
