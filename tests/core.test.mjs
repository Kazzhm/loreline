import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildMindsMessage,
  conversationAlias,
  findReliabilityTriggerOutcome,
  findReplyAfterMessage,
  getMindsStatus,
  hasAutonomousFollowUp,
  isAuthorizedCron,
  publicMindsError,
  startMindsPoc,
} from "../lib/minds.ts";
import { prepareReceiptDigests } from "../lib/receipt.ts";

test("contains the Loreline product shell and metadata", async () => {
  const [layout, consoleSource, receiptSource] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/loreline-console.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/receipt-panel.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /title:\s*"Loreline"/);
  assert.match(consoleSource, /Creator canon.*that remembers/is);
  assert.match(consoleSource, /Mind activity trace/i);
  assert.match(receiptSource, /Creator approval gate/i);
  assert.match(receiptSource, /does not\s+transfer copyright/i);
});

test("keeps conversation evidence behind the public API boundary", async () => {
  const [routeSource, mindsSource, cronSource] = await Promise.all([
    readFile(new URL("../app/api/minds/poc/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/minds.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/cron/due-cases/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(routeSource, /\["seed", "review"\]/);
  assert.match(routeSource, /pollMindsPoc/);
  assert.doesNotMatch(routeSource, /"history"/);
  assert.doesNotMatch(mindsSource, /return \{ alias, history/);
  assert.doesNotMatch(mindsSource, /fingerprint: outcome\.reply\.fingerprint/);
  assert.match(cronSource, /isAuthorizedCron/);
  assert.match(mindsSource, /reliabilityTriggerConfigured/);
});

test("reports missing Minds configuration without inventing a result", async () => {
  const previousKey = process.env.MINDS_BUILDER_API_KEY;
  const previousMind = process.env.MINDS_MIND_ID;
  delete process.env.MINDS_BUILDER_API_KEY;
  delete process.env.MINDS_MIND_ID;

  try {
    assert.deepEqual(await getMindsStatus(), {
      configured: false,
      connected: false,
      reason: "missing_configuration",
    });

    await assert.rejects(
      startMindsPoc({
        action: "review",
        creatorId: "glass-sea-studio",
        requestId: "request_1234567890",
        submission: "A courier crosses the Glass Sea at midnight.",
      }),
      (error) => {
        const result = publicMindsError(error);
        assert.equal(result.status, 503);
        assert.equal(result.code, "setup_required");
        return true;
      },
    );
  } finally {
    if (previousKey === undefined) delete process.env.MINDS_BUILDER_API_KEY;
    else process.env.MINDS_BUILDER_API_KEY = previousKey;
    if (previousMind === undefined) delete process.env.MINDS_MIND_ID;
    else process.env.MINDS_MIND_ID = previousMind;
  }
});

test("creates stable, creator-scoped conversation aliases", () => {
  assert.equal(conversationAlias("Glass Sea Studio"), "loreline-glass-sea-studio");
  assert.throws(() => conversationAlias("??"), /at least three/i);
});

test("requires explicit creator identity and canon authority before seeding", () => {
  assert.throws(
    () => buildMindsMessage({
      action: "seed",
      canonRule: "Blue lanterns may not cross the western gate.",
    }),
    /creator-world identity/i,
  );

  const message = buildMindsMessage({
    action: "seed",
    worldContext: "The Ember Archive is managed by Glass Sea Studio.",
    canonSource: "Creator-approved canon register",
    canonRule: "Blue lanterns may not cross the western gate.",
  });
  assert.match(message, /Creator-world identity:/);
  assert.match(message, /Canon authority and source:/);
  assert.match(message, /durable creator context/);
});

test("correlates replies by message time instead of fingerprint ordering", () => {
  const sentMessageText = "Schedule the due-case proof.";
  const reply = findReplyAfterMessage([
    {
      fingerprint: "zzzz-old-reply",
      senderType: 0,
      messageText: "Old inspection reply",
      createdAt: "2026-08-16T12:09:08.281Z",
    },
    {
      fingerprint: "aaaa-new-request",
      senderType: 1,
      messageText: sentMessageText,
      createdAt: "2026-08-16T12:09:22.684Z",
    },
    {
      fingerprint: "bbbb-new-reply",
      senderType: 0,
      messageText: "Case filed.",
      createdAt: "2026-08-16T12:13:19.991Z",
    },
  ], sentMessageText, Date.parse("2026-08-16T12:09:20.000Z"));

  assert.equal(reply?.messageText, "Case filed.");
});

test("recognizes a Mind follow-up without a new creator message", () => {
  const followUp = hasAutonomousFollowUp([
    {
      senderType: 1,
      messageText: "Creator request",
      createdAt: "2026-08-16T10:00:00.000Z",
    },
    {
      senderType: 0,
      messageText: "Initial decision",
      createdAt: "2026-08-16T10:01:00.000Z",
    },
    {
      senderType: 0,
      messageText: "Autonomous follow-up",
      createdAt: "2026-08-16T11:00:00.000Z",
    },
  ]);
  assert.equal(followUp?.messageText, "Autonomous follow-up");
});

test("requires the configured bearer secret for cron requests", () => {
  const previousSecret = process.env.CRON_SECRET;
  process.env.CRON_SECRET = "a-strong-test-secret";
  try {
    assert.equal(
      isAuthorizedCron(
        new Request("https://example.test/api/cron/due-cases", {
          headers: { authorization: "Bearer a-strong-test-secret" },
        }),
      ),
      true,
    );
    assert.equal(
      isAuthorizedCron(new Request("https://example.test/api/cron/due-cases")),
      false,
    );
  } finally {
    if (previousSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previousSecret;
  }
});

test("reports a product-owned trigger and its correlated reply separately", () => {
  const triggerText = [
    "Loreline daily due-work trigger: 2026-08-17",
    "Current UTC time: 2026-08-17T00:00:00.000Z",
  ].join("\n");
  const outcome = findReliabilityTriggerOutcome([
    {
      senderType: 1,
      messageText: triggerText,
      createdAt: "2026-08-17T00:00:00.000Z",
    },
    {
      senderType: 0,
      messageText: "No cases were due.",
      createdAt: "2026-08-17T00:00:40.000Z",
    },
  ]);

  assert.equal(outcome.trigger?.messageText, triggerText);
  assert.equal(outcome.reply?.messageText, "No cases were due.");
});

test("creates deterministic receipt digests without storing raw content", () => {
  const first = prepareReceiptDigests(
    "  A fan-designed lantern keeper.  ",
    "Approved with contributor attribution and no copyright transfer.\r\n",
  );
  const second = prepareReceiptDigests(
    "A fan-designed lantern keeper.",
    "Approved with contributor attribution and no copyright transfer.\n",
  );

  assert.deepEqual(first, second);
  assert.match(first.contentDigest, /^0x[0-9a-f]{64}$/);
  assert.notEqual(first.contentDigest, first.agreementDigest);
});

test("locks registry deployment to Base Sepolia wallet approval", async () => {
  const [deploymentSource, bytecodeSource] = await Promise.all([
    readFile(new URL("../lib/receipt-deployment.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/receipt-bytecode.ts", import.meta.url), "utf8"),
  ]);

  assert.match(deploymentSource, /baseSepolia/);
  assert.match(deploymentSource, /awaiting_signature/);
  assert.match(deploymentSource, /waitForTransactionReceipt/);
  assert.match(bytecodeSource, /0x[0-9a-f]{100,}/);
});
