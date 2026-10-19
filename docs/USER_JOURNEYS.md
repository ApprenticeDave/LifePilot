# LifePilot user journeys

## Status and purpose

Initial discovery record, begun on 2026-10-17, with current implementation
status recorded below. This document develops the
[product vision](PRODUCT_VISION.md) through guided discussion with the project
owner. It records product decisions, not personal disclosures or an interview
transcript. Proposed behavior and example copy are not approved requirements.

## First local implementation status (2026-10-18)

The first application implements the bounded first-use flow: optional and
resumable profile setup, the selected profile areas and combinable guidance
preferences, single difficulty choice with at most one relevant follow-up,
editable review, a starting suggestion, and a visual home dashboard with setup
and profile actions plus clearly unavailable future-area previews. One profile
and setup progress persist in a local SQLite database. Users can resume, edit,
or explicitly clear that data. Review edits return to review after correction;
changing difficulty may ask one new, relevant optional follow-up. The
dashboard's guidance shortcut returns to the dashboard. The Tasks card now
supports capture, editing, completion and reopening without setup.

If another tab has saved newer data or cleared the profile, a stale save is
rejected. Reload adopts the current saved state and discards unsaved changes in
that tab; an older tab cannot recreate a cleared profile.

The workspace does not implement dates, reminders, notes or document storage,
property management, or financial tracking. Country/region localization,
accounts, cloud sync, notifications, and encryption are also absent. The local
file can be read by someone with access to this computer or its files. See the
[walkthrough](FIRST_USE_WALKTHROUGH.md) for the implementation boundary and
privacy notice.

The following discovery notes distinguish the product owner's earlier
confirmed direction from proposed interactions and remaining product
decisions. The implementation makes limited, explicit test-bed choices; it
does not turn every proposal or acceptance hypothesis into a validated
specification. Usability and accessibility research remains outstanding.

The discovery team consists of a facilitator, a product-planning specialist,
and a usability/privacy specialist. Their suggestions inform the discussion;
the project owner determines the product direction.

## Journey 1: opening LifePilot for the first time

The [screen-by-screen walkthrough](FIRST_USE_WALKTHROUGH.md) develops this
journey into proposed wording, navigation and branches. It includes the
confirmed profile areas and guidance choices, but its new interaction details
remain proposals for review.

### User goal

Proposed: understand how LifePilot can support the problems the person is facing
and find a manageable starting point, without needing to configure everything.
This goal still needs confirmation.

### Confirmed direction

- Start discovery with first launch: what users see and which options they have.
- Offer guided setup.
- Get to know the person and the problems they are facing.
- Gather useful personal basics ("vital stats") first, then guide the person
  through identifying their problems in a clean, easy-to-interact-with way.
  The owner requested research before deciding the fields and response format.
- Help the user feel supported and guided through clear, easy-to-understand wording.
- Make setup optional and resumable: users may skip questions, leave, and return later.

The initial profile areas are defined below. At the time of discovery these
decisions did not establish storage or account behavior; the current local
implementation stores one profile without an account, as described above.

### Your basics: initial profile definition

On 2026-10-18, the owner selected five initial profile areas. Their shared
purpose is to build a profile that LifePilot uses to tailor its approaches and
guidance to the person. These questions are skippable, consistent with the
agreed optional setup. Selecting an area does not approve specific controls,
default answers, storage behavior, or personalization rules.

| Confirmed profile area | Purpose | Proposed question and interaction |
| --- | --- | --- |
| Preferred name or nickname | Address the person as they choose. | "What would you like us to call you?" Optional text field; no legal name required. |
| Broad responsibilities | Tailor follow-up questions to relevant parts of everyday life. | "Which responsibilities are part of your everyday life?" Select any relevant examples, with an own-word alternative. Do not request other people's identities. |
| Guidance preferences | Tailor the way LifePilot presents steps and explanations. | "What would make guidance easier for you to use?" Offer the four owner-selected choices defined below; exact control and wording remain proposals. |
| Country or region | Localize relevant guidance. | "Which country or region should we use when guidance depends on location?" Explain that this is not a request for an address. Scope of localized guidance remains undecided. |
| Time zone | Interpret schedules and reminders in the intended time zone. | "Which time zone should we use for schedules and reminders?" Use a clearly labeled choice; detection and travel behavior are undecided. |

The field selection and purposes are confirmed. The wording and interactions
in the last column are proposals for discussion, not approved screen copy.
Country or region must not silently determine time zone, nationality, language,
or currency. Supplying a time zone does not enroll the user in reminders.

