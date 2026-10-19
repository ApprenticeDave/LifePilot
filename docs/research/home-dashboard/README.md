# Home dashboard: a calm visual starting point

## Brief and status

2026-10-18. Complete for a bounded public-guidance review, not a systematic
review or validated design. The owner requested research into a more visual
everyday home screen after setup, not a replacement welcome or onboarding flow.
No application changes are authorized by this research.

Questions: what should the home prioritize; how can cards make it scannable
without clutter; what should new or unavailable-data states show?
Excluded: choosing task/finance workflows, new integrations, architecture,
clinical claims, and copying product designs or screenshots.

## Team and evidence coverage

Two synchronous research tasks:

- `dashboard-accessibility`: cognitive accessibility, hierarchy, reflow,
  color and control sizing.
- `dashboard-patterns`: daily-planner product examples and empty-state guidance.

The task tool exposed invocation names, not persistent agent IDs. Both returned
evidence. The coordinator opened the six consequential sources listed in the
[source register](sources.md). Additional Todoist examples returned by the
patterns researcher were not needed for this synthesis and are not cited.

Six original source notes are saved. No full source copies, screenshots or
downloads are archived; this is a citation-and-notes pack.

## Executive recommendation

Use an **action-oriented home**, not an analytics dashboard: a clear page
heading, one prominent next-step panel, a short daily list when that capability
exists, and a small set of clearly labeled life-area cards.

"Visual" should mean a readable hierarchy, recognizable icons paired with
text, consistent alignment and purposeful whitespace, rather than more charts,
badges or animations. This is a design recommendation, not a measured finding
that cards are superior to lists or that all neurodivergent users prefer it.

## Findings

| ID | Classification and finding | Evidence | Confidence and limitations |
| --- | --- | --- | --- |
| F-01 | Guidance: clearly signal page purpose and use familiar controls and hierarchy. | S-001, design guide 4.1 and Objective 1. | High for the guidance; supplemental W3C advice, not proof of one best dashboard. |
| F-02 | Product example: a daily focus list can be user-curated; suggestions need not automatically populate it. | S-002, My Day and suggestions. | High for documented Microsoft behavior; observed design, not comparative effectiveness evidence. Do not assume LifePilot should copy nightly reset behavior. |
| F-03 | Guidance: left-align empty-state content; use images only when helpful and space permits. Avoid multiple competing primary actions across empty tiles. | S-003, small tiles/side panels; multiple empty states. | High for retrieved guidance. Only that section was retrieved, not the full page. |
| F-04 | Accessibility: normal dashboard content should reflow without loss at 320 CSS pixels, subject to the criterion's exceptions. | S-004, SC 1.4.10 and Intent. | High; official explanation reproduces the criterion. Page overflow alone does not verify internal text/control containment. |
| F-05 | Accessibility: pointer targets need sufficient size or spacing; minimum is 24 by 24 CSS pixels with specified exceptions. | S-005, Intent and Exceptions. | High; do not confuse the visible icon or checkbox size with its entire clickable target. |
| F-06 | Accessibility: color alone must not convey an action or status. | S-006, SC 1.4.1 and Intent. | High; add text/shape cues rather than relying on colored life-area cards. |

## Proposed visual layout

Desktop structure, not a pixel specification:

```text
LifePilot                          Home       Profile

Home
Welcome back, Alex

+----------------------------------------------------+
| Your next step                                     |
| One relevant suggestion, with a short reason        |
| [One primary action]     Choose something else      |
+----------------------------------------------------+

+---------------------------+------------------------+
| Today                     | Coming up              |
| Short actionable list     | Only relevant items    |
| or helpful empty state    | No fabricated counts   |
+---------------------------+------------------------+

Your areas
[ Home and property ] [ Work or study ] [ Money and bills ]
[ Other selected areas, with short text descriptions     ]

Profile and guidance preferences             Setup, if unfinished
```

On mobile, use one column in that same meaningful order. Avoid a horizontal
card carousel or a miniature desktop dashboard. Text labels remain visible.
The exact number of cards and items needs testing; no source establishes an
optimal count for this product.

