# Task prioritisation: keep it explicit, lightweight and user-controlled

## Brief and status

2026-10-18. Complete for a bounded product decision on how LifePilot should help users decide what matters most on a task list, without over-automating or guessing.

Questions:
- Which prioritisation methods are widely used and easy to explain?
- Which approach matches LifePilot's calm, low-cognitive-load style?
- How should the app support task decisions without making hidden assumptions from task text alone?

Excluded:
- No implementation of automatic scoring or AI prioritisation.
- No new reminders, dates or scheduling model in this research.
- No clinical or executive-function claims beyond general UX guidance.

## Team and evidence coverage

This research used a two-part evidence review:
- `task-prioritisation-patterns`: established task-priority frameworks and practical guidance.
- `task-prioritisation-cognitive-load`: usable, low-friction behaviour for user decision-making.

The coordinator checked the sources below and retained brief notes. This is a citation-and-notes pack rather than a full downloaded archive.

## Executive recommendation

LifePilot should support an explicit, optional priority choice rather than infer a score from task wording.

Recommended product behavior:
- Let the user mark a task as "Important" or keep it unlabelled.
- Keep the task list compact and readable; show flagged tasks first when relevant.
- Treat urgency and due dates as separate concepts; do not infer them from incomplete text.
- Keep all priority controls reversible and optional so the user remains in charge.

This recommendation is consistent with:
- the common urgency-versus-importance framing,
- GTD's emphasis on next actions and clear decisions,
- and accessibility guidance encouraging simple, familiar choices over complex scoring.

## Findings

| ID | Classification and finding | Evidence | Confidence and limitations |
| --- | --- | --- | --- |
| F-01 | Priority frameworks often distinguish urgency from importance; the Eisenhower matrix is still a common reference. | S-001 | High for the continued popularity of the model; not proof of universal superiority. |
| F-02 | GTD emphasises clarifying the task and deciding the next action before trying to rank it. | S-002 | High for the GTD framing; not a comparative trial against other methods. |
| F-03 | Cognitive-accessibility guidance recommends simple, familiar controls and clear purpose over dense, complex decision structures. | S-003 | High for UI guidance; not an empirical productivity outcome study. |
| F-04 | A manual, user-controlled "important" flag is lower friction than hidden or inferred ranking. | S-001, S-003 | Medium. Good product fit, but not a proven superiority claim. |

## Why this fits LifePilot

1. The project goal is reducing cognitive load, not turning task tracking into a scorekeeping exercise.
2. Task titles are often ambiguous. A task can be important but not urgent, or urgent but not important.
3. A small number of explicit choices is easier to learn than a hidden algorithm or a complicated matrix.
4. The current task slice is intentionally compact; it should not add requiring fields or hidden prioritisation logic.

## Suggested future product wording

Not a final design specification, but a useful direction:
- "Would you like this task to stand out?"
- Options: "Important", "No priority label"
- Optional future addition: "Due soon" or a date field only when that capability is added intentionally.

Do not automatically label a task as "important" or "urgent" based only on its text. Keep priority choices explicit, easy to revise, and clearly user-owned.

## Source register

See [sources.md](sources.md) for the full source register and evidence notes.

## Disagreements, limits and open questions

- The sources support a general design principle, not a specific task-scoring formula.
- LifePilot's future behaviour should be validated with real users before introducing labels like "important", "urgent", or due dates in the UI.
- A later date or reminder feature may need a separate, more explicit design because time pressure is not equivalent to importance.
- This research recommends a simple user-controlled flag as the best first slice, not a final statement that the problem is solved.
