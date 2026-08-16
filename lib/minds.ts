import {
  createMindsClient,
  MindsApiError,
  type MessageRecord,
} from "@animocabrands/minds-client-lib";

export type PocAction = "seed" | "review" | "history";

export class MindsSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MindsSetupError";
  }
}

function readConfig() {
  const builderApiKey = process.env.MINDS_BUILDER_API_KEY?.trim();
  const mindId = process.env.MINDS_MIND_ID?.trim();
  const prefix = normalizeSegment(
    process.env.MINDS_CONVERSATION_PREFIX?.trim() || "loreline",
  );

  if (!builderApiKey || !mindId) {
    throw new MindsSetupError(
      "A Builder API key and Mind ID are required before authenticated Minds calls can run.",
    );
  }

  return { builderApiKey, mindId, prefix };
}

function normalizeSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function conversationAlias(creatorId: string) {
  const creator = normalizeSegment(creatorId);
  if (creator.length < 3) {
    throw new TypeError("Creator ID must contain at least three letters or digits.");
  }
  const prefix = normalizeSegment(
    process.env.MINDS_CONVERSATION_PREFIX?.trim() || "loreline",
  );
  return `${prefix}-${creator}`;
}

function publicHistory(rows: MessageRecord[]) {
  return rows.map((row) => ({
    fingerprint: row.fingerprint,
    sender: row.senderType === 1 ? "creator" : "mind",
    messageText: row.messageText ?? "",
    createdAt: row.createdAt ?? null,
  }));
}

export async function getMindsStatus() {
  const builderApiKey = process.env.MINDS_BUILDER_API_KEY?.trim();
  const mindId = process.env.MINDS_MIND_ID?.trim();

  if (!builderApiKey || !mindId) {
    return {
      configured: false,
      connected: false,
      reason: "missing_configuration",
    } as const;
  }

  const client = createMindsClient({ builderApiKey });
  const mind = await client.getMind(mindId);

  return {
    configured: true,
    connected: true,
    mind: {
      mindId: mind.mindId,
      name: mind.name ?? "Configured Mind",
      isEnabled: mind.isEnabled ?? null,
      species: mind.species ?? null,
      chain: mind.chain ?? null,
      hasWallet: Boolean(mind.walletAddress),
    },
  } as const;
}

export async function runMindsPoc(input: {
  action: PocAction;
  creatorId: string;
  canonRule?: string;
  submission?: string;
}) {
  const config = readConfig();
  const alias = conversationAlias(input.creatorId);
  const client = createMindsClient({ builderApiKey: config.builderApiKey });

  await client.ensureConversation(alias, config.mindId);

  if (input.action === "history") {
    const history = await client.getHistory(alias, { limit: 100 });
    return { alias, history: publicHistory(history) };
  }

  const messageText = buildMessage(input);
  const before = await client.getLatestHistoryFingerprint(alias);
  await client.sendMessage({ alias, messageText });

  const outcome = await client.waitForReply({
    alias,
    timeoutMs: 180_000,
    afterFingerprint: before,
    sentMessageText: messageText,
  });

  if (outcome.timedOut) {
    const error = new Error(
      "The Mind did not reply before the three-minute timeout. Check history before retrying.",
    );
    error.name = "MindsTimeoutError";
    throw error;
  }

  const history = await client.getHistory(alias, { limit: 100 });

  return {
    alias,
    reply: {
      fingerprint: outcome.reply.fingerprint,
      messageText: outcome.reply.messageText ?? "",
      createdAt: outcome.reply.createdAt ?? null,
    },
    history: publicHistory(history),
  };
}

function buildMessage(input: {
  action: PocAction;
  canonRule?: string;
  submission?: string;
}) {
  if (input.action === "seed") {
    const canonRule = input.canonRule?.trim();
    if (!canonRule || canonRule.length < 12) {
      throw new TypeError("Canon rule must be at least 12 characters.");
    }
    return [
      "Store this as a standing canon rule for this creator world.",
      `Rule: ${canonRule}`,
      "Acknowledge the rule, explain its practical boundary in one sentence, and preserve it for future community reviews.",
    ].join("\n");
  }

  const submission = input.submission?.trim();
  if (!submission || submission.length < 12) {
    throw new TypeError("Submission must be at least 12 characters.");
  }
  return [
    "Continue the existing creator-world review without asking me to restate prior canon.",
    `New community submission: ${submission}`,
    "Identify any remembered canon rule or precedent that matters. Return: recalled context, decision, one reason, and next action.",
  ].join("\n");
}

export function publicMindsError(error: unknown) {
  if (error instanceof MindsSetupError) {
    return { status: 503, code: "setup_required", message: error.message };
  }
  if (error instanceof TypeError) {
    return { status: 400, code: "invalid_request", message: error.message };
  }
  if (error instanceof MindsApiError) {
    return {
      status: error.status >= 400 && error.status < 600 ? error.status : 502,
      code: error.code || "minds_api_error",
      message: error.message,
    };
  }
  if (error instanceof Error && error.name === "MindsTimeoutError") {
    return { status: 504, code: "reply_timeout", message: error.message };
  }
  return {
    status: 500,
    code: "unexpected_error",
    message: "The request failed without a verified result.",
  };
}
