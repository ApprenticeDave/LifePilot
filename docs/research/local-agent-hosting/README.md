# Local agent hosting options

## Brief and status

Research date: 2026-10-18. Status: **complete for a source-backed options
comparison**, not an empirical performance test or security audit.

Question: what are the practical ways to host a local AI agent on a Windows
machine similar to the current development machine, and which is the best fit
for a privacy-sensitive personal assistant?

Scope: compare local model serving, agent orchestration, and turnkey chat/agent
front ends separately; assess Windows support, hardware fit, integration,
privacy boundaries, and practical complexity. No software was installed, no
models were downloaded, and no implementation or benchmark was performed.
Information is current to the date accessed; vendor documentation is mutable
and does not always state a publication date or version.

The product context is LifePilot's first local test bed: a Node.js app using
built-in modules and plain web technologies, with personal data in a local
SQLite database. Its product vision leaves the assistant's responsibilities
and initiative open. These recommendations therefore support experimentation,
not an approved product decision.

## Machine profile observed

The local machine reports Windows 11 Pro, an AMD EPYC 74F3 allocation with
6 cores / 12 logical processors, and 109.9 GiB of visible system memory. The
NVIDIA driver query reports an NVIDIA A10-8Q with 8192 MiB and compute
capability 8.6, driver 573.96. A separate WMI `AdapterRAM` query reported
4.0 GB for that adapter. The mismatch is unresolved; the driver-level
`nvidia-smi` reading is the more useful current capacity reading, but the
selected runtime must still be checked to confirm actual usable VRAM.

This is a substantial system-memory allocation paired with a moderate
GPU-memory allocation and a 6-core CPU allocation. System RAM capacity is not a
proxy for CPU inference speed. No token-throughput or latency result should be
assumed from these specifications.

## Team and evidence coverage

Two independent research tasks completed:

- `ec1bb72b-19c9-487a-9b0c-624c69e7a2da` — Windows model-runtime options,
  hardware constraints, serving APIs, and inference fit.
- `3dc50a11-af3d-4f4f-9cb8-1f6018adb3a9` — agent frameworks, user-facing
  front ends, persistence, and tool-execution security.

The coordinator opened the cited vendor and project documentation listed in
the [source register](sources.md). Search summaries and snippets were treated
as leads only; unverified claims from those summaries are not relied on as
facts below.

## Executive synthesis

**Best starting point for integrating a local assistant into this application:
Ollama as the local model server, with the application retaining ownership of a
small, explicit set of agent actions.** It has a Windows-native install, an
HTTP API, and official documentation listing A10 support. The server defaults
to loopback. For a model-testing GUI and alternate local OpenAI-compatible
server, **LM Studio** is a good parallel evaluation option. **llama.cpp /
`llama-server`** is the best choice when detailed control over model format,
quantization, and CPU/GPU placement is more important than ease of setup.

**Owner decision (2026-10-18):** keep the existing Ollama setup as the baseline
and defer installing or switching to llama.cpp. This does not yet confirm which
Ollama version, model, or runtime configuration is installed.

For a ready-made chat-and-agent experience, **AnythingLLM** connects to a local
Ollama service and documents no-code Agent Flows. Its agent behavior depends
on whether the selected model can use tools; its own documentation says that
not all models can. Verify its data paths and enabled tools before using it
with personal data. **Open WebUI** is another extensible front end, but its
official warning is consequential: its tools and plugins can execute arbitrary
Python code on the host. It should not be treated as a security sandbox.

For LifePilot, begin with a thin model-server adapter and application-owned
tool dispatch rather than adding a general agent framework immediately. Keep
the model away from raw database access and unrestricted shell/filesystem
tools. Require clear user confirmation for changes to saved information. A
workflow framework such as LangGraph becomes worth evaluating only after
specific multi-step, resumable workflows justify its extra code and
dependencies. This is a recommendation, not an implemented design.

## Findings

