# Loreline

**Creator canon that remembers. Community collaboration that stays attributable.**

Loreline is a persistent community steward for writers, game makers, worldbuilders, and other creators whose audiences contribute theories, characters, remixes, and lore. It remembers canon decisions and community precedents across sessions, reviews new submissions against that history, follows unresolved cases, and prepares portable contribution receipts when creators approve work.

## Problem

Growing creator communities accumulate knowledge faster than a creator can review it. Canon rules live across posts and private notes. Moderation decisions lose context. Valuable fan contributions are difficult to approve, attribute, and reuse safely.

## Solution

Loreline turns an equipped Mind into a long-running canon and community steward. The same creator-to-Mind conversation is reused across sessions. A creator can establish a rule today, close the product, and later review a fan submission without restating the rule. Loreline makes the loaded context, recalled precedent, decision, follow-up, and rights receipt visible in one flow.

## Why Minds

- **Memory:** creator boundaries, canon facts, contribution history, and prior rulings remain available across sessions.
- **Continuity:** one stable conversation alias keeps multi-stage reviews connected.
- **Autonomy:** unresolved submissions are placed into a follow-up queue so the equipped Mind can revisit them and prepare the next action.
- **Identity:** each configured Mind has a stable platform identity and account-level permissions.
- **Skills and Apps:** moderation, notification, and publishing capabilities can be equipped without exposing service credentials to the Mind.

Removing Minds collapses the core experience: Loreline would become a one-off checker with no reliable memory of the creator's world or previous community decisions.

## Golden Path

1. The creator records a canon rule and approval boundary.
2. Loreline stores the rule through a persistent Mind conversation.
3. A later session introduces a community submission.
4. The Mind recalls the earlier rule and explains the relevant precedent.
5. Loreline prepares a decision and, when required, a follow-up.
6. After creator approval, the system produces a portable contribution receipt.
7. The decision becomes context for the next submission.

## Architecture

- **Web:** Next.js, React, TypeScript
- **Mind integration:** `@animocabrands/minds-client-lib` with server-only credentials
- **Messaging:** stable conversation aliases, history retrieval, reply waiting, and live event support
- **State:** Mind conversation history for creator context; application records for workflow state
- **Rights layer:** test-network contribution receipt planned after the Minds P0 is verified

## Configuration

Copy `.env.example` to `.env` and add values locally. Never commit credentials.

```bash
MINDS_BUILDER_API_KEY=
MINDS_MIND_ID=
MINDS_CONVERSATION_PREFIX=loreline
```

The Builder API key is created in the Minds Builder Console and is sent only from server routes.

## Development

```bash
npm install
npm run dev
```

## Vercel Deployment

Import this repository as a Next.js project. In the Vercel project settings,
add these production environment variables before the authenticated demo run:

- `MINDS_BUILDER_API_KEY` — mark as sensitive.
- `MINDS_MIND_ID` — the UUID of the configured Mind.
- `MINDS_CONVERSATION_PREFIX` — use `loreline`.

Redeploy after changing any environment variable. The site deliberately reports
that setup is required until both required Minds values are available to its
server routes.

## Minds POC

```bash
npm run minds:check
npm run minds:poc -- seed creator-001 "The Glass Sea cannot be crossed at night."
npm run minds:poc -- verify creator-001
```

`seed` and `verify` must be run as separate commands. Success requires the second response to recall the rule without it being repeated in the verification prompt. See `docs/MINDS_POC.md` for evidence requirements.

## Testing

```bash
npm test
npm run lint
```

Tests cover the rendered product shell. Minds network tests require real credentials and are never replaced with fabricated responses.

## Security

- Builder credentials stay server-side.
- Public routes never return credentials, conversation aliases, message fingerprints, or history.
- Stable aliases are normalized before use.
- The product uses explicit approval gates before rights or publication actions.
- Production actions must be idempotent and auditable.

## Roadmap

P0 proves Minds persistence and the end-to-end canon review. P1 adds autonomous follow-up and a test-network contribution receipt. P2 adds creator-platform connections and richer community analytics.

## Team

Independent entrant. Product, architecture, implementation, testing, and submission materials are maintained in this repository.

## License

MIT
