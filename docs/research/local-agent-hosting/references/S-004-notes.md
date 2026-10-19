# S-004 — API Introduction / Ollama

- Original URL: https://docs.ollama.com/api
- Final URL: https://docs.ollama.com/api/introduction.md
- Accessed: 2026-10-18
- Locator: Base URLs; Ollama API example; versioning.
- Verification: official documentation page opened after redirect.
- Publication/update date: not stated in retrieved page.
- Summary: the page identifies local API base URL `http://localhost:11434/api`
  and OpenAI-compatible base URL `http://localhost:11434/v1`. Local model
  requests do not need an authorization header. The API is not strictly
  versioned, though the docs state it is expected to remain stable and
  backwards-compatible.
- Supports: direct integration through an application HTTP client.
- Caveats: compatibility details vary by endpoint and model; test required
  tool calling and structured output with selected models.
- Copy/reuse: no source copy saved; notes are paraphrases. Full-page copying
  permission was not assessed.
- Source register: [S-004](../sources.md#s-004-api-introduction--ollama).
