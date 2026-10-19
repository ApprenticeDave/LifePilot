# Conversational models and delegated tasks

## Brief and status

Research date: 2026-10-18. Status: **complete for an initial, evidence-backed
technology orientation, expanded local/hybrid shortlist, and synthetic local
smoke test**, not a controlled model bake-off or approved product
specification.

Question: which local models are worth trying for a personable, friendly
assistant that guides the user, and how could it hand off bounded work to a
different model when useful?

Scope: models available via the existing Ollama direction and hosted API
alternatives; conversational behavior, tool calling, local/cloud delegation,
privacy and cost trade-offs, orchestration options, and a beginner-friendly
learning sequence. The user has decided to keep Ollama and has asked not to
limit evaluation to currently installed models, including consideration of
hybrid approaches. A later read-only check found Ollama 0.40.6 with
`qwen2.5:3b` and `qwen2.5vl:3b` installed. After owner approval,
`qwen3.5:9b` and `gemma4:e4b` were downloaded and evaluated locally;
see the follow-ups below. Gemma currently leads on measured warm latency,
but neither model is validated for unattended task writes.

Machine context from the previous research: Windows 11 Pro; 6 CPU cores / 12
threads; about 110 GiB visible RAM; A10 vGPU reported as 8 GiB by
`nvidia-smi`, while WMI reported 4 GiB. The discrepancy remains unresolved.
Performance, fit, conversational quality, and response latency still require
further local testing; the initial synthetic smoke test is recorded below.

The product vision explores a personal assistant but leaves its responsibilities,
interaction modes, and degree of initiative open. This is research input, not a
decision to implement an agent or to store conversations.

**Owner clarification (2026-10-18):** the assistant should be able to execute
tasks and update the data store with items discussed with the user. This
confirms the goal is an action-capable assistant, not chat-only. The initial
record scope and save behavior are recorded in the follow-up decision below;
capture criteria and feedback behavior remain to be specified.

**Follow-up decision (2026-10-18):** start with **tasks only**. The assistant
should **automatically save relevant task items discussed in conversation**,
rather than requiring approval for every save. What counts as a task-worthy
mention, how saved changes are surfaced, and how a user can review or undo them
remain to be specified. This is an owner-confirmed direction, not an
implemented behavior.

**Workflow example (2026-10-18):** during conversation, the user says, "I need
to go pick up tinned tomatoes for dinner tonight." The assistant should add a
task to Home, set its deadline to tonight, and set a reminder. This implies
task records need deadline and reminder fields, and the application needs a
way to interpret relative dates and deliver reminders. What counts as a
task-worthy mention, how vague times such as "tonight" resolve, and how saves
are reviewed or undone remain to be specified. The owner also wants the agent
to recommend a reminder time based on the activity. The recommendation should
be made visible and easy to change; the exact user-control behavior remains to
be agreed. These are owner-confirmed product directions, not implemented
behavior.

**Research scope update (2026-10-18):** the user wants the model choice based
on best results, not only already-installed models, and explicitly includes
hybrid approaches. Cloud providers are therefore compared as research options.
This is not authorization to send personal data to an API, create provider
accounts, incur charges, or change the application.

## Team and coverage

Two independent research tasks completed:

- `52f3f129-0b3d-45fe-949b-40ebd31920be` — Ollama conversational-model
  candidates, dialogue/tool support, hardware considerations, and limits of
  "personableness" evidence.
- `b118a526-dbe6-4a5c-bae3-2c3cb38a1d04` — distinction between tool calls and
  model delegation; Ollama, Node-compatible orchestration, and approval
  boundaries.

For the expanded hybrid scope, two further research tasks compared hosted
model options/provider terms and local-cloud routing patterns. Their useful
claims were cross-checked against the official provider pages registered in
the source list; vendor claims and unverified benchmark/region claims were
not treated as independent evidence.

The coordinator opened the cited Ollama, Hugging Face, LangChain, and Microsoft
documentation pages listed in the [source register](sources.md). Several
concurrency and framework details were also opened by the delegation
researcher, as identified in that register.

## Short answer

For **local-only** use on this machine, the streamed comparison now favors
**Gemma4:e4b for the next interactive prototype**, with **Qwen3.5:9b** retained
as a comparison. Gemma produced warm task proposals in about 1.6-2.0 seconds
versus Qwen's 7.4-8.4 seconds in these small tests. This is not a blanket
quality recommendation: Gemma initially captured an undecided hypothetical,
and both models needed clearer instructions. See the streaming section for
methods, follow-up results, cold-start variation, and limitations.

Both models run on Ollama 0.40.6. Each installed package is listed at about
6.6 GB; neither stored size nor Gemma's "effective 4B" name proves a smaller
runtime memory footprint. Friendly tone, useful reminders, and reliable
multi-turn action behavior still require evaluation before actual task writes.

If the user prioritizes the **strongest conversational experience over
keeping all conversation local**, include cloud-hosted candidates in a
controlled bake-off. Current provider documentation positions **Claude Sonnet
5.5** as a speed/intelligence balance, **OpenAI GPT-6.1 Sol** as a balanced
reasoning model, and **Gemini API models** as another comparison point. These
are vendor characterizations, not independent evidence that one is the
friendliest. Start with at least one mid-tier model from two providers and
compare actual conversations. Use current model IDs and prices from the
provider pages at test time.

