import {
  createMindsClient,
  MindsApiError,
  type MessageRecord,
} from "@animocabrands/minds-client-lib";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

export type PocAction = "seed" | "review";

const JOB_TOKEN_TTL_MS = 10 * 60 * 1_000;
const REQUEST_ID_PATTERN = /^[a-zA-Z0-9_-]{16,80}$/;

type JobTokenPayload = {
  version: 1;
  alias: string;
  messageText: string;
  requestStartedAt: number;
  expiresAt: number;
};

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

function tokenKey(builderApiKey: string) {
  return createHash("sha256")
    .update("loreline:minds-job-token:v1\0")
    .update(builderApiKey)
    .digest();
}

function sealJobToken(payload: JobTokenPayload, builderApiKey: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", tokenKey(builderApiKey), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ciphertext].map((part) => part.toString("base64url")).join(".");
}

function openJobToken(token: string, builderApiKey: string) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new TypeError("Job token is invalid.");

  try {
    const [iv, tag, ciphertext] = parts.map((part) =>
      Buffer.from(part, "base64url"),
    );
    const decipher = createDecipheriv(
      "aes-256-gcm",
      tokenKey(builderApiKey),
      iv,
    );
    decipher.setAuthTag(tag);
    const payload = JSON.parse(
      Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString(
        "utf8",
      ),
    ) as JobTokenPayload;
    if (
      payload.version !== 1 ||
      typeof payload.alias !== "string" ||
      typeof payload.messageText !== "string" ||
      !Number.isFinite(payload.requestStartedAt) ||
      !Number.isFinite(payload.expiresAt)
    ) {
      throw new Error("invalid payload");
    }
    if (Date.now() > payload.expiresAt) {
      const error = new Error("The result window expired. Start a new run.");
      error.name = "MindsJobExpiredError";
      throw error;
    }
    return payload;
  } catch (error) {
    if (error instanceof Error && error.name === "MindsJobExpiredError") {
      throw error;
    }
    throw new TypeError("Job token is invalid.");
  }
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

function requestMarker(requestId: string) {
  if (!REQUEST_ID_PATTERN.test(requestId)) {
    throw new TypeError("Request ID must be a valid opaque identifier.");
  }
  return `Loreline request ID: ${requestId}`;
}

function findExistingRequest(rows: MessageRecord[], marker: string) {
  return rows
    .filter(
      (row) =>
        row.senderType === 1 &&
        row.messageText?.split("\n")[0]?.trim() === marker,
    )
    .sort(
      (a, b) => Date.parse(b.createdAt ?? "") - Date.parse(a.createdAt ?? ""),
    )[0];
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

export async function startMindsPoc(input: {
  action: PocAction;
  creatorId: string;
  requestId: string;
  worldContext?: string;
  canonSource?: string;
  canonRule?: string;
  submission?: string;
}) {
  const config = readConfig();
  const alias = conversationAlias(input.creatorId);
  const client = createMindsClient({ builderApiKey: config.builderApiKey });

  await client.ensureConversation(alias, config.mindId);

  const marker = requestMarker(input.requestId);
  const messageText = `${marker}\n${buildMindsMessage(input)}`;
  const history = await client.getHistory(alias, { limit: 100 });
  const existing = findExistingRequest(history, marker);
  if (existing?.messageText && existing.messageText.trim() !== messageText.trim()) {
    throw new TypeError("Request ID was already used with different content.");
  }

  let requestStartedAt = existing?.createdAt
    ? Date.parse(existing.createdAt)
    : Date.now();
  if (!Number.isFinite(requestStartedAt)) requestStartedAt = Date.now();

  if (!existing) {
    await client.sendMessage({ alias, messageText });
  }

  const expiresAt = requestStartedAt + JOB_TOKEN_TTL_MS;
  const jobToken = sealJobToken(
    { version: 1, alias, messageText, requestStartedAt, expiresAt },
    config.builderApiKey,
  );

  return {
    state: "pending" as const,
    jobToken,
    submittedAt: new Date(requestStartedAt).toISOString(),
    expiresAt: new Date(expiresAt).toISOString(),
  };
}

export async function pollMindsPoc(jobToken: string) {
  const config = readConfig();
  const payload = openJobToken(jobToken, config.builderApiKey);
  const client = createMindsClient({ builderApiKey: config.builderApiKey });
  const history = await client.getHistory(payload.alias, { limit: 100 });
  const reply = findReplyAfterMessage(
    history,
    payload.messageText,
    payload.requestStartedAt,
  );

  if (!reply) {
    return {
      state: "pending" as const,
      expiresAt: new Date(payload.expiresAt).toISOString(),
    };
  }

  return {
    state: "completed" as const,
    reply: {
      messageText: reply.messageText ?? "",
      createdAt: reply.createdAt ?? null,
    },
  };
}

export function hasAutonomousFollowUp(rows: MessageRecord[]) {
  const ordered = rows
    .filter((row) => Number.isFinite(Date.parse(row.createdAt ?? "")))
    .sort(
      (a, b) => Date.parse(a.createdAt ?? "") - Date.parse(b.createdAt ?? ""),
    );

  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const current = ordered[index];
    if (
      previous.senderType !== 1 &&
      current.senderType !== 1 &&
      current.messageText?.trim()
    ) {
      return current;
    }
  }
  return undefined;
}

export async function getAutonomyStatus() {
  const builderApiKey = process.env.MINDS_BUILDER_API_KEY?.trim();
  if (!builderApiKey || !process.env.MINDS_MIND_ID?.trim()) {
    return { configured: false, verified: false, observedAt: null } as const;
  }

  const client = createMindsClient({ builderApiKey });
  const history = await client.getHistory(
    conversationAlias("steward-configuration"),
    { limit: 100 },
  );
  const followUp = hasAutonomousFollowUp(history);
  return {
    configured: true,
    verified: Boolean(followUp),
    observedAt: followUp?.createdAt ?? null,
  } as const;
}

export function isAuthorizedCron(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const authorization = request.headers.get("authorization") ?? "";
  const expected = secret ? `Bearer ${secret}` : "";
  if (!secret || authorization.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(authorization), Buffer.from(expected));
}

export async function triggerDueCaseReview(now = new Date()) {
  const config = readConfig();
  const alias = conversationAlias("due-case-trigger");
  const client = createMindsClient({ builderApiKey: config.builderApiKey });
  await client.ensureConversation(alias, config.mindId);

  const date = now.toISOString().slice(0, 10);
  const marker = `Loreline daily due-work trigger: ${date}`;
  const messageText = [
    marker,
    `Current UTC time: ${now.toISOString()}`,
    "Review persistent creator cases that are due or overdue.",
    "Respect creator approval gates, do not repeat completed actions, and prepare only the next permitted follow-up.",
    "Return a concise summary of checked, due, prepared, and blocked cases.",
  ].join("\n");
  const history = await client.getHistory(alias, { limit: 100 });
  const alreadyTriggered = history.some(
    (row) =>
      row.senderType === 1 && row.messageText?.split("\n")[0]?.trim() === marker,
  );
  if (!alreadyTriggered) {
    await client.sendMessage({ alias, messageText });
  }
  return { accepted: true, duplicate: alreadyTriggered } as const;
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
  if (error instanceof Error && error.name === "MindsJobExpiredError") {
    return { status: 410, code: "job_expired", message: error.message };
  }
  return {
    status: 500,
    code: "unexpected_error",
    message: "The request failed without a verified result.",
  };
}
