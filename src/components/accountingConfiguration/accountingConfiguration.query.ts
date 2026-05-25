import { useQuery } from "@tanstack/react-query";

import { getAccountingConfiguration } from "./accountingConfiguration.client.ts";

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
