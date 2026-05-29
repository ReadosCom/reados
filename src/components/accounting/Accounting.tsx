import { useTranslation } from "@components/i18n/useTranslation.ts";
import { Card, CardContent, CardHeader, CardTitle } from "@components/uiframework/Card";
import { Skeleton } from "@components/uiframework/Skeleton";

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
  const { data: summary, isError, isPending } = useAccountingDashboardSummaryQuery();

  return (
    <>
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
      {isPending ? (
        <section aria-label={t(`Accounting summary`)} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </section>
      ) : null}
      {isError ? <p className="mt-4 text-sm text-destructive">{t(`Could not load accounting summary right now.`)}</p> : null}
    </>
  );
};
