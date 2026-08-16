import {
  createMindsClient,
  MindsApiError,
  type MindsClient,
  type MessageRecord,
} from "@animocabrands/minds-client-lib";

export type PocAction = "seed" | "review";

export class MindsSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MindsSetupError";
  }
}

function readConfig() {
  const builderApiKey = process.env.MINDS_BUILDER_API_KEY?.trim();
  const mindId = process.env.MINDS_MIND_ID?.trim();
  if (!builderApiKey || !mindId) {
    throw new MindsSetupError(
      "A Builder API key and Mind ID are required before authenticated Minds calls can run.",
    );
  }

  return { builderApiKey, mindId };
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

export function findReplyAfterMessage(
  rows: MessageRecord[],
  sentMessageText: string,
  requestStartedAt: number,
) {
  const sentRows = rows.filter((row) => {
    const createdAt = Date.parse(row.createdAt ?? "");
    return row.senderType === 1
      && row.messageText?.trim() === sentMessageText.trim()
      && Number.isFinite(createdAt)
      && createdAt >= requestStartedAt - 5_000;
  });
  const sentRow = sentRows.sort(
    (a, b) => Date.parse(b.createdAt ?? "") - Date.parse(a.createdAt ?? ""),
  )[0];
  if (!sentRow?.createdAt) return undefined;

  const sentAt = Date.parse(sentRow.createdAt);
  return rows
    .filter((row) => {
      const createdAt = Date.parse(row.createdAt ?? "");
      return row.senderType !== 1
        && Boolean(row.messageText?.trim())
        && Number.isFinite(createdAt)
        && createdAt > sentAt;
    })
    .sort(
      (a, b) => Date.parse(a.createdAt ?? "") - Date.parse(b.createdAt ?? ""),
    )[0];
}

async function sendAndWaitForVerifiedReply(
  client: MindsClient,
  alias: string,
  messageText: string,
) {
  const requestStartedAt = Date.now();
  await client.sendMessage({ alias, messageText });
  const deadline = requestStartedAt + 270_000;

  while (Date.now() < deadline) {
    const history = await client.getHistory(alias, { limit: 100 });
    const reply = findReplyAfterMessage(history, messageText, requestStartedAt);
    if (reply) return { reply, history };
    await new Promise((resolve) => setTimeout(resolve, 4_000));
  }

  const error = new Error(
    "The Mind did not produce a verifiable reply before the timeout. Check history before retrying.",
  );
  error.name = "MindsTimeoutError";
  throw error;
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
      isEnabled: mind.isEnabled ?? null,
    },
  } as const;
}

export async function runMindsPoc(input: {
  action: PocAction;
  creatorId: string;
  worldContext?: string;
  canonSource?: string;
  canonRule?: string;
  submission?: string;
}) {
  const config = readConfig();
  const alias = conversationAlias(input.creatorId);
  const client = createMindsClient({ builderApiKey: config.builderApiKey });

  await client.ensureConversation(alias, config.mindId);

  const messageText = buildMindsMessage(input);
  const outcome = await sendAndWaitForVerifiedReply(client, alias, messageText);

  return {
    reply: {
      messageText: outcome.reply.messageText ?? "",
      createdAt: outcome.reply.createdAt ?? null,
    },
  };
}

export function buildMindsMessage(input: {
  action: PocAction;
  worldContext?: string;
  canonSource?: string;
  canonRule?: string;
  submission?: string;
}) {
  if (input.action === "seed") {
    const worldContext = input.worldContext?.trim();
    const canonSource = input.canonSource?.trim();
    const canonRule = input.canonRule?.trim();
    if (!worldContext || worldContext.length < 24) {
      throw new TypeError("Creator-world identity must be at least 24 characters.");
    }
    if (!canonSource || canonSource.length < 8) {
      throw new TypeError("Canon authority must be at least 8 characters.");
    }
    if (!canonRule || canonRule.length < 12) {
      throw new TypeError("Canon rule must be at least 12 characters.");
    }
    return [
      `Creator-world identity: ${worldContext}`,
      `Canon authority and source: ${canonSource}`,
      "This persistent conversation is the creator-approved working canon register for this project.",
      `Standing canon rule: ${canonRule}`,
      "Preserve the identity, authority, and rule as durable creator context and apply them in future community reviews under this creator relationship.",
      "Confirm the stored context, its authority, the practical boundary, and how you will use it in a later review.",
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
