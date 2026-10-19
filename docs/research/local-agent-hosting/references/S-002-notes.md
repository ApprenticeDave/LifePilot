# S-002 — Hardware support / Ollama

- Original URL: https://docs.ollama.com/gpu
- Accessed: 2026-10-18
- Locator: Nvidia support matrix and GPU selection.
- Verification: official documentation page opened.
- Publication/update date: not stated in retrieved page.
- Summary: Ollama lists Nvidia GPUs with compute capability 5.0+ and driver
  550+ as supported (with a newer driver requirement for older compute
  capabilities). The list places A10 in the 8.6 compute-capability family.
  It documents selecting or disabling GPUs through `CUDA_VISIBLE_DEVICES`.
- Supports: broad compatibility of the observed A10 generation and driver
  with Ollama's documented support range.
- Caveats: a listed GPU does not guarantee that a VM/vGPU allocation, driver
  setup, or every model will work or achieve a particular speed.
- Copy/reuse: no source copy saved; notes are paraphrases. Full-page copying
  permission was not assessed.
- Source register: [S-002](../sources.md#s-002-hardware-support--ollama).