Because the user already has Ollama, **Ollama Cloud** is another low-friction
hybrid candidate: its cloud models can be reached through Ollama's API, and
sign-in is required for cloud compute. Prompts still leave the machine and go
to Ollama. Its published policy says cloud prompts/responses are processed
transiently and are not used for model training. Verify current availability,
pricing, and policy before live use. This makes it convenient to compare, not
automatically the best model for friendly conversation.

As a current price snapshot, **OpenAI GPT-6.1 Sol and Claude Sonnet 5.5 both
list USD $2 per million short-context input tokens and $10 per million output
tokens** on their official pricing pages. Actual usage depends on the amount
of conversation history, generated output, cached/long-context pricing, and
other features. This is not a monthly-cost estimate; confirm pricing before
using an API.

A sensible hybrid to prototype later is a hosted conversational model with
LifePilot's **task data and tool execution remaining local**. Only the
minimum turn context needed to answer should be sent to the chosen provider;
the app, not the model, validates and writes tasks. A more privacy-conservative
variant keeps the local model as default and asks before sending a selected
request to a hosted model. Do not secretly send the full chat history,
profile, task database, or reminder list to a cloud model. No data has been
sent for this research.

For an additional local reasoning candidate, **gpt-oss:20b** is described as
agentic and local/specialized, but it is larger and has no particular evidence
of a warm conversational style. Do not start by keeping multiple models
loaded or building a multi-agent system.

There is no reliable, objective "friendliest local model" ranking in the
sources reviewed. **Tone is partly a model behavior and partly a product
design:** a clear system prompt, short actionable guidance, user control, and
consistent conversational testing matter. The model should not pretend to
understand someone's feelings, impose a planning style, or turn a friendly
persona into false confidence.

## Beginner's map of the technologies

Think of this as a small team with clearly separated jobs:

1. **Ollama is the local model server.** It loads downloaded model weights and
   accepts requests over a local HTTP API. It is the part already chosen to
   keep.
2. **A model is the language engine.** For example, Qwen3-8B generates the
   assistant's words and may propose a structured tool call.
3. **A prompt/persona is the role brief.** It guides tone and response style,
   but does not give the model real authority or make it consistently
   trustworthy.
4. **A tool is a function the application provides.** For example, a narrowly
   defined `add_task(title, due_at, reminder_at)` function. The model can
   request it; application code validates the request and decides whether it
   is allowed to run.
5. **An orchestrator is the coordinator.** It handles turns, tool results,
   approvals, and—if justified—calls a second model for a specialist job.
   Initially this can simply be ordinary application code, not another AI.
6. **Memory is saved application data.** Chat history or user facts are not
   automatically safe, correct, or persistent just because a model is local.
   The application must decide what, if anything, to save and how users can
   review and clear it.

### Tool call versus delegating to a second model

- **Tool call:** Guide model asks the application to run a function; the
  application returns the result to that same model, which replies to the user.
  There is still one model.
- **Model delegation:** Application routing logic invokes another model with a
  narrower job and its own instructions/context, then returns that result to
  the guide model or to application code for checking. This is multiple model
  calls. The guide model does not magically start a second model on its own.

Example: the guide receives "Can you help me get the kitchen sorted?" It can
ask a gentle clarification. Later, deterministic application code can send a
sanitized summary to a specialist that drafts a short checklist. The user-facing
guide reviews and presents that draft. When a task is to be saved, application
code validates the item and performs the write; the model itself does not write
directly to SQLite. Under the owner's current auto-save direction, the UI
should visibly indicate when a task was captured and provide a low-friction
way to review and undo it. If the user's intent is ambiguous, the assistant
should clarify rather than silently inventing a task. Destructive or bulk
changes should have a separate safeguard.

### A sensible progression

| Stage | What it does | Why it is a good learning step |
| --- | --- | --- |
| 1. Local chat | Send a synthetic user prompt to one Ollama model and inspect the response. | Learn the model/server/API distinction and compare response style before granting any tools. |
| 2. Persona evaluation | Give candidate models the same short system prompt and the same scenarios. | Finds which model feels clear, kind, and appropriately concise for this user; vendor benchmarks cannot answer that. |
| 3. One safe tool | Offer a narrowly scoped task-create/update function; validate title, deadline, and reminder arguments in application code. | Teaches tool calling without giving the model unrestricted filesystem, shell, or database access. |
| 4. Visible auto-save | For a clear, task-like item in conversation, validate and save it, then say what was saved, its deadline/reminder, and offer a quick way to review or undo. Clarify ambiguous intent instead of guessing. | Matches the owner's preferred low-friction task capture while making the write visible and reversible. |
| 5. Specialist handoff | Add an application-owned route to a separate model only for a tested task, with minimal context and a bounded output schema. | Adds another model only when it materially helps; keeps routing and permissions explicit. |
| 6. Framework, if needed | Consider LangGraph.js if workflows need durable state, pause/resume, or more sophisticated handoffs. | Avoids introducing an orchestration dependency before the workflow justifies it. |

For this project, app-owned routing is the simplest first architecture: Node's
built-in `fetch` can call Ollama's local API, so no new runtime or framework is
required for an experiment. LangGraph has a JavaScript/TypeScript option and
adds graph orchestration, persistence, and human-in-the-loop patterns. It is a
later step, not a prerequisite. The Microsoft Agent Framework supports Ollama
but its documented language options are .NET, Python, and Go—not the existing
Node.js application—so it is not the natural starting point here.

