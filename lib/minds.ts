import {
  createMindsClient,
  MindsApiError,
  type MindsClient,
  type MessageRecord,
} from "@animocabrands/minds-client-lib";

export type PocAction = "seed" | "review" | "history";
export type OperatorAction = "skills" | "propose" | "build" | "inspect" | "schedule" | "diagnose" | "history";

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

export async function runMindsOperatorAction(action: OperatorAction) {
  const config = readConfig();
  const client = createMindsClient({ builderApiKey: config.builderApiKey });

  if (action === "skills") {
    const skills = await client.listEquippedSkills(config.mindId);
    return {
      count: skills.length,
      skills: skills.map((skill) => ({
        skillId: skill.skillId,
        name: skill.name ?? null,
        source: skill.source ?? null,
      })),
    };
  }

  const alias = `${config.prefix}-steward-configuration`;
  await client.ensureConversation(alias, config.mindId);

  if (action === "history") {
    const history = await client.getHistory(alias, { limit: 100 });
    return {
      history: publicHistory(history).map(({ sender, messageText, createdAt }) => ({
        sender,
        messageText,
        createdAt,
      })),
    };
  }

  const messages: Record<Exclude<OperatorAction, "skills" | "history">, string> = {
    propose: [
      "Design a private Skill named Loreline Due Case Steward.",
      "It should remember an unresolved creator-community review case, its due time, the creator-world context, and the approval boundary.",
      "At the due time, without waiting for a new human message, it should re-evaluate the case from durable context and proactively send the creator: recalled context, provisional decision, one reason, and next action.",
      "It must never approve, publish, contact a contributor, transfer assets, or issue a rights receipt without explicit creator approval.",
      "For this proof, it needs no external app. First propose the playbook, trigger, stored fields, and permission boundaries. Do not build it yet.",
    ].join("\n"),
    build: [
      "The proposed private Loreline Due Case Steward Skill is approved.",
      "Use a multi-case queue across creator worlds, with each case isolated by caseId and canon reference.",
      "Each dueAtUtc gets one fire only, with no automatic reschedule unless the creator explicitly requests one. Enforce idempotency by caseId plus dueAtUtc.",
      "Finish building it now with the narrow trigger and permission boundaries already described.",
      "Keep it private and unlisted, activate it only on this Mind, and do not publish it to the Bazaar. Confirm only after the Skill is built and available to this Mind.",
    ].join("\n"),
    inspect: [
      "Inspect the Loreline Due Case Steward Skill now.",
      "Report its trigger, stored fields, allowed actions, forbidden actions, external connections, and whether it is active on this Mind.",
      "Do not broaden its permissions and do not publish it.",
    ].join("\n"),
    schedule: [
      "Use the Loreline Due Case Steward Skill for a one-time proof case.",
      "The unresolved case is a creator review of a community proposal that conflicts with stored canon. Its approval state is pending and the only allowed action is to prepare a recommendation for the creator.",
      "Schedule the due time for five minutes from now. At that time, without waiting for another human message, send a proactive follow-up in this conversation containing: recalled context, provisional decision, one reason, and next action.",
      "Do not approve, publish, contact a contributor, transfer assets, or issue a receipt. Confirm the scheduled due time and the approval boundary now.",
    ].join("\n"),
    diagnose: [
      "Perform a read-only diagnosis of Loreline Due Case Steward case proof-001.",
      "Its confirmed due time was 2026-08-16T12:14:23Z, but no autonomous follow-up appeared in the filing conversation during the observation window.",
      "Inspect the stored case, calendar event, trigger state, execution log, and historyLog. Explain whether the event was created, whether a cognition cycle woke, and the exact failure or pending state.",
      "Do not fire, resend, reschedule, modify, pause, resolve, or delete the case or event. Do not change the Skill.",
    ].join("\n"),
  };

  const messageText = messages[action];
  const outcome = await sendAndWaitForVerifiedReply(client, alias, messageText);

  return {
    reply: {
      messageText: outcome.reply.messageText ?? "",
      createdAt: outcome.reply.createdAt ?? null,
    },
  };
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

  if (input.action === "history") {
    const history = await client.getHistory(alias, { limit: 100 });
    return { alias, history: publicHistory(history) };
  }

  const messageText = buildMindsMessage(input);
  const outcome = await sendAndWaitForVerifiedReply(client, alias, messageText);

  return {
    alias,
    reply: {
      fingerprint: outcome.reply.fingerprint,
      messageText: outcome.reply.messageText ?? "",
      createdAt: outcome.reply.createdAt ?? null,
    },
    history: publicHistory(outcome.history),
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
