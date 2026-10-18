# First-use walkthrough

## Status and purpose

Design draft, 2026-10-18, with implementation status recorded below. The
walkthrough began as a screen-by-screen proposal for the
[first-use journey](USER_JOURNEYS.md), informed by the
[onboarding research](research/first-use-onboarding/README.md). The application
now implements a bounded local version of that flow; this document retains
proposed design details and decisions not validated by usability testing.

Confirmed: optional, resumable guided setup; a profile covering preferred name,
responsibilities, guidance preferences, country/region and time zone; the four
guidance choices below; and using that profile to tailor support.
Everything else here, including screen order, copy, grouping, defaults and
branching, is proposed for review unless identified below as a bounded local
implementation behavior.

## Local application status

Implemented: welcome and local-storage notice; optional nickname; combinable
guidance preferences; optional multiple responsibilities and own-word entry;
independent region and IANA time zone; one selected difficulty and at most one
relevant follow-up; editable review; a starting-point suggestion; dashboard
handoff; back, skip, explicit remove-and-skip, pause, resume, profile editing,
and confirmed local deletion. Progress and one profile are saved in a
single-user SQLite database on this computer. The setup preferences affect
relevant prompts, overview/context, progress language, and starting-point
presentation.

In the running app, review **Change** actions return to review after a
correction. Changing the selected difficulty may ask one new, relevant optional
follow-up before returning to review. From the dashboard, the guidance shortcut
returns to the dashboard. If another tab has saved newer data or cleared the
profile, a stale save is rejected; an explicit reload adopts the current saved
state and discards unsaved changes in that tab. An older tab cannot recreate a
cleared profile.

The application binds to `127.0.0.1` and has no account, cloud storage,
external service, notifications, or encryption. Its local SQLite file is
readable by anyone with access to this computer or its files. Clearing the
profile removes it from LifePilot but is not a secure erase of storage.
Region-specific localization is not implemented. The workspace clearly
describes future task, reminder, note/document, property, and finance
capabilities as unimplemented; it does not create records or trigger actions.

Controls, wording, sequence, and personalization in the sections below are
design history where they differ from the running interface, not a promise of
additional capabilities. Candidate walkthrough checks remain usability
hypotheses; no intended-user or assistive-technology study has been conducted.

## Flow at a glance

Welcome -> name -> guidance style -> responsibilities -> region/time zone ->
difficulties -> one relevant follow-up -> review -> choose a starting action.

These are nine candidate screen states, not nine required questions. The
follow-up is conditional, every question is optional, and a person can bypass
the profile or leave setup. Test whether the sequence feels too long before
committing to it; do not advertise a completion time without evidence.

Show the current stage using plain labels: "About you", "What would help",
and "Your starting point". If future steps vary, do not imply a fixed total.
Use consistent Back, Continue, Skip this question and Finish setup later
controls where applicable. Do not advance automatically when an option is selected.

## 1. Welcome

**Heading:** "Welcome to LifePilot"

**Text:** "Let's get to know what would help you. We'll start with a few basics,
then help you find a useful starting point. You can skip questions or stop and
come back later."

**Actions:**

- Primary: "Get started".
- Secondary: "Explore without setup".

Explain how profile answers are used and retained before collecting them. The
implemented notice explains local persistence and the unencrypted-file limit.
Language selection and localization are not implemented.

## 2. What should we call you?

**Stage:** About you.

**Heading:** "What would you like us to call you?"

**Field:** "Name or nickname (optional)".

**Help:** "We'll use this when we address you. It doesn't need to be your legal name."

Use a standard text field, without splitting first and last names or asking for
a title. Continue with an empty field has the same result as skipping: no name
is supplied. Use neutral greetings when no name is given.

Offer "Skip the profile" as a clearly labeled route to screen 6; this must not
be confused with skipping only the current question.

## 3. How would you like guidance?

**Stage:** About you.

**Heading:** "What would make guidance easier for you to use?"

**Help:** "Choose any that sound useful, or skip this for now."

Use labeled checkboxes with a short explanation for each:

| Choice | Explanation |
| --- | --- |
| Smaller steps | Break a complex activity into manageable actions. |
| More explanation | Explain unfamiliar terms and why a step matters. |
| Help me choose a starting point | Suggest a next action that I can accept or change. |
| A brief overview first | Show the bigger picture before individual steps. |

