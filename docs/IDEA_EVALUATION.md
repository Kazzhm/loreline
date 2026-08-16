# Idea Evaluation

## Method

Ten mechanisms were evaluated against the requested 100-point model. Scores are weighted points, not raw 1–10 ratings.

## 1. Loreline

- **One-line Pitch:** A persistent steward that remembers creator canon, reviews community contributions against precedent, follows unresolved cases, and records approved attribution.
- **Target User:** writers, game makers, worldbuilders, and community-led intellectual-property creators.
- **Creator Problem:** canon, community rulings, consent, and contribution history fragment across tools.
- **Current Workflow:** notes, chat search, moderator judgment, spreadsheets, and informal permissions.
- **Why Existing Solution Fails:** moderation tools judge messages but do not preserve a creator world's evolving rules or turn approved contributions into attributable assets.
- **Product Workflow:** record canon → receive contribution later → recall precedent → review → follow up → approve → issue receipt.
- **What the Mind Does:** maintains creator-specific canon and precedent, reasons about new submissions, and prepares next actions.
- **Memory Usage:** canon facts, exceptions, contributor history, creator boundaries, prior rulings.
- **Persistence Usage:** one stable conversation per creator world across separate sessions.
- **Autonomy Usage:** revisits due cases and prepares a creator decision or contributor request.
- **Web3 Role:** portable, tamper-evident receipt for explicit approval, attribution, and optional split terms.
- **Why Web3:** a receipt may need to be verified outside Loreline by creators, contributors, publishers, and marketplaces.
- **Demo Magic Moment:** a later fan submission conflicts with a rule established in an earlier session; the Mind recalls it, requests one fix, then recognizes the revision and prepares an attribution receipt.
- **Technical Architecture:** web client, server-side Minds client, workflow store, due-case trigger, optional test-network receipt contract.
- **MVP Scope:** one world, one creator, seed rule, review one contribution, one follow-up, one receipt preview.
- **Biggest Risk:** proving autonomous follow-up within the public Builder surface.
- **Competition Advantage:** precise Track fit, emotionally legible demo, and a differentiated bridge from moderation to creator-owned co-creation.

## 2. SplitSignal

- **One-line Pitch:** A persistent collaboration steward that remembers creative contributions and turns evolving agreements into transparent revenue splits.
- **Target User:** small creator teams, podcast partners, video collaborators, music producers.
- **Creator Problem:** credit and revenue terms are decided informally and disputed after publication.
- **Current Workflow:** direct messages, spreadsheets, manual payouts, memory.
- **Why Existing Solution Fails:** split tools record final percentages but not the contextual negotiations and contribution changes that produced them.
- **Product Workflow:** open project → record roles → track changes → flag unresolved split → obtain approvals → settle.
- **What the Mind Does:** remembers contribution history, detects changed assumptions, summarizes open consent, and follows up before release.
- **Memory Usage:** roles, promised percentages, exceptions, approvals, contributor preferences.
- **Persistence Usage:** collaboration continues across weeks and revisions.
- **Autonomy Usage:** deadline-triggered split reconciliation and approval reminders.
- **Web3 Role:** signed split commitment and optional test-network settlement.
- **Why Web3:** portable settlement instructions reduce dependence on one platform and make approvals independently verifiable.
- **Demo Magic Moment:** a late editor joins; the Mind remembers the original split constraint, detects that totals no longer reconcile, and asks only the affected parties.
- **Technical Architecture:** Minds conversation, contribution event store, approval workflow, split contract.
- **MVP Scope:** three collaborators, five events, one conflict, one approved split.
- **Biggest Risk:** official Track fit is less immediate than Loreline.
- **Competition Advantage:** strong Web3 necessity and clear economic value.

## 3. Audience Covenant

- **One-line Pitch:** A persistent fan-relationship steward that remembers what a community values and turns participation promises into portable membership rights.
- **Target User:** independent creators with paid or high-engagement communities.
- **Creator Problem:** audience growth tactics optimize reach while losing long-term promises and individual fan context.
- **Current Workflow:** platform analytics, mailing lists, membership tiers, manual community notes.
- **Why Existing Solution Fails:** analytics aggregate people; they do not maintain a trustworthy record of creator promises and fan contribution history across platforms.
- **Product Workflow:** define community promise → learn participation → detect unmet promise → follow up → grant portable benefit.
- **What the Mind Does:** remembers community commitments, identifies relevant members, and prepares personalized actions.
- **Memory Usage:** fan preferences, consent, past participation, creator commitments.
- **Persistence Usage:** relationship history spans campaigns and platforms.
- **Autonomy Usage:** monitors due benefits and prepares outreach.
- **Web3 Role:** portable membership credential or claim receipt.
- **Why Web3:** fans retain proof outside a single platform and can present it to other creator experiences.
- **Demo Magic Moment:** the Mind recalls a creator promise from a prior campaign and proactively finds a qualifying fan.
- **Technical Architecture:** Minds, consent store, event ingest, notification connector, credential contract.
- **MVP Scope:** one campaign, three fans, one triggered benefit.
- **Biggest Risk:** privacy and consent scope can complicate the demo.
- **Competition Advantage:** deeper relationship narrative than a growth dashboard.

