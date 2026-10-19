# S-008 — FAQ / Ollama Documentation

- Original URL: https://docs.ollama.com/faq
- Accessed: 2026-10-18
- Locator: model residency (`keep_alive`), concurrency and context length.
- Verification: official FAQ page opened by delegation researcher.
- Publication/update date: not stated in retrieved page.
- Summary: Ollama documents controls for how long models stay loaded and
  limits on concurrent loaded models/parallel requests. It says concurrent
  GPU model loads require the models to fit in VRAM; under memory pressure
  requests may queue and idle models may be evicted. It also documents
  context-window defaults and notes larger contexts increase memory needs.
- Supports: caution that multiple specialists can add model-loading latency
  and memory pressure on a small vGPU.
- Caveats: actual behavior depends on Ollama version, runtime, model format,
  and machine; no matching benchmark was found.
- Copy/reuse: no copy saved; summary is paraphrased. Copy permission not assessed.
- Source register: [S-008](../sources.md#s-008-faq--ollama-documentation).
