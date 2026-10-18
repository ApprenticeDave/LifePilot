# First-use onboarding: basics, then guided needs discovery

## Status and brief

Research session: 2026-10-17 (conversation date). Complete for this bounded
guidance review; not a systematic literature review, usability study, or
validated design. Researcher date labels differed by one day; exact access
timestamps were not independently established.

Decision: how to gather useful personal basics, then help users identify the
problems they face, in a clear, supportive, optional and resumable setup.
Excluded: technology selection, implementation, legal-compliance conclusions,
and collecting real personal records.

Two researchers each investigated a complementary question, limited to a small
set of public authoritative sources. The coordinator opened the consequential
source sections to check the synthesis.

## Team and coverage

| Researcher invocation name | Remit | Coverage |
| --- | --- | --- |
| onboarding-accessibility-researcher | Cognitive accessibility, steps, orientation, repeated input and help | Three opened W3C sources. |
| onboarding-profile-researcher | Purpose of profile fields, progressive collection and sensitive-data boundaries | Two GOV.UK and two ICO pages; the special-category page was only partially retrieved. |

These were separate synchronous research tasks. The tool did not expose
persistent agent IDs; the actual invocation names are retained above.

## Executive recommendation

Use a **short guided form with conversational wording**, rather than either a
large profile questionnaire or an unrestricted chat as the only way through.
Start with useful basics, then guide needs discovery with recognizable examples
and optional own-word answers. This is a design synthesis, not a source-proven
winner in a comparison trial.

The sources support clear purpose, manageable steps, relevant branching and
purpose-limited collection. They do not determine the exact profile fields,
number of screens, or whether selectable suggestions outperform free text for
LifePilot's intended users.

## Findings

| ID | Type and finding | Evidence and locator | Confidence and caveat |
| --- | --- | --- | --- |
| F-01 | Guidance: start with one thing per page and branch to relevant questions. | S-001, "Start with one thing per page"; "Design for the most common scenarios first". | High for the guidance; transfer from public services to this application requires testing. The source allows merging pages when research supports it. |
| F-02 | Guidance: make purpose and position in a process clear. | S-002, sections 4.2.1 and 4.2.4. | High for the guidance; supplemental W3C advice, not a normative WCAG requirement or measured treatment effect. |
| F-03 | Guidance: justify each field by its purpose, use and relevant users. Collect enough, but no unnecessary extras. | S-001, "Know why you're asking every question"; S-003, "Do not collect information you do not need"; S-004, "When could we be processing inadequate personal data?". | High for principle; no source establishes that a full name or birth date is necessary here. |
| F-04 | Accessibility: avoid redundant entry within the same process, subject to stated exceptions. | S-005, SC and "Intent". | High; this does not require storing answers between sessions. Resume is already an owner decision, with storage details unresolved. |
| F-05 | Guidance: explain personal-information use in plain language and avoid retaining unnecessary raw records. | S-003, "Tell users what information you're collecting"; "Do not store information any longer than you need to". | High for guidance; UK public-service context, not a compliance assessment for this product. |
| F-06 | Accessibility: if help is repeated across pages, keep its relative placement consistent. | S-006, "Intent"; "Limitations and Exceptions". | High; this criterion does not itself require adding a help service. |
| F-07 | Caution: deliberately inferring health or other sensitive traits can introduce special-category processing issues under the ICO framework. | S-007, "What about inferences?". | High for that section; applicability depends on jurisdiction and processing. Do not turn difficulty answers into inferred diagnoses. |

## Proposed journey to test, not approved behavior

| Stage | User-facing purpose | Candidate content |
| --- | --- | --- |
| Welcome | Understand what will happen and retain control. | "Let's get to know what would help you. You can skip questions and come back later." Explain retention before retaining answers; do not promise storage behavior not yet specified. |
| Your basics | Provide only context that will be used. | Optional preferred name; additional context only where its purpose is established. |
| Your everyday life | Recognize responsibilities without a detailed inventory. | Optional examples such as work/study, home, caring responsibilities or personal administration; include another answer and skip. Do not require names of other people. |
| What feels difficult | Identify problems without needing to invent categories. | Examples: "Remembering things", "Knowing where to start", "Finding information", "Keeping track of ongoing responsibilities"; optional own words and "I'm not sure". These examples need validation. |
| One relevant follow-up | Clarify the chosen difficulty. | For "Finding information": ask what kind of information is difficult to find, rather than start an unrelated questionnaire. |
| Check and choose | Correct the interpretation and pick a useful starting point. | Show a brief editable summary and offer one starting action; do not silently turn every selected difficulty into tasks or reminders. |

