import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from '@components/i18n/useTranslation.ts';

import { useDiscoverTenantsMutation } from '@components/tenant/tenant.client.ts';
import { Button } from '@components/uiframework/Button';
import { type IdentifierLoginFormValues, identifierLoginSchema } from './identify.schema';

/**
 * Render the identifier-first login experience for tenant discovery.
 */
export const Identify = () => {
  const { t } = useTranslation(`./Identify.i18n.ts`);
  const [lookupEmail, setLookupEmail] = useState<string | null>(null);
  const { data, error, isPending, isSuccess, mutateAsync, reset } = useDiscoverTenantsMutation();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<IdentifierLoginFormValues>({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(identifierLoginSchema),
  });

  const onSubmit = async ({ email }: IdentifierLoginFormValues) => {
    setLookupEmail(email);
    reset();

    try {
      await mutateAsync({ email });
    } catch {
      // The mutation state carries the error, and the UI renders a generic fallback message below.
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.95_0.02_220),transparent_60%)]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-4xl items-start px-6 py-12">
        <div className="w-full rounded-2xl border border-border bg-card/90 p-8 shadow-sm backdrop-blur sm:p-10">
          <div className="mb-8 flex items-center gap-4">
            <img alt="Reados" className="h-16 w-auto shrink-0" src="/assets/images/reados.png" />
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-card-foreground">{t('Sign in to Reados')}</h1>
          </div>

          <form
            onSubmit={(event) => {
              void handleSubmit(onSubmit)(event);
            }}
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-card-foreground" htmlFor="login-email">
                {t('Email address')}
              </label>
              <input
                {...register('email')}
                autoComplete="email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                id="login-email"
                placeholder={t('name@example.com')}
                type="email"
              />
              {errors.email?.message ? <p className="text-sm text-destructive">{t(errors.email.message)}</p> : null}
            </div>

            <div className="mt-6 flex justify-end">
              <Button disabled={isSubmitting} size="lg" type="submit">
                {t('Sign in')}
              </Button>
            </div>
          </form>

          {lookupEmail ? (
            <div aria-live="polite" className="mt-8">
              {isPending ? <p className="text-sm text-muted-foreground">{t('Looking up tenants for {{email}}...', { email: lookupEmail })}</p> : null}

              {error ? <p className="text-sm text-destructive">{t('We could not look up your tenants right now. Please try again.')}</p> : null}

              {isSuccess && data ? (
                data.tenants.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-card-foreground">{t('Choose a tenant for {{email}}.', { email: lookupEmail })}</p>

                    <ul className="space-y-2">
                      {data.tenants.map((tenant) => (
                        <li key={tenant.slug}>
                          <Button asChild className="w-full justify-center" size="lg">
                            <a href={`${tenant.loginUrl}?email=${encodeURIComponent(lookupEmail)}`}>{t('Continue to {{name}}', { name: tenant.name })}</a>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('No tenant was found for {{email}}.', { email: lookupEmail })}</p>
                )
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
};
