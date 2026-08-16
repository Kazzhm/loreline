import { createMindsClient } from "@animocabrands/minds-client-lib";

try {
  process.loadEnvFile?.();
} catch {
  // A local environment file is optional until authenticated testing begins.
}

const [action, creatorId, value = ""] = process.argv.slice(2);
if (!['seed', 'verify', 'history'].includes(action) || !creatorId) {
  console.error('Usage: npm run minds:poc -- <seed|verify|history> <creator-id> [text]');
  process.exit(2);
}

const builderApiKey = process.env.MINDS_BUILDER_API_KEY?.trim();
const mindId = process.env.MINDS_MIND_ID?.trim();
if (!builderApiKey || !mindId) {
  console.error(JSON.stringify({
    ok: false,
    status: 'NOT WORKING YET',
    reason: 'MINDS_BUILDER_API_KEY and MINDS_MIND_ID are required',
  }, null, 2));
  process.exit(3);
}

const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48);
const creator = normalize(creatorId);
if (creator.length < 3) {
  console.error('Creator ID must contain at least three letters or digits.');
  process.exit(2);
}

const prefix = normalize(process.env.MINDS_CONVERSATION_PREFIX || 'loreline');
const alias = `${prefix}-${creator}`;
const client = createMindsClient({ builderApiKey });

await client.ensureConversation(alias, mindId);

if (action === 'history') {
  const history = await client.getHistory(alias, { limit: 100 });
  console.log(JSON.stringify({ ok: true, alias, history }, null, 2));
  process.exit(0);
}

let messageText;
if (action === 'seed') {
  if (value.trim().length < 12) {
    console.error('Seed text must be at least 12 characters.');
    process.exit(2);
  }
  messageText = `Store this as a standing canon rule for this creator world.\nRule: ${value.trim()}\nAcknowledge and preserve it for future community reviews.`;
} else {
  messageText = 'Continue the existing creator-world review without asking me to repeat prior canon. A community member proposes that a traveler crosses the forbidden boundary at midnight. Identify the remembered rule that matters, decide whether this fits canon, and give the next action.';
}

const before = await client.getLatestHistoryFingerprint(alias);
await client.sendMessage({ alias, messageText });
const outcome = await client.waitForReply({
  alias,
  timeoutMs: 180000,
  afterFingerprint: before,
  sentMessageText: messageText,
});
const history = await client.getHistory(alias, { limit: 100 });

console.log(JSON.stringify({
  ok: !outcome.timedOut,
  alias,
  timedOut: outcome.timedOut,
  reply: outcome.timedOut ? null : outcome.reply,
  history,
}, null, 2));

if (outcome.timedOut) process.exit(4);
