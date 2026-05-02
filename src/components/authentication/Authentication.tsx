import { Button, ButtonAppearance, Input, LoginPageLayout } from '@canonical/react-components';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

import { otpRequestBodySchema, otpVerifyBodySchema, type OtpRequestBody, type OtpVerifyBody } from './authentication.schema.ts';
import { useRequestAuthenticationOtpMutation, useVerifyAuthenticationOtpMutation } from './authentication.query.ts';
import './Authentication.scss';

const getCurrentTenantRootPath = () => {
  const browserWindow = (
    globalThis as {
      window?: {
        location: {
          host: string;
          protocol: string;
        };
      };
    }
  ).window;

  if (!browserWindow) {
    return `/`;
  }

  return `${browserWindow.location.protocol}//${browserWindow.location.host}/`;
};

const getEmailFromQueryString = () => {
  const browserWindow = (
    globalThis as {
      window?: {
        location: {
          search: string;
        };
      };
    }
  ).window;

  if (!browserWindow) {
    return ``;
  }

  const queryEmail = new URLSearchParams(browserWindow.location.search).get(`email`);

  if (!queryEmail) {
    return ``;
  }

  const parsedEmail = otpRequestBodySchema.shape.email.safeParse(queryEmail);

  if (!parsedEmail.success) {
    return ``;
  }

  return parsedEmail.data;
};

const genericOtpRequestMessage = `If this account is eligible, we sent a verification code.`;

/**
 * Render the tenant-scoped authentication experience.
 */
export const Authentication = () => {
  const initialEmail = getEmailFromQueryString();
  const [requestMessage, setRequestMessage] = useState<string | null>(null);
  const [requestedEmail, setRequestedEmail] = useState<string | null>(null);
  const requestOtpMutation = useRequestAuthenticationOtpMutation();
  const verifyOtpMutation = useVerifyAuthenticationOtpMutation();

  const {
    formState: { errors: requestErrors, isSubmitting: isSubmittingRequest },
    handleSubmit: handleRequestSubmit,
    register: registerRequest,
  } = useForm<OtpRequestBody>({
    defaultValues: {
      email: initialEmail,
    },
    resolver: zodResolver(otpRequestBodySchema),
  });

  const {
    formState: { errors: verifyErrors, isSubmitting: isSubmittingVerify },
    handleSubmit: handleVerifySubmit,
    register: registerVerify,
  } = useForm<Pick<OtpVerifyBody, `code`>>({
    defaultValues: {
      code: ``,
    },
    resolver: zodResolver(
      otpVerifyBodySchema.pick({
        code: true,
      }),
    ),
  });

  const onRequestOtp = async ({ email }: OtpRequestBody) => {
    setRequestedEmail(email);

    try {
      const result = await requestOtpMutation.mutateAsync({ email });
      setRequestMessage(result.message);
    } catch {
      setRequestMessage(genericOtpRequestMessage);
    }
  };

  const onVerifyOtp = async ({ code }: Pick<OtpVerifyBody, `code`>) => {
    if (!requestedEmail) {
      return;
    }

    await verifyOtpMutation.mutateAsync({
      code,
      email: requestedEmail,
    });

    window.location.href = getCurrentTenantRootPath();
  };

  return (
    <main className="authentication" aria-labelledby="authentication-page-title">
      <LoginPageLayout title="Authenticate with Reados" logo={{ src: `/assets/images/reados.png`, title: `Reados`, url: `/` }}>
        <h1 id="authentication-page-title">Sign in with a one-time code</h1>
        <p>Enter your work email to receive a one-time verification code.</p>

        <form
          className="authentication__form"
          onSubmit={(event) => {
            void handleRequestSubmit(onRequestOtp)(event);
          }}
        >
          <Input
            {...registerRequest(`email`)}
            disabled={isSubmittingRequest || Boolean(requestedEmail)}
            error={requestErrors.email?.message}
            id={`authentication-email`}
            label={`Email address`}
            placeholder={`name@example.com`}
            stacked
            type={`email`}
          />

          <div className="u-align--right">
            <Button appearance={ButtonAppearance.BRAND} disabled={isSubmittingRequest || Boolean(requestedEmail)} type={`submit`}>
              Send verification code
            </Button>
          </div>
        </form>

        {requestMessage ? (
          <p className="authentication__status" aria-live="polite">
            {requestMessage}
          </p>
        ) : null}

        {requestOtpMutation.error ? <p className="authentication__error">We could not request a verification code right now. Please try again.</p> : null}

        {requestedEmail ? (
          <form
            className="authentication__form"
            onSubmit={(event) => {
              void handleVerifySubmit(onVerifyOtp)(event);
            }}
          >
            <Input {...registerVerify(`code`)} error={verifyErrors.code?.message} id={`authentication-otp-code`} label={`Verification code`} maxLength={6} placeholder={`123456`} stacked type={`text`} />

            <div className="u-align--right authentication__actions">
              <Button appearance={ButtonAppearance.BASE} element="a" href={`/`}>
                Back to home
              </Button>
              <Button appearance={ButtonAppearance.BRAND} disabled={isSubmittingVerify} type={`submit`}>
                Verify and continue
              </Button>
            </div>
          </form>
        ) : null}

        {verifyOtpMutation.error ? <p className="authentication__error">The verification code is invalid or expired.</p> : null}
      </LoginPageLayout>
    </main>
  );
};
