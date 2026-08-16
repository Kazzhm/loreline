# Minds Proof of Concept

## Current Result

Authenticated Minds connectivity and cross-request conversation continuity are
`WORKING` in the production deployment.

Durable canon memory beyond the persistent conversation is also `WORKING`.
The verified seed supplies a complete creator-world identity, an explicit canon
authority, and authorization to use the persistent conversation as the working
canon register.

Verified on 2026-08-16:

- Builder API host responds to the official CLI health check.
- CLI 0.1.3 runs on Node.js 24.
- Client library 0.1.3 is installed.
- Public Bazaar requests work without credentials.
- Server routes and command-line scripts use the official client library.
- Production status endpoint returned `configured: true` and `connected: true`.
- The configured Mind returned real replies and is enabled.
- A new conversation with no prior history recalled durable context established
  in a different conversation.

## Verified Production Run

Verified on 2026-08-16 and 2026-08-17 using independent production HTTP requests.
Session A and Session B used the same deterministic creator-scoped alias, and
an independent history retrieval returned all four records. Identifiers and
raw private conversation evidence are intentionally excluded from the public
repository.

Session A established that blue lanterns in the Ember Archive belong to
deceased cartographers and may not pass the western gate. Session B omitted
that complete rule and proposed a living courier carrying one through the
gate. The Mind recalled both constraints, declined the proposal, explained the
two violations, and proposed a canon-amendment or rewrite path.

Observed response time varied substantially. The production workflow now sends
a short duplicate-safe request and polls with an encrypted ten-minute result
token, so a long Mind response no longer occupies one server request.

## Three-Stage Case Proof

Session C was verified in production on 2026-08-17. Its prompt contained only a
revised submission that moved the crossing to after sunrise. It did not repeat
the standing canon rule or the earlier decision. The Mind recalled the exact
night-crossing constraint and the prior conflict, accepted the compliant
revision, explained why daylight changed the result, and returned a next
action. Raw replies and conversation identifiers remain excluded from the
public repository.

## Durable Memory Proof

Verified on 2026-08-16 with a new fictional creator world and no reused raw
conversation evidence in the public repository:

1. Session A supplied the creator-world identity, creator-approved canon source,
   and a two-clause standing rule. The Mind explicitly distinguished this from
   the earlier incomplete setup and accepted it as durable creator context.
2. Session B was a separate request in the same conversation. It omitted the
   identity, authority, and complete rule, then correctly recalled and applied
   both clauses.
3. A third request used a fresh conversation with no previous history and again
   omitted the identity, authority, and rule. The Mind recalled the correct
   world and both clauses, accepted the compliant part of the proposal, and
   declined the conflicting part.
4. Independent history retrieval for the first conversation returned four
   non-empty records. The fresh conversation returned only its two new records,
   distinguishing durable memory from copied conversation history.

Conversation identifiers, message fingerprints, and raw replies are excluded
from the public repository. Observed reply time in this run ranged from under a
minute to nearly two minutes.

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

Recorded evidence:

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

The verification prompt did not repeat the complete rule. The Mind recalled it
from the persistent conversation and used it to decide a new community
submission.

## Continuity Proof

The second run continued the same creator-review workflow with the same alias.
An additional history request returned both earlier creator messages and both
Mind replies.

Session C then continued the same open case. It recalled both the original rule
and the prior issue before evaluating the revision, demonstrating continuity
across a three-stage creator workflow rather than two isolated questions.

## Autonomy Proof Target

Autonomous execution remains `NOT WORKING YET`. A scheduled proof did not
produce a later Mind action during the observation window. An authenticated
daily product-owned trigger is deployed as a reliability fallback, but it is
reported separately and is not counted as platform-initiated autonomy. Its
first production observation window begins at 00:00 UTC on 2026-08-17.

## Reply Correlation

A long-running operator request exposed a stale-reply match when opaque message
fingerprints were compared as ordered strings. Loreline now locates the exact
sent creator message in official history and accepts only the first Mind message
with a later timestamp. A regression test covers the stale-reply case.

## Failure Cases

| Case | Expected behavior |
| --- | --- |
| Missing API key | 503 with setup-required state; no request sent |
| Missing Mind ID | 503 with setup-required state |
| Invalid creator ID | 400; no alias created |
| Result window expires | 410 job-expired response; no success claim |
| Stale reply | Reject replies older than the exact sent message |
| Malformed reply | Preserve raw history metadata and mark response invalid |
| History unavailable | Report unavailable; do not infer memory |
| Duplicate seed | Same alias; idempotent conversation creation |
| Tool failure | Record failure and keep case pending |

## Reproduction Checklist

- [x] Production status endpoint confirms the configured Mind.
- [x] Session A completes.
- [x] Session A request ends before Session B starts.
- [x] Session B recalls the rule without complete prompt repetition.
- [x] Independent history retrieval returns the full four-record sequence.
- [x] A fresh conversation recalls the authorized world and both canon clauses.
- [x] Fresh-conversation history contains only its own two records.
- [x] Session C recalls the earlier rule and decision before accepting a revision.
- [x] Duplicate-safe asynchronous production polling returns the correlated reply.
- [x] Public evidence contains no credentials.
- [ ] Autonomy proof produces a later Mind action.
