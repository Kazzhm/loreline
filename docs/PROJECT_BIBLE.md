# Loreline Project Bible

## Vision

**Project Name:** Loreline

**Tagline:** Creator canon that remembers. Community collaboration that stays attributable.

**One-line Pitch:** A persistent steward that remembers creator canon and community precedent, follows unresolved submissions, and preserves attribution when fan work becomes part of the world.

## Problem

### Creator Pain Point

Creator communities accumulate lore, exceptions, moderation precedents, fan concepts, and informal reuse promises. The creator becomes the only person who can reconcile them, creating a review bottleneck and a trust risk.

### Target User

Independent storytellers, game makers, worldbuilders, comic and animation creators, and community-led creative projects.

### Current Alternative

Scattered notes, chat search, volunteer moderators, spreadsheets, static community guidelines, and informal direct-message permission.

## Product

### Core Experience

Loreline remembers the creator's world and the community decisions that shaped it. When a new contribution arrives later, the Mind recalls the relevant rule, explains the precedent, proposes a decision, and preserves the next action. Approved work can receive a portable attribution receipt.

### User Flow

1. Creator opens a world and records canon boundaries.
2. Loreline establishes a stable persistent conversation.
3. A community submission arrives in a later session.
4. The Mind recalls applicable canon and precedent.
5. The creator approves, requests revision, holds, or declines.
6. Loreline schedules follow-up when the case remains open.
7. Approved work receives an attribution receipt.
8. The decision becomes precedent for future reviews.

### Key Features

- creator-world conversation identity;
- cross-session canon memory;
- precedent-aware submission review;
- visible context and action trace;
- creator approval gate;
- due-case follow-up;
- portable contribution receipt;
- failure and permission visibility.

## Minds

### Why Minds

The product's central decision is contextual and cumulative. A one-off response cannot reliably know the creator's old canon, prior exceptions, contributor history, and unresolved promises.

### Memory

Canon facts, creator boundaries, contributor context, exceptions, outcomes, and the reasons behind rulings.

### Persistence

One stable conversation alias per creator world. Session A and Session B can run in separate processes while retaining the same history.

### Autonomy

A due-case Skill revisits cases with unresolved next actions and prepares a result without requiring the creator to re-explain the case.

### Skills

Planned Loreline Case Steward Skill: inspect due cases, retrieve creator context, prepare a next action, and notify the creator without bypassing approval gates.

### Apps

P0 needs no third-party App. P1 may use a verified messaging or task App after scope inspection.

### Tools

Application tools expose narrowly scoped case reads, status updates, and notification actions. No tool can publish a contribution or issue a receipt without explicit creator approval.

### Connections

External-service credentials remain in the Minds connection layer. Application credentials remain server-side.

## Web3

### Blockchain

Base Sepolia is selected for the first receipt. It is EVM-compatible, supported by viem, inexpensive for test transactions, and independently verifiable through BaseScan. No mainnet transaction is permitted for the hackathon proof.

### Contract

Append-only contribution receipts keyed by content digest and creator-controlled approval. The contract records identifiers and receipt metadata hashes, not private content.

### Asset

The receipt is not an ownership token. It is evidence that the creator approved a described contribution under referenced terms.

### Identity

Creator and contributor addresses are optional receipt participants. Product identities remain separate from wallet addresses.

### Ownership

Copyright is not transferred by default. The referenced agreement states the approved use and attribution.

### Settlement

Not part of P0. Optional split settlement is P2 after legal and product validation.

### Reputation

Future versions may count verified accepted contributions without publishing private moderation history.

### Web3 Necessity Test

**What goes on-chain?** Content digest, agreement digest, creator address, optional contributor address, timestamp, and receipt status.

**Why is it on-chain?** Multiple parties and platforms can independently verify that the receipt existed and has not changed.

**Who writes it?** The application test wallet after creator approval; later, the creator or an approved relayer.

**Who verifies it?** Creator, contributor, publisher, marketplace, or community tool.

**Who owns it?** Nobody owns the underlying work through the receipt; rights remain governed by the referenced terms.

**What does the user gain?** Portable evidence of approval and attribution.

**What becomes impossible without blockchain?** Independent verification after Loreline is unavailable or distrusted. Workflow storage itself remains off-chain.

If the receipt cannot demonstrate this portability clearly, blockchain will be removed.

## Architecture

### Frontend

Next.js and React interface centered on the two-session proof and activity trace.

### Backend

TypeScript server routes normalize creator identities, call Minds, sanitize history, handle timeouts, and enforce approval gates.

### Minds

Official client library 0.1.3, stable alias, message send, history retrieval, reply wait, and later an equipped due-case Skill.

### Database

P0 can hold workflow state in a minimal durable store once the hosting database binding is enabled. Mind history is not duplicated and relabeled as platform memory.

### Blockchain

Solidity receipt contract with local automated tests and a creator wallet approval gate, followed by Base Sepolia deployment only.

### External APIs

No external creator platform is required for the Golden Path. Connectors are P1 or P2.

## Competition

### Track

Moderation & community assistance.

### Judging Fit

- integration depth: cross-session memory and later follow-up are the product core;
- creator problem: canon and contribution review bottleneck;
- innovation: community moderation becomes attributable co-creation;
- execution: one clear end-to-end case;
- viability: creator communities and fictional worlds are repeat-use contexts.

### Competitive Advantage

Public entries cover general moderation, broad creator operations, and repurposing provenance. Loreline focuses on the unserved transition from community contribution to creator-approved canon and attribution.

## Demo

### Magic Moment

In Session A, the creator states that the Glass Sea cannot be crossed at night. In Session B, the prompt only contains a fan's midnight-crossing proposal. The Mind recalls the old rule, flags the conflict, requests one change, and later recognizes the revision without restarting the case.

### Proof

- same stable alias;
- separate processes or browser sessions;
- earlier and later fingerprints in official history;
- verification prompt does not repeat the rule;
- a later action appears for the unresolved case;
- optional test-network receipt has a verifiable transaction.

### Demo Sequence

1. Creator-world problem.
2. Session A stores one canon rule.
3. Session B opens later with no repeated rule.
4. Mind recalls and reviews a conflicting contribution.
5. Revised contribution is approved.
6. Attribution receipt appears.
7. Architecture and closing claim.

## Future

### Expansion

Multi-world portfolios, creator-platform connectors, fan contribution portals, publisher verification, and portable contributor reputation.

### Business Model

Creator subscription by active world and review volume; team plan for studios; optional verification service for publishers and marketplaces.

### Scale

Partition workflow state by creator world, make actions idempotent, store only references on-chain, paginate Minds history, and use rate-aware due-case batches.
