import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { finalizeAccountingConfiguration, getAccountingConfiguration } from "./accountingConfiguration.client.ts";

const accountingConfigurationQueryKey = [`accounting`, `configuration`] as const;

/**
 * Returns accounting configuration.
 */
export const useAccountingConfigurationQuery = () => {
  return useQuery({
    queryFn: getAccountingConfiguration,
    queryKey: accountingConfigurationQueryKey,
  });
};

/**
 * Finalizes accounting configuration.
 */
export const useFinalizeAccountingConfigurationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: finalizeAccountingConfiguration,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountingConfigurationQueryKey });
    },
  });
};
