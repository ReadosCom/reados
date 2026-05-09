import { Button } from '@components/uiframework/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/uiframework/Card';
import { useTranslation } from '@components/i18n/useTranslation.ts';

/**
 * Render the public Reados landing page.
 */
export const Home = () => {
  const { t } = useTranslation(`./Home.i18n.ts`);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.95_0.02_220),transparent_60%)]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-4xl items-start px-6 py-12">
        <Card className="w-full bg-card/90 backdrop-blur sm:p-2">
          <CardHeader>
            <div className="mb-2 flex items-center gap-4">
              <img alt="Reados" className="h-16 w-auto shrink-0" src="/assets/images/reados.png" />
              <div>
                <CardTitle>{t('Welcome to Reados')}</CardTitle>
                <CardDescription className="mt-0 max-w-2xl text-pretty text-sm leading-6 sm:text-base">{t('Start your workday with us. Your path to productivity is just a click away.')}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex justify-end">
              <Button asChild size="lg">
                <a href="/identify">{t('Start here')}</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};
