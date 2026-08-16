"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type MindStatus =
  | { state: "checking" }
  | { state: "missing" }
  | { state: "connected"; name: string; enabled: boolean | null }
  | { state: "error"; message: string };

type HistoryItem = {
  fingerprint: string;
  sender: "creator" | "mind";
  messageText: string;
  createdAt: string | null;
};

type PocResult = {
  alias?: string;
  reply?: { messageText: string };
  history?: HistoryItem[];
  error?: { message: string };
};

const STEPS = [
  ["Context loaded", "Standing canon and creator boundaries"],
  ["Precedent recalled", "Prior exceptions and community rulings"],
  ["Decision prepared", "Approve, revise, hold, or decline"],
  ["Follow-up queued", "The next useful action remains attached"],
  ["Attribution ready", "A portable receipt after creator approval"],
];

export default function LorelineConsole() {
  const [status, setStatus] = useState<MindStatus>({ state: "checking" });
  const [mode, setMode] = useState<"seed" | "review">("seed");
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
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<PocResult | null>(null);

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
            name: body.mind?.name || "Configured Mind",
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
      return status.enabled === false ? "Mind paused" : `${status.name} connected`;
    }
    if (status.state === "missing") return "Mind setup required";
    return "Connection needs attention";
  }, [status]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setResult(null);
    try {
      const response = await fetch("/api/minds/poc", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: mode,
          creatorId,
          worldContext,
          canonSource,
          canonRule,
          submission,
        }),
      });
      const body = (await response.json()) as PocResult;
      setResult(body);
    } catch {
      setResult({ error: { message: "The request ended without a verified result." } });
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
            <h2>Review one contribution across two sessions</h2>
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
                onClick={() => {
                  setMode("seed");
                  setResult(null);
                }}
              >
                <b>Session A</b>
                <span>Establish canon</span>
              </button>
              <button
                type="button"
                className={mode === "review" ? "active" : ""}
                onClick={() => {
                  setMode("review");
                  setResult(null);
                }}
              >
                <b>Session B</b>
                <span>Recall &amp; review</span>
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
            ) : (
              <label>
                New community submission
                <textarea
                  value={submission}
                  onChange={(event) => setSubmission(event.target.value)}
                  rows={5}
                />
              </label>
            )}

            <button className="primary-action" disabled={!canRun || pending}>
              {pending
                ? "Waiting for the Mind…"
                : mode === "seed"
                  ? "Store canon in Session A"
                  : "Review from remembered context"}
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
              <span>{result?.alias || "Awaiting a verified run"}</span>
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
                  Session B deliberately omits the canon rule so recall can be
                  evaluated.
                </small>
              </div>
            )}

            <ol className="trace-list">
              {STEPS.map(([title, detail], index) => (
                <li key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
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
