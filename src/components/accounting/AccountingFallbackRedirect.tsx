import { useAccountingConfigurationQuery } from "@components/accountingConfiguration/accountingConfiguration.query.ts";
import { useTranslation } from "@components/i18n/useTranslation.ts";
import { Navigate } from "@tanstack/react-router";

/**
 * Redirects unknown accounting child paths according to configuration finalization state.
 */
export const AccountingFallbackRedirect = () => {
  const { t } = useTranslation(`./Accounting.i18n.ts`);
  const { data: accountingConfiguration, isPending } = useAccountingConfigurationQuery();
  const isFinalized = accountingConfiguration?.configuration.finalized === true;

  if (isPending) {
    return <p className="text-sm text-muted-foreground">{t(`Loading accounting configuration...`)}</p>;
  }

  if (!isFinalized) {
    return <Navigate replace to="/erp/accounting/configure" />;
  }

  return <Navigate replace to="/erp/accounting" />;
};