| ID | Classification and finding | Evidence | Confidence and limitations |
| --- | --- | --- | --- |
| F-01 | Observed: this machine has Windows 11 Pro, 6 CPU cores / 12 threads, 109.9 GiB visible RAM, and an A10-8Q reported by `nvidia-smi` as 8192 MiB, CC 8.6. WMI returned a conflicting 4.0 GB adapter-memory value. | Local PowerShell `Get-CimInstance` and `nvidia-smi` observations on 2026-10-18; Ollama GPU support page, S-002. | High for the observed outputs; the WMI/driver discrepancy and actual inference-visible VRAM remain unresolved. |
| F-02 | Fact: Ollama is a practical default Windows model server. Its Windows app supports NVIDIA GPUs, serves a local API on `localhost:11434`, and documents NVIDIA support for CC 5.0+ with driver 550+; A10 is listed at CC 8.6. | S-001 Windows; S-002 Hardware support; S-004 API introduction. | High for documented compatibility and API behavior. It does not establish performance on this vGPU or support for every model. |
| F-03 | Fact: Ollama can run local inference without a cloud account, defaults to loopback, and provides a setting to disable its cloud features. | S-003 FAQ, local-only mode and network exposure sections. | High for the documented configuration. Local inference does not by itself prevent other application components, tools, or network extensions from sending data elsewhere. |
| F-04 | Fact: llama.cpp targets local inference across hardware and supports CPU/GPU hybrid inference, multiple quantization formats, and an OpenAI-compatible server. | S-005 project README. | High for stated project capabilities; hardware-specific throughput and the best build/configuration were not tested. |
| F-05 | Fact: LM Studio supports Windows x64, recommends at least 16 GB system RAM and 4 GB dedicated VRAM, can run offline after model files are present, and exposes OpenAI-compatible local endpoints. | S-006 System Requirements; S-007 Offline Operation; S-008 OpenAI Compatibility. | High for documented requirements and endpoints. The pages do not benchmark this A10 vGPU. |
| F-06 | Fact: AnythingLLM separates its chat/agent application from the model provider, documents a local Ollama connection, and offers no-code Agent Flows; not all models support tool use. | S-009 Ollama LLM; S-010 AI Agents; S-011 Agent Flows. | High for the opened documentation. The documents reviewed do not establish that every configuration is network-silent or that every tool action is isolated. |
| F-07 | Fact: Open WebUI's plugin and tool components can execute arbitrary Python on its server; the project advises installing only trusted code and restricting workspace access. | S-012 Plugin security warning. | High; this is an explicit vendor warning. It does not mean every Open WebUI configuration executes arbitrary code. |
| F-08 | Fact: LangGraph provides short-term thread-scoped checkpoints and separate long-term stores; in-memory persistence is lost at process restart, with persistent backends such as SQLite available. | S-013 Persistence. | High for the persistence model. It is orchestration infrastructure, not an inference server or end-user app. |
| F-09 | Recommendation: for the current Node.js test bed, first trial Ollama behind an app-owned, narrow tool interface; use LM Studio to compare local model behavior through its local API. Only adopt a framework or separate UI if a concrete workflow needs it. | S-001–S-008, S-013; product context in [Product vision](../../PRODUCT_VISION.md) and [documentation overview](../../README.md). | Moderate-high as a fit assessment; final choice depends on measured task quality, latency, and required workflows. |

## Practical comparison

| Option | Role | Why it fits | Main caveat |
| --- | --- | --- | --- |
| **Ollama** | Local model runtime / API | Easiest general-purpose starting point for a Windows-native local service; simple HTTP API; supported A10 family and local-only setting. | Confirm it sees the full GPU allocation. Model, quantization, context, and tool-call behavior must be tested. |
| **LM Studio** | Local runtime with GUI and API | Strong for browsing/testing models and trying an OpenAI-compatible local API; offline use is documented; its minimum GPU recommendation is 4 GB. | Proprietary desktop application; do not assume model-server performance or the 8 GB driver-reported amount from requirements alone. |
| **llama.cpp / `llama-server`** | Inference engine and server | Most direct control over GGUF models, quantization, and hybrid CPU/GPU inference. | More configuration and model lifecycle work than Ollama or LM Studio. |
| **AnythingLLM** | Turnkey chat UI and lightweight agent | Local Ollama provider integration and visual Agent Flows; useful for testing an agent without first building a UI. | Agent/tool support varies by model; verify storage, network behavior, and each enabled tool before using sensitive data. |
| **Open WebUI** | Extensible chat UI and tool host | Broad extensibility and multiple tool connection styles. | Its own documentation warns that in-process tools/plugins run arbitrary Python on the host. Not an isolation boundary. |
| **LangGraph** | Developer orchestration framework | Explicit graph state, checkpoints, and memory stores for complex, resumable workflows. | Adds a framework and likely a separate runtime/language stack; premature for the present prototype absent defined workflow requirements. |