### Local versus hybrid choices

| Setup | What stays local / what leaves | Potential benefit | Trade-off |
| --- | --- | --- | --- |
| **Local-only Ollama** | Model inference, prompt, and app data stay on the machine if cloud features and external tools are disabled. | Maximum control over data movement; no per-token API bill. | Quality and speed depend on selected model and constrained GPU/CPU; may be less natural or robust for difficult turns. |
| **Hosted model, local app actions** | Chat context necessary for each turn goes to the selected provider; task database and write execution remain in the local app. | Access to larger hosted models without local GPU constraints; one strong model can converse and call a local app tool. | The text sent to the API is no longer local. Provider retention, cost, internet availability, and user consent must be addressed. |
| **Local default, explicit hosted escalation** | Ordinary chat stays local; a user-approved selected request and only the context needed for it is sent to a hosted model. | Better privacy default with an option for a stronger answer on demand. | Requires clear consent UX and careful context minimization. A local model may not reliably know when it needs help; user-selected escalation is more transparent than hidden routing. |
| **Local guide + hosted specialist** | Conversation can stay local while a bounded, sanitized subtask is sent to a cloud model. | Allows a specialist to draft or classify without moving the entire conversation. | The supposedly small subtask may still reveal personal details; adds latency, routing complexity, and another failure mode. |

For the tomatoes example, a hosted model might interpret the natural-language
request and recommend a reminder time. The local app should resolve the date
against the user's timezone, show the proposed task/deadline/reminder, and write
it to the local store according to the approved task-capture behavior. The
user's example may itself be personal information, so this hybrid still
transmits information unless the user explicitly keeps that turn local.

## Model shortlist

| Candidate | What the sources support | Possible role | Limitations and test questions |
| --- | --- | --- | --- |
| **Qwen3.5-9B** | Qwen/Ollama describe multimodal, multilingual, and agent capabilities; the Ollama 9B tag reports 7.6 GB package size. [S-030–S-031, S-033] | First local model to evaluate for current-generation language and tool capability. | Package size is not VRAM use; with the conflicting 4–8 GiB GPU figures, test load/offload behavior and latency before adopting. Vendor benchmarks do not assess LifePilot tone. |
| **Gemma 4 E4B** | Ollama describes a smaller model with configurable reasoning modes, a 128K small-model context window, and native function calling. [S-032] | Smaller local comparison for responsiveness and tool reliability. | Google's Gemma terms apply; review the license and exact Ollama tag before product use. Vendor claims are not independent friendliness evidence. |
| **Qwen3-8B** | Qwen's card claims natural multi-turn dialogue, role-play, instruction following, tool/agent ability, and support for 100+ languages. Ollama documents Qwen3 tool-call examples. [S-001–S-005, S-013] | Established fallback/comparison if newer local candidates are a poor fit. | Claims are vendor-authored; no objective friendliness comparison. 8.2B parameters; test actual latency and memory with the conflicting vGPU readings. |
| **Qwen3-4B** | Same model family, 4B parameters, same advertised dialogue, tool, reasoning-mode, and multilingual capabilities. [S-001, S-003–S-004] | Lighter comparison if 8B is slow or memory-constrained. | Smaller parameter count is not proof it will be faster enough or retain adequate quality. Evaluate the same prompts and tool tasks. |
| **Llama 3.2 3B** | Ollama's model page describes it as optimized for multilingual dialogue, assistant-like personal information management, summarization, and tool use. [S-014] | A compact comparison model if local responsiveness is the priority. | Its listed supported languages are narrower than Qwen3's claims; check exact tag terms and tool-call behavior before adoption. |
| **gpt-oss:20b** | OpenAI and Ollama describe agentic/function-calling ability, configurable reasoning effort, and local/specialized use. The model card says the 20B model runs within 16 GB memory in its stated MXFP4 setup. [S-006–S-007] | Possible later reasoning/tool specialist; not the first conversational guide. | Much larger; 16 GB refers to the model card's stated setup, not guaranteed speed on this Windows vGPU. The materials do not support a warmth/persona advantage. |
| **Ollama Cloud** | Ollama documents cloud models accessible through its API after sign-in; its privacy policy says cloud prompt/response content is transiently processed and not used to train models. [S-027–S-029] | Easiest hybrid route to compare while keeping Ollama as the runtime interface. | Model names, availability, and prices change; text leaves the machine. No independent quality or latency test is available. |
| **Claude Sonnet 5.5 (hosted API)** | Anthropic labels it a speed/intelligence balance, supports tool use, and publishes API IDs and pricing. [S-019–S-022] | Hosted conversational candidate in hybrid bake-off. | Vendor positioning; prompt context leaves the machine. Standard/ZDR retention rules and feature eligibility need review. |
| **OpenAI GPT-6.1 Sol (hosted API)** | OpenAI describes it as balanced speed, cost, and intelligence; supports tools through the Responses API. [S-015–S-018] | Hosted candidate for conversation plus structured local tool requests. | Vendor positioning; API requests transmit context. Default abuse monitoring retains content up to 30 days; ZDR is eligibility/approval-gated. |
| **Gemini API (paid service only for EEA app use)** | Google documents model options and paid-tier pricing; paid-service prompts/responses are not used to improve products, with limited safety/security logging. [S-023–S-026] | Third hosted provider to compare if the model and product terms fit. | Google's terms require paid services when offering an API client in the EEA/UK/Switzerland. Free-tier input/output can be used to improve products, so do not send sensitive/personal data to free tier. |

