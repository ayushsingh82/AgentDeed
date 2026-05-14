"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import {
  neuronToOg,
  type ChatCompletionResponse,
  type RouterModel,
} from "@/lib/router";

export default function PlaygroundPage() {
  const [models, setModels] = useState<RouterModel[]>([]);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [model, setModel] = useState("");
  const [prompt, setPrompt] = useState(
    "Explain what an ERC-7857 iNFT is in two sentences.",
  );
  const [system, setSystem] = useState("You are a concise technical assistant.");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ChatCompletionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/inference")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load models");
        return data.models as RouterModel[];
      })
      .then((list) => {
        if (cancelled) return;
        setModels(list);
        if (list.length > 0) setModel(list[0].id);
      })
      .catch((err: Error) => {
        if (!cancelled) setModelsError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function run() {
    if (!model || !prompt.trim() || running) return;
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/inference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            ...(system.trim()
              ? [{ role: "system" as const, content: system.trim() }]
              : []),
            { role: "user" as const, content: prompt.trim() },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setResult(data as ChatCompletionResponse);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRunning(false);
    }
  }

  const answer = result?.choices?.[0]?.message;
  const trace = result?.x_0g_trace;
  const selected = models.find((m) => m.id === model);

  return (
    <main className="flex min-h-screen flex-col bg-[#E2E2DA] text-[#0A0A0A]">
      <NavBar />

      <section className="border-b border-[#0A0A0A] px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#F64618]">
            Inference · /playground
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Run a model on 0G Compute.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[#0A0A0A]/75">
            Live calls to the 0G Compute Router — TEE-attested providers,
            OpenAI-compatible. Every response carries an on-chain billing trace.
          </p>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr]">
          {/* Left: request */}
          <div className="space-y-6 border-2 border-[#0A0A0A] bg-[#0A0A0A] p-7 text-[#E2E2DA]">
            <div className="flex items-center gap-3">
              <span className="border-2 border-[#F64618] bg-[#F64618] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#0A0A0A]">
                §01
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tight">
                Request
              </h2>
            </div>

            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#F64618]">
                Model
              </span>
              {modelsError ? (
                <p className="border border-[#F64618]/50 bg-[#F64618]/10 px-3 py-2.5 font-mono text-xs text-[#F64618]">
                  {modelsError}
                </p>
              ) : (
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={models.length === 0}
                  className="w-full border-2 border-[#0A0A0A] bg-[#0A0A0A] px-3 py-2.5 font-mono text-sm text-[#E2E2DA] focus:border-[#F64618] focus:outline-none"
                >
                  {models.length === 0 ? (
                    <option>Loading catalog…</option>
                  ) : (
                    models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.id} · {m.provider_count} provider
                        {m.provider_count === 1 ? "" : "s"}
                      </option>
                    ))
                  )}
                </select>
              )}
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#F64618]">
                System prompt
              </span>
              <input
                value={system}
                onChange={(e) => setSystem(e.target.value)}
                className="w-full border-2 border-[#0A0A0A] bg-[#0A0A0A] px-3 py-2.5 font-mono text-sm text-[#E2E2DA] placeholder:text-[#E2E2DA]/50 focus:border-[#F64618] focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#F64618]">
                User prompt
              </span>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="w-full resize-y border-2 border-[#0A0A0A] bg-[#0A0A0A] px-3 py-2.5 font-mono text-sm text-[#E2E2DA] placeholder:text-[#E2E2DA]/50 focus:border-[#F64618] focus:outline-none"
              />
            </label>

            <button
              onClick={run}
              disabled={running || !model || !prompt.trim()}
              className={`inline-flex items-center gap-3 border-2 px-7 py-3.5 font-bold uppercase tracking-[0.22em] transition ${
                running || !model || !prompt.trim()
                  ? "border-[#E2E2DA]/30 text-[#E2E2DA]/40"
                  : "border-[#F64618] bg-[#F64618] text-[#0A0A0A] hover:bg-[#E2E2DA]"
              }`}
            >
              {running ? "Running…" : "Run inference →"}
            </button>

            {selected && (
              <p className="font-mono text-[11px] text-[#E2E2DA]/60">
                ctx {selected.context_length.toLocaleString()} tokens · prompt{" "}
                {neuronToOg(selected.pricing.prompt).toExponential(2)} OG/tok ·
                completion{" "}
                {neuronToOg(selected.pricing.completion).toExponential(2)} OG/tok
              </p>
            )}
          </div>

          {/* Right: response */}
          <div className="space-y-6">
            <div className="border border-[#0A0A0A] bg-[#E2E2DA] p-7 seal-shadow">
              <div className="flex items-center justify-between border-b border-[#0A0A0A] pb-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#6A6A60]">
                  Response
                </span>
                <span
                  className={`border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] ${
                    error
                      ? "border-[#F64618] bg-[#F64618] text-[#E2E2DA]"
                      : result
                      ? "border-[#F64618]/40 bg-[#F64618]/10 text-[#F64618]"
                      : "border-[#0A0A0A]/30 text-[#6A6A60]"
                  }`}
                >
                  {error ? "Error" : result ? "Completed" : "Idle"}
                </span>
              </div>

              {error && (
                <p className="mt-4 font-mono text-xs leading-5 text-[#F64618]">
                  {error}
                </p>
              )}

              {!error && !result && (
                <p className="mt-4 font-mono text-xs text-[#6A6A60]">
                  Pick a model, write a prompt, and run — the answer and its 0G
                  billing trace land here.
                </p>
              )}

              {answer && (
                <div className="mt-4 space-y-4">
                  {answer.reasoning_content && (
                    <details className="border border-[#0A0A0A]/30 bg-[#0A0A0A]/[0.03] p-3">
                      <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#6A6A60]">
                        Reasoning trace
                      </summary>
                      <p className="mt-2 whitespace-pre-wrap font-mono text-[11px] leading-5 text-[#0A0A0A]/70">
                        {answer.reasoning_content}
                      </p>
                    </details>
                  )}
                  <p className="whitespace-pre-wrap text-sm leading-6 text-[#0A0A0A]">
                    {answer.content}
                  </p>
                </div>
              )}
            </div>

            {result && trace && (
              <div className="border border-[#0A0A0A] bg-[#E2E2DA] p-6">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#6A6A60]">
                  x_0g_trace
                </span>
                <dl className="mt-3 space-y-2 font-mono text-xs">
                  <Row k="request_id" v={trace.request_id} />
                  <Row k="provider" v={trace.provider} />
                  <Row
                    k="tokens"
                    v={`${result.usage.prompt_tokens} in · ${result.usage.completion_tokens} out`}
                  />
                  <Row
                    k="total cost"
                    v={`${neuronToOg(trace.billing.total_cost).toExponential(4)} OG`}
                    highlight
                  />
                  {trace.tee_verified !== undefined && (
                    <Row
                      k="tee_verified"
                      v={String(trace.tee_verified)}
                      highlight={trace.tee_verified}
                    />
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Row({
  k,
  v,
  highlight,
}: {
  k: string;
  v: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[#6A6A60]">{k}</dt>
      <dd
        className={`truncate ${
          highlight ? "font-bold text-[#F64618]" : "text-[#0A0A0A]/90"
        }`}
      >
        {v}
      </dd>
    </div>
  );
}
