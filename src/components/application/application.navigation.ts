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
  Home01Icon,
  Note04Icon,
  PayByCheckIcon,
  Trolley01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';

export type ApplicationIcon = typeof Building06Icon;

type NavItem = {
  title: string;
  link?: string;
  icon?: ApplicationIcon;
};

type NavMainItem = {
  title: string;
  link?: string;
  icon?: ApplicationIcon;
  isActive?: boolean;
  items?: NavItem[];
};

type ProjectItem = {
  name: string;
  link: string;
};

type TenantItem = {
  name: string;
  plan: string;
};

export type ApplicationSidebarData = {
  tenants: TenantItem[];
  navMain: NavMainItem[];
  projects: ProjectItem[];
};

export const applicationSidebarData: ApplicationSidebarData = {
  tenants: [
    {
      name: 'Reados',
      plan: 'Enterprise',
    },
  ],
  navMain: [
    {
      title: 'Home',
      link: '/',
      icon: Home01Icon,
    },
    {
      title: 'ERP',
      link: '/erp',
      icon: Building06Icon,
      isActive: true,
      items: [
        {
          title: 'Accounting',
          link: '/erp/accounting',
          icon: BookOpen02Icon,
        },
        {
          title: 'CRM',
          link: '/erp/crm',
          icon: UserGroupIcon,
        },
        {
          title: 'Sales',
          link: '/erp/sales',
          icon: BadgePercentIcon,
        },
        {
          title: 'Billing',
          link: '/erp/billing',
          icon: Invoice03Icon,
        },
        {
          title: 'Contract Management',
          link: '/erp/contract-management',
          icon: ContractsIcon,
        },
        {
          title: 'Inventory',
          link: '/erp/inventory',
          icon: BoundingBoxIcon,
        },
        {
          title: 'Procurement',
          link: '/erp/procurement',
          icon: Trolley01Icon,
        },
        {
          title: 'HR',
          link: '/erp/hr',
          icon: FlyingHumanIcon,
        },
        {
          title: 'Payroll',
          link: '/erp/payroll',
          icon: PayByCheckIcon,
        },
      ],
    },
    {
      title: 'Project Management',
      link: '/project-management',
      icon: Note04Icon,
    },
    {
      title: 'Document Management',
      link: '/document-management',
      icon: LegalDocument02Icon,
    },
    {
      title: 'Communication',
      link: '/communication',
      icon: BubbleChatSparkIcon,
    },
    {
      title: 'Content Management',
      link: '/content-management',
      icon: AiContentGenerator02Icon,
    },
  ],
  projects: [],
};

export const applicationModules = [
  { name: 'Accounting', link: '/erp/accounting' },
  { name: 'CRM', link: '/erp/crm' },
  { name: 'Sales', link: '/erp/sales' },
  { name: 'Billing', link: '/erp/billing' },
  { name: 'Contract Management', link: '/erp/contract-management' },
  { name: 'Inventory', link: '/erp/inventory' },
  { name: 'Procurement', link: '/erp/procurement' },
  { name: 'HR', link: '/erp/hr' },
  { name: 'Payroll', link: '/erp/payroll' },
  { name: 'Projects', link: '/project-management' },
  { name: 'Documents', link: '/document-management' },
  { name: 'Communication', link: '/communication' },
  { name: 'Content Management', link: '/content-management' },
  { name: 'Workflow', link: '/workflow' },
  { name: 'Audit', link: '/audit' },
  { name: 'Search', link: '/search' },
  { name: 'Notification', link: '/notification' },
] as const;
