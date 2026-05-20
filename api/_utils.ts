type HeaderValue = string | string[] | undefined;

type NodeRequest = {
  method?: string;
  url?: string;
  headers?: Record<string, HeaderValue>;
  body?: unknown;
  on?: (event: string, callback: (...args: any[]) => void) => unknown;
};

type NodeResponse = {
  statusCode?: number;
  setHeader: (name: string, value: string | string[] | number) => unknown;
  end: (chunk?: unknown) => unknown;
};

type WebHandler = (request: Request) => Response | Promise<Response>;

function firstHeader(value: HeaderValue) {
  return Array.isArray(value) ? value[0] : value;
}

async function readNodeBody(request: NodeRequest) {
  if (request.body !== undefined) {
    if (
      typeof request.body === "string" ||
      request.body instanceof ArrayBuffer ||
      request.body instanceof Blob ||
      request.body instanceof FormData ||
      request.body instanceof URLSearchParams ||
      request.body instanceof Uint8Array
    ) {
      return request.body;
    }

    return JSON.stringify(request.body);
  }

  if (!request.on) return undefined;

  const chunks: Uint8Array[] = [];
  await new Promise<void>((resolve, reject) => {
    request.on!("data", chunk => {
      chunks.push(typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk);
    });
    request.on!("end", resolve);
    request.on!("error", reject);
  });

  if (!chunks.length) return undefined;
  const size = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

async function toWebRequest(request: NodeRequest) {
  const method = request.method || "GET";
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers || {})) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  const protocol = firstHeader(request.headers?.["x-forwarded-proto"]) || "https";
  const host = firstHeader(request.headers?.["x-forwarded-host"]) || firstHeader(request.headers?.host) || "localhost";
  const url = request.url?.startsWith("http") ? request.url : `${protocol}://${host}${request.url || "/"}`;
  const body = method === "GET" || method === "HEAD" ? undefined : await readNodeBody(request);

  return new Request(url, {
    method,
    headers,
    body,
    ...(body ? { duplex: "half" } : {}),
  } as RequestInit);
}

async function sendNodeResponse(response: Response, nodeResponse: NodeResponse) {
  nodeResponse.statusCode = response.status;

  const getSetCookie = (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  const setCookies = getSetCookie?.call(response.headers);
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") {
      nodeResponse.setHeader(key, value);
    }
  });

  if (setCookies?.length) {
    nodeResponse.setHeader("Set-Cookie", setCookies);
  } else {
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) nodeResponse.setHeader("Set-Cookie", setCookie);
  }

  const body = await response.arrayBuffer();
  nodeResponse.end(body.byteLength ? Buffer.from(body) : undefined);
}

export function withWebResponse(handler: WebHandler) {
  return async function vercelHandler(request: Request | NodeRequest, response?: NodeResponse) {
    try {
      const webRequest = request instanceof Request ? request : await toWebRequest(request as NodeRequest);
      const webResponse = await handler(webRequest);
      if (!response) return webResponse;
      await sendNodeResponse(webResponse, response);
    } catch (error) {
      console.error("API handler failed:", error);
      const webResponse = Response.json({ error: "Internal Server Error" }, { status: 500 });
      if (!response) return webResponse;
      await sendNodeResponse(webResponse, response);
    }
  };
}