## 4. Remix Passport

- **One-line Pitch:** A persistent licensing desk that remembers creator terms and handles incoming remix requests from question to permission receipt.
- **Target User:** video, music, illustration, and virtual-asset creators.
- **Creator Problem:** small licensing requests are too fragmented and low-value for manual negotiation.
- **Current Workflow:** direct messages, email, static terms pages, manual invoices.
- **Why Existing Solution Fails:** static terms cannot interpret exceptions or remember earlier promises.
- **Product Workflow:** request → rights check → clarification → creator approval → license and payment receipt.
- **What the Mind Does:** remembers rights boundaries, asks missing questions, and follows stalled requests.
- **Memory Usage:** territories, platforms, exclusivity, exceptions, prior licensees.
- **Persistence Usage:** negotiations span multiple sessions.
- **Autonomy Usage:** follows unanswered requests and expiring offers.
- **Web3 Role:** portable license evidence and settlement.
- **Why Web3:** license proof must travel with the remix and remain verifiable outside the product.
- **Demo Magic Moment:** a new request conflicts with an earlier exclusive promise the creator had forgotten.
- **Technical Architecture:** Minds, rights rules, request workflow, receipt contract.
- **MVP Scope:** one asset, two conflicting requests, one approved license.
- **Biggest Risk:** public competitor already combines repurposing, provenance, and payments.
- **Competition Advantage:** negotiation continuity is clearer than a pure hashing pipeline.

## 5. Sponsor Memory Desk

- **One-line Pitch:** A persistent deal steward that remembers creator boundaries, brand promises, deliverables, and renewal history.
- **Target User:** solo creators managing several sponsorships.
- **Creator Problem:** briefs, exclusions, deadlines, usage rights, and follow-ups are scattered across email and documents.
- **Current Workflow:** inbox, calendar, spreadsheets, agency support.
- **Why Existing Solution Fails:** project trackers store tasks but do not reason over the creator's evolving brand boundaries.
- **Product Workflow:** ingest brief → compare boundaries → negotiate exceptions → track deliverables → follow renewal.
- **What the Mind Does:** preserves negotiation history and surfaces conflicts before acceptance.
- **Memory Usage:** banned categories, rates, past performance, usage-rights preferences.
- **Persistence Usage:** deal lifecycle and repeat sponsors.
- **Autonomy Usage:** deadline and renewal follow-up.
- **Web3 Role:** optional escrow receipt; not necessary for P0.
- **Why Web3:** only useful when cross-border settlement or portable deal reputation is required.
- **Demo Magic Moment:** the Mind refuses a subtle exclusivity conflict based on a months-old sponsor promise.
- **Technical Architecture:** Minds, email app, structured deal state, notification tool.
- **MVP Scope:** two briefs, one conflict, one deliverable schedule.
- **Biggest Risk:** email connection setup and privacy.
- **Competition Advantage:** direct revenue protection.

## 6. Patron Pulse

- **One-line Pitch:** A persistent retention steward that remembers supporter journeys and proposes respectful interventions before members disengage.
- **Target User:** membership-funded creators.
- **Creator Problem:** creators see churn after it happens and cannot personally remember every supporter interaction.
- **Current Workflow:** aggregate dashboards and manual direct messages.
- **Why Existing Solution Fails:** generic retention sequences ignore relationship context and risk feeling exploitative.
- **Product Workflow:** observe participation → recall consent and history → detect risk → propose human-reviewed outreach → learn result.
- **What the Mind Does:** maintains relationship context and improves intervention choice.
- **Memory Usage:** consent, interests, past outreach, event attendance, benefits used.
- **Persistence Usage:** supporter journey over time.
- **Autonomy Usage:** detects thresholds and drafts a respectful follow-up.
- **Web3 Role:** none in P0; optional portable loyalty credential.
- **Why Web3:** weak unless benefits must travel across communities.
- **Demo Magic Moment:** the Mind recognizes that a quiet supporter prefers event invitations, not discount messages.
- **Technical Architecture:** Minds, supporter event store, consent rules, messaging connector.
- **MVP Scope:** five supporter histories and one intervention.
- **Biggest Risk:** requires credible consent design and realistic data.
- **Competition Advantage:** relationship quality rather than follower growth.

