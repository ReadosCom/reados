import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getAuthenticationSession, logoutAuthenticationSession, requestAuthenticationOtp, verifyAuthenticationOtp } from './authentication.client.ts';

/**
 * Returns the current authentication session.
 */
export const useAuthenticationSessionQuery = () => {
  return useQuery({
    queryFn: getAuthenticationSession,
    queryKey: [`authentication`, `session`],
  });
};

/**
 * Mutation hook for requesting a tenant OTP code.
 */
export const useRequestAuthenticationOtpMutation = () => {
  return useMutation({
    mutationFn: requestAuthenticationOtp,
  });
};

/**
 * Mutation hook for verifying a tenant OTP code.
 */
export const useVerifyAuthenticationOtpMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyAuthenticationOtp,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [`authentication`, `session`],
      });
    },
  });
};

/**
 * Mutation hook for logging out the current authentication session.
 */
export const useLogoutAuthenticationSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutAuthenticationSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [`authentication`, `session`],
      });
    },
  });
};
