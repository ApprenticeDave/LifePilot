# S-013 — Persistence / LangGraph

- Original URL: https://docs.langchain.com/oss/python/langgraph/persistence
- Accessed: 2026-10-18
- Locator: checkpointers, stores, checkpointer vs. store, in-memory
  persistence note.
- Verification: official documentation page opened.
- Publication/update date: not stated in retrieved page.
- Summary: LangGraph separates thread-scoped short-term state held by
  checkpointers from long-term, application-defined data held by stores. Its
  in-memory saver is not persistent across process restarts; the page points
  to persistent backends such as SQLite.
- Supports: LangGraph as orchestration/persistence infrastructure for
  resumable workflows, rather than a model host or turnkey front end.
- Caveats: the page documents concepts and examples, not the maintenance or
  operational suitability of a particular application design.
- Copy/reuse: no source copy saved; notes are paraphrases. Full-page copying
  permission was not assessed.
- Source register: [S-013](../sources.md#s-013-persistence--langgraph).
