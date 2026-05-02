import { useMutation } from '@tanstack/react-query';

import { tenantDiscoveryRequestSchema, tenantDiscoveryResponseSchema, type TenantDiscoveryRequest, type TenantDiscoveryResponse } from './tenant.schema.ts';

const getTenantServiceOrigin = () => {
  const browserWindow = (
    globalThis as {
      window?: {
        location: {
          hostname: string;
          protocol: string;
        };
      };
    }
  ).window;

  if (!browserWindow) {
    return `http://tenant.reados.localhost`;
  }

  const { hostname, protocol } = browserWindow.location;

  return `${protocol}//tenant.${hostname}`;
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