Model cards and library pages often include benchmarks, but those measure
specific test sets, not whether a person experiences the assistant as
supportive or easy to follow. Marketing claims about alignment, helpfulness, or
agent performance should be treated as candidate-selection evidence only.

## Evaluation plan for "personable and friendly"

Use the same short system prompt and a small set of synthetic scenarios with
two or three candidate models. Score each response from 1–5 against observable
criteria:

1. **Warmth without presumption:** respectful and human-sounding without
   claiming feelings or overfamiliarity.
2. **Clarity:** plain language; explains technical terms when needed.
3. **Manageable next step:** offers one useful next action, and breaks a larger
   request into smaller steps when helpful.
4. **User agency:** follows the owner's auto-save direction for task-like
   mentions, while making captures visible, editable, and undoable; asks before
   making assumptions about priorities or timing.
5. **Good clarification:** asks one focused question when a missing detail
   changes the answer; otherwise proceeds with a sensible, stated assumption.
6. **Tone consistency:** stays supportive when a user is uncertain, changes
   direction, or says a suggestion does not fit.
7. **Action reliability:** if tools are enabled, identifies actual task intent
   without turning hypotheticals, completed items, or passing references into
   new tasks; extracts the deadline, recommends an activity-appropriate
   reminder time, or asks about ambiguity; supplies valid arguments and does
   not claim a save succeeded unless the application confirms it.

Use prompts such as "I have several things to do and can't pick one", "I don't
want to decide right now", "Could you help me with this in smaller steps?", and
"That suggestion doesn't fit me." Include an action test using synthetic task
data. Compare outputs side by side; retain examples of failures and
disagreements, not only average scores.

This is a proposed evaluation, not user research. It does not assume all
neurodivergent users want the same tone or degree of structure. Preferences
should be adjustable and validated with intended users.

### First local smoke test (2026-10-18)

A read-only inventory found Ollama **0.40.6** and two installed models:
`qwen2.5:3b` and `qwen2.5vl:3b`. I sent the same three synthetic prompts to
both through `http://localhost:11434/api/chat`. The system prompt asked for a
warm, concise, nonjudgmental guide, to distinguish future tasks from completed
ones, not to invent an exact time for "tonight", label reminders as
recommendations, and never claim a save because no tools were provided.
Temperature was 0.3; no external API, tools, or personal data were used.

| Test | `qwen2.5:3b` | `qwen2.5vl:3b` |
| --- | --- | --- |
| "I have several things to do and cannot pick one." | Asked for details about the tasks before suggesting a next step; friendly, but adds another decision. | Asked about task priorities/importance; an initial answer gave an unnecessarily elaborate prioritization checklist. |
| "I need to go pick up tinned tomatoes for dinner tonight." | Recognized shopping intent but asked what time to go; did not propose a reminder time. | Incorrectly changed the requested timing to "tomorrow morning." This is a serious date-interpretation failure for the intended workflow. |
| "I bought tinned tomatoes yesterday, so dinner is sorted." | Correctly treated the task as completed and did not create a new one. | Correctly acknowledged dinner was sorted and did not create a new task. |

Ollama-reported total response times were about **5.4–16.5 seconds** for
`qwen2.5:3b` and **6.0–30.6 seconds** for `qwen2.5vl:3b`. First-load and
model-cache effects were present; one overly long response hit the output cap
and was rerun with a higher cap. These few calls are a functional smoke test,
not a controlled speed benchmark. The vision model received text only.

**Takeaway:** both models need tighter task/date instructions and application
validation before being trusted with automatic task capture. `qwen2.5vl:3b`
must not determine due dates without deterministic checks; "tonight" should
not become "tomorrow." Neither model received tools, so this test did not
measure structured tool calls or actual data-store writes. This baseline does
not test the newer Qwen3.5 or Gemma 4 candidates.

For a local/cloud bake-off, use identical synthetic prompts, instructions,
conversation history, tool schemas, and response limits. Record the exact model
ID/revision, date, API tier, time-to-first-token, full response time, input and
output tokens, estimated cost, and scored rubric. Test provider fallback
separately. Do not rank a hosted model from its provider's own benchmarks alone.

### Qwen3.5-9B local evaluation (2026-10-18)

The owner approved downloading and testing Qwen first. Ollama 0.40.6
successfully pulled and ran `qwen3.5:9b`, digest
`56671c2ab9385f9cfcb404638e32cd62d88e3501d44822208363c010179a3c90`,
Q4_K_M, 9.0B parameters. Ollama lists a 6.6 GB stored package. At the
compatibility check, the registry listed minimum versions 0.30.0 for
Qwen3.5:9b and 0.30.9 for Gemma4:e4b; both are below the installed version.
Live registry layers totaled about 6.10 GiB and 6.13 GiB respectively,
differing from the earlier website figures. Gemma E4B's registry described
7.5B total parameters: "effective 4B" does not mean a 4B memory footprint.
These mutable registry observations do not establish Gemma runtime performance.

