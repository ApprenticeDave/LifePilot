# LifePilot documentation

LifePilot aims to reduce the cognitive load of everyday life through supportive
organization and access to useful information.

## Product discovery

- [Product vision](PRODUCT_VISION.md): purpose, capability areas, and confirmed direction.
- [User journeys](USER_JOURNEYS.md): first-use discovery, proposed flow, and open decisions.
- [First-use walkthrough](FIRST_USE_WALKTHROUGH.md): proposed screen wording,
  profile-to-problem flow, skip paths, and prototype checks.
- [First-use onboarding research](research/first-use-onboarding/README.md):
  evidence and recommendations for personal basics and guided needs discovery.
- [Home dashboard research](research/home-dashboard/README.md): a proposed
  visual everyday home, empty states, and evidence boundaries.

The first local application now implements optional, resumable guided setup,
profile editing, review, and a visual home dashboard with profile/setup actions
and clearly labeled future-area previews. Changes from the review return to the
review after correction; changing the selected difficulty can lead to a new
relevant optional follow-up. The dashboard's guidance shortcut returns to the
dashboard. The walkthrough and user journey preserve earlier discovery
proposals and distinguish them from what actually runs. Broader task, reminder,
documentation, property, and finance capabilities remain unimplemented.

## Setup and use

The app uses Node.js built-ins (`node:http` and `node:sqlite`) and plain
HTML/CSS/JavaScript. No dependency installation or build step is used. Node
22.13+ is required; the first implementation was checked with Node 22.18.0.

- Start from the repository root with `npm start`, then open
  <http://127.0.0.1:4173>. Set `PORT` to use another port.
- Run the automated tests with `npm test` (`node --test`).
- Profile and progress data are stored in `.data/lifepilot.sqlite`. The server
  binds only to `127.0.0.1`; data is local and unencrypted.
- If another tab has saved newer data or cleared the profile, a stale save is
  rejected. Reload LifePilot to adopt the current saved state; an older tab
  cannot recreate a cleared profile. Reloading discards unsaved changes in the
  stale tab.

The implementation uses Node's built-in SQLite API, which Node currently
labels experimental. No npm packages are installed.

See [Copilot project setup](COPILOT_SETUP.md) for the available agents, skills,
and their intended use. Continue product discovery by working through the open
questions in the user journey; distinguish owner-confirmed decisions from
proposals.

## Verification

For documentation changes, check that relative links resolve, confirmed
decisions agree across pages, and discovery proposals are distinguished from
implemented behavior. `npm test` covers model validation, state transitions,
SQLite persistence across reopening, and HTTP protections. It does not replace
keyboard/screen-reader testing or usability validation with intended users;
those have not been conducted.
