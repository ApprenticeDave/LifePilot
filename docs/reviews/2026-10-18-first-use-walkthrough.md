# Manual review: first-use walkthrough

## Code review and remediation: 2026-10-18

Scope: the full current application, tests, documentation and project setup,
not only the dashboard change. There was no initial Git commit; all project
files were untracked. File hashes were recorded in session storage and verified
unchanged between the two read-only review rounds. No user profile was read
for review, cleared, or used in tests.

### Actual teams

- Initial review (4): `review-a-state` (state/contracts), `review-a-browser`
  (browser behavior), `review-a-server` (Node/SQLite), `review-a-evidence`
  (tests/documentation).
- Independent challenge (4): `review-b-state` (concurrency), `review-b-flow`
  (save/navigation failures), `review-b-ui` (accessible interaction),
  `review-b-evidence` (validation/test claims).
- Engineering (4 fresh instances): `fix-c-server` (server and server tests),
  `fix-c-browser` (client and browser regression tests), `fix-c-docs`
  (related documentation), `fix-c-integration` (read-only acceptance checks).
  The coordinator executed the integrated tests and browser checks.

Limitation: the tool rejected follow-up messages to synchronous reviewers.
Their independent reports were collected, but the cross-team confirmation
step could not be completed. Reconciliation below is the coordinator's
evidence-based disposition, not a claim of unanimous team agreement.

### Findings and remediation

| ID | Original provenance | Severity | Disposition, owner and correction | Verification |
| --- | --- | --- | --- | --- |
| CR-001 | A-state-001; B-state-001 | Medium | Accepted; fix-c-server and fix-c-browser. Version-checked saves and clears prevent stale tabs overwriting newer changes or restoring cleared data. Conflicts retain the visible draft and require explicit reload. | Transaction, stale-writer, clear-tombstone, migration and client conflict tests; real two-tab browser check against isolated SQLite. |
| CR-002 | A-browser-001 | Low | Accepted; fix-c-browser. Synchronous transition lock prevents repeated navigation while saving. | Delayed-save regression tests and real browser double-click check. |
| CR-003 | B-ui-001 | Medium | Accepted; fix-c-browser. Summary actions have distinct contextual accessible names. | Name assertions and browser actions located by their new accessible names; screen-reader audit not performed. |
| CR-004 | B-ui-002 | Medium | Accepted; fix-c-browser. Targeted edits return to review, with one relevant new follow-up when difficulty changes. Dashboard guidance edits return home. | Deterministic flow tests and real-browser nickname/difficulty edit checks. |
| CR-005 | B-evidence-001 | Medium | Accepted; fix-c-server. Default HTTP-port host/origin handling is normalized while enforcing loopback and actual bound port. | Host/origin tests, including default-port helpers and rejection of wrong ports. Actual binding on port 80 was not tested. |
| CR-006 | A-evidence-001 | Low | Accepted; fix-c-docs. Root README updated to describe the visual dashboard. Related edit/conflict documentation updated. | Source/content checks and local documentation links. |

No other candidates were reported by the initial or independent teams.
The integration checker suspected that six-digit `localhost:000080` would
pass host validation. This was rejected: the source regex permits at most five
port digits, and the executed regression test rejects that input. No speculative
fix was made. The checker could not execute commands; execution evidence below
is from the coordinator, not that agent.

Changed surfaces:
[server](../../server.js), [browser UI](../../public/app.js),
[page markup](../../public/index.html), [server tests](../../test/server.test.js),
[browser tests](../../test/browser-input.test.js), [root README](../../README.md)
and directly related product/journey/setup documentation.

### Final evidence and limitations

- `npm test`: 30 passed, 0 failed.
- `node --check`: server, browser UI and model passed.
- Real-browser checks with a separate test database: stale tab rejected after
  clear, cleared data not restored, confirmed conflict reload, double-click
  caused a single transition, targeted nickname edit returned directly, and
  changed difficulty completed its new follow-up before review. The dashboard
  guidance shortcut returned home. No page errors were observed in those paths.
- Documentation link check: 66 local links resolved, none broken.
- Existing-database migration was tested with synthetic legacy fixtures. The
  running app requires restart to load the server change; users should refresh
  existing tabs for the versioned API.