During functional review on 2026-10-18, the owner initially approved a separate
"Financial goals" responsibility, then replaced it with descriptions explaining
each existing choice. "Money and bills" now explicitly covers budgeting, saving
and user-directed financial goals. Earlier selections are retained under that
broader choice rather than discarded. No financial figures are collected or
goals created, and no personalized financial advice is implied.

#### Confirmed guidance choices

The owner selected these four choices for initial setup on 2026-10-18:

| Choice | Intended effect |
| --- | --- |
| Smaller steps | Break a complex activity into manageable actions. |
| More explanation | Explain unfamiliar terms and why a step matters. |
| Help me choose a starting point | Suggest a next action the user can accept or change. |
| A brief overview first | Show the bigger picture before individual steps. |

These are support preferences, not diagnoses or permission to act for the user.
The proposed question is "What would make guidance easier for you to use?"
The proposed interaction permits several choices, because these forms of
support can complement each other; exact selection behavior remains to be
confirmed. For example, an overview could precede smaller steps, with extra
explanation alongside them. The presentation of combined preferences, behavior
when no preference is supplied, later editing, and per-task overrides still
need definition. No choice is a promise of implemented functionality.

#### Proposed presentation

- Heading: "Let's get to know you".
- Introduction: "We'll ask a few questions to help make LifePilot useful for you.
  You can skip any question."
- Use short steps rather than assume all five areas belong on one screen.
  Grouping, order, progress indication, and navigation remain to be agreed.
- Explain the specific use alongside each question. Do not imply that every
  answer changes every feature or promise tailoring that is not supported.
- Keep unanswered areas unspecified; do not interpret skipped questions as
  "no responsibilities" or a preference for a particular style.
- Before collecting retained answers, define how users can review, change or
  remove them, and what leaving and resuming setup retains.

#### Candidate acceptance criteria for the profile

These criteria are proposed, not implemented or validated:

1. Each of the five selected areas is available during initial setup, and every
   question can be skipped without blocking the next stage.
2. Each question explains its purpose in plain language.
3. A user can provide a nickname without supplying a legal name or diagnosis.
4. Responsibilities support more than one answer and an alternative to the
   supplied examples, if this proposed interaction is adopted.
5. Before a guidance preference is offered, its visible effect is defined.
6. A missing profile answer does not prevent guided problem identification;
   the application does not infer a sensitive trait from it.

No full birth date, age range, legal identity, street address, diagnosis or
financial records were selected for this initial profile. Language settings
were recommended earlier but their behavior and placement have not been agreed.

### Proposed flow for discussion

| Moment | Proposed experience | Decision still needed |
| --- | --- | --- |
| Arrival | Brief welcome explaining that LifePilot will guide the user through getting started. | Exact wording and what users need to understand before answering. |
| Personal basics | Offer the five optional profile areas defined above before exploring difficulties. | Exact wording, controls, order, and how answers affect guidance. |
| Identifying difficulties | Guide the person through describing what is hard, rather than assume that they can name all their needs unaided. | Examples, suggested choices, free-text options, and relevant follow-ups. |
| Building understanding | Ask a relevant follow-up based on the answer, without presenting a long questionnaire. | Depth, pacing, and how much tailoring is appropriate. |
| Checking understanding | Offer a short summary the user can correct before it shapes their experience. | Whether this step is helpful and what can be edited. |
| Finding a starting point | Offer a manageable next action connected to the stated problem. | How suggestions are chosen and whether users prefer to choose their own. |
| Pausing or skipping | Let the user leave setup and return later, as confirmed. | Where they land, what progress is retained, and how they resume. |

Except for the confirmed direction above, this sequence is a proposal. It does
not establish a final screen count, navigation model, or assistant capability.

### Earlier example wording, pending research discussion

The problem-first prompt below predates the owner's clarification that personal
basics should come first. It is a possible later prompt, not the approved opening.

- Welcome: "Welcome to LifePilot. We'll help you get started, one step at a time."
- Possible first prompt: "What feels difficult to keep on top of at the moment?"
- Possible supporting text: "Share only what you're comfortable with. You can skip this and come back later."
- Possible controls: "Continue", "Skip this question", and "Finish setup later".

Validate tone, comprehension, and response options with the owner and intended
users. Do not assume that one conversational style suits all neurodivergent people.

### Candidate acceptance criteria

