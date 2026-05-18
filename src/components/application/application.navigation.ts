import type { ApplicationSidebarData } from '@components/application/application.navigation.schema.ts';
import {
  IconBook,
  IconSettings,
  IconBuilding,
  IconChecklist,
  IconCoin,
  IconFileDescription,
  IconHome,
  IconMessageCircle,
  IconNotebook,
  IconPackage,
  IconReceipt2,
  IconShoppingCart,
  IconSparkles,
  IconUsers,
  IconUserStar,
} from '@tabler/icons-react';

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
      Icon: IconHome,
    },
    {
      title: 'ERP',
      link: '/erp',
      Icon: IconBuilding,
      isActive: true,
      items: [
        {
          title: 'Accounting',
          link: '/erp/accounting',
          Icon: IconBook,
          items: [
            {
              title: 'Configure',
              link: '/erp/accounting/configure',
              Icon: IconSettings,
            },
          ],
        },
        {
          title: 'CRM',
          link: '/erp/crm',
          Icon: IconUsers,
        },
        {
          title: 'Sales',
          link: '/erp/sales',
          Icon: IconCoin,
        },
        {
          title: 'Billing',
          link: '/erp/billing',
          Icon: IconReceipt2,
        },
        {
          title: 'Contract Management',
          link: '/erp/contract-management',
          Icon: IconFileDescription,
        },
        {
          title: 'Inventory',
          link: '/erp/inventory',
          Icon: IconPackage,
        },
        {
          title: 'Procurement',
          link: '/erp/procurement',
          Icon: IconShoppingCart,
        },
        {
          title: 'HR',
          link: '/erp/hr',
          Icon: IconUserStar,
        },
        {
          title: 'Payroll',
          link: '/erp/payroll',
          Icon: IconChecklist,
        },
      ],
    },
    {
      title: 'Project Management',
      link: '/project-management',
      Icon: IconNotebook,
    },
    {
      title: 'Document Management',
      link: '/document-management',
      Icon: IconFileDescription,
    },
    {
      title: 'Communication',
      link: '/communication',
      Icon: IconMessageCircle,
    },
    {
      title: 'Content Management',
      link: '/content-management',
      Icon: IconSparkles,
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
