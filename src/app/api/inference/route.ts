/**
 * Inference proxy — fronts the 0G Compute Router so the API key stays
 * server-side and out of the browser bundle.
 *
 * When OLLAMA_BASE_URL is set, requests are routed to a local Ollama
 * instance instead. Same OpenAI body either way; the response from Ollama
 * gets a synthesized zero-cost x_0g_trace so the UI shape stays identical.
 *
 *   GET  /api/inference          → live model catalog
 *   POST /api/inference          → OpenAI-compatible chat completion
 */
import {
  chatCompletion,
  listModels,
  RouterError,
  type ChatCompletionRequest,
} from "@/lib/router";
import {
  OLLAMA_ENABLED,
  OllamaError,
  listOllamaModels,
  ollamaChatCompletion,
} from "@/lib/ollama";

function errorStatus(err: unknown): number {
  if (err instanceof RouterError || err instanceof OllamaError) return err.status;
  return 502;
}

export async function GET() {
  try {
    const models = OLLAMA_ENABLED ? await listOllamaModels() : await listModels();
    return Response.json({
      models,
      provider: OLLAMA_ENABLED ? "ollama" : "router",
    });
  } catch (err) {
    const status = errorStatus(err);
    return Response.json(
      { error: (err as Error).message },
      { status: status >= 400 ? status : 502 },
    );
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.OG_ROUTER_API_KEY;
  if (!OLLAMA_ENABLED && !apiKey) {
    return Response.json(
      {
        error:
          "Inference is not configured. Either set OLLAMA_BASE_URL (e.g. http://localhost:11434) for local Ollama, or OG_ROUTER_API_KEY for the 0G Compute Router.",
      },
      { status: 503 },
    );
  }

  let body: ChatCompletionRequest;
  try {
    body = (await request.json()) as ChatCompletionRequest;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body?.model || !Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json(
      { error: "Request must include `model` and a non-empty `messages` array." },
      { status: 400 },
    );
  }

  const args: ChatCompletionRequest = {
    model: body.model,
    messages: body.messages,
    temperature: body.temperature,
    max_tokens: body.max_tokens,
    response_format: body.response_format,
  };

  try {
    const completion = OLLAMA_ENABLED
      ? await ollamaChatCompletion(args)
      : await chatCompletion(args, apiKey!);
    return Response.json(completion);
  } catch (err) {
    const status = errorStatus(err);
    return Response.json(
      { error: (err as Error).message },
      { status: status >= 400 ? status : 502 },
    );
  }
}