- The local app was restarted with the reviewed code and responded HTTP 200 at
  `http://127.0.0.1:4173`, listening only on `127.0.0.1`. The isolated test server
  was stopped and its exact session-owned database files removed.
- Not exhaustive correctness, legal compliance, or accessibility certification.
  Screen-reader testing, production deployment and network exposure remain out
  of scope. Targeted-edit return context is session-only: refreshing mid-edit
  retains saved answers/stage but resumes ordinary setup navigation.

All six accepted issues are fixed and checked; no accepted item is deferred.
Cross-team confirmation remains incomplete for the tooling reason above.
No commit, push, issue creation, or publication was performed.

**Date:** 2026-10-18

**Review status:** partial

## Scope

Owner-led review of the [first-use design](../FIRST_USE_WALKTHROUGH.md) using
a fictional person, Alex. Design feedback only; not a study with intended users.

## Success criteria

Determine whether the welcome explains the value of setup and the option to
leave; later evaluate clarity, effort and control throughout the journey.

## Environment and build

Written screen copy presented in chat. No runnable prototype or application
was used for the initial owner observation. Subsequently, a Node.js local web
application with built-in SQLite and a plain browser UI was implemented with
owner approval. It is served at <http://127.0.0.1:4173> with a local unencrypted
database; no sign-in or external service. Assistive-technology behavior has
not been tested.

## Setup performed

Read the walkthrough and presented the welcome wording and its two actions.
The owner approved this project-local findings report.

## Coverage

- Welcome: owner reported that the wording feels clear. This is a positive
  design observation, not independent verification of comprehension.
- Review medium: finding R-001.
- Functional interface: owner reported poor text alignment, oversized checkboxes,
  and difficulty reading the interface; finding R-003.
- Guidance preferences: after being asked to select overview-first and smaller
  steps and assess their descriptions and visible effects, the owner reported
  that it looked good. Positive owner feedback; no independent observation of
  their exact selections or screen state.
- Responsibilities: owner reported the question is very clear but the list is
  missing financial goals; finding R-004.
- Implementation verification, not owner acceptance: nine Node tests passed.
  Isolated browser checks using synthetic data verified typing, combined guidance
  choices, a difficulty follow-up, review, reload persistence, workspace entry,
  confirmed profile clearing, and pause/reload/resume.
- At a 390-pixel viewport, the tested review screen had no horizontal overflow.
  Skipping all profile questions and selecting "I'm not sure yet" reached review
  without a follow-up. These checks do not establish usability for intended users.

## Not covered

Owner review of all subsequent screens, comprehensive branching and error
testing, screen-reader behavior and intended-user usability validation.

## Findings

### R-001: functional interaction preferred over written-only review

- Category: review-method preference.
- Affected component: review of the entire first-use journey.
- Reproduction/context: present the welcome screen wording and button labels
  in chat, then ask for feedback.
- Expected: assess whether the first screen is clear and supportive.
- Reported result: the owner found it clear but preferred testing something
  functional.
- Impact: written-only review does not meet the owner's preferred level of
  interaction; it cannot establish actual navigation or usability.
- Evidence: owner feedback during this review; no independent usability evidence.
- Priority: not assigned.
- Resolution: owner selected an actual local web application, a local-server
  database, and Node.js with built-in SQLite and a plain browser interface.

### R-002: typing could re-enter rendering and block navigation

- Category: implementation defect, corrected.
- Affected component: profile text inputs.
- Reproduction: type a synthetic nickname character by character, then Continue.
- Expected: text remains editable and Continue advances to guidance preferences.
- Direct observation: the browser raised DOM replacement errors and stayed on
  the name screen. Rendering replaced the focused field on each input while
  also listening to change, allowing a blur/change event to re-enter rendering.
- Correction: delegate input handling once; retain the text field DOM while
  typing; rerender only choice changes that affect visible controls.
- Verification: a regression test confirms typing does not replace the field.
  Subsequent browser checks reached review and workspace without page errors.
- Priority: not assigned; fixed as part of initial implementation.

### R-003: oversized choice controls disrupt text alignment and readability