All inference used the loopback API with synthetic text, a 4,096-token
context, temperature 0.3, thinking disabled, and a 256-token output limit.
Three chat scenarios reused the baseline instructions. Four further scenarios
offered a `propose_task` tool with title, original deadline text, and a relative
reminder recommendation. Tool requests were inspected only, never executed.

- Chat guidance was supportive but wordy. For the tomatoes example it
  unnecessarily asked whether "tonight" meant tomorrow evening.
- With the initial tool instructions, it asked permission rather than
  producing the tool call for a clear future intention.
- It made no tool requests for completed, hypothetical, or opted-out tasks.
- A follow-up supplied a synthetic date/time and Europe/Berlin timezone,
  explained "tonight", and explicitly stated the user's automatic-capture
  policy. It then emitted one valid `propose_task` request:
  title "Pick up tinned tomatoes for dinner", deadline text "tonight", and
  reminder recommendation "before you start preparing dinner".
- Under that stronger policy it also made no tool requests for the completed
  and opted-out scenarios. This is one observed pass per case, not a
  reliability estimate or evidence of actual database writes.

While loaded, Ollama reported about 5.83 GiB total model allocation and
4.45 GiB in GPU memory, consistent with partial GPU offload. The machine
reported 8 GiB GPU memory, about 5.3 GiB free before the test, 96.8 GiB
available system RAM, and 343 GiB free on C:. There was no capacity failure.
Warm calls took about 5.2-8.5 seconds. The first call took 32.9 seconds,
including 23.8 seconds loading; after unloading, another first call took
124.5 seconds, including 116.2 seconds loading. The cause of that load-time
variation was not investigated. This is not a controlled speed benchmark.

**Decision:** Qwen runs on this machine without upgrading Ollama and can
produce a suitable task proposal with explicit policy/context. It is not yet
validated for automatic task writes: warm latency, inconsistent cold starts,
unnecessary clarification, multi-turn corrections, duplicate prevention, and
actual date/reminder scheduling still need evaluation. The model remains
installed but was unloaded after testing. No app configuration, database,
notification system, or cloud service was changed.

### Streaming latency comparison and bounded follow-up (2026-10-18)

The owner approved measuring responsiveness and comparing Gemma. Gemma4:e4b
was downloaded successfully (Ollama lists 6.6 GB), digest
`dc35e8d9c6061baa6f0fa870975ab6932e2542b579b13ea0f199fa4bb7300c9c`,
Q4_K_M, 7.5B total parameters. Both installed models used Ollama 0.40.6.

**Decision being tested:** can either model meet provisional warm targets of
1-2 seconds to first visible text and about 5 seconds for a short reply or
structured task proposal without unacceptable capture errors? A fast model
that proposes tasks from undecided ideas does not pass on speed alone.

**Method:** sequential local requests, one model loaded at a time, 4,096-token
context, thinking disabled, temperature 0.3, seed 42, a 192-token output cap,
and instructions to use at most 60 words. Each model received the same system
instructions, synthetic clock/timezone, prompts, and proposal-only tool schema.
The initial comparison included one unloaded-model greeting, three warm chat
prompts, three actual task intentions, and three negative controls (completed,
hypothetical, opt-out): 20 calls total. No tool was executed.

The streaming client measured elapsed time from request start to the first
non-whitespace content event, the first parsed structured tool event, and
stream completion. Thinking text was excluded; none was returned. A tool
request is not counted as visible conversational text. A successful task
proposal required exactly one `propose_task` call, the three nonempty string
fields, no extra arguments, and the expected original deadline wording.
Schema checks do not prove semantic correctness or a useful reminder.

| Initial comparison metric | Qwen3.5:9b | Gemma4:e4b |
| --- | --- | --- |
| Warm first visible text, three chat cases | 0.71-0.77 s | 0.39-0.44 s |
| Warm complete reply, same chat cases | 4.05-5.64 s | 1.99-2.27 s |
| Warm structured proposal available, three clear intentions | 7.76-8.36 s | 1.83-1.97 s |
| First visible text after unloaded start, one greeting | 25.63 s | 8.97 s |
| Load component reported for that start | 24.86 s | 7.70 s |
| Clear intentions with schema/deadline checks passing | 3/3 | 3/3 |
| Negative controls with zero structured requests | 3/3 | 2/3 |

**Quality issues:** Gemma proposed "Decide on pasta recipe" for an explicitly
undecided hypothetical. In all three no-tool chat cases it also printed
pseudo-function calls as ordinary prose. These were not real executable
tool requests, but would be confusing in a chat UI. Qwen avoided those
pseudo-calls but unnecessarily imposed an evening deadline in guidance and
gave irrelevant advice about ripe tomatoes in an opt-out response.

**Bounded follow-up:** instructions were separated for chat versus tool-enabled
turns. Chat explicitly prohibited function names and pretend calls. Tool
instructions explicitly excluded questions, conditionals, undecided ideas, and
invented decision subtasks. Dates could be used only when the user mentioned
them. Each model then received one unloaded greeting, one warm chat case, one
clear task intention, and four negative controls: 14 further calls total.

- Neither model printed a pseudo-call in the follow-up chat case.
- Both produced a valid tomatoes proposal preserving "tonight"; Qwen took
  7.41 s to the structured event and Gemma 1.60 s.
