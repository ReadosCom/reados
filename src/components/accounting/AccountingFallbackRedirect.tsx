import { useAccountingConfigurationQuery } from '@components/accountingConfiguration/accountingConfiguration.query.ts';
import { useTranslation } from '@components/i18n/useTranslation.ts';
import { Skeleton } from '@components/uiframework/Skeleton';
import { Navigate, useRouterState } from '@tanstack/react-router';

/**
 * Redirects unknown accounting child paths according to configuration finalization state.
 */
export const AccountingFallbackRedirect = () => {
  const { t } = useTranslation(`./Accounting.i18n.ts`);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { data: accountingConfiguration, isPending } = useAccountingConfigurationQuery();
  const isFinalized = accountingConfiguration?.configuration.finalized === true;
  const isAccountingRoute = pathname === `/erp/accounting` || pathname.startsWith(`/erp/accounting/`);

  if (!isAccountingRoute) {
    return <Navigate replace to="/" />;
  }

  if (isPending) {
    return (
      <>
        <p className="text-sm text-muted-foreground">{t(`Loading accounting configuration...`)}</p>
        <Skeleton className="mt-4 h-28 rounded-xl" />
      </>
    );
  }

  if (!isFinalized) {
    return <Navigate replace to={'/erp/accounting/configuration/segments' as never} />;
  }

  return <Navigate replace to={'/erp/accounting' as never} />;
};
