# Pre-Submission Review

Status labels: **Answered**, **Needs evidence**, **Open risk**.

1. **Is this a real creator problem?** — **Answered.** Long-running communities fragment canon, precedent, consent, and attribution; research and the official theme support engagement and workflow pain.
2. **Why would a creator pay?** — **Answered.** It reduces review load and prevents trust-damaging inconsistency while enabling reusable community work.
3. **Is the target user too narrow?** — **Answered.** The initial niche is deliberate; writers, games, comics, animation, and virtual worlds share the same mechanic.
4. **Why not use a wiki?** — **Answered.** A wiki stores facts but does not interpret a new case, preserve decision context, or follow unresolved work.
5. **Why not use a moderation bot?** — **Answered.** Moderation asks whether content is allowed; Loreline asks whether a contribution can become canon and under what attribution.
6. **Could a one-off response do this?** — **Answered.** The demo withholds the old rule; a one-off response lacks the necessary context.
7. **Is memory genuinely cross-session?** — **Needs evidence.** Must record separate-process Session A and Session B with the same alias and official history.
8. **Is continuity more than chat history?** — **Needs evidence.** The later case must inherit status and precedent, not merely display old text.
9. **What does the Mind do autonomously?** — **Needs evidence.** A due-case Skill must create a later action without a new creator message at that moment.
10. **Is the timer itself being called autonomy?** — **Answered.** No. The trigger only wakes the workflow; the Mind must evaluate context and choose the next action.
11. **Why Minds specifically?** — **Answered.** Stable identity, persistent history, memory, skills, app permissions, and cognition-backed autonomous work are central.
12. **Is application storage being presented as Mind memory?** — **Answered.** No. Mind history and case state are separated in architecture and UI.
13. **Could the Mind hallucinate canon?** — **Open risk.** The interface must show recalled source context and let the creator correct the decision.
14. **What happens after a creator override?** — **Needs evidence.** Override rationale must become later precedent and be demonstrated.
15. **Does the Mind have excessive access?** — **Answered.** P0 needs no third-party connector; later tools are narrowly scoped and inspected.
16. **Can an unknown sender reach the Mind?** — **Needs evidence.** Circle permission test must show the unauthorized sender is blocked.
17. **What if history is unavailable?** — **Answered.** The case is marked unavailable; Loreline does not infer or fabricate context.
18. **What if the reply times out?** — **Answered.** The request reports timeout and instructs the operator to check history before retrying.
19. **Can a duplicate trigger act twice?** — **Open risk.** Due-case actions need an idempotency key before P1 completion.
20. **Does Web3 add real value?** — **Answered conditionally.** Only portable receipt verification qualifies; otherwise it will be removed.
21. **Why not PostgreSQL for receipts?** — **Answered.** PostgreSQL handles workflow state, but cannot offer independent verification after the service is unavailable or distrusted.
22. **Does the receipt transfer copyright?** — **Answered.** No. It references explicit terms and records approval evidence.
23. **What goes on-chain?** — **Answered.** Digests, participant addresses when provided, timestamp, and receipt status; no private content.
24. **Who signs the transaction?** — **Open risk.** P1 uses an application test wallet after creator approval; production model requires creator or relayer design.
25. **Why no mainnet?** — **Answered.** Mainnet adds cost and asset risk without improving the hackathon proof.
26. **Is this already represented by Keeper?** — **Answered.** Keeper focuses on nuanced moderation; Loreline focuses on canon admission, contribution rights, and attribution.
27. **Is this already represented by ProvenaMind?** — **Answered.** ProvenaMind focuses on media repurposing, provenance, and payment; Loreline does not transcode or redistribute content.
28. **Can a judge understand it in one minute?** — **Answered.** One old rule, one later conflicting submission, one remembered decision.
29. **Does the demo fit 1.5–2 minutes?** — **Answered.** The script targets 1:50 with a single Golden Path.
30. **Is the working state clear?** — **Answered.** The UI distinguishes connected, missing setup, paused, timeout, and verified reply states.
31. **What happens at 100,000 creators?** — **Answered at architecture level.** Partition case state by world, paginate history, batch due work, and respect rate limits.
32. **Are rate limits known?** — **Open risk.** Numeric limits are not public; load testing requires organizer guidance or measured safe bounds.
33. **What if Minds changes during Beta?** — **Answered.** The official client is isolated behind one server module and versions are pinned.
34. **Is the product complete without the receipt?** — **Answered.** Yes. The creator-community loop works; the receipt is a winning feature, not a dependency for memory proof.
35. **What will be cut first?** — **Answered.** Multi-chain, analytics, connectors, reputation, and settlement; never the Minds core loop.

## Release Gate

Submission remains blocked until questions 7, 8, 9, 14, 16, 19, and 24 have recorded evidence or are explicitly removed from the product claim.
