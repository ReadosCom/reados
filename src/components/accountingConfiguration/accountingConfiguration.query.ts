import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getAccountingConfiguration, updateAccountingConfiguration } from "./accountingConfiguration.client.ts";

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
 * Mutates accounting configuration.
 */
export const useUpdateAccountingConfigurationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAccountingConfiguration,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: accountingConfigurationQueryKey,
      });
    },
  });
};
