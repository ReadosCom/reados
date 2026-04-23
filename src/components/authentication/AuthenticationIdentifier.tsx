import { Button, ButtonAppearance, Input, LoginPageLayout } from '@canonical/react-components';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { type IdentifierLoginFormValues, identifierLoginSchema } from './authentication.schema';
import './AuthenticationIdentifier.scss';

/**
 * Render the identifier-first login experience for tenant discovery.
 */
export const AuthenticationIdentifier = () => {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

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
    setSubmittedEmail(email);
  };

  return (
    <div className="authentication-identifier">
      <LoginPageLayout title="" logo={{ src: `/assets/images/reados.png`, title: `Reados`, url: `/` }}>
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

          {submittedEmail ? (
            <div aria-live="polite">
              <p>Tenant lookup requested for {submittedEmail}.</p>
            </div>
          ) : null}
        </div>
      </LoginPageLayout>
    </div>
  );
};
