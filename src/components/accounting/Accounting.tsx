import { AppShell } from "@components/application/AppShell";
import { useAccountingConfigurationQuery } from "@components/accountingConfiguration/accountingConfiguration.query.ts";
import { useTranslation } from "@components/i18n/useTranslation.ts";
import { Card, CardContent, CardHeader, CardTitle } from "@components/uiframework/Card";
import { Navigate } from "@tanstack/react-router";

import { useAccountingDashboardSummaryQuery } from "./accounting.query.ts";

const asCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat(undefined, {
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: `currency`,
  }).format(amount);
};

/**
 * Renders the accounting module landing page.
 */
export const Accounting = () => {
  const { t } = useTranslation(`./Accounting.i18n.ts`);
  const { data: accountingConfiguration, isPending: isAccountingConfigurationPending } = useAccountingConfigurationQuery();
  const { data: summary, isError, isPending } = useAccountingDashboardSummaryQuery();
  const isFinalized = accountingConfiguration?.configuration.finalized === true;

  if (isAccountingConfigurationPending) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">{t(`Loading accounting configuration...`)}</p>
      </AppShell>
    );
  }

  if (!isFinalized) {
    return <Navigate replace to="/erp/accounting/configure" />;
  }

  return (
    <AppShell>
      <main className="relative min-h-[100vh] overflow-hidden rounded-xl bg-background md:min-h-min">
        <div className="relative w-full h-full px-2 py-4 sm:px-4 sm:py-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label={t(`Accounting summary`)}>
            <Card>
              <CardHeader>
                <CardTitle>{t(`Open invoices`)}</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">{summary?.openInvoices ?? `--`}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t(`Overdue invoices`)}</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">{summary?.overdueInvoices ?? `--`}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t(`Unpaid balance`)}</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">{summary ? asCurrency(summary.unpaidBalance, summary.currency) : `--`}</CardContent>
            </Card>
          </section>
          {isPending ? <p className="mt-4 text-sm text-muted-foreground">{t(`Loading accounting summary...`)}</p> : null}
          {isError ? <p className="mt-4 text-sm text-destructive">{t(`Could not load accounting summary right now.`)}</p> : null}
        </div>
      </main>
    </AppShell>
  );
};
