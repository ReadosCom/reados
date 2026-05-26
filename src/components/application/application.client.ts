import { getAuthenticationServiceOrigin, getCoreServiceOrigin, getErpServiceOrigin } from "@components/application/application.host.ts";

type ApplicationMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

type ApplicationRequestOptions = Omit<RequestInit, "body"> & {
  origin?: string;
  path: string;
};

type ApplicationBodyRequestOptions<TBody> = ApplicationRequestOptions & {
  body: TBody;
};

export const applicationFetch = ({ body, origin, path, ...init }: ApplicationRequestOptions & { body?: unknown }) => {
  const url = origin ? `${origin}${path}` : path;

  return fetch(url, {
    ...init,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: init.credentials ?? `include`,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": `application/json` }),
      ...init.headers,
    },
  });
};

const createServiceMethod = (method: ApplicationMethod) => {
  return <TBody = never>(options: ApplicationRequestOptions | ApplicationBodyRequestOptions<TBody>) => {
    return applicationFetch({
      ...options,
      method,
    });
  };
};

const createServiceRequest = (getDefaultOrigin: () => string) => {
  return (method: ApplicationMethod) => {
    const request = createServiceMethod(method);

    return <TBody = never>(options: ApplicationRequestOptions | ApplicationBodyRequestOptions<TBody>) => {
      return request({
        ...options,
        origin: options.origin ?? getDefaultOrigin(),
      });
    };
  };
};

export const appGet = createServiceMethod("GET");
export const appDelete = createServiceMethod("DELETE");
export const appPost = createServiceMethod("POST");
export const appPatch = createServiceMethod("PATCH");
export const appPut = createServiceMethod("PUT");

const coreServiceMethod = createServiceRequest(getCoreServiceOrigin);
const authenticationServiceMethod = createServiceRequest(getAuthenticationServiceOrigin);
const erpServiceMethod = createServiceRequest(getErpServiceOrigin);

export const coreServiceGet = coreServiceMethod("GET");
export const coreServiceDelete = coreServiceMethod("DELETE");
export const coreServicePost = coreServiceMethod("POST");
export const coreServicePatch = coreServiceMethod("PATCH");
export const coreServicePut = coreServiceMethod("PUT");

export const authenticationServiceGet = authenticationServiceMethod("GET");
export const authenticationServiceDelete = authenticationServiceMethod("DELETE");
export const authenticationServicePost = authenticationServiceMethod("POST");
export const authenticationServicePatch = authenticationServiceMethod("PATCH");
export const authenticationServicePut = authenticationServiceMethod("PUT");

export const erpServiceGet = erpServiceMethod("GET");
export const erpServiceDelete = erpServiceMethod("DELETE");
export const erpServicePost = erpServiceMethod("POST");
export const erpServicePatch = erpServiceMethod("PATCH");
export const erpServicePut = erpServiceMethod("PUT");
