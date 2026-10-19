# S-013 — Thinking / Ollama Documentation

- Original URL: https://docs.ollama.com/capabilities/thinking
- Accessed: 2026-10-18
- Locator: discover model thinking controls; enable thinking in API calls.
- Verification: official documentation page opened by coordinator.
- Publication/update date: not stated in retrieved page.
- Summary: Ollama documents model-specific thinking metadata discoverable via
  `/api/show` and a `think` request field to enable, disable, or set a supported
  named level. Thinking and final response are exposed separately.
- Supports: testing Qwen3's no-thinking mode for ordinary conversation while
  reserving reasoning mode for tasks that benefit from it.
- Caveats: controls differ by model; the page does not promise that turning off
  thinking improves friendliness or quality.
- Copy/reuse: no copy saved; summary is paraphrased. Copy permission not assessed.
- Source register: [S-013](../sources.md#s-013-thinking--ollama-documentation).
