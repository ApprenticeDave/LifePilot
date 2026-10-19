# S-003 — FAQ / Ollama

- Original URL: https://docs.ollama.com/faq
- Accessed: 2026-10-18
- Locator: context size, processor placement, server configuration,
  disabling cloud features, network exposure.
- Verification: official documentation page opened.
- Publication/update date: not stated in retrieved page.
- Summary: the FAQ says default context is 4096 tokens and can be changed;
  `ollama ps` reports whether model placement is CPU, GPU, or split. It
  documents `OLLAMA_NO_CLOUD=1` / `disable_ollama_cloud` for disabling cloud
  features and says the server binds to `127.0.0.1` by default.
- Supports: practical tuning/verification points and an explicit local-only
  configuration option.
- Caveats: model files still need to be obtained; no statement here guarantees
  the behavior of an agent's other tools or a separate UI.
- Copy/reuse: no source copy saved; notes are paraphrases. Full-page copying
  permission was not assessed.
- Source register: [S-003](../sources.md#s-003-faq--ollama).
