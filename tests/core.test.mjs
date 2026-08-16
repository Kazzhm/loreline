import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildMindsMessage,
  conversationAlias,
  getMindsStatus,
  publicMindsError,
  runMindsPoc,
} from "../lib/minds.ts";

test("contains the Loreline product shell and metadata", async () => {
  const [layout, consoleSource] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/loreline-console.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /title:\s*"Loreline"/);
  assert.match(consoleSource, /Creator canon.*that remembers/is);
  assert.match(consoleSource, /Mind activity trace/i);
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
      runMindsPoc({
        action: "review",
        creatorId: "glass-sea-studio",
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
