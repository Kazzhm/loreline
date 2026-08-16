"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import ReceiptPanel from "./receipt-panel";

type MindStatus =
  | { state: "checking" }
  | { state: "missing" }
  | { state: "connected"; enabled: boolean | null }
  | { state: "error"; message: string };

type PocResult = {
  state?: "pending" | "completed";
  jobToken?: string;
  expiresAt?: string;
  reply?: { messageText: string };
  error?: { message: string };
};

const STEPS = [
  ["Request accepted", "A duplicate-safe request ID is attached"],
  ["Conversation addressed", "The persistent creator relationship is reused"],
  ["Mind working", "The browser polls without holding one long request"],
  ["Reply verified", "The reply is correlated to this exact request"],
];

type RunPhase = "idle" | "submitted" | "waiting" | "completed" | "error";

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export default function LorelineConsole() {
  const [status, setStatus] = useState<MindStatus>({ state: "checking" });
  const [mode, setMode] = useState<"seed" | "review" | "revise">("seed");
  const [creatorId, setCreatorId] = useState("glass-sea-studio");
  const [worldContext, setWorldContext] = useState(
    "The Glass Sea is an original fantasy setting managed by Glass Sea Studio. Loreline is its designated canon and community-review steward.",
  );
  const [canonSource, setCanonSource] = useState(
    "Creator-approved Loreline canon register",
  );
  const [canonRule, setCanonRule] = useState(
    "The Glass Sea cannot be crossed at night; moonlight turns every vessel back toward its port of origin.",
  );
  const [submission, setSubmission] = useState(
    "A fan proposes a courier who crosses the Glass Sea at midnight by sailing without a lantern.",
  );
  const [revision, setRevision] = useState(
    "The fan revises the courier route: the vessel waits outside the harbor and crosses only after sunrise, when the night restriction has ended.",
  );
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<PocResult | null>(null);
  const [runPhase, setRunPhase] = useState<RunPhase>("idle");

  useEffect(() => {
    let active = true;
    fetch("/api/minds/status", { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json();
        if (!active) return;
        if (!body.configured) {
          setStatus({ state: "missing" });
        } else if (body.connected) {
          setStatus({
            state: "connected",
            enabled: body.mind?.isEnabled ?? null,
          });
        } else {
          setStatus({
            state: "error",
            message: body.error?.message || "Connection could not be verified.",
          });
        }
      })
      .catch(() => {
        if (active) {
          setStatus({ state: "error", message: "Connection check failed." });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const statusLabel = useMemo(() => {
    if (status.state === "checking") return "Checking Mind";
    if (status.state === "connected") {
      return status.enabled === false ? "Mind paused" : "Mind connected";
    }
    if (status.state === "missing") return "Mind setup required";
    return "Connection needs attention";
  }, [status]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setResult(null);
    setRunPhase("submitted");
    try {
      const requestId = crypto.randomUUID();
      const startResponse = await fetch("/api/minds/poc", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          operation: "start",
          requestId,
          action: mode,
          creatorId,
          worldContext,
          canonSource,
          canonRule,
          submission,
          revision,
        }),
      });
      const startBody = (await startResponse.json()) as PocResult;
      if (!startResponse.ok || !startBody.jobToken || !startBody.expiresAt) {
        throw new Error(startBody.error?.message || "The run could not be started.");
      }

      setRunPhase("waiting");
      const deadline = Date.parse(startBody.expiresAt);
      while (Date.now() < deadline) {
        await delay(4_000);
        const pollResponse = await fetch("/api/minds/poc", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            operation: "poll",
            jobToken: startBody.jobToken,
          }),
        });
        const pollBody = (await pollResponse.json()) as PocResult;
        if (!pollResponse.ok) {
          throw new Error(pollBody.error?.message || "Result check failed.");
        }
        if (pollBody.state === "completed" && pollBody.reply) {
          setResult(pollBody);
          setRunPhase("completed");
          return;
        }
      }
      throw new Error("The result window expired. Start a new run.");
    } catch (error) {
      setRunPhase("error");
      setResult({
        error: {
          message:
            error instanceof Error
              ? error.message
              : "The request ended without a verified result.",
        },
      });
    } finally {
      setPending(false);
    }
  }

  const canRun = status.state === "connected" && status.enabled !== false;

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Loreline home">
          <span className="brand-mark">L</span>
          <span>Loreline</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#workflow">Workflow</a>
          <a href="#proof">Proof</a>
          <a href="#architecture">Architecture</a>
        </nav>
        <div className={`connection-pill ${status.state}`}>
          <span aria-hidden="true" />
          {statusLabel}
        </div>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow">Persistent creator-world stewardship</div>
        <h1>
          Creator canon
          <span>that remembers.</span>
        </h1>
        <p className="hero-copy">
          Loreline helps creator communities grow without losing the world,
          the precedent, or the people who helped build it.
        </p>
        <div className="hero-meta">
          <span>Moderation &amp; community assistance</span>
          <span>One Mind · continuous context</span>
          <span>Creator-approved attribution</span>
        </div>
      </section>

      <section className="console-shell" id="workflow" aria-label="Loreline workflow console">
        <div className="console-heading">
          <div>
            <p className="section-kicker">Live workflow</p>
            <h2>Review one contribution across three sessions</h2>
          </div>
          <p className="run-state">
            {canRun
              ? "Ready for authenticated persistence proof"
              : "Authenticated persistence is not verified yet"}
          </p>
        </div>

        <div className="console-grid">
          <form className="work-panel" onSubmit={submit}>
            <div className="mode-tabs" role="tablist" aria-label="Proof session">
              <button
                type="button"
                className={mode === "seed" ? "active" : ""}
                disabled={pending}
                onClick={() => {
                  setMode("seed");
                  setResult(null);
                  setRunPhase("idle");
                }}
              >
                <b>Session A</b>
                <span>Establish canon</span>
              </button>
              <button
                type="button"
                className={mode === "review" ? "active" : ""}
                disabled={pending}
                onClick={() => {
                  setMode("review");
                  setResult(null);
                  setRunPhase("idle");
                }}
              >
                <b>Session B</b>
                <span>Recall &amp; review</span>
              </button>
              <button
                type="button"
                className={mode === "revise" ? "active" : ""}
                disabled={pending}
                onClick={() => {
                  setMode("revise");
                  setResult(null);
                  setRunPhase("idle");
                }}
              >
                <b>Session C</b>
                <span>Revise &amp; approve</span>
              </button>
            </div>

            <label>
              Creator world ID
              <input
                value={creatorId}
                onChange={(event) => setCreatorId(event.target.value)}
                spellCheck={false}
              />
            </label>

            {mode === "seed" ? (
              <>
                <label>
                  Creator-world identity
                  <textarea
                    value={worldContext}
                    onChange={(event) => setWorldContext(event.target.value)}
                    rows={3}
                  />
                </label>
                <label>
                  Canon authority
                  <input
                    value={canonSource}
                    onChange={(event) => setCanonSource(event.target.value)}
                  />
                </label>
                <label>
                  Standing canon rule
                  <textarea
                    value={canonRule}
                    onChange={(event) => setCanonRule(event.target.value)}
                    rows={5}
                  />
                </label>
              </>
            ) : mode === "review" ? (
              <label>
                New community submission
                <textarea
                  value={submission}
                  onChange={(event) => setSubmission(event.target.value)}
                  rows={5}
                />
              </label>
            ) : (
              <label>
                Revised community submission
                <textarea
                  value={revision}
                  onChange={(event) => setRevision(event.target.value)}
                  rows={5}
                />
              </label>
            )}

            <button className="primary-action" disabled={!canRun || pending}>
              {pending
                ? runPhase === "submitted"
                  ? "Submitting safely…"
                  : "Mind working · checking result…"
                : mode === "seed"
                  ? "Store canon in Session A"
                  : mode === "review"
                    ? "Review from remembered context"
                    : "Review the revision in Session C"}
            </button>

            {!canRun && (
              <div className="setup-note" role="status">
                <strong>Setup boundary</strong>
                <span>
                  Add a Builder API key and Mind ID to enable this real workflow.
                  No substitute response is shown.
                </span>
              </div>
            )}
          </form>

          <div className="trace-panel" aria-live="polite">
            <div className="trace-topline">
              <span>Mind activity trace</span>
              <span>
                {result?.reply
                  ? "Verified server-side reply"
                  : pending
                    ? "Run continues safely"
                    : "Awaiting a verified run"}
              </span>
            </div>

            {result?.error ? (
              <div className="result-card error-card">
                <p>Run not completed</p>
                <strong>{result.error.message}</strong>
              </div>
            ) : result?.reply ? (
              <div className="result-card">
                <p>Verified Mind reply</p>
                <strong>{result.reply.messageText}</strong>
              </div>
            ) : (
              <div className="empty-result">
                <span className="empty-orbit" aria-hidden="true" />
                <p>The trace fills only after a real Mind reply.</p>
                <small>
                  Sessions B and C deliberately omit the canon rule so recall
                  and precedent can be evaluated.
                </small>
              </div>
            )}

            {mode === "revise" && result?.reply ? (
              <ReceiptPanel submission={revision} />
            ) : null}

            <ol className="trace-list">
              {STEPS.map(([title, detail], index) => (
                <li key={title}>
                  <span>
                    {runPhase === "completed" ||
                    (index === 0 && runPhase !== "idle" && runPhase !== "error") ||
                    (index === 1 && ["waiting", "completed"].includes(runPhase)) ||
                    (index === 2 && runPhase === "waiting")
                      ? "✓"
                      : String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <b>{title}</b>
                    <small>{detail}</small>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="proof-section" id="proof">
        <div>
          <p className="section-kicker">The judge test</p>
          <h2>Remove the Mind and the product loses its point.</h2>
        </div>
        <div className="proof-grid">
          <article>
            <span>01</span>
            <h3>Memory</h3>
            <p>Canon, exceptions, contributor history, and creator boundaries survive the session boundary.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Continuity</h3>
            <p>A stable conversation alias lets every new case inherit the decisions that shaped the world.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Follow-up</h3>
            <p>Unresolved cases keep their next action, due time, and approval gate instead of falling out of chat.</p>
          </article>
        </div>
      </section>

      <section className="architecture" id="architecture">
        <p className="section-kicker">Focused architecture</p>
        <div className="architecture-row">
          <div><b>Creator</b><span>canon &amp; boundaries</span></div>
          <i aria-hidden="true">→</i>
          <div className="accent-node"><b>Loreline Mind</b><span>memory &amp; judgment</span></div>
          <i aria-hidden="true">→</i>
          <div><b>Case workflow</b><span>state &amp; follow-up</span></div>
          <i aria-hidden="true">→</i>
          <div><b>Rights receipt</b><span>portable attribution</span></div>
        </div>
      </section>

      <footer>
        <div>
          <span className="brand-mark">L</span>
          <strong>Loreline</strong>
        </div>
        <p>Built for creator worlds that outgrow a single conversation.</p>
      </footer>
    </main>
  );
}