Each stage may contain several short steps. Do not present a fixed step count
or time estimate until the branching flow is known and tested. Give a truthful
indication of the current stage and what remains.

### Candidate field-purpose protocol

All rows are recommendations to discuss, not confirmed requirements.

| Candidate information | Purpose | Suggested timing and status |
| --- | --- | --- |
| Preferred name or nickname | Address the person as they choose. | Optional early question. Legal/full name is not justified merely for a greeting. |
| Language, date/time preferences | Make wording and dates understandable. | Offer accessible settings when needed; do not assume device defaults are always correct. |
| Time zone | Interpret actual schedules/reminders correctly. | Confirm when scheduling first becomes relevant, or earlier only if setup uses it. Do not require before any time-based action. |
| Country/region or currency | Localize relevant future financial/property features. | Ask only when the selected capability uses the answer; do not request a street address for localization. |
| Broad responsibilities or household context | Select relevant follow-ups and starting options. | Optional after basics, with stated use. No roster of dependants or identifying details. |
| Support preferences | Adjust presentation or guidance if supported. | Ask about useful behavior, not a diagnosis; defer options the product cannot act on. |
| Full birth date, legal identity, exact address | No initial purpose established. | Defer; first identify a specific need and the minimum precision required. |
| Diagnosis, financial balances, uploaded records | No initial purpose established; potentially sensitive. | Do not make initial onboarding depend on them. Separate purpose-bound features require their own decisions. |

## Disagreements, limitations and open decisions

- The profile researcher proposed a required full name and auto-filled required
  time zone. These were recommendations, not source-backed necessities.
  The synthesis rejects those defaults: neither has a demonstrated initial
  dependency, and the name-pattern citation was search-only.
- The GOV.UK Names pattern was a search-only lead, not verified or used as
  evidence. One W3C supplemental-pattern link returned 404; it is not cited.
- W3C sources provide standards explanations and supplemental guidance, not a
  comparative trial of onboarding forms versus chat. No numeric effectiveness,
  completion-time, or abandonment claims are supported by this review.
- GOV.UK and ICO are related UK institutional guidance, not independent
  usability experiments. The product's jurisdiction and age range are unknown.
- The ICO special-category fetch exposed the inferences section but not the
  opening category list. Claims here are restricted to the retrieved section.
- Suggested choices can support recognition but can also steer answers or
  exclude experiences. Test clarity, coverage and an easy own-word alternative.
- Exact vital stats, single/multiple difficulty selection, pacing, account
  timing, answer retention, resume and deletion behavior remain undecided.

## Evidence coverage

See the [source register](sources.md). Seven sources have original local notes;
no full source copies were saved. Public access is not treated as permission
to redistribute entire pages. This is a notes-and-citations evidence pack, not
a complete local archive.

## Next actions and update history

1. Agree which "vital stats" have a concrete initial use.
2. Approve or revise the proposed setup stages and example difficulties.
3. Draft a small fictional-data walkthrough; test comprehension, back/skip,
   interruption recovery, correction of answers and keyboard access.
4. Revise based on intended-user observations before implementing.

2026-10-17: initial two-researcher synthesis. No design recommendation has been
implemented or recorded as owner-approved.

2026-10-18: following this research, the owner selected five optional initial
profile areas: preferred name, broad responsibilities, guidance preferences,
country or region, and time zone. Their purpose is to tailor approaches and
guidance. This includes country/region and time zone during initial setup,
rather than the research's suggested deferral. See the
[current journey decisions](../../USER_JOURNEYS.md) for the definition.
The historical recommendations above remain unchanged; specific wording,
controls, personalization rules and storage behavior are still open.