- Both made zero requests in the four negative controls, including the
  original pasta hypothetical and two new uncertain/conditional examples.
- Warm chat first text/full reply was 0.59/2.57 s for Qwen and
  0.34/1.96 s for Gemma.
- Follow-up unloaded first text was 7.31 s for Qwen and 8.55 s for Gemma.
  A single unloaded start is not a disk-cold benchmark: OS caches, background
  activity, and model-specific caching were not controlled.

**Interpretation:** Gemma met the provisional warm first-text and proposal
targets on these cases; Qwen met first-text targets but missed the 5-second
proposal target. Prompt changes improved observed behavior, but each case was
sampled only once per configuration. This is a small, fixed-seed experiment,
not an accuracy rate or percentile latency benchmark. Tests used independent
short turns, not long histories, actual task saves, notifications, a UI, or
the model's final acknowledgement after a tool result. A complete save-and-
acknowledge round trip will add latency beyond proposal availability.

Qwen's running-model endpoint again reported 4.45 GiB GPU allocation. For Gemma
it reported only about 352 MiB for both total and GPU size despite a 6.6 GB
download; that accounting is unexplained and must not be used to claim the
whole Gemma model fits in that much VRAM. No application configuration or
other process was changed to improve memory availability.

**Recommendation:** prefer Gemma4:e4b as the next interactive prototype
candidate on responsiveness, retaining Qwen for comparison. First validate
multi-turn corrections and false task capture with held-out examples, then
test a validated local tool round trip. Do not treat the follow-up passes as
authorization for unattended writes. Both models remain installed and were
unloaded after testing; no cloud inference or personal data was used.

### Muse Glimmer 30B bounded experiment (2026-10-18)

