# Decisions

## 2026-08-16 — Select Moderation & Community Assistance

This Track has the clearest opening for a high-context product. Public entries already cover general moderation, but not the transition from community contribution to canon approval and portable attribution.

## 2026-08-16 — Select Loreline

Loreline was selected over broad creator assistants and repurposing pipelines because the core decision deteriorates sharply without long-term creator context. The demo can show a precise cross-session memory event in under two minutes.

## 2026-08-16 — Keep Web3 Behind the Minds P0

A contribution receipt may add verifiability and portability, but it is not allowed to delay persistence proof. No mainnet use is planned. A local contract test and test-network deployment are the first acceptable milestones.

## 2026-08-16 — Use One Mind for the MVP

The official rules accept single-Mind products. One Mind reduces configuration risk and makes memory evidence easier for judges to follow. Multi-Mind orchestration is not required for the Golden Path.

## 2026-08-16 — Use Stable Conversation Aliases

Each creator gets a deterministic alias. This makes continuity reproducible across separate processes and avoids accidental creation of isolated conversations.

## 2026-08-16 — Separate Workflow State from Mind History

Mind history carries creator context and reasoning continuity. Application state carries case status, idempotency keys, timestamps, and receipts. Neither layer is presented as the other.

## 2026-08-16 — Keep Due-Case Authority Narrow

Due-work actions remain isolated by creator world and idempotent per case and
due time. They may prepare a recommendation for the creator, but cannot approve,
publish, contact third parties, transfer assets, issue receipts, or alter canon.

## 2026-08-16 — Do Not Treat Calendar Storage as Autonomy

The first due event was stored correctly but did not produce a later Mind action.
Autonomy remains incomplete until a later Mind message is produced without a
new creator message. Loreline will add an authenticated product-owned due
trigger rather than presenting event creation as execution.

## 2026-08-16 — Separate submission from result retrieval

Minds responses can take several minutes, so the public workflow uses a short submission request followed by encrypted-token polling. The request carries an opaque idempotency ID; retries reuse the original message instead of creating a duplicate. The token expires after ten minutes and contains no readable conversation data.

## 2026-08-16 — Distinguish platform autonomy from product scheduling

Loreline reports unprompted Mind follow-up as a separate boolean proof. A daily authenticated Vercel Cron route is a product-owned reliability fallback and is never presented as evidence of platform-initiated autonomy.

## 2026-08-17 — Use a receipt registry instead of an NFT

The rights layer records creator-signed content and agreement digests. It does not mint a collectible, publish private content, or claim to transfer copyright. The creator transaction is the approval authority, duplicate receipts revert, and changed agreement terms fail verification.
