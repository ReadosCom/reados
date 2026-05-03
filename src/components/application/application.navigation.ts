import {
  AiContentGenerator02Icon,
  BadgePercentIcon,
  BookOpen02Icon,
  BoundingBoxIcon,
  BubbleChatSparkIcon,
  Building06Icon,
  ContractsIcon,
  FlyingHumanIcon,
  Invoice03Icon,
  LegalDocument02Icon,
  Note04Icon,
  PayByCheckIcon,
  Trolley01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';

export type ApplicationIcon = typeof Building06Icon;

type NavItem = {
  title: string;
  url: string;
  icon?: ApplicationIcon;
};

type NavMainItem = {
  title: string;
  url: string;
  icon?: ApplicationIcon;
  isActive?: boolean;
  items?: NavItem[];
};

type ProjectItem = {
  name: string;
  url: string;
};

type TenantItem = {
  name: string;
  plan: string;
};

type UserItem = {
  name: string;
  email: string;
  avatar: string;
};

export type ApplicationSidebarData = {
  user: UserItem;
  tenants: TenantItem[];
  navMain: NavMainItem[];
  projects: ProjectItem[];
};

export const applicationSidebarData: ApplicationSidebarData = {
  user: {
    name: 'Demo User',
    email: 'demo@reados.local',
    avatar: '',
  },
  tenants: [
    {
      name: 'Reados',
      plan: 'Enterprise',
    },
  ],
  navMain: [
    {
      title: 'ERP',
      url: '/erp',
      icon: Building06Icon,
      isActive: true,
      items: [
        {
          title: 'Accounting',
          url: '/erp/accounting',
          icon: BookOpen02Icon,
        },
        {
          title: 'CRM',
          url: '/erp/crm',
          icon: UserGroupIcon,
        },
        {
          title: 'Sales',
          url: '/erp/sales',
          icon: BadgePercentIcon,
        },
        {
          title: 'Billing',
          url: '/erp/billing',
          icon: Invoice03Icon,
        },
        {
          title: 'Contract Management',
          url: '/erp/contract-management',
          icon: ContractsIcon,
        },
        {
          title: 'Inventory',
          url: '/erp/inventory',
          icon: BoundingBoxIcon,
        },
        {
          title: 'Procurement',
          url: '/erp/procurement',
          icon: Trolley01Icon,
        },
        {
          title: 'HR',
          url: '/erp/hr',
          icon: FlyingHumanIcon,
        },
        {
          title: 'Payroll',
          url: '/erp/payroll',
          icon: PayByCheckIcon,
        },
      ],
    },
    {
      title: 'Project Management',
      url: '/project-management',
      icon: Note04Icon,
    },
    {
      title: 'Document Management',
      url: '/document-management',
      icon: LegalDocument02Icon,
    },
    {
      title: 'Communication',
      url: '/communication',
      icon: BubbleChatSparkIcon,
    },
    {
      title: 'Content Management',
      url: '/content-management',
      icon: AiContentGenerator02Icon,
    },
  ],
};

export const applicationModules = [
  { name: 'Accounting', path: '/erp/accounting' },
  { name: 'CRM', path: '/erp/crm' },
  { name: 'Sales', path: '/erp/sales' },
  { name: 'Billing', path: '/erp/billing' },
  { name: 'Contract Management', path: '/erp/contract-management' },
  { name: 'Inventory', path: '/erp/inventory' },
  { name: 'Procurement', path: '/erp/procurement' },
  { name: 'HR', path: '/erp/hr' },
  { name: 'Payroll', path: '/erp/payroll' },
  { name: 'Projects', path: '/project-management' },
  { name: 'Documents', path: '/document-management' },
  { name: 'Communication', path: '/communication' },
  { name: 'Content Management', path: '/content-management' },
  { name: 'Workflow', path: '/workflow' },
  { name: 'Audit', path: '/audit' },
  { name: 'Search', path: '/search' },
  { name: 'Notification', path: '/notification' },
] as const;
