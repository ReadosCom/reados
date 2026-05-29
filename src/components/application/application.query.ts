import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { apiSuccessSchema } from "@components/application/api.schema.ts";
import { coreServiceGet } from "@components/application/application.client.ts";

/**
 * Probes whether the browser is running on the root Reados application host.
 */
export const probeRootApplication = async () => {
  try {
    const response = await coreServiceGet({
      path: `/whoami`,
    });

    if (!response.ok) {
      return false;
    }

    const parsedBody = apiSuccessSchema(
      z.object({
        whoami: z.string().optional(),
      }),
    ).parse(await response.json());

    return parsedBody.data.whoami === `root`;
  } catch {
    return false;
  }
};

/**
 * Detect whether the current browser host is the root application host by asking the core service.
 */
export const useRootApplicationQuery = () => {
  return useQuery({
    gcTime: Infinity,
    queryFn: probeRootApplication,
    queryKey: [`app`, `rootApplication`],
    staleTime: Infinity,
  });
};