Proposed combination rule: show a brief overview first, then manageable
actions, with explanation beside the relevant action. Suggest rather than
execute a starting action. These options are independent; no choice is
preselected. An unselected choice does not mean the user dislikes that support.

Apply presentation preferences to subsequent setup steps where relevant.
If skipped, use clear wording and manageable content without recording an
inferred preference. Later editing should be available, but its location
and persistence behavior need approval.

## 4. What is part of everyday life?

**Stage:** About you.

**Heading:** "Which responsibilities are part of your everyday life?"

**Help:** "This helps us make follow-up questions relevant. Choose any that fit."

The owner refined this screen on 2026-10-18: remove the separate financial-goals
choice and explain what each responsibility includes. Implemented choices:

| Choice | Description |
| --- | --- |
| Work or study | Work tasks, study deadlines, classes, and professional commitments. |
| Home or property | Household tasks, maintenance, repairs, renovations, and property paperwork. |
| Caring for others | Helping children, family members, or others with day-to-day needs and appointments. |
| Personal administration | Forms, applications, renewals, and important correspondence. |
| Money and bills | Bills, budgeting, saving, and keeping track of financial goals you set. |
| Something else | Another responsibility or area of life you would like support with. |

"Something else" offers an optional short text field. Earlier saved
financial-goals selections are represented under "Money and bills" on load and
subsequent saves, with duplicates removed. No amounts are collected, goals
created automatically, or personalized financial advice offered.

Do not ask for employer names, household members, property addresses or financial
amounts. Selecting a responsibility does not mean it is a problem, nor does it
enable sharing, integrations or reminders.

Keep all later difficulty choices available regardless of these answers.
Skipping leaves context unspecified, rather than recording "no responsibilities".

## 5. Location and time

**Stage:** About you.

**Heading:** "Which region and time zone should we use?"

**Text:** "Your region helps us localize relevant guidance. Your time zone helps
us interpret schedules and reminders."

Offer two separately labeled, optional searchable choices:

- "Country or region (optional)".
- "Time zone (optional)", with an understandable location label and offset
  applicable to an example date, not an unexplained abbreviation.

Implemented after owner review: country/region uses a standard dropdown
from a local country/territory code list named by the browser's English locale
data. "Other / enter my own" reveals an optional text field. Existing custom
answers select that option automatically. Users may leave the dropdown empty.
No network lookup or location detection is used. If region naming is
unavailable, the field explains that users can still select the own-word option.
The existing time-zone selector is unchanged.

This grouping is a proposal to reduce screen count, not a requirement to combine
two decisions. Split it if testing finds it harder to understand.
Allow either answer without the other. Do not silently derive one from the
other, request location permission, infer currency or nationality, or activate
notifications. Detection and daylight-saving/travel rules remain open.
Do not ask for an address.

If localization is not supported for a selected region, explain that limitation
instead of presenting generic guidance as region-specific.

## 6. What would help?

**Stage:** What would help.

**Heading:** "What feels difficult to keep on top of?"

**Help:** "Choose one thing to explore first. You don't need to explain everything now."

Candidate single-choice options:

- "Remembering tasks or important dates".
- "Knowing where to start".
- "Finding information when I need it".
- "Keeping track of ongoing responsibilities".
- "Something else", with optional own-word text.
- "I'm not sure yet".

These are everyday difficulties, not diagnoses or a scoring questionnaire.
Examples from selected responsibilities may illustrate an option, but must not
remove options or assume the person has a particular difficulty.
Single selection is a proposal to keep the initial conversation bounded; it
does not imply other problems are unimportant.

"I'm not sure yet" and skipping proceed to review without a probing follow-up.
For "Something else", use the person's description without requiring a
category; offer a general follow-up, not an unconfirmed diagnostic inference.

## 7. One relevant follow-up

**Stage:** What would help.

Ask one question based on the chosen difficulty, with selectable examples and
an optional own-word alternative:

| Difficulty | Candidate question | Example answers |
| --- | --- | --- |
| Remembering things | "What do you most often want help remembering?" | Tasks; appointments; important dates; something else. |
| Knowing where to start | "What tends to make starting difficult?" | Too many options; the task feels too big; the next step is unclear; something else. |
| Finding information | "What information is hardest to find when you need it?" | Documents; notes; dates or details; something else. |
| Ongoing responsibilities | "What is hardest to keep track of?" | What needs doing; progress; deadlines; something else. |
| Something else | "What would make this a little easier?" | Optional own-word answer, without requiring private details. |

