export const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "Pragma": "no-cache",
} as const;

export function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: {
      ...(init?.headers || {}),
    },
  });
}

export function noStoreJson(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: {
      ...noStoreHeaders,
      ...(init?.headers || {}),
    },
  });
}

export function methodNotAllowed(allowedMethods: string[], noStore = false) {
  const headers = {
    Allow: allowedMethods.join(", "),
    ...(noStore ? noStoreHeaders : {}),
  };
  return Response.json({ error: "Method not allowed" }, { status: 405, headers });
}

export async function requireMethod(request: Request, allowedMethods: string[], handler: (request: Request) => Response | Promise<Response>, noStore = false) {
  if (!allowedMethods.includes(request.method)) {
    return methodNotAllowed(allowedMethods, noStore);
  }

  return handler(request);
}
