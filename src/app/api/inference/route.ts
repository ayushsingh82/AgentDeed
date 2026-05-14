/**
 * Inference proxy — fronts the 0G Compute Router so the API key stays
 * server-side and out of the browser bundle.
 *
 *   GET  /api/inference          → live model catalog (no auth needed upstream)
 *   POST /api/inference          → OpenAI-compatible chat completion (keyed)
 */
import {
  chatCompletion,
  listModels,
  RouterError,
  type ChatCompletionRequest,
} from "@/lib/router";

export async function GET() {
  try {
    const models = await listModels();
    return Response.json({ models });
  } catch (err) {
    const status = err instanceof RouterError ? err.status : 502;
    return Response.json(
      { error: (err as Error).message },
      { status: status >= 400 ? status : 502 },
    );
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.OG_ROUTER_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "OG_ROUTER_API_KEY is not configured. Add it to .env.local to enable inference.",
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

  try {
    const completion = await chatCompletion(
      {
        model: body.model,
        messages: body.messages,
        temperature: body.temperature,
        max_tokens: body.max_tokens,
        response_format: body.response_format,
      },
      apiKey,
    );
    return Response.json(completion);
  } catch (err) {
    const status = err instanceof RouterError ? err.status : 502;
    return Response.json(
      { error: (err as Error).message },
      { status: status >= 400 ? status : 502 },
    );
  }
}