## 7. Release Relay

- **One-line Pitch:** A persistent release steward that adapts one creative asset across platforms while remembering embargoes, format rules, and performance lessons.
- **Target User:** creators publishing recurring multimedia releases.
- **Creator Problem:** repurposing loses context, approvals, and platform-specific lessons.
- **Current Workflow:** templates, calendars, editing tools, manual checklists.
- **Why Existing Solution Fails:** automation reproduces formats but forgets why past variants succeeded or were rejected.
- **Product Workflow:** ingest master → recall rules → prepare variants → approve → measure → update playbook.
- **What the Mind Does:** maintains release-specific constraints and learning loop.
- **Memory Usage:** voice, embargoes, prior performance, platform exceptions.
- **Persistence Usage:** lessons compound between releases.
- **Autonomy Usage:** prepares next-channel variant after approval.
- **Web3 Role:** optional provenance pointer only.
- **Why Web3:** insufficient for MVP; database is preferable.
- **Demo Magic Moment:** the Mind avoids a previously rejected short-form hook and explains the remembered reason.
- **Technical Architecture:** Minds, media pipeline, analytics store.
- **MVP Scope:** text-first adaptation for three channels.
- **Biggest Risk:** crowded Track and direct comparison with stronger media pipelines.
- **Competition Advantage:** learning continuity.

## 8. SafeStage

- **One-line Pitch:** A restorative moderation steward that remembers context, proposes proportionate action, and follows cases after warnings.
- **Target User:** livestreamers and membership communities.
- **Creator Problem:** standard moderation is binary and forgets context.
- **Current Workflow:** keyword filters, volunteer moderators, bans, appeals.
- **Why Existing Solution Fails:** no durable precedent or structured repair process.
- **Product Workflow:** triage → context review → warning → later check → resolve or escalate.
- **What the Mind Does:** reasons with community norms and maintains case continuity.
- **Memory Usage:** member dossier, norms, prior rulings, repair actions.
- **Persistence Usage:** case lifecycle across sessions.
- **Autonomy Usage:** scheduled re-checks.
- **Web3 Role:** none.
- **Why Web3:** not needed; ordinary records are safer.
- **Demo Magic Moment:** the Mind reduces a sanction after a member completes a repair action.
- **Technical Architecture:** Minds, moderation queue, case store.
- **MVP Scope:** three cases and one follow-up.
- **Biggest Risk:** near-direct overlap with Keeper.
- **Competition Advantage:** restorative model, but differentiation is too narrow.

## 9. CreditWeave

- **One-line Pitch:** A persistent attribution graph for collaborative creator projects and derivative works.
- **Target User:** open creative collectives and community productions.
- **Creator Problem:** contribution lineage is lost when assets move between people and platforms.
- **Current Workflow:** credits documents, source folders, commit history, manual manifests.
- **Why Existing Solution Fails:** records do not explain consent changes or creative dependencies.
- **Product Workflow:** register contribution → link derivation → request approval → publish graph → update reputation.
- **What the Mind Does:** resolves ambiguous attribution and follows missing approvals.
- **Memory Usage:** contributor identities, assets, dependencies, exceptions.
- **Persistence Usage:** project lineage across releases.
- **Autonomy Usage:** finds missing consent before publication.
- **Web3 Role:** portable contribution graph anchors.
- **Why Web3:** third parties can verify lineage without relying on one project database.
- **Demo Magic Moment:** the Mind detects that a final asset includes an unapproved contribution two steps upstream.
- **Technical Architecture:** Minds, graph store, receipt anchor.
- **MVP Scope:** four assets, three contributors, one missing approval.
- **Biggest Risk:** graph UI and identity resolution increase scope.
- **Competition Advantage:** strong creator ownership story.

## 10. Learning Guild

- **One-line Pitch:** A persistent cohort steward that remembers each creator's project, forms useful peer circles, and issues portable contribution credentials.
- **Target User:** creator education cohorts and community workshops.
- **Creator Problem:** short programmes lose context between sessions and peer help is rarely recognized.
- **Current Workflow:** group chat, office hours, static coursework, attendance certificates.
- **Why Existing Solution Fails:** progress and peer contribution are separated from the creator's actual project history.
- **Product Workflow:** onboard goal → track weekly work → match peers → follow blockers → verify contribution.
- **What the Mind Does:** remembers project state and adapts support over time.
- **Memory Usage:** goals, blockers, skills, peer help, milestones.
- **Persistence Usage:** multi-week creator journey.
- **Autonomy Usage:** weekly check-ins and peer matching.
- **Web3 Role:** portable learning and contribution credential.
- **Why Web3:** creators can carry verified cohort work into future communities.
- **Demo Magic Moment:** the Mind remembers two complementary blockers and introduces the right peers at the right time.
- **Technical Architecture:** Minds, Circle permissions, progress records, credential contract.
- **MVP Scope:** three learners, two weeks, one peer match.
- **Biggest Risk:** less direct commercial value and group identity complexity.
- **Competition Advantage:** natural Open Campus connection.