### What is appropriate in the current test bed?

The current app only has onboarding and a saved profile. A redesigned home may
honestly offer:

- Resume unfinished setup, or review/edit the profile.
- A short explanation of the saved guidance style, without repeating all
  personal answers on the home screen.
- Selected life-area cards with short descriptors and explicit "Not available
  yet" text where no workflow exists. Avoid fake interactive links or a wall
  of disabled buttons.
- An optional, clearly labeled future-layout preview, only if the owner wants
  to assess a concept rather than working functionality.

**Do not show working-looking Today lists, Add task controls, search, spending
charts or completion rings until the corresponding features work.** A mostly
empty dashboard is not solved by invented activity. The populated layout above
is a future direction, not the current implementation specification.

### New, returning and interrupted states

| State | Proposed home behavior |
| --- | --- |
| Setup unfinished | One clear Resume setup action, plus an option to explore; no guilt or completion pressure. |
| Setup complete, no activity features | Profile/edit actions and truthful life-area previews, not fake productivity data. |
| Activity features exist but no items | Brief explanation and one relevant working action; avoid many competing empty-state calls to action. |
| Returning with data | A short user-controlled focus list; do not automatically expose sensitive documents, amounts or household details. |
| Data fails to load | Explicit error and retry; never portray a failure as "nothing planned". |

The privacy recommendations are project-specific precautions, not findings
that Microsoft's task-selection behavior alone proves a privacy benefit.

## Personalization proposal

- Overview first: show a brief explanation of the home sections.
- Smaller steps: make the primary suggestion one bounded action, not an
  entire project checklist.
- More explanation: offer a short reason or optional details beside an action,
  rather than duplicating the same explanatory boxes everywhere.
- Help choosing a starting point: explain why a suggestion is offered and let
  the user replace or dismiss it. Do not perform actions on their behalf.
- Responsibilities: prioritize relevant life-area cards, with a way to access
  other areas. Skipped context must not hide capabilities permanently.

These are proposals for applying existing preferences, not approved new behavior.

## Alternatives, disagreements and unknowns

- Cards are useful for navigating areas; lists better express ordered tasks.
  A hybrid is recommended, but no source comparison proves its superiority.
- An analytics-heavy dashboard may be appropriate for a specific later question,
  but charts have no useful basis in this profile-only app.
- Microsoft's daily reset is one product's behavior, not a recommendation to
  hide or reset LifePilot's unfinished work. User control matters more than copying.
- Carbon permits a centered image in a small tile; this does not justify
  centering all dashboard text or adding decorative imagery to every card.
- COGA and WCAG material come from one standards organization, not independent
  usability experiments. Product documentation describes behavior, not outcomes.
- Detailed navigation, information density, dashboard customization, sensitive
  detail visibility and the first working daily-life capability remain open.

## Proposed next steps

1. Owner approves or revises the action-oriented visual direction.
2. Decide whether to redesign the profile-only home now or first define one
   working capability that gives a daily dashboard useful content.
3. Produce a clearly labeled wireframe with synthetic content, then test
   navigation comprehension, item containment at 320 CSS pixels, keyboard
   focus/reading order, zoom and empty/error states.
4. Implement only after approval; resume guided owner review at the home screen.

Update history: 2026-10-18, initial two-researcher synthesis. No dashboard
implementation or intended-user testing performed.

2026-10-18 implementation update: the owner approved the next step. The home
now has a next-step panel, profile/guidance shortcuts, and visual responsibility
cards marked unavailable. It does not include Today/Coming up lists, working
task controls or fabricated metrics. The recommendations above remain the
research record; intended-user validation of the redesign is outstanding.

Later implementation update, 2026-10-18: the owner approved a separate everyday
task journey. Home now includes working quick capture, editing, completion and
reopening in one Tasks card. Earlier profile-only constraints above describe
the research baseline, not a prohibition on the newly implemented task list.
See the [current task journey](../../USER_JOURNEYS.md#journey-2-get-one-thing-off-my-mind).
