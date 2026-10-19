# Task capture walkthrough

Date: 2026-10-18
Status: partial

## Scope and success criteria

Review the local Home task journey: find capture, add a task, find it again,
edit, complete and reopen it. Capture should feel lightweight and leave room
for the rest of the dashboard.

## Environment and setup

- Local app: http://127.0.0.1:4173.
- Build: uncommitted task implementation following baseline commit 4241449.
- The local server was started with `npm start`; availability check returned HTTP 200.
- The served task script and stylesheet contained the compact-list and
  narrower-card changes. Browser and viewport details are unknown.
- The owner confirmed seeing the new Tasks area.
- No existing user data was read or reset. One synthetic task was added, edited,
  marked done, and reopened; it remains saved as an open task.

## Coverage

| Item | Outcome | Evidence |
| --- | --- | --- |
| Find Tasks on Home | Finding: owner reported the original card remained full-width after the compact-list change. A narrower, shorter layout was then implemented, but not visually confirmed; broader dashboard optimization deferred. | Owner report; served assets checked directly |
| Capture a task | Passed | Owner report: synthetic task appeared in the list |
| Find a saved task | Passed | Owner located the saved synthetic task for editing |
| Edit a task | Passed | Owner report: edited title saved |
| Complete and reopen | Passed | Owner report: task moved to Completed and returned to To do |

## Findings

### T-001: Tasks card occupies too much dashboard space

- Category: usability / layout preference.
- Component: Home Tasks card.
- Reproduction: open Home and view the new Tasks area.
- Expected: compact task capture that leaves space for other dashboard content.
- Actual: the owner reports that the area takes up too much dashboard space.
- Impact: the task feature visually dominates more of Home than the owner wants.
- Evidence: owner feedback during the walkthrough; not an independently
  measured layout defect.
- Resolution: the owner selected quick capture plus a two-task preview, with
  older open tasks behind **Show all**, and then requested both a narrower
  desktop card and reduced height. The card is now narrower with inline capture
  on wider screens, uses less internal spacing, and returns to full width with
  stacked capture controls on small screens. Completed tasks remain in their
  existing expandable section.
- Follow-up decision: the owner asked not to continue adjusting width in this
  walkthrough; broader dashboard optimization can happen later. The final
  narrower layout has not been visually approved or rejected.
- Verification: automated task-rendering test covers the preview, expansion,
  and editing a task in the expanded list. Automated tests do not verify
  rendered layout; owner visual retesting and intended-user validation remain
  outstanding.

## Proposed follow-up and decisions

- T-001: narrower, shorter layout implemented; further dashboard optimization
  deferred. Revisit visual layout during that work; no current approval of the
  rendered width was recorded.
- Report location approved by the owner.
- No plan updates, issues, commits or publication authorized by this review.
- The synthetic task remains open in local data because individual task
  deletion is not available; clearing all data would also remove the profile
  and setup, and was not requested.
- Next: address broader dashboard layout in a future iteration, then validate
  the result visually with the owner.
