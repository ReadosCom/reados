import { Button, ButtonAppearance, Input, LoginPageLayout } from '@canonical/react-components';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { type IdentifierLoginFormValues, identifierLoginSchema } from './identify.schema';
import { useDiscoverTenantsMutation } from '@components/tenant/tenant.api.ts';
import './Identify.scss';

/**
 * Render the identifier-first login experience for tenant discovery.
 */
export const Identify = () => {
  const [lookupEmail, setLookupEmail] = useState<string | null>(null);
  const { data, error, isPending, isSuccess, mutateAsync, reset } = useDiscoverTenantsMutation();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<IdentifierLoginFormValues>({
    defaultValues: {
      email: ``,
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
    <div className="identify">
      <LoginPageLayout title="Sign in to Reados" logo={{ src: `/assets/images/reados.png`, title: `Reados`, url: `/` }}>
        <div>
          <form
            onSubmit={(event) => {
              void handleSubmit(onSubmit)(event);
            }}
          >
            <Input {...register(`email`)} error={errors.email?.message} id={`login-email`} label={`Email address`} placeholder={`name@example.com`} stacked type={`email`} />

            <div className="u-align--right">
              <Button appearance={ButtonAppearance.BRAND} disabled={isSubmitting} type={`submit`}>
                Sign in
              </Button>
            </div>
          </form>

          {lookupEmail ? (
            <div aria-live="polite">
              {isPending ? <p>Looking up tenants for {lookupEmail}...</p> : null}

              {error ? <p>We could not look up your tenants right now. Please try again.</p> : null}

              {isSuccess && data ? (
                data.tenants.length > 0 ? (
                  <div className="identify__tenants">
                    <p>Choose a tenant for {lookupEmail}.</p>

                    <ul className="identify__tenant-list">
                      {data.tenants.map((tenant) => (
                        <li key={tenant.slug}>
                          <Button appearance={ButtonAppearance.BRAND} element="a" href={tenant.loginUrl}>
                            Continue to {tenant.name}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p>No tenant was found for {lookupEmail}.</p>
                )
              ) : null}
            </div>
          ) : null}
        </div>
      </LoginPageLayout>
    </div>
  );
};
