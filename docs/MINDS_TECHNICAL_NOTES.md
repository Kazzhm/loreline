# Minds Technical Notes

Last verified: 2026-08-16 against the Builder Hub, API reference, FAQ, changelog, CLI 0.1.3, and client library 0.1.3.

## Platform Model

A Mind is a persistent, always-on agent with its own identity, long-term memory, platform wallet metadata, and permissions. The platform describes Minds as able to monitor data, execute multi-step tasks, and reach out proactively. A Mind is owned by a Steward.

The product distinction is continuity rather than a single response. A stable Mind identity and conversation allow behavior to improve as creator context, rulings, and outcomes accumulate.

## Persistence and Conversation Continuity

- Create a conversation with a stable human-readable alias and `mindId`.
- `ensureConversation(alias, mindId)` is idempotent.
- `sendMessage` addresses the alias.
- `getHistory(alias)` returns the human and Mind transcript oldest-first.
- History pagination uses `limit` and an exclusive continuation fingerprint.
- `getLatestHistoryFingerprint` and `waitForReply` prevent confusing an old reply with the current one.
- `waitForReply` listens to the live event stream first and polls history as a fallback.

Persistent memory implementation details, retention periods, and deletion semantics are not fully documented on the public Builder pages and remain `UNVERIFIED`.

## Autonomy

Minds consume cognition when reasoning, using tools, and carrying out autonomous tasks, not only when replying to messages. The platform documentation describes monitoring, proactive outreach, and multi-step work. The public Builder API exposes status, messages, history, events, skills, apps, and usage data, but no general-purpose scheduling route is documented.

For Loreline, autonomous follow-up must therefore be demonstrated through an equipped Skill or product-owned due-work trigger that asks the persistent Mind to evaluate the stored case. A mere timer that displays a canned result is not acceptable.

## Identity and Wallet Capability

`getMind(mindId)` returns identity details that may include name, email, model, species, enabled status, wallet address, and chain. The public Builder API documentation does not expose a transaction-signing or asset-transfer method. Wallet signing must not be assumed. Loreline will use an application-controlled test wallet for test-network receipts unless an official Mind wallet action becomes documented and verified.

## Skills

A Skill is a reusable behavior composed of:

- a discoverable Bazaar offering;
- an App Manifest defining the connection;
- tool schemas defining permitted actions;
- a playbook defining behavior over time.

The Skill Building Guide says a Steward can describe, refine, connect, run, inspect, and publish a Skill through conversation with the Mind. Access scope should be inspected before publication.

## Apps and Bazaar

The Bazaar is the public catalog for Skills and Apps. Catalog reads do not require a Builder API key. Skills use `skillId`; Apps use `appId` and `appName`. Catalog popularity is represented by `equippedCount`, which is different from whether a specific Mind has the item equipped.

Authenticated Mind routes can list, equip, and unequip Skills and Apps. The July 19 changelog identifies these routes as current in Builder API 1.0.2 and client library 0.1.3.

## Circles

A Circle is the permission boundary controlling who can interact with a Mind. A new Mind initially hears its Steward and blocks unknown senders. Each Mind has one Circle across web chat, email, and Telegram. Unknown senders are silently rejected before the Mind sees the message.

The current public Circle API accepts human collaborator emails only. Mind-to-Mind membership is not supported through that API, although the broader product documentation describes introductions through email or Telegram surfaces. Loreline will not assume unsupported Mind-to-Mind Circle mutations.

## Messaging and Event Stream

Core routes cover:

- create, list, and get conversation by alias;
- send a message;
- retrieve conversation history;
- subscribe to Server-Sent Events.

The canonical history route is `GET /v1/messaging/histories/{alias}`. The singular `/history` route is deprecated. Events are streamed from `GET /v1/messaging/events`.

## Builder API and Authentication

- Node.js 22 or newer is required by the CLI and client library.
- Authenticated requests use `X-Api-Key`.
- `X-Access-Key` is deprecated.
- Environment variable: `MINDS_BUILDER_API_KEY`.
- API host: `https://api.build.hellominds.ai`.
- Credentials remain server-side and are never returned to the browser.

## CLI

Current verified release: `@animocabrands/minds-cli@0.1.3`.

Important commands:

```bash
minds doctor --pretty
minds list --pretty
minds mind show --mind <mind-id>
minds chat create --mind <mind-id> --alias <alias>
minds send <alias> "message" --wait --timeout 180000
minds history <alias>
minds events
minds mind skills list --mind <mind-id>
minds mind apps list --mind <mind-id>
```

CLI stdout is structured JSON, except the event stream, which emits newline-delimited records. Diagnostics go to stderr.

## Client Library

Current verified release: `@animocabrands/minds-client-lib@0.1.3`.

Primary application methods:

- `listMinds`, `getMind`, `updateMindStatus`
- `ensureConversation`, `sendMessage`, `getHistory`, `waitForReply`
- `subscribeEvents`, `eventsIterator`
- `listEquippedSkills`, `equipSkills`, `unequipSkills`
- `listEquippedApps`, `equipApps`, `unequipApps`
- Circle and cognition methods
- public `client.bazaar.*` catalog methods

## Connections and Secret Handling

The Skill guide says external-service keys are stored by the platform connection layer and are not held directly by the Mind. Connections can be reused by later Skills. Loreline will request only the minimum scopes needed for notifications or publishing.

## API Limits and Beta Constraints

- The Builder Hub is marked Beta.
- A 429 response may contain retry guidance.
- Public documentation does not publish numeric rate limits: `UNVERIFIED`.
- Conversation memory retention, context window policy, and deletion guarantees: `UNVERIFIED`.
- General scheduling API: not exposed in the current public reference.
- Direct wallet signing from the Builder API: not exposed in the current public reference.
- Tool equip routes are not documented as a general public surface; Skills and Apps equip routes are available.

## Verified Local Findings

On 2026-08-16, `minds doctor` reached the Builder API ping successfully and confirmed CLI 0.1.3. Authenticated checks could not run because `MINDS_BUILDER_API_KEY` was absent. Public Bazaar search completed successfully and returned no match for the narrow test query.

## Sources

- https://build.hellominds.ai/en/docs/get-started/account-setup
- https://build.hellominds.ai/en/docs/get-started/cli
- https://build.hellominds.ai/en/docs/get-started/client-library
- https://build.hellominds.ai/en/docs/guides/building-skills
- https://build.hellominds.ai/en/docs/guides/circles
- https://build.hellominds.ai/docs/api
- https://build.hellominds.ai/en/changelog
- https://build.hellominds.ai/en/faq
