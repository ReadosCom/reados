import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "@components/i18n/useTranslation.ts";

import { getBrowserOrigin, getBrowserSearch, setBrowserLocation } from "@components/application/application.browser.ts";
import { Button } from "@components/uiframework/Button";
import { Input } from "@components/uiframework/Input";
import { otpRequestBodySchema, otpVerifyBodySchema, type OtpRequestBody, type OtpVerifyBody } from "./authentication.schema.ts";
import { useRequestAuthenticationOtpMutation, useVerifyAuthenticationOtpMutation } from "./authentication.query.ts";

const getCurrentTenantRootPath = () => {
  const browserOrigin = getBrowserOrigin();

  if (!browserOrigin) {
    return "/";
  }

  return `${browserOrigin}/`;
};

const getEmailFromQueryString = () => {
  const search = getBrowserSearch();

  if (!search) {
    return "";
  }

  const queryEmail = new URLSearchParams(search).get("email");

  if (!queryEmail) {
    return "";
  }

  const parsedEmail = otpRequestBodySchema.shape.email.safeParse(queryEmail);

  if (!parsedEmail.success) {
    return "";
  }

  return parsedEmail.data;
};

/**
 * Render the tenant-scoped authentication experience.
 */
export const Authentication = () => {
  const { t } = useTranslation(`./Authentication.i18n.ts`);
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
  } = useForm<Pick<OtpVerifyBody, "code">>({
    defaultValues: {
      code: "",
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
      setRequestMessage(t("If this account is eligible, we sent a verification code."));
    }
  };

  const onVerifyOtp = async ({ code }: Pick<OtpVerifyBody, "code">) => {
    if (!requestedEmail) {
      return;
    }

    await verifyOtpMutation.mutateAsync({
      code,
      email: requestedEmail,
    });

    setBrowserLocation(getCurrentTenantRootPath());
  };

  return (
    <main aria-labelledby="authentication-page-title" className="relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.95_0.02_220),transparent_60%)]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-4xl items-start px-6 py-12">
        <div className="w-full rounded-2xl border border-border bg-card/90 p-8 shadow-sm backdrop-blur sm:p-10">
          <div className="mb-8 flex items-center gap-4">
            <img alt="Reados" className="h-16 w-auto shrink-0" src="/assets/images/reados.png" />
            <div>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-card-foreground" id="authentication-page-title">
                {t("Sign in with a one-time code")}
              </h1>
              <p className="mt-0 text-sm leading-6 text-muted-foreground sm:text-base">{t("Enter your work email to receive a one-time verification code.")}</p>
            </div>
          </div>

          <form
            className="space-y-6"
            onSubmit={(event) => {
              void handleRequestSubmit(onRequestOtp)(event);
            }}
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-card-foreground" htmlFor="authentication-email">
                {t("Email address")}
              </label>
              <Input {...registerRequest("email")} autoComplete="email" disabled={isSubmittingRequest || Boolean(requestedEmail)} id="authentication-email" placeholder={t("name@example.com")} type="email" />
              {requestErrors.email?.message ? <p className="text-sm text-destructive">{t(requestErrors.email.message)}</p> : null}
            </div>

            <div className="flex justify-end">
              <Button disabled={isSubmittingRequest || Boolean(requestedEmail)} size="lg" type="submit">
                {t("Send verification code")}
              </Button>
            </div>
          </form>

          {requestMessage ? (
            <p aria-live="polite" className="mt-6 text-sm text-muted-foreground">
              {requestMessage}
            </p>
          ) : null}

          {requestOtpMutation.error ? <p className="mt-4 text-sm text-destructive">{t("We could not request a verification code right now. Please try again.")}</p> : null}

          {requestedEmail ? (
            <form
              className="mt-8 space-y-6"
              onSubmit={(event) => {
                void handleVerifySubmit(onVerifyOtp)(event);
              }}
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium text-card-foreground" htmlFor="authentication-otp-code">
                  {t("Verification code")}
                </label>
                <Input {...registerVerify("code")} id="authentication-otp-code" maxLength={6} placeholder={t("123456")} type="text" />
                {verifyErrors.code?.message ? <p className="text-sm text-destructive">{t(verifyErrors.code.message)}</p> : null}
              </div>

              <div className="flex justify-end gap-3">
                <Button asChild variant="outline">
                  <a href="/">{t("Back to home")}</a>
                </Button>
                <Button disabled={isSubmittingVerify} type="submit">
                  {t("Verify and continue")}
                </Button>
              </div>
            </form>
          ) : null}

          {verifyOtpMutation.error ? <p className="mt-4 text-sm text-destructive">{t("The verification code is invalid or expired.")}</p> : null}
        </div>
      </section>
    </main>
  );
};