### Hardware implications

The machine meets the broad Windows and RAM recommendations stated by LM
Studio and the NVIDIA generation/driver range documented by Ollama. The
driver-reported 8 GiB VRAM is materially different from the 4 GiB WMI reading,
so both values should be checked in the chosen inference server before model
selection. Even with 8 GiB, model weights, context/KV cache, and runtime
overhead compete for GPU memory; RAM can hold CPU-offloaded model state, but
the 6-core allocation may limit generation speed. No source opened here
supports a reliable tokens-per-second estimate for this exact configuration.

As a test plan, not a capacity guarantee, start with a modest quantized
instruction model and a conservative context window, then compare a larger
quantized model. Record runtime-reported GPU/CPU placement, peak memory,
time-to-first-token, generation speed, and success on synthetic tool-use
scenarios. Include the actual prompt/context lengths intended for the
assistant.

### Privacy and control implications

- Keep the inference server bound to loopback; do not expose its unauthenticated
  local API to the LAN or Internet without a deliberate, separately reviewed
  access-control design.
- If using Ollama, explicitly disable its cloud features for a strictly local
  setup and verify the effective setting after restart. Downloading model files
  still requires network access unless models are transferred separately.
- Treat downloaded models, model metadata, application logs, chat histories,
  vector stores, and tool servers as separate data paths to inspect. Local
  inference does not make an entire agent stack private automatically.
- Give tools the smallest capabilities needed. Avoid general shell, arbitrary
  filesystem access, and unrestricted database access. Route state changes
  through the application and ask for user approval before writing.
- Keep real personal, property, and financial information out of the initial
  test. Use synthetic scenarios and verify local storage and cleanup behavior.
- Do not assume a framework's confirmation prompt is OS-level sandboxing.
  Tool code must be treated as trusted host code unless it is separately
  isolated and constrained.

## Disagreements and open questions

- **VRAM reading:** WMI reported 4.0 GB; `nvidia-smi` reported 8192 MiB for
  the A10-8Q. This report records both and uses the driver query as the current
  operational reading, not as a guarantee that a runtime can allocate all of
  it.
- **Performance:** no matching benchmark for this exact CPU/vGPU allocation
  was verified. Test locally; do not rely on generic tokens-per-second
  estimates.
- **Agent quality:** local model support for tool calling, structured output,
  and multi-step reliability varies. The product goal and target workflows
  remain to be defined.
- **Privacy:** local runtime documentation does not certify third-party
  front-end settings, custom tools, OS access, or all network traffic.
- **Licensing:** model weights have their own terms. This comparison did not
  review every model's license or provide legal advice.

## Next actions

1. If proceeding, benchmark Ollama and LM Studio on the machine using the same
   synthetic tasks and prompts, and record actual GPU placement, latency,
   throughput, and tool-call reliability.
2. Decide whether the next prototype is an app-integrated agent or a
   standalone local assistant before choosing an orchestration/UI framework.
3. Before any real personal data is used, define the allowed tools, retention
   and deletion behavior, and network boundary.

## Source coverage and update history

The [source register](sources.md) lists the verified pages and local notes.
No original pages, model files, or screenshots were copied into this research
pack. It is a notes-and-citations collection, not a full local archive.

- 2026-10-18: initial comparison; primary documentation opened for the
  runtime, front-end, and persistence claims cited above.