## Weighted Scorecard

| Idea | Minds 18 | Problem 15 | Innovation 12 | Demo 10 | Feasible 10 | Complete 8 | Viable 8 | UX 7 | Web3 5 | Different 4 | Explain 3 | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Loreline | 18 | 15 | 11 | 10 | 8 | 7 | 7 | 6 | 5 | 4 | 3 | **94** |
| SplitSignal | 16 | 14 | 11 | 9 | 7 | 7 | 7 | 6 | 5 | 4 | 3 | **89** |
| Remix Passport | 16 | 14 | 10 | 9 | 7 | 7 | 8 | 6 | 5 | 2 | 3 | **87** |
| Audience Covenant | 17 | 14 | 10 | 8 | 7 | 6 | 7 | 7 | 4 | 3 | 3 | **86** |
| Learning Guild | 16 | 12 | 9 | 8 | 7 | 7 | 8 | 7 | 5 | 4 | 3 | **86** |
| Sponsor Memory Desk | 16 | 15 | 8 | 8 | 9 | 7 | 8 | 6 | 2 | 3 | 3 | **85** |
| CreditWeave | 15 | 13 | 11 | 8 | 6 | 6 | 8 | 6 | 5 | 4 | 3 | **85** |
| SafeStage | 18 | 14 | 7 | 9 | 9 | 8 | 7 | 7 | 1 | 1 | 3 | **84** |
| Patron Pulse | 17 | 14 | 9 | 9 | 8 | 7 | 7 | 7 | 2 | 3 | 3 | **86** |
| Release Relay | 15 | 13 | 7 | 8 | 9 | 8 | 7 | 7 | 2 | 2 | 3 | **81** |

## Top 3

The numerical Top 3 are Loreline, SplitSignal, and Remix Passport. Remix Passport is displaced from final architecture review because public competition evidence shows direct overlap in repurposing, provenance, and payment. Audience Covenant advances instead as the strongest less-crowded alternative.

### Loreline

- **Architecture:** one Mind, stable creator-world alias, case store, due-case Skill, optional receipt contract.
- **Minds integration:** canon memory, precedent continuity, due-case follow-up, Circle permissions.
- **Web3 integration:** approved attribution receipt only.
- **User journey:** creator rule → later fan submission → remembered conflict → revision → approval.
- **Demo flow:** two sessions with a visible history boundary.
- **MVP:** narrow and demoable.
- **Technical risk:** autonomous trigger setup.
- **Competition risk:** must remain clearly beyond generic moderation.
- **Estimate:** 4 days P0, 2 days P1, 2 days polish and evidence.
- **Winning narrative:** creator communities can co-create without losing canon, trust, or credit.

### SplitSignal

- **Architecture:** one Mind, contribution event store, approval service, split contract.
- **Minds integration:** remembers contribution and negotiation history; follows missing approvals.
- **Web3 integration:** excellent fit for settlement and portable approvals.
- **User journey:** collaboration evolves → inconsistency detected → affected parties approve → split recorded.
- **Demo flow:** clear conflict and resolution.
- **MVP:** feasible but requires credible multi-party approval.
- **Technical risk:** identity, signatures, and contract UX.
- **Competition risk:** weaker mapping to one official Track.
- **Estimate:** 5 days P0, 3 days contract and approval, 2 days polish.
- **Winning narrative:** creative collaboration should not end in invisible labor or payment disputes.

### Audience Covenant

- **Architecture:** one Mind, supporter event store, consent rules, notification connector, optional credential.
- **Minds integration:** long-term fan context and promise tracking.
- **Web3 integration:** portable benefit credential.
- **User journey:** creator makes promise → supporter qualifies later → Mind follows through.
- **Demo flow:** emotionally strong but needs realistic supporter data.
- **MVP:** feasible with sample consented records.
- **Technical risk:** privacy and connector setup.
- **Competition risk:** could look like customer relationship automation.
- **Estimate:** 4 days P0, 3 days connector and consent, 2 days polish.
- **Winning narrative:** growth should deepen relationships rather than turn fans into metrics.

## Final Recommendation

**Build Loreline.**

It has the strongest Minds Necessity Test: removing long-term memory and continuity destroys the ability to compare a new contribution with prior canon and creator precedent. It also has the clearest two-minute Magic Moment, fits an official Track directly, occupies a public competitive gap, and gives Web3 one disciplined job—portable evidence of approved attribution—without making the chain the product.
