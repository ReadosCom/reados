import { useMutation } from "@tanstack/react-query";

import { getBrowserProtocol } from "@components/application/application.browser.ts";
import { applicationFetch } from "@components/application/application.client.ts";
import { getAppConfig } from "@components/application/application.config.ts";
import { tenantDiscoveryRequestSchema, tenantDiscoveryResponseSchema, type TenantDiscoveryRequest, type TenantDiscoveryResponseData } from "./tenant.schema.ts";

const getRoot = () => {
  const protocol = getBrowserProtocol();

  if (!protocol) {
    return `http://${getAppConfig().tenantServiceFqdn}`;
  }

  return `${protocol}//${getAppConfig().tenantServiceFqdn}`;
};

/**
 * Discover the tenants associated with the supplied email address.
 */
export const discoverTenants = async (body: TenantDiscoveryRequest): Promise<TenantDiscoveryResponseData> => {
  const parsedBody = tenantDiscoveryRequestSchema.parse(body);
  const response = await applicationFetch({
    body: parsedBody,
    credentials: `same-origin`,
    origin: getRoot(),
    path: `/discovery`,
    method: `POST`,
  });

  if (!response.ok) {
    throw new Error(`Failed to discover tenants.`);
  }

  return tenantDiscoveryResponseSchema.parse(await response.json()).data;
};

export const useDiscoverTenantsMutation = () => {
  return useMutation({
    mutationFn: discoverTenants,
  });
};
