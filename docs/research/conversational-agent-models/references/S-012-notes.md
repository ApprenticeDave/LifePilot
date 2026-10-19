# S-012 — Human-in-the-loop middleware / LangChain JavaScript Documentation

- Original URL: https://docs.langchain.com/oss/javascript/langchain/human-in-the-loop
- Accessed: 2026-10-18
- Locator: human-in-the-loop middleware and approval decisions.
- Verification: official JavaScript documentation opened by delegation researcher.
- Publication/update date: not stated in retrieved page.
- Summary: LangChain's JavaScript middleware can pause tool calls for human
  review with per-tool policies and approve/edit/reject/respond decisions; a
  checkpointer is needed for persistence across interrupts.
- Supports: a possible later implementation aid for pause-and-confirm workflows.
- Caveats: the application still needs to define its approval policy and
  permissions; a framework approval UI is not an OS-level sandbox.
- Copy/reuse: no copy saved; summary is paraphrased. Copy permission not assessed.
- Source register: [S-012](../sources.md#s-012-human-in-the-loop-middleware--langchain-javascript-documentation).
