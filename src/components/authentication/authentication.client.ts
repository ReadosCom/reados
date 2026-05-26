import { authenticationServiceGet, authenticationServicePatch, authenticationServicePost } from "@components/application/application.client.ts";
import { otpRequestBodySchema, otpRequestResponseSchema, otpTestResponseSchema, otpVerifyBodySchema, otpVerifyResponseSchema, profileUpdateBodySchema, sessionMeResponseDataSchema, sessionMeResponseSchema } from './authentication.schema.ts';

/**
 * Requests an OTP code for tenant-scoped authentication.
 */
export const requestAuthenticationOtp = async (body: unknown) => {
  const parsedBody = otpRequestBodySchema.parse(body);
  const response = await authenticationServicePost({
    body: parsedBody,
    path: `/otp/request`,
  });

  if (!response.ok) {
    throw new Error(`Failed to request OTP.`);
  }

  return otpRequestResponseSchema.parse(await response.json()).data;
};

/**
 * Verifies an OTP code and starts an authenticated session.
 */
export const verifyAuthenticationOtp = async (body: unknown) => {
  const parsedBody = otpVerifyBodySchema.parse(body);
  const response = await authenticationServicePost({
    body: parsedBody,
    path: `/otp/verify`,
  });

  if (!response.ok) {
    throw new Error(`Failed to verify OTP.`);
  }

  return otpVerifyResponseSchema.parse(await response.json()).data;
};

/**
 * Retrieves the authenticated session state.
 */
export const getAuthenticationSession = async () => {
  const response = await authenticationServiceGet({
    path: `/session/me`,
  });

  if (response.status === 401) {
    return sessionMeResponseDataSchema.parse({
      authenticated: false,
      session: null,
    });
  }

  if (!response.ok) {
    throw new Error(`Could not load authentication session.`);
  }

  return sessionMeResponseSchema.parse(await response.json()).data;
};

/**
 * Logs out the current authenticated session.
 */
export const logoutAuthenticationSession = async () => {
  await authenticationServicePost({
    body: {},
    path: `/session/logout`,
  });
};

/**
 * Updates authenticated user profile fields in authentication service.
 */
export const updateAuthenticationProfile = async (body: unknown) => {
  const parsedBody = profileUpdateBodySchema.parse(body);
  const response = await authenticationServicePatch({
    body: parsedBody,
    path: `/profile/me`,
  });

  if (!response.ok) {
    throw new Error(`Could not update authentication profile.`);
  }

  return sessionMeResponseSchema.parse(await response.json()).data;
};

/**
 * Reads the latest OTP for e2e tests from the test-only transport endpoint.
 */
export const getLatestOtpForTesting = async ({ email }: { email: string }) => {
  const response = await authenticationServiceGet({
    path: `/test/otp/latest?email=${encodeURIComponent(email)}`,
  });

  if (!response.ok) {
    throw new Error(`Could not load the latest OTP for testing.`);
  }

  return otpTestResponseSchema.parse(await response.json()).data;
};
