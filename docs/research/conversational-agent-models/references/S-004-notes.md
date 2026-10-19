# S-004 — Tool calling / Ollama Documentation

- Original URL: https://docs.ollama.com/capabilities/tool-calling
- Accessed: 2026-10-18
- Locator: single tool call and parallel tool calling examples.
- Verification: official API documentation opened by coordinator.
- Publication/update date: not stated in retrieved page.
- Summary: the docs show a tool schema provided to a model, a structured
  `tool_calls` response, application execution of the named function, then a
  follow-up chat request with the tool result. Qwen3 is used in the examples.
  The page distinguishes sequential/single tool use from parallel tool calls.
- Supports: explaining that an LLM proposes a function call, while the host
  application executes it and returns its result.
- Caveats: model output is not authorization; the host must check the tool
  name, arguments, user confirmation, and execution result.
- Copy/reuse: no copy saved; summary is paraphrased. Copy permission not assessed.
- Source register: [S-004](../sources.md#s-004-tool-calling--ollama-documentation).
