# S-012 — Plugin security warning / Open WebUI

- Original URL: https://docs.openwebui.com/features/extensibility/plugin/
- Accessed: 2026-10-18
- Locator: Critical Security Warning; Tools and Functions.
- Verification: official documentation page opened.
- Publication/update date: not stated in retrieved page.
- Summary: Open WebUI warns that Tools, Functions, Pipes, Filters, and
  Pipelines execute arbitrary Python on its server. It advises using trusted
  sources, reviewing code, protecting the data directory, and restricting
  workspace access.
- Supports: treating in-process plugins as host code, not as a sandbox.
- Caveats: the warning concerns extensibility components and does not mean
  they must be enabled in every installation.
- Copy/reuse: no source copy saved; notes are paraphrases. Full-page copying
  permission was not assessed.
- Source register: [S-012](../sources.md#s-012-plugin-security-warning--open-webui).
