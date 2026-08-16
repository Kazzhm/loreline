# DoraHacks Submission Draft

Form field names and limits are provisional until the submission form is opened.

## One-line Description

Loreline is a persistent Mind that remembers creator canon, reviews community contributions against precedent, follows unresolved cases, and preserves attribution for approved work.

## Short Description

Creators with growing fictional worlds cannot personally reconcile every canon rule, fan submission, exception, and permission promise. Loreline gives them a persistent community steward. In one session a creator establishes a world rule; in a later session the Mind recalls that rule without being reminded, reviews a new fan contribution, and preserves the case through revision and approval. An optional test-network receipt makes approved attribution portable without claiming ownership of the underlying work.

## Full Description

Creator communities create enormous value: theories, characters, remixes, lore, and collaborative ideas. The same growth also produces a hidden operational problem. Canon lives in scattered notes, prior rulings disappear into chat history, and fan contributions are difficult to approve and reuse without losing context or credit.

Loreline is a long-running canon and community steward built around a persistent Mind. Each creator world uses a stable conversation identity. The Mind remembers canon, creator boundaries, prior exceptions, contributor context, and the reasons behind earlier decisions. When a new submission arrives later, Loreline retrieves that continuity, prepares a review, and attaches the next action so open cases do not disappear.

The demo proves the core claim across two separate sessions. Session A establishes one canon rule. Session B supplies only a new community submission. The second prompt does not repeat the rule. The Mind must recall it from the persistent history, apply it to the new case, and explain what should happen next.

Loreline is not a general chatbot and not a generic moderation queue. Its purpose is to help a creator decide when community work can safely become part of a living world. After explicit creator approval, Loreline can prepare a portable attribution receipt containing hashes of the contribution and referenced terms. The receipt does not transfer copyright or replace a legal agreement.

## Problem

Community growth makes canon, precedent, consent, and attribution harder to manage. The creator becomes a bottleneck, while generic moderation tools cannot reason about the evolving world or preserve co-creation decisions.

## Solution

A persistent creator-world steward that connects long-term context to a visible case workflow: remember, review, follow up, approve, and attribute.

## Minds Integration

- Stable conversation alias per creator world.
- Official Builder API and client library.
- Cross-session message history and reply fingerprints.
- Canon and precedent memory.
- Case continuity through revision and creator override.
- Due-case Skill for autonomous follow-up.
- Circle permissions and server-side credentials.

The product loses its core value if Minds is replaced with a one-off response endpoint.

## Creator Economy Fit

Loreline serves writers, game makers, worldbuilders, comic and animation creators, and community-led creative projects. It reduces review burden while protecting audience trust and contributor credit.

## Innovation

Loreline moves beyond removing harmful messages. It treats community assistance as a path to safe, attributable co-creation and makes creator-specific memory visible in the decision.

## Architecture

Next.js and TypeScript web product; server-only Minds client; stable conversation identity; minimal durable case state; due-case Skill; optional EVM test-network receipt.

## Web3 Integration

Only approved contribution and agreement digests are recorded. The receipt provides portable, independent verification. Private content and moderation history stay off-chain. No mainnet funds are used.

## Demo Description

The video shows the creator define a Glass Sea rule, leave Session A, open Session B, submit a fan proposal that conflicts with the forgotten rule, and receive a precedent-aware review. The fan revision is approved and an attribution receipt is prepared.

## Future Roadmap

Creator-platform connectors, multi-world portfolios, publisher verification, portable contributor reputation, and optional split settlement after rights and compliance review.