These are hypotheses for later approval and testing, not verified outcomes:

1. On first opening, a user can explain what setup is for and identify how to
   proceed or leave without facilitator explanation.
2. A user can describe a problem without first choosing a product area; the
   precise input format remains undecided.
3. A user can skip a question or leave setup without being forced to answer it.
4. A user returning after an interruption can recognize the setup stopping point
   and choose whether to continue.
5. If a summary is adopted, a user can correct the application's interpretation
   before it is used to tailor suggestions.

Testing should use fictional situations and evaluate understanding and control,
not merely speed or setup completion rate. No interface or tests exist yet.

### Privacy and accessibility considerations

Proposals to refine before implementation:

- Ask only for context needed to support the user's chosen goal. Do not require
  diagnoses, identity documents, addresses, or financial records merely to
  explain a difficulty.
- Explain whether answers are retained, where they are used, and how users can
  change or remove them. Storage, retention, and deletion behavior are undecided.
- Distinguish leaving setup from deleting answers; resolve what resumability
  retains and give users meaningful control.
- Avoid unrequested reminder enrollment or importing information during setup.
  Reminder behavior and integrations are not yet defined.
- Use clear language, readable structure, and accessible controls. Validate
  keyboard and assistive-technology behavior when an interface exists.
- Avoid guilt, pressure, or assumptions about a person's energy, abilities, or
  preferred organizational style.

### Open decisions, in discovery order

1. Agree the profile's wording, controls and short-step sequence. The five
   initial profile areas and four guidance choices are now selected; combined
   preference behavior, defaults and later editing remain open.
2. How should guided problem identification combine suggested choices,
   relevant follow-ups, and the person's own words?
3. How should follow-ups adapt without making setup feel unbounded?
4. What would a useful end-of-setup outcome look like?
5. What should a user see after skipping setup, and how do they resume it?
6. Which answers are retained, with what explanation and editing/deletion controls?
7. Is sign-in needed, and if so, where does it belong in the journey?

## Journey 2: get one thing off my mind

### Goal and confirmed scope

On 2026-10-18 the owner approved a small everyday task journey, with quick
capture in one Tasks card on Home rather than inside responsibility cards.
The goal is to put something down, trust it is saved, and return to act on it.
No required dates or categories; no reminders, calendars, recurring tasks,
AI-generated plans or financial tracking.

### Implemented workflow

1. Open Home, including through **Explore without setup**.
2. Enter a task, such as the synthetic example "Arrange a boiler service",
   and select **Add task** or press Enter.
3. See the newest saved tasks under **To do**; Home previews up to two open
   tasks and offers **Show all** when there are more.
4. Expand **Show all** to reach older open tasks without removing them from
   the list.
5. Use **Edit** to change its text and **Save changes** to persist it.
   **Cancel edit** leaves the saved task unchanged.
6. Use **Mark done** to move it into an expandable **Completed** section.
   Use **Reopen** there to bring it back to To do.

On wider screens, the Tasks card is narrower than the main dashboard and the
capture field and button sit on one row. On small screens the card fills the
available width and capture controls stack. This layout is a product-owner
preference and remains subject to visual review.

Task titles are limited to 240 characters and cannot be blank. Drafts are
not autosaved; input remains visible after a failed save for explicit retry.
Save conflicts do not overwrite newer local data. Reload requires confirmation
that unsaved drafts will be discarded. Tasks and profile changes share a
revision so that an old tab cannot restore data after a clear.

### Control, privacy and acceptance checks

- Tasks work without completing the profile and survive reloads and restarts.
- Task changes do not alter the profile or setup resume point.
- Text is displayed as text, not interpreted as markup.
- Completed tasks remain stored and can be reopened. Individual deletion is
  not included; **Clear my local data** removes all tasks, profile and setup
  together, with explicit confirmation. This is not secure device erasure.
- Only an identifier, title and completion status are stored for each task.
  They stay in the existing unencrypted local database; nothing is sent to an
  external service. No inferred priorities, deadlines or reminders.
- Capture supports keyboard submission, controls have contextual accessible
  names, and narrow-screen layouts must contain long task text.

These are bounded implementation choices, not proof of usability for every
user. Intended-user and screen-reader validation remain outstanding.

## Scope boundary

This discovery does not select technology, specify authentication or storage,
approve integrations, or define detailed property, daily-planning, and finance
workflows. The task journey above is a separate, owner-approved increment;
broader journeys should follow discovery rather than be
invented from capability lists.
