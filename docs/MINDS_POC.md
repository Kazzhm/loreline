# Minds Proof of Concept

## Current Result

`NOT WORKING YET` for authenticated persistence because no Builder API key or Mind ID is available in the current environment.

Verified on 2026-08-16:

- Builder API host responds to the official CLI health check.
- CLI 0.1.3 runs on Node.js 24.
- Client library 0.1.3 is installed.
- Public Bazaar requests work without credentials.
- Server routes and command-line scripts use the official client library.

## Configuration

1. Create a Mind at https://www.hellominds.ai/.
2. Create a Builder API key at https://build.hellominds.ai/en/console.
3. Add the following to local `.env`:

```bash
MINDS_BUILDER_API_KEY=<secret>
MINDS_MIND_ID=<mind-uuid>
MINDS_CONVERSATION_PREFIX=loreline
```

Do not paste credentials into documentation or commit them.

## API Used

- `listMinds`
- `getMind`
- `ensureConversation`
- `getLatestHistoryFingerprint`
- `sendMessage`
- `waitForReply`
- `getHistory`

## Stable Conversation Handling

Conversation aliases are deterministic:

```text
loreline-<normalized-creator-id>
```

The same alias must be used in separate processes and separate browser sessions. `ensureConversation` prevents duplicate conversation creation.

## Persistence Proof

### Session A — Seed

```bash
npm run minds:poc -- seed creator-001 "The Glass Sea cannot be crossed at night."
```

Expected evidence:

- conversation alias;
- human message fingerprint before send;
- Mind reply fingerprint after send;
- non-empty reply acknowledging the rule;
- history containing both messages.

### Session B — Verify

Close the first process, then run:

```bash
npm run minds:poc -- verify creator-001
```

The verification prompt does not repeat the rule. The Mind must recall it from the persistent conversation and explain how it affects a new community submission.

## Continuity Proof

The second run asks the Mind to continue the same creator-review workflow. Evidence must show the same alias and earlier fingerprints in the returned history.

## Autonomy Proof Target

P1 adds a due-case Skill. A creator marks a case for later review, exits, and the equipped Mind evaluates the due case after the trigger, producing a new history record without a new creator message at that moment. Until that run is recorded, autonomy remains `NOT WORKING YET`.

## Failure Cases

| Case | Expected behavior |
| --- | --- |
| Missing API key | 503 with setup-required state; no request sent |
| Missing Mind ID | 503 with setup-required state |
| Invalid creator ID | 400; no alias created |
| API timeout | 504-style application error; no success claim |
| Malformed reply | Preserve raw history metadata and mark response invalid |
| History unavailable | Report unavailable; do not infer memory |
| Duplicate seed | Same alias; idempotent conversation creation |
| Tool failure | Record failure and keep case pending |

## Reproduction Checklist

- [ ] `minds doctor --pretty` passes all checks.
- [ ] `minds list --pretty` returns the configured Mind.
- [ ] Session A completes.
- [ ] Session A process is closed.
- [ ] Session B recalls the rule without prompt repetition.
- [ ] Full history is saved as private test evidence with secrets removed.
- [ ] Autonomy proof produces a later Mind action.
