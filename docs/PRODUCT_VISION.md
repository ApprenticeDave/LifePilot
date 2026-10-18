# LifePilot product vision

## Purpose

LifePilot is a life assistant and knowledge repository for neurodivergent individuals. It aims to reduce the cognitive load involved in managing everyday life and help people organize, find, and act on information in support of a productive and happy life.

The project grew from the complexity of buying a house and renovating a previous home. The product should help make that kind of ongoing responsibility easier to manage.

## Intended capability areas

### Property and household management

Support the property lifecycle for one or more properties, including finding and purchasing property, organizing related documentation, maintenance and repairs, expenses, renovation checklists, and buying or selling.

### Personal organization and time

Help users keep track of birthdays, appointments, tasks, and other important events; organize todos; and support day-to-day planning and productivity.

### Personal assistant

Explore an assistant that uses advances in large language models and agentic
computing to provide a more human interface to LifePilot, making it easier for
people to express needs and work with its capabilities. Its responsibilities,
interaction modes, and degree of initiative remain to be defined and validated.

### Personal finances

Help users track income, expenses, savings, investments, and budgets.

## Product principles to validate as the product develops

- Reduce cognitive load; make information easy to organize and retrieve.
- Make complex processes manageable through clear, actionable steps and checklists.
- Keep users in control of their information, reminders, and plans.
- Treat personal, property, and financial information as sensitive.

These are product goals derived from the initial project description, not a substitute for validating detailed requirements with the project owner.

## Initial experience: discovery decisions

The first journey implemented in the local test bed is opening LifePilot for the first time.
The project owner has confirmed the following direction during guided discovery:

- Offer guided setup that gets to know the person and the problems they are facing.
- Gather useful personal basics ("vital stats"), then guide the user through
  identifying their difficulties in a clean, easy-to-interact-with experience.
  The initial profile areas are preferred name, broad responsibilities, guidance
  preferences, country or region, and time zone. Each question is skippable.
  Their purpose is to tailor LifePilot's approach and guidance to the person;
  exact controls and personalization rules remain to be defined.
- Offer guidance preferences for smaller steps, more explanation, help choosing
  a starting point, and a brief overview before individual steps. Their intended
  effects are defined in the user journey; detailed interaction rules remain open.
- Make the experience feel supportive and guided, with clear wording that is easy to understand.
- Allow users to skip questions or leave setup and return later.

See the [first-use journey](USER_JOURNEYS.md) and
[walkthrough](FIRST_USE_WALKTHROUGH.md) for confirmed direction, the
implemented subset, preserved design proposals, candidate acceptance criteria,
and open questions. The [onboarding research](research/first-use-onboarding/README.md)
remains research input, not approved requirements.

## Current implementation scope (2026-10-18)

The first local test bed uses Node.js built-ins (`node:http`, `node:sqlite`)
with plain HTML, CSS, and JavaScript. It implements optional guided onboarding,
the five profile areas and four combinable guidance preferences, one relevant
optional follow-up, editable review, a suggested starting point, and a neutral
workspace. A single profile and setup progress persist in a SQLite file in
`.data/` on this computer; users can explicitly clear it in the workspace.

The server binds to IPv4 loopback (`127.0.0.1`) only. There is no account,
sign-in, cloud storage, external service, or encryption. The database is
readable to people with access to this computer and its files. The app explains
this before collecting answers. Clearing removes the saved profile from the app;
it is not a secure erase of the storage device. Country/region is saved as a
preference, but localization is not implemented. Time zone does not activate notifications.

The home dashboard provides one working next step (resume setup or review the
profile), a guidance shortcut, and visual previews of selected responsibility
areas. Previews are explicitly unavailable and have no fake action controls.
Local data management remains available in an expandable section. No daily
activity counts or charts are fabricated.

Task and important-date capture, reminders,
notes and document storage, property workflows, and financial tracking are not
implemented and must not be represented as available features. Broader product
requirements and future workflows still need definition and validation.

This implementation is a first test bed, not a validated product specification.
The walkthrough and user journey preserve outstanding design questions and
candidate acceptance criteria; usability and assistive-technology validation
with intended users has not yet taken place.