- Category: confirmed layout defect, corrected; owner reported improvement.
- Affected components: checkbox and radio choice rows within fieldsets.
- Owner observation: text is poorly aligned, checkboxes are too large, and the
  interface is unattractive and difficult to read.
- Reproduction: open guidance preferences using an isolated browser context with
  synthetic responses; inspect a checkbox row at a 1280-pixel viewport.
- Expected: compact controls aligned beside readable labels inside each row.
- Direct observation: the first checkbox occupied 540 by 48 pixels in a
  574-pixel-wide row, pushing its text beyond the row. The text-field selector
  also matches checkbox and radio inputs and overrides their sizing.
- Impact: narrow, displaced labels and excessive row height impair readability.
  The absence of page-level horizontal overflow did not catch this defect.
- Correction: scoped text-input styles to exclude checkboxes/radio buttons,
  reset native fieldset borders and padding, aligned compact controls with text,
  and adjusted spacing and explanatory-text weight.
- Approval state: owner approved the focused correction; implemented in
  [interface styles](../../public/styles.css).
- Verification: browser checks at widths 320, 390 and 1280 pixels confirmed
  19-by-19-pixel controls and contained labels for both checkbox and radio
  screens. Clicking the label still selected the option in all six cases.
  A synthetic-data screenshot was visually inspected. These checks do not
  replace the owner's judgment of readability.
- Owner recheck: after the correction, the owner reported that the interface
  was much better. No additional layout concern was raised in that response;
  this is not acceptance of all screens or an accessibility certification.

## Proposed follow-ups

- R-001: actual application implemented under the owner's approved local
  stack and storage direction. See [setup and verification](../README.md).
- R-002: fixed in the browser UI and covered by an input regression test.
- R-003: approved correction applied and owner recheck was positive.
- R-004: propose adding "Financial goals" as a separate optional context choice,
  preserving "Money and bills". Owner approved the separate choice; UI,
  validation, persistence-test fixture and journey documentation updated.
- Resume interactive owner review in the functional app; design changes based
  on further findings still require approval.

### R-004: responsibilities list does not cover financial goals explicitly

- Category: owner-requested content addition, not a runtime defect.
- Affected component: responsibilities choices.
- Context: owner reviewed the responsibilities question and optional own-word
  path and found it clear, but identified financial goals as missing.
- Expected by owner: financial goals should be represented in the list.
- Current behavior: "Money and bills" exists, but financial goals are not explicit.
- Impact: people may not recognize longer-term financial organization as covered.
- Proposal: add "Financial goals" separately, used only as context for relevant
  examples. Do not collect balances, recommend financial products, infer a
  problem, or create goals automatically.
- Evidence: owner feedback; no independent intended-user study.
- Approval state: owner approved the separate "Financial goals" choice.
  Implemented as optional context in the choice list, relevant examples and
  review summary, with validation support and regression coverage.
- Verification: all ten Node tests passed, including independent selection and
  persistence with the new responsibility. An isolated browser check verified
  that selecting Financial goals does not select Money and bills, that its
  contextual example appears, and that the review summary uses the correct label.
  The local server was restarted and returned HTTP 200. User data was not reset.
- Subsequent owner revision: remove the separate financial-goals line and add
  descriptors explaining every responsibility. Implemented six described
  choices, with saving and user-directed financial goals covered by "Money and
  bills". Earlier financial-goals selections normalize to that choice, without
  duplicates. This supersedes the separate-choice decision above.
- Revision verification: all ten tests passed, including normalization and
  persistence of earlier selections; the restarted app serves all six
  descriptors without the separate option.
- Owner visual recheck: the owner reported that it looks good and is happy
  with the outcome. The responsibilities descriptions and removal of the
  separate financial-goals choice are accepted for this review.

## Decisions and next action

### R-006: explore a visual everyday home dashboard

- Category: owner design-direction question, not a confirmed defect.
- Context: while reviewing the starting-point handoff, the owner said the page
  looks good but proposed a more visual dashboard for the first page.
- Clarification: the owner selected the home after setup, not the first-ever
  welcome screen.
