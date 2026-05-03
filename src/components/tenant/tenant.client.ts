import { useMutation } from '@tanstack/react-query';

import { getBrowserProtocol } from '@components/app/app.browser.ts';
import { getAppConfig } from '@components/app/app.config.ts';
import { tenantDiscoveryRequestSchema, tenantDiscoveryResponseSchema, type TenantDiscoveryRequest, type TenantDiscoveryResponse } from './tenant.schema.ts';

const getTenantServiceOrigin = () => {
  const protocol = getBrowserProtocol();

  if (!protocol) {
    return `http://${getAppConfig().tenantServiceFqdn}`;
  }

  return `${protocol}//${getAppConfig().tenantServiceFqdn}`;
};

/**
 * Discover the tenants associated with the supplied email address.
 */
export const discoverTenants = async (body: TenantDiscoveryRequest): Promise<TenantDiscoveryResponse> => {
  const parsedBody = tenantDiscoveryRequestSchema.parse(body);
  const response = await fetch(`${getTenantServiceOrigin()}/discovery`, {
    body: JSON.stringify(parsedBody),
    headers: {
      'Content-Type': `application/json`,
    },
    method: `POST`,
  });

  if (!response.ok) {
    throw new Error(`Failed to discover tenants.`);
  }

  return tenantDiscoveryResponseSchema.parse(await response.json());
};

export const useDiscoverTenantsMutation = () => {
  return useMutation({
    mutationFn: discoverTenants,
  });
};
