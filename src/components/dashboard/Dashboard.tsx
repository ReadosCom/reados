import { applicationModules } from "@components/application/application.navigation.ts";
import { Link } from "@tanstack/react-router";
import { Button } from "@components/uiframework/Button";
import { useTranslation } from "@components/i18n/useTranslation.ts";

/**
 * Render the tenant application dashboard.
 */
export const Dashboard = () => {
  const { t } = useTranslation(`./Dashboard.i18n.ts`);

  return (
    <>
      <section aria-label={t("Available modules")} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {applicationModules.map(({ name, link }) => (
          <article className="flex min-h-40 flex-col rounded-xl border border-border bg-card p-5 shadow-sm" key={name}>
            <h2 className="text-base font-semibold text-card-foreground">{t(name)}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{t("Open {{module}} workflows and continue where you left off.", { module: t(name).toLocaleLowerCase() })}</p>
            <div className="mt-4 flex justify-end">
              <Button asChild>
                <Link to={link as never}>{t("Go")}</Link>
              </Button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
};