The owner approved downloading and testing the standard
[Ollama Muse package](https://ollama.com/library/muse-glimmer).
`muse-glimmer:30b` installed successfully on Ollama 0.40.6, local ID
`de878ce33ad8`, listed size 18 GB. The registry declared minimum version
0.32.8, Q4_K_M text weights of 16.76 GB and a 1.40 GB vision component,
without a drafter layer. The
[publisher's GGUF repository](https://huggingface.co/meta-models/Muse-Glimmer-30B-GGUF)
offers a 19.65 GB alternative text build and an optional 1.63 GB DFlash
drafter; Ollama's page explicitly advertises DFlash for its Apple MLX route.
DFlash acceleration on Windows Ollama was not established or enabled.

The experiment reused the refined comparison instructions and proposal tool
schema, synthetic clock, streaming client, 4,096-token context, temperature
0.3, seed 42, and 192-token output cap. `think:false` was requested.
Only local synthetic prompts were used; no tool requests were executed.
A warm call exceeding 60 seconds stopped the remaining cases.

| Measurement | Initial configuration | Follow-up with `Reasoning strength: low` in system prompt |
| --- | --- | --- |
| Unloaded greeting first visible text | 46.24 s | 45.75 s |
| Unloaded greeting full completion | 49.01 s | 48.50 s |
| Load time reported for greeting | 12.33 s | 12.34 s |
| Warm case | Guidance | Tomatoes task proposal |
| Warm completion time | 60.90 s | 63.59 s |
| Warm output returned to caller | No visible text or tool call | No visible text or tool call |
| Completion status | Output cap reached, 192 tokens | Output cap reached, 192 tokens |

Both warm cases exhausted their generation allowance without a user-visible
answer. The API reported generated tokens but returned no thinking field;
the experiment does not establish whether internal reasoning, model parsing,
or another runtime behavior explains that discrepancy. It would be incorrect
to claim this proves the model cannot perform the task. Increasing the cap
might yield an answer but would not address the immediate latency failure at
the observed speed. The low-reasoning follow-up did not improve this result.
Publisher-recommended sampling settings and alternative runtimes were not
tested; this is a product-fit test under our low-latency configuration, not a
capability benchmark.

Ollama reported about 16.21 GiB total model allocation, with about 3.84 GiB
in GPU memory, consistent with substantial offload outside dedicated VRAM.
Those figures do not distinguish CPU offload from Windows shared-GPU-memory
behavior and do not prove the cause of the latency.

**Decision:** stop this experiment and retain Gemma4:e4b as the responsive
prototype candidate. Muse loads on the machine but misses the current
latency targets by a wide margin in this configuration; its task accuracy
could not be assessed. Four inference calls were made across the initial
trial and bounded follow-up. Muse remains installed, but was unloaded;
no runtime upgrade, DFlash installation, app changes, or cloud inference
occurred. Further runtime tuning is a separate experiment, not an automatic
next step.

## Hardware, privacy, and control

- Earlier website package sizes differed from the live registry and local
  download. Use the measurements above rather than treating package size as
  runtime VRAM use. Qwen was observed using partial GPU offload with a
  4,096-token context; longer contexts may change memory needs and speed.
- **Current behavior gap:** the existing task data stores only a title and
  completion status. It has no deadline, reminder time, or notification
  delivery. The quoted workflow needs new task fields, date/time interpretation,
  reminder delivery, and an updated task display; none are implemented.
- **Reminder suggestion:** the assistant can propose a reminder time from the
  activity and deadline (for example, early enough to shop before dinner).
  The scheduling mechanism must use a definite local date/time and timezone;
  the model's natural-language estimate alone cannot deliver a reliable
  reminder. Do not imply knowledge of store hours or the user's schedule unless
  that information is available and authorized.
- Sequential delegation to a second model may require unloading/swapping model
  weights. Ollama documents concurrent model loading only when the models fit
  in VRAM; small VRAM may therefore mean slower sequential handoffs rather than
  simultaneous specialist models. No matching performance benchmark was found.
- Keep Ollama local-only if that is the requirement; local model inference is
  distinct from any cloud features, external tools, telemetry, or model
  downloads. Confirm the effective local-only setting before using personal
  information.
- A cloud API requires an explicit outbound data boundary. Avoid transmitting
  the full local conversation or profile by default. Send only the fields needed
  for the current task; never send task-store dumps or sensitive property,
  household, or financial records to a model solely to improve tone.
- Provider controls differ. OpenAI says API data are not used for training by
  default but documents default abuse-monitoring logs up to 30 days; ZDR and
  modified monitoring require approval and have endpoint limitations.
  Anthropic documents that ZDR must be enabled for an organization and excludes
  some features/models; the currently listed covered models have 30-day
  retention. Ollama says cloud prompts/responses are processed transiently and
  are not used for training. Google says paid service data are not used to
  improve products but may be logged transiently for safety/security; unpaid
  services can use submitted content for product improvement and human review.
  Read the current terms before any live use.
- A cloud model's tool call should still be executed by the local application.
  Provider-hosted tools (such as web search) are a distinct data path and should
  not be enabled casually.
- Start with synthetic data. Do not expose raw SQLite access, general shell,
  or unrestricted filesystem capabilities to a model. Treat a delegated
  model's answer as untrusted output: validate it before displaying or acting.
- Keep the model's job and the application's authority separate. The
  application decides which tools exist, validates schemas and values, limits
  retries, applies the owner's auto-save policy for task capture, adds a
  separate safeguard for destructive or bulk changes, and reports failures.
- Decide explicitly whether chats are saved. Local storage is still readable
  by users and processes with access to the machine; clearing app data is not
  secure erasure.

## Findings

| ID | Classification and finding | Evidence | Confidence and limitations |
| --- | --- | --- | --- |
| F-01 | Fact: Ollama tool calling is a request/response loop in which the model emits a structured call, application code runs the function, and the result is supplied back for a model response. | S-004, Tool calling; S-005, API chat example. | High for API behavior. Tool calling does not itself grant the model execution authority or delegate to another model. |
| F-02 | Fact: Qwen3-8B and Qwen3-4B cards describe thinking/non-thinking modes, multilingual support, tool/agent capability, and intended strengths in multi-turn dialogue and role-play. Ollama documents a `think` API option. | S-001, S-002 and S-013, highlights/model overview and API thinking controls. | High that the publisher makes these claims; medium/low as evidence of actual friendly-guide quality because independent conversational testing is absent. |
| F-03 | Recommendation: prefer Gemma4:e4b for the next interactive prototype on measured warm responsiveness, retaining Qwen3.5:9b as a comparison; do not label either universally "best". | S-001–S-004, S-030–S-033; local Qwen evaluation and streaming comparison above. | Both run locally and produced dry-run proposals under explicit policy/context. Gemma had an initial false capture; follow-up passes are insufficient to estimate action reliability. |
| F-04 | Fact: gpt-oss:20b is described as a local/specialized reasoning model with agentic/function-calling features; the card's 16 GB memory statement applies to its specified MXFP4 quantization setup. | S-006 and S-007. | High for source statements, not a prediction of speed or usability on this machine. |
| F-05 | Fact: multi-agent designs have patterns such as router, subagents, handoffs, and workflows; LangChain's docs warn a single agent with appropriate tools may suffice and multi-agent is not always necessary. | S-009 and S-010. | High for documented concepts. Which workflow matters in LifePilot remains undecided. |
| F-06 | Recommendation: begin with one guide model plus app-owned routing and narrowly scoped tools; add specialist models only for tasks where an evaluation shows a meaningful benefit. | S-004, S-008–S-010; existing Node.js and product constraints. | Moderate-high fit assessment. Additional framework/model calls add coordination work and may add latency or memory contention. |
| F-07 | Fact: the hardware's GPU-memory reporting conflicts (4 GiB WMI vs 8 GiB `nvidia-smi`); Ollama documents GPU-memory constraints for loading multiple models concurrently. | Local machine probe recorded in the prior local hosting research; S-008. | High for observed values and vendor behavior; actual usable memory and model-switching latency are unknown until measured. |
| F-08 | Recommendation: separate the assistant's friendly language from tool authority; have the application validate task data and apply the owner's auto-save policy, with separate safeguards for destructive or bulk changes. | S-004, S-005, S-011; product principle of user control. | Strong safety recommendation; this is an architecture proposal, not current application behavior. |
| F-09 | Owner direction: automatically capture task items from conversation, with the example requiring a task, a "tonight" deadline, and an activity-based reminder-time recommendation. | User clarification on 2026-10-18; current capability boundary checked against [Product vision](../../PRODUCT_VISION.md) and [documentation overview](../../README.md). | High for the stated intent; exact time parsing, scheduling behavior, notification channel, and review/undo behavior remain open. |
| F-10 | Fact: hosted model APIs provide more model choices but send request context to the provider; provider data policies differ by endpoint, plan, and eligibility. | S-015–S-029. | High for the cited current provider terms; terms and model pricing change. This report is not a legal review. |
| F-11 | Recommendation: if the user prioritizes conversational quality and accepts cloud data transfer, compare one mid-tier API model from Anthropic and OpenAI against local candidates using the same task-intent evaluation; keep task storage, validation, reminders, and writes local. | S-004–S-005, S-015–S-022, S-030–S-033; user-stated aim. | Moderate-high architecture fit; comparative quality for this user is unknown until tested. |
| F-12 | Recommendation: for a privacy-first hybrid, use explicit user-selected hosted escalation rather than silently sending conversations based on a local model's confidence. | S-009, S-015–S-029; privacy minimization and transparency. | Strong risk-control recommendation; explicit escalation may add a confirmation step and latency. |
| F-13 | Fact/recommendation: Ollama supports cloud models through its API in addition to local models; this can make it a simpler integration experiment, but it still transmits prompts to Ollama's cloud. | S-027–S-029. | High for current API and published policy statements; model list, pricing, and account terms are mutable; quality is untested. |
| F-14 | Observation: in a three-prompt, synthetic local smoke test, both installed Qwen2.5 models identified the completed-item scenario as already done; Qwen2.5:3b asked for an exact time for "tonight", while Qwen2.5vl:3b proposed "tomorrow morning." | Local Ollama API smoke test on 2026-10-18, recorded above. | Directly observed once per model/scenario; outputs are stochastic and the test is too small to estimate reliability. The incorrect date is sufficient to require application-side date validation. |

## Open questions and limits

- Which user preferences should shape the assistant's tone, response length,
  step size, and tendency to ask questions?
- Which specific workflows merit an assistant, and which should remain clear,
  deterministic UI flows?
- What, if anything, should be remembered between conversations, for how long,
  and how can users review and delete it?
- What counts as task intent rather than a hypothetical, completed item, or
  passing mention? How should the UI surface automatic task capture and support
  review, correction, and undo? How should explicit opt-out language work?
- What time should the reminder use when the user says "tonight" without an
  exact time? How should date interpretation use the saved timezone, and how
  should the user control or override the activity-based recommendation?
- Is a second model worth its added latency and memory use for any defined
  task? There is no benchmark for the actual machine or planned prompts.
- Is hosted processing acceptable for any conversation turns, including the
  task text "pick up tinned tomatoes for dinner tonight"? Which provider terms,
  budget cap, and user disclosure/consent model would be acceptable?
- The model pages are mutable, often omit publication dates, and are
  publisher-authored. Recheck exact tags, terms, and Ollama tool support before
  relying on a model in a released product.
- Ollama 0.40.6 ran both Qwen3.5:9b and Gemma4:e4b successfully. Ollama Cloud
  has not been tested. Gemma's running-model memory accounting was unexplained;
  do not infer actual runtime VRAM use from its reported 352 MiB alone.
- No security audit, model red-team exercise, user evaluation, or accessibility
  test was performed.

## Next step for a guided learning path

The next useful step is a Gemma-led interactive prototype evaluation with
held-out multi-turn corrections, negative task-intent examples, and a
validated local tool round trip. Preserve streaming for conversation and
measure save-to-acknowledgement latency separately. Do not integrate either
model into unattended task writes until action behavior and date handling
are validated. If exploring hosted models later, agree on provider, data
boundary, and budget before creating accounts or making API calls.

The owner has chosen task-only capture with automatic saving, including task
deadlines and activity-based reminder-time recommendations in the example
workflow. Before implementation, define observable capture rules, date/time
conversion, how a suggested time becomes a scheduled reminder, notification
delivery, how captures are communicated, how mistaken captures are corrected
or undone, and how explicit opt-out language is handled. Any hybrid/API
implementation separately requires explicit authorization for external
transmission and paid usage.

## Source coverage and update history

See the [source register](sources.md) and its citation-only original notes. No
source copies or external assets were archived in this research pack.
Qwen3.5:9b, Gemma4:e4b, and Muse Glimmer 30B were downloaded into Ollama's
model storage with owner approval. This is a research note collection, not
a full archive.

- 2026-10-18: initial model shortlist and beginner-oriented overview; two
  researchers completed complementary model and orchestration remits.
- 2026-10-18: scope expanded to hosted and hybrid approaches at the user's
  request; provider claims and data terms were compared from official docs.
- 2026-10-18: read-only Ollama inventory and three-prompt local smoke test
  completed for the two models already installed; no downloads or cloud calls.
- 2026-10-18: owner-approved Qwen3.5:9b download and ten synthetic local calls;
  observed partial GPU offload and a successful dry-run task proposal after
  explicit auto-capture policy and date context. No tool requests executed.
- 2026-10-18: owner-approved Gemma4:e4b download and 34 streamed local calls
  across initial comparison and bounded prompt follow-up. Gemma led on warm
  latency; initial false capture and pseudo-calls improved in the follow-up.
  No tools executed, application changes, or cloud inference.
- 2026-10-18: owner-approved Muse Glimmer 30B download and four local calls.
  Both warm cases hit the output cap without a visible answer and exceeded
  the 60-second cutoff; low-reasoning instructions did not remedy the result.
  Model left installed but unloaded; Gemma remains the lead prototype choice.
