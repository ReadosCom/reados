import { useTranslation } from '@components/i18n/useTranslation.ts';
import { Tabs, TabsList, TabsTrigger } from '@components/uiframework/Tabs';
import { Link, Outlet, useLocation } from '@tanstack/react-router';

/**
 * Renders accounting configuration tabs and nested configuration content.
 */
export const AccountingConfiguration = () => {
  const { t } = useTranslation(`./AccountingConfiguration.i18n.ts`);
  const location = useLocation();

  const activeTab = location.pathname.includes(`/segments`) ? `segments` : `segments`;

  return (
    <section className="space-y-4" aria-label={t(`Accounting configuration`)}>
      <Tabs value={activeTab}>
        <TabsList>
          <TabsTrigger asChild value="segments">
            <Link to={"/erp/accounting/configuration/segments" as never}>
              {t(`Segments`)}
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Outlet />
    </section>
  );
};
