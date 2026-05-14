/**
 * 0G Compute Router client — OpenAI-compatible inference gateway.
 *
 * Server-side module. The model catalog (`listModels`/`listProviders`) needs no
 * auth; `chatCompletion` and `generateImage` require an API key, which is read
 * from the `OG_ROUTER_API_KEY` env var and never sent to the browser. The UI
 * reaches these through the `/api/inference` proxy route.
 */
import { OG_ROUTER } from "./og";

// --- Catalog types -------------------------------------------------------

export type RouterModel = {
  id: string;
  object: "model";
  owned_by: string;
  name: string;
  context_length: number;
  pricing: { prompt: string; completion: string; image?: string };
  provider_count: number;
};

export type RouterProvider = {
  address: `0x${string}`;
  model: string;
  service_type?: string;
  latency_ms?: number;
  tee?: Record<string, unknown>;
};

// --- Chat completion types ----------------------------------------------

export type ChatRole = "system" | "user" | "assistant" | "tool";

export type ChatMessage = {
  role: ChatRole;
  content: string;
  reasoning_content?: string;
};

export type ChatCompletionRequest = {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  response_format?: { type: "json_object" | "text" };
};

export type OgTrace = {
  request_id: string;
  provider: `0x${string}`;
  billing: {
    input_cost: string;
    output_cost: string;
    total_cost: string;
  };
  tee_verified?: boolean;
};

export type ChatCompletionResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  x_0g_trace: OgTrace;
};

// --- Internal helpers ----------------------------------------------------

const ZERO_NEURON_PER_OG = 1e18;

class RouterError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "RouterError";
    this.status = status;
  }
}

async function routerFetch<T>(
  path: string,
  init: RequestInit & { apiKey?: string } = {},
): Promise<T> {
  const { apiKey, headers, ...rest } = init;
  const res = await fetch(`${OG_ROUTER.baseUrl}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new RouterError(
      res.status,
      `0G Router ${res.status}: ${body.slice(0, 300) || res.statusText}`,
    );
  }
  return res.json() as Promise<T>;
}

// --- Public API ----------------------------------------------------------

/** Live model catalog. No auth required. */
export async function listModels(): Promise<RouterModel[]> {
  const data = await routerFetch<{ data: RouterModel[] }>("/v1/models");
  return data.data;
}

/** TEE-acknowledged providers serving a given model. No auth required. */
export async function listProviders(
  model?: string,
  serviceType?: string,
): Promise<RouterProvider[]> {
  const qs = new URLSearchParams();
  if (model) qs.set("model", model);
  if (serviceType) qs.set("service_type", serviceType);
  const suffix = qs.toString() ? `?${qs}` : "";
  const data = await routerFetch<{ data: RouterProvider[] }>(
    `/v1/providers${suffix}`,
  );
  return data.data;
}

/** OpenAI-compatible chat completion. Requires an API key. */
export async function chatCompletion(
  body: ChatCompletionRequest,
  apiKey: string,
): Promise<ChatCompletionResponse> {
  return routerFetch<ChatCompletionResponse>("/v1/chat/completions", {
    method: "POST",
    apiKey,
    body: JSON.stringify({ ...body, stream: false }),
  });
}

/** Convert a neuron-denominated cost string to 0G, for display. */
export function neuronToOg(neuron: string): number {
  return Number(neuron) / ZERO_NEURON_PER_OG;
}

export { RouterError };
