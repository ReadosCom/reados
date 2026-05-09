import { applicationModules } from '@components/application/application.navigation.ts';
import { Button } from '@components/uiframework/Button';
import { useTranslation } from '@components/i18n/useTranslation.ts';

/**
 * Render the tenant application dashboard.
 */
export const Dashboard = () => {
  const { t } = useTranslation(`./Dashboard.i18n.ts`);

  return (
    <main aria-labelledby="dashboard-title" className="relative min-h-[100vh] overflow-hidden rounded-xl bg-background md:min-h-min">
      <div className="relative w-full h-full px-2 py-4 sm:px-4 sm:py-6">
        <section aria-label={t('Available modules')} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {applicationModules.map(({ name, path }) => (
            <article className="flex min-h-40 flex-col rounded-xl border border-border bg-card p-5 shadow-sm" key={name}>
              <h2 className="text-base font-semibold text-card-foreground">{t(name)}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                {t('Open {{module}} workflows and continue where you left off.', { module: t(name).toLocaleLowerCase() })}
              </p>
              <div className="mt-4 flex justify-end">
                <Button asChild>
                  <a href={path}>{t('Go')}</a>
                </Button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
};