Each question remains skippable. Do not continue opening new branches after
this answer during initial setup. No uploads, private records or diagnosis are
needed to complete it.

If an answer cannot be understood or no suitable follow-up exists, show the
original answer for review rather than inventing an interpretation.

## 8. Check our understanding

**Stage:** Your starting point.

**Heading:** "Does this look right?"

Show a short summary of supplied profile answers, selected difficulty and
follow-up answer, with clearly labeled Change actions. Keep profile facts
separate from a proposed interpretation. Do not display skipped answers as facts.

**Synthetic example:** "You'd like an overview followed by smaller steps.
Home responsibilities are part of your everyday life. You'd like help finding
documents when you need them."

No inferred diagnosis, urgency score, or claim that all the user's needs are
understood. If they skipped everything, say "You haven't added any details yet"
and allow them to continue without going back.

Changing an earlier choice must not leave a stale dependent answer in the
summary. Ask the person to review any affected follow-up instead of silently
treating it as still applicable.

## 9. Choose a starting action

**Stage:** Your starting point.

**Heading:** "Where would you like to start?"

Offer one relevant suggestion, with a short explanation connecting it to what
the person said. Example candidates:

| Stated difficulty | Possible next action |
| --- | --- |
| Remembering things | Capture one task or important date. |
| Knowing where to start | Break one activity into a manageable next step. |
| Finding information | Create one note about where a useful document is kept, without uploading it. |
| Ongoing responsibilities | Make a short list for one responsibility. |

These are proposed capability handoffs, not claims that those features exist.
An eventual interface may offer only actions actually implemented.

Offer "Try this", "Choose something else" and "Explore for now". If the user
skipped difficulty discovery or no appropriate suggestion exists, show a neutral
choice of available starting actions without calling them personalized.
Accepting a suggestion opens the relevant workflow; it does not automatically
create reminders, import records, or perform external actions.

## Pause, skip, return and errors

Home implementation update (2026-10-18): the workspace is now a visual
dashboard with a primary resume/profile action, selected responsibility-area
previews, and a guidance shortcut. Areas are marked "Not available yet" and
are not interactive tools. Local-data clearing is under "Manage local data".
This replaces the original neutral-workspace presentation, not the setup flow.
See the [dashboard research](research/home-dashboard/README.md).

- Skip this question proceeds without an answer. If an answer was already
  entered, the application offers **Continue with this answer** or the explicit
  **Remove answer and skip** action.
- Back preserves the current draft for review rather than submitting or deleting
  it. The draft and current stage are saved locally.
- Finish setup later leads to the dashboard, where the user can continue setup
  or review the profile.
- The dashboard's guidance shortcut returns to the dashboard. No notifications
  are used; people should still consider shared-device privacy.
- Cross-session resume is implemented in the local SQLite file on this
  computer. It is account-free and does not sync across devices.
- If a save fails, the interface shows that the change could not be saved and
  provides **Retry save**. It does not show a success message for a failed save.
- Invalid supplied input gets an inline, plain-language explanation associated
  with the field; optional fields must still have a clear remove-and-skip path.

## Walkthrough checks for a future prototype

These are proposed checks, not executed usability tests:

1. A person can identify why each profile question is asked and skip every one.
2. All four guidance options can be combined without contradictory behavior.
3. The person can reach problem discovery without supplying any profile details.
4. Every difficulty branch asks at most one follow-up before review.
5. "I'm not sure yet" and "Something else" have clear, non-blocking routes.
6. Region and time zone can be answered independently; neither enables reminders.
7. Changed answers do not leave a contradictory summary or stale personalization.
8. Pause/resume and simulated save failures do not lose answers silently or
   falsely claim persistence.
9. Keyboard and assistive-technology users can read labels, operate choices,
   reach errors and navigate without relying on color or pointer input.
10. Review with intended users whether nine screen states create unnecessary
    burden; consider grouping simple questions or shortening the route based
    on observations rather than completion-rate assumptions.

## Decisions still needed for later product iterations

- Validate or revise wording, grouping, examples, and single-difficulty
  selection with intended users.
- Decide whether an account or cross-device persistence is ever needed; the
  current application has neither.
- Define localization and future reminder behavior before those features exist.
- Select and implement any real task, document, property, or financial
  capabilities before offering them as functional starting actions.
- Validate comprehension, perceived effort, keyboard/screen-reader behavior,
  and interruption recovery with fictional data before treating this as an
  approved specification.