- Approved action: research only. See the
  [dashboard evidence and proposed layout](../research/home-dashboard/README.md).
- State: research completed; dashboard design and implementation are not
  approved. Guided review is paused at this decision. Relevance and limitations
  of the starting suggestion were not explicitly confirmed by the response.
- Subsequent decision: owner approved implementing the recommended next step.
  A visual home now offers profile/setup actions, a guidance shortcut and
  responsibility-area previews marked "Not available yet". Owner review pending.
- Implementation verification: twelve automated tests passed. Isolated browser
  checks at 320, 390 and 1280 pixels verified contained card text, no horizontal
  page overflow, a single primary action and the guidance shortcut. Pause/resume
  worked, with no page errors in the tested paths. A desktop screenshot was
  visually inspected. Tests used mocked synthetic profile responses; the owner's
  database was not modified. Screen-reader testing remains outstanding.
- Owner visual recheck: reported that the home dashboard looks much better.
  Recorded as positive feedback on the visual redesign, not acceptance of
  unimplemented tools or completion of all functional/accessibility checks.

### R-005: country or region lacks predictive suggestions

- Category: owner-reported usability concern.
- Affected component: country or region input on the location screen.
- Owner observation: a plain text input feels odd; predictive responses are
  expected. The time-zone selector was reported good.
- Current behavior: country or region accepts free text without suggestions.
- Proposed correction: offer locally supplied country/region suggestions while
  typing, keeping the question optional and preserving existing saved text.
  Do not use a third-party lookup service or infer location.
- Approval state: owner approved suggestions with free-text answers allowed.
- Implemented: native browser suggestions from local country/territory codes,
  with English names supplied by browser locale data. No external lookup,
  location inference, or restriction to listed answers. Existing text is retained.
  The time-zone selector is unchanged.
- Verification: all eleven Node tests passed, including suggestion markup,
  representative names, escaped saved text, own-word saving, empty answers,
  and no lookup requests. Updated JavaScript passes syntax checking and is
  served by the running app. Actual suggestion-popup usability awaits owner
  review; matching and popup behavior vary between browsers.
- Subsequent owner revision: replace predictive suggestions with a standard
  dropdown and "Other / enter my own". Approved and implemented; this
  supersedes the native-suggestions interaction above. Existing custom text
  selects Other and remains editable. The field remains optional.
- Revision verification: eleven Node tests passed. An isolated browser check
  confirmed preservation of existing custom text, selecting a listed country,
  revealing the own-word field, saving a custom answer, and leaving the time
  zone unchanged.
- Owner recheck: reported that the dropdown works and is much better.
  The revised country/region interaction is accepted for this review.

## Location-screen follow-up

Guided problem-identification screen: the owner reported that the difficulty
choices and wording look good after being asked to review the list before
selection. Positive feedback on this screen only; the conditional follow-up
and its navigation have not yet been owner-reviewed.

On the next requested check (selecting information-finding and reviewing its
follow-up), the owner reported that it looks good and is a good summary.
The response does not establish whether they stopped at the follow-up or
continued to the review summary; confirm the visible heading before proceeding.
The owner then confirmed the visible screen was "Does this look right?".
Their positive summary feedback applies to the review screen. The follow-up's
individual wording was not separately confirmed.

Summary correction path: asked to change the nickname to fictional "Alex",
continue back to review, and check preservation of other answers, the owner
reported "Works". Recorded as a successful owner-reported correction path;
no additional claim about route length or independently inspected values.

The owner approved saving findings at this path and building the local app.
The corrected choice layout and guidance-preference check received positive
owner feedback. The responsibilities question was reported clear and the
revised responsibility descriptions and removal of the separate financial-goals
choice received owner acceptance. The time-zone selector received positive
feedback; the country/region dropdown and own-word option received positive
owner recheck. Guided problem-identification choices received positive feedback.
The owner confirmed the review summary and gave positive feedback. Next,
the summary correction path was reported working. Next, review the starting-point
handoff.
The earlier copy review is not acceptance of the
implemented welcome. Do not treat the remaining journey as passed.

The guide's named structural validator was not found in its skill directory.
The report was checked against the supplied template fields instead; no
automated structural-validator pass is claimed.
