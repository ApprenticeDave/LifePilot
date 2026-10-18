const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { blankState } = require("../model");

test("home dashboard offers working profile actions and honest area previews", async () => {
  for (const completed of [false, true]) {
    const state = blankState();
    state.stage = "workspace";
    state.resumeStage = completed ? "starting" : "responsibilities";
    state.profile.nickname = "<Alex>";
    state.profile.responsibilities = ["homeProperty", "moneyBills"];
    state.profile.guidance = ["overviewFirst", "smallerSteps", "moreExplanation", "startingPointHelp"];
    let markup;
    const root = { addEventListener() {}, set innerHTML(value) { markup = value; }, querySelector() { return null; } };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "public", "app.js"), "utf8"), {
      document: {
        querySelector(selector) {
          return { "#app": root, "#save-status": { classList: { toggle() {} } }, "#retry-save": { addEventListener() {} }, "#reload-state": { addEventListener() {} } }[selector];
        },
        querySelectorAll() { return []; },
      },
      async fetch() { return { ok: true, async json() { return { state, version: 0 }; } }; },
    });
    await new Promise((resolve) => setImmediate(resolve));
    assert.match(markup, /id="home-heading">Home/);
    assert.match(markup, /Welcome, &lt;Alex&gt;/);
    assert.match(markup, /Home or property/);
    assert.match(markup, /Money and bills/);
    assert.equal((markup.match(/class="availability">Not available yet/g) || []).length, 2);
    assert.doesNotMatch(markup, /<h3>Work or study/);
    assert.match(markup, /data-action="edit" data-stage="guidance"/);
    assert.match(markup, /data-action="confirm-clear"/);
    assert.equal((markup.match(/class="button primary"/g) || []).length, 1);
    assert.match(markup, completed ? /Adjust my profile/ : /Continue setup/);
    assert.match(markup, /One small step/);
  }
});

test("typing retains the input DOM and uses a single delegated input listener", async () => {
  const listeners = new Map();
  let renders = 0;
  let scheduledSave;
  const writes = [];
  let version = 0;
  const state = blankState();
  state.stage = "name";
  const root = {
    addEventListener(name, handler) {
      assert.equal(listeners.has(name), false);
      listeners.set(name, handler);
    },
    set innerHTML(value) { renders += 1; },
    querySelector() { return null; },
  };
  const status = { textContent: "", classList: { toggle() {} } };
  const retry = { addEventListener() {}, hidden: true };
  const document = {
    querySelector(selector) {
      return { "#app": root, "#save-status": status, "#retry-save": retry, "#reload-state": { addEventListener() {} } }[selector];
    },
    querySelectorAll() { return []; },
  };
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, "..", "public", "app.js"), "utf8"),
    {
      document,
      setTimeout(callback) { scheduledSave = callback; return 1; },
      clearTimeout() {},
      async fetch(url, options) {
        if (options?.method === "POST") {
          assert.equal(options.headers["X-LifePilot-Version"], String(version));
          writes.push(JSON.parse(options.body));
          version++;
          return { ok: true, async json() { return { state: writes.at(-1), version }; } };
        }
        return { ok: true, async json() { return { state, version }; } };
      },
    },
  );
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(renders, 1);
  const input = { name: "nickname", id: "nickname", type: "text", value: "" };
  for (const value of ["A", "Al", "Ale", "Alex"]) {
    input.value = value;
    listeners.get("input")({ target: input });
  }
  assert.equal(renders, 1, "typing must not replace a focused field and trigger recursive blur/change");
  assert.equal(listeners.size, 6, "one input listener and five transition-only capture guards");
  await scheduledSave();
  assert.equal(writes.at(-1).profile.nickname, "Alex");
});

test("region dropdown is local, optional, escaped, and preserves own-word answers", async () => {
  const state = blankState();
  state.stage = "location";
  state.profile.countryRegion = 'Example "region"';
  let markup = "";
  let inputHandler;
  let save;
  let saved;
  const root = {
    addEventListener(name, handler) { if (name === "input") inputHandler = handler; },
    set innerHTML(value) { markup = value; },
    querySelector() { return null; },
  };
  const document = {
    querySelector(selector) {
      return {
        "#app": root,
        "#save-status": { classList: { toggle() {} } },
        "#retry-save": { addEventListener() {} },
        "#reload-state": { addEventListener() {} },
      }[selector];
    },
    querySelectorAll() { return []; },
    getElementById() { return null; },
  };
  let requests = 0;
  let version = 0;
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, "..", "public", "app.js"), "utf8"),
    {
      document,
      setTimeout(callback) { save = callback; },
      clearTimeout() {},
      async fetch(url, options) {
        requests++;
        assert.equal(url, "/api/state");
        if (options?.method === "POST") {
          assert.equal(options.headers["X-LifePilot-Version"], String(version));
          saved = JSON.parse(options.body);
          version++;
        }
        return { ok: true, async json() { return { state: saved || state, version }; } };
      },
    },
  );
  await new Promise((resolve) => setImmediate(resolve));
  assert.match(markup, /<select id="countryRegionChoice"/);
  assert.match(markup, /<option value="South Africa" >South Africa<\/option>/);
  assert.match(markup, /<option value="United Kingdom" >United Kingdom<\/option>/);
  assert.match(markup, /value="__other" selected/);
  assert.match(markup, /value="Example &quot;region&quot;"/);
  assert.match(markup, /Other \/ enter my own/);
  assert.equal(requests, 1, "suggestions must not request an external lookup");
  inputHandler({ target: { name: "countryRegion", type: "text", value: "My own region" } });
  await save();
  assert.equal(saved.profile.countryRegion, "My own region");
  inputHandler({ target: { name: "countryRegion", type: "text", value: "" } });
  await save();
  assert.equal(saved.profile.countryRegion, "");
  inputHandler({ target: { name: "countryRegionChoice", type: "select-one", value: "South Africa" } });
  await save();
  assert.equal(saved.profile.countryRegion, "South Africa");
  assert.match(markup, /value="South Africa" selected/);
  assert.doesNotMatch(markup, /id="countryRegion" /);
  inputHandler({ target: { name: "countryRegionChoice", type: "select-one", value: "__other" } });
  assert.match(markup, /id="countryRegion" /);
  inputHandler({ target: { name: "countryRegion", type: "text", value: "Another region" } });
  await save();
  assert.equal(saved.profile.countryRegion, "Another region");
  inputHandler({ target: { name: "countryRegionChoice", type: "select-one", value: "" } });
  await save();
  assert.equal(saved.profile.countryRegion, "");
});

const appSource = fs.readFileSync(path.join(__dirname, "..", "public", "app.js"), "utf8");
const clone = (value) => JSON.parse(JSON.stringify(value));
const settle = () => new Promise((resolve) => setImmediate(resolve));

// A small DOM/event fixture, not a browser emulator. Buttons are reconstructed
// from rendered markup; their real application handlers drive every transition.
async function browserFixture(initial) {
  const listeners = new Map();
  const fields = new Map();
  const timers = new Map();
  const plans = [];
  const requests = [];
  let saved = clone(initial);
  let version = 7;
  let timerId = 0;
  let renders = 0;
  let headingFocus = 0;
  let reloads = 0;
  let confirmResult = false;
  let confirmation = "";
  function container() {
    return {
      markup: "", buttons: [],
      set innerHTML(value) {
        this.markup = value;
        this.buttons = [...value.matchAll(/<button\b([^>]*)>(.*?)<\/button>/gs)].map((match) => {
          const attributes = Object.fromEntries([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map((attribute) => [attribute[1], attribute[2]]));
          return {
            attributes,
            dataset: { action: attributes["data-action"], stage: attributes["data-stage"] },
            addEventListener(name, handler) { this[name] = handler; },
            focus() {},
          };
        });
      },
      querySelectorAll(selector) {
        if (selector === "[data-action]") return this.buttons;
        const name = selector.match(/name="([^"]+)"/)?.[1];
        return [...fields.values()].filter((field) => field.name === name && field.checked);
      },
      querySelector(selector) {
        if (selector === "h1") return { focus() { headingFocus++; } };
        if (selector === "button") return this.buttons[0];
        return this.querySelectorAll(selector)[0] || null;
      },
      replaceChildren() { this.innerHTML = ""; },
    };
  }
  const root = container();
  const originalDescriptor = Object.getOwnPropertyDescriptor(root, "innerHTML");
  Object.defineProperty(root, "innerHTML", {
    set(value) { renders++; originalDescriptor.set.call(this, value); },
  });
  root.addEventListener = (name, handler) => listeners.set(name, handler);
  root.setAttribute = (name, value) => { root[name] = value; };
  root.removeAttribute = (name) => { delete root[name]; };
  const status = { textContent: "", classList: { toggle() {} } };
  const retry = { hidden: true, addEventListener(name, handler) { this[name] = handler; } };
  const reload = { hidden: true, addEventListener(name, handler) { this[name] = handler; } };
  const skip = container();
  const clear = container();
  const document = {
    querySelector(selector) {
      return { "#app": root, "#save-status": status, "#retry-save": retry, "#reload-state": reload, "#skip-confirm": skip, "#clear-confirm": clear }[selector] || null;
    },
    querySelectorAll() { return root.buttons; },
    getElementById(id) { return fields.get(id) || null; },
  };
  vm.runInNewContext(appSource, {
    document,
    window: {
      confirm(message) { confirmation = message; return confirmResult; },
      location: { reload() { reloads++; } },
    },
    setTimeout(callback) { timers.set(++timerId, callback); return timerId; },
    clearTimeout(id) { timers.delete(id); },
    async fetch(url, options) {
      if (!options?.method) return { ok: true, json: async () => ({ state: clone(saved), version }) };
      const request = { url, state: JSON.parse(options.body), version: options.headers["X-LifePilot-Version"] };
      requests.push(request);
      const plan = plans.shift();
      if (plan?.gate) await plan.gate;
      const status = plan?.status || (request.version === String(version) ? 200 : 409);
      if (status !== 200) return { ok: false, status, json: async () => ({ error: status === 409 ? "Stale version" : "Synthetic save failure" }) };
      saved = url === "/api/clear" ? blankState() : clone(request.state);
      version++;
      return { ok: true, status, json: async () => ({ state: clone(saved), version }) };
    },
  });
  await settle();
  return {
    root, status, retry, reload, requests,
    get markup() { return root.markup; },
    get saved() { return clone(saved); },
    get version() { return version; },
    get renders() { return renders; },
    get headingFocus() { return headingFocus; },
    get reloads() { return reloads; },
    get confirmation() { return confirmation; },
    externalChange() { version++; saved.profile.nickname = "Other window"; },
    confirm(value) { confirmResult = value; },
    hold() {
      let release;
      plans.push({ gate: new Promise((resolve) => { release = resolve; }) });
      return release;
    },
    fail(status = 500) { plans.push({ status }); },
    input(name, value, type = "text") {
      const field = { id: name, name, value, type, checked: true, focus() {} };
      fields.set(name, field);
      listeners.get("input")({ target: field });
    },
    fireTimer() {
      assert.equal(timers.size, 1);
      const [id, callback] = [...timers][0];
      timers.delete(id);
      return callback();
    },
    capture(type, key) {
      let prevented = false;
      listeners.get(type)({ type, key, preventDefault() { prevented = true; } });
      return prevented;
    },
    button(action, stage) {
      const found = [...root.buttons, ...skip.buttons, ...clear.buttons].find((button) => button.dataset.action === action && (!stage || button.dataset.stage === stage));
      assert.ok(found, `Expected rendered button ${action} ${stage || ""}`);
      return found;
    },
    click(button) { return button.click({ currentTarget: button }); },
    action(action, stage) { return this.click(this.button(action, stage)); },
  };
}

test("transition lock covers dirty save and stage save without replacing the focused DOM", async () => {
  const state = blankState();
  state.stage = "name";
  const app = await browserFixture(state);
  app.input("nickname", "Draft");
  const releaseDirty = app.hold();
  const releaseStage = app.hold();
  const next = app.button("next");
  const moving = app.click(next);
  assert.equal(app.requests.length, 1);
  assert.equal(app.root["aria-busy"], "true");
  for (const action of ["next", "back", "later", "skip"]) await app.action(action);
  // Also exercise already-queued handlers from controls on a previous render.
  for (const action of ["remove-skip", "clear", "edit", "review"]) {
    await next.click({ currentTarget: { dataset: { action, stage: "responsibilities" } } });
  }
  app.input("nickname", "Must not change during transition");
  assert.equal(app.capture("beforeinput"), true);
  assert.equal(app.capture("click"), true);
  assert.equal(app.capture("pointerdown"), true);
  assert.equal(app.capture("mousedown"), true);
  assert.equal(app.capture("keydown", "ArrowDown"), true);
  assert.equal(app.capture("keydown", "Tab"), false);
  assert.equal(app.renders, 1);
  assert.equal(app.headingFocus, 1);
  releaseDirty();
  await settle();
  assert.equal(app.requests.length, 2);
  assert.equal(app.requests[1].version, "8");
  await app.click(next);
  assert.equal(app.renders, 1, "keep the original DOM until stage persistence completes");
  releaseStage();
  await moving;
  assert.equal(app.saved.stage, "guidance");
  assert.equal(app.saved.profile.nickname, "Draft");
  assert.equal(app.renders, 2);
  assert.equal(app.headingFocus, 2);
  assert.equal(app.root["aria-busy"], undefined);
});

test("failed dirty or stage saves release the lock and retry cannot bypass a stage", async () => {
  for (const dirty of [false, true]) {
    const state = blankState();
    state.stage = "name";
    const app = await browserFixture(state);
    if (dirty) app.input("nickname", "Synthetic");
    app.fail();
    await app.action("next");
    assert.match(app.markup, /What would you like us to call you/);
    assert.equal(app.root["aria-busy"], undefined);
    assert.equal(app.retry.hidden, false);
    await app.action("next");
    assert.equal(app.saved.stage, "guidance");
    assert.match(app.markup, /What would make guidance easier/);
  }
});

test("every successful save advances the token even with concurrent input and queued saves", async () => {
  const state = blankState();
  state.stage = "name";
  const app = await browserFixture(state);
  app.input("nickname", "First");
  const release = app.hold();
  const saving = app.fireTimer();
  app.input("nickname", "Latest draft");
  const queued = app.fireTimer();
  assert.equal(app.renders, 1);
  release();
  await Promise.all([saving, queued]);
  assert.deepEqual(app.requests.map((request) => request.version), ["7", "8"]);
  assert.equal(app.saved.profile.nickname, "Latest draft");
  assert.equal(app.renders, 1);
  assert.equal(app.retry.hidden, true);
});

test("explicit save retry recovers without navigating and locks overlapping actions", async () => {
  const state = blankState();
  state.stage = "name";
  const app = await browserFixture(state);
  app.input("nickname", "Synthetic retry");
  app.fail(400);
  assert.equal(await app.fireTimer(), false);
  assert.equal(app.retry.hidden, false);
  const release = app.hold();
  const retrying = app.retry.click();
  await app.retry.click();
  await app.action("next");
  assert.equal(app.requests.length, 2);
  release();
  await retrying;
  assert.equal(app.saved.stage, "name");
  assert.equal(app.saved.profile.nickname, "Synthetic retry");
  assert.equal(app.retry.hidden, true);
  assert.equal(app.renders, 1);
  await app.action("next");
  assert.equal(app.saved.stage, "guidance");
});

test("409 retains the draft, blocks autosave/retry/clear and requires confirmed reload", async () => {
  const state = blankState();
  state.stage = "name";
  const app = await browserFixture(state);
  app.input("nickname", "Local draft");
  const release = app.hold();
  const saving = app.fireTimer();
  app.input("nickname", "Newest local draft");
  app.externalChange();
  release();
  assert.equal(await saving, false);
  assert.match(app.status.textContent, /Save conflict/);
  assert.equal(app.retry.hidden, true);
  assert.equal(app.reload.hidden, false);
  assert.equal(app.renders, 1, "do not replace the visible input DOM with server answers");
  await app.retry.click();
  await app.action("next");
  app.input("nickname", "Still editing locally");
  assert.match(app.status.textContent, /Save conflict/);
  assert.equal(app.requests.length, 1, "no automatic adoption of a newer token or stale overwrite");
  assert.equal(app.saved.profile.nickname, "Other window");
  app.reload.click();
  assert.equal(app.reloads, 0);
  assert.match(app.confirmation, /discards your unsaved draft/);
  app.confirm(true);
  app.reload.click();
  assert.equal(app.reloads, 1);
});

test("clear serializes with pending saves, guards double clicks, and adopts returned version", async () => {
  const state = blankState();
  state.stage = "workspace";
  const app = await browserFixture(state);
  await app.action("confirm-clear");
  const clearButton = app.button("clear");
  app.input("nickname", "Pending draft");
  const releaseSave = app.hold();
  const releaseClear = app.hold();
  const saving = app.fireTimer();
  const clearing = app.click(clearButton);
  await app.click(clearButton);
  await app.action("review");
  assert.equal(app.requests.length, 1);
  releaseSave();
  await settle();
  assert.equal(app.requests.length, 2);
  assert.equal(app.requests[1].url, "/api/clear");
  assert.equal(app.requests[1].version, "8");
  assert.deepEqual(app.requests[1].state, {});
  releaseClear();
  await Promise.all([saving, clearing]);
  assert.equal(app.saved.stage, "welcome");
  await app.action("next");
  assert.equal(app.requests.at(-1).version, "9");
  assert.equal(app.saved.stage, "name");
});

test("clear conflicts leave the workspace and draft visible and prohibit repeated clears", async () => {
  const state = blankState();
  state.stage = "workspace";
  state.profile.nickname = "Synthetic";
  const app = await browserFixture(state);
  await app.action("confirm-clear");
  const clear = app.button("clear");
  app.externalChange();
  await app.click(clear);
  assert.equal(app.requests[0].url, "/api/clear");
  assert.equal(app.renders, 1);
  assert.match(app.markup, /Welcome, Synthetic/);
  assert.match(app.status.textContent, /Save conflict/);
  await app.click(clear);
  assert.equal(app.requests.length, 1);
  assert.equal(app.root["aria-busy"], undefined);
});

test("failed clear releases the lock for an explicit retry without consuming a version", async () => {
  const state = blankState();
  state.stage = "workspace";
  const app = await browserFixture(state);
  await app.action("confirm-clear");
  app.fail();
  await app.action("clear");
  assert.equal(app.saved.stage, "workspace");
  assert.equal(app.root["aria-busy"], undefined);
  assert.equal(app.reload.hidden, true);
  await app.action("clear");
  assert.deepEqual(app.requests.map((request) => request.version), ["7", "7"]);
  assert.equal(app.saved.stage, "welcome");
});

test("review Change buttons have unique escaped contextual accessible names", async () => {
  const state = blankState();
  state.stage = "review";
  state.profile.difficulty = "remembering";
  const app = await browserFixture(state);
  const labels = app.root.buttons.filter((button) => button.dataset.action === "edit").map((button) => button.attributes["aria-label"]);
  assert.equal(labels.length, 6);
  assert.equal(new Set(labels).size, 6);
  assert.ok(labels.includes("Change Nickname"));
  assert.ok(labels.includes("Change Responsibilities"));
  assert.ok(labels.includes("Change What you&#39;d like help with"));
  assert.ok(labels.every((label) => label.startsWith("Change ")));
});

test("review targeted edits return directly to review; Back also returns to review", async () => {
  const state = blankState();
  state.stage = "review";
  const app = await browserFixture(state);
  for (const stage of ["name", "guidance", "responsibilities", "location"]) {
    await app.action("edit", stage);
    assert.equal(app.saved.stage, stage);
    if (stage === "name") app.input("nickname", "Edited synthetic");
    await app.action("next");
    assert.equal(app.saved.stage, "review");
    assert.match(app.markup, /Does this look right/);
    await app.action("edit", stage);
    await app.action("back");
    assert.equal(app.saved.stage, "review");
  }
  assert.equal(app.saved.profile.nickname, "Edited synthetic");
  await app.action("next");
  assert.equal(app.saved.stage, "starting", "targeted edit must not leak into normal navigation");
});

test("difficulty edits invalidate old follow-up, offer one relevant follow-up then review", async () => {
  const state = blankState();
  state.stage = "review";
  Object.assign(state.profile, { difficulty: "remembering", followup: "other", followupOther: "Old synthetic detail" });
  const app = await browserFixture(state);
  await app.action("edit", "difficulty");
  app.input("difficulty", "starting", "radio");
  await app.action("next");
  assert.equal(app.saved.stage, "followup");
  assert.equal(app.saved.profile.followup, "");
  assert.equal(app.saved.profile.followupOther, "");
  assert.match(app.markup, /What tends to make starting difficult/);
  assert.doesNotMatch(app.markup, /Old synthetic detail/);
  await app.action("back");
  assert.equal(app.saved.stage, "difficulty");
  await app.action("next");
  assert.equal(app.saved.stage, "followup");
  app.input("followup", "tooBig", "radio");
  await app.action("next");
  assert.equal(app.saved.stage, "review");
  assert.equal(app.saved.profile.followup, "tooBig");
  await app.action("edit", "followup");
  await app.action("back");
  assert.equal(app.saved.stage, "review");
  await app.action("edit", "difficulty");
  app.input("difficulty", "unsure", "radio");
  await app.action("next");
  assert.equal(app.saved.stage, "review");
  assert.equal(app.saved.profile.followup, "");
  await app.action("edit", "difficulty");
  await app.action("skip");
  await app.action("remove-skip");
  assert.equal(app.saved.stage, "review");
  assert.equal(app.saved.profile.difficulty, "");
  assert.equal(app.saved.profile.followupOther, "");
});

test("normal setup keeps the full sequence and optional skips do not create edit context", async () => {
  const app = await browserFixture(blankState());
  for (const expected of ["name", "guidance", "responsibilities", "location", "difficulty"]) {
    await app.action("next");
    assert.equal(app.saved.stage, expected);
  }
  await app.action("skip");
  assert.equal(app.saved.stage, "review");
  await app.action("next");
  assert.equal(app.saved.stage, "starting");
  await app.action("next");
  assert.equal(app.saved.stage, "workspace");
  assert.equal(app.saved.resumeStage, "starting");
});

test("workspace guidance shortcut returns home without replacing setup resume point", async () => {
  const state = blankState();
  state.stage = "workspace";
  state.resumeStage = "responsibilities";
  const app = await browserFixture(state);
  await app.action("edit", "guidance");
  app.input("guidance", "smallerSteps", "checkbox");
  await app.action("next");
  assert.equal(app.saved.stage, "workspace");
  assert.equal(app.saved.resumeStage, "responsibilities");
  assert.deepEqual(app.saved.profile.guidance, ["smallerSteps"]);
  await app.action("resume");
  assert.equal(app.saved.stage, "responsibilities");
  await app.action("next");
  assert.equal(app.saved.stage, "location");
});

test("reloading mid targeted edit preserves saved answers/stage but resets session return context", async () => {
  const state = blankState();
  state.stage = "review";
  const app = await browserFixture(state);
  await app.action("edit", "name");
  app.input("nickname", "Saved synthetic");
  await app.fireTimer();
  const reloaded = await browserFixture(app.saved);
  assert.match(reloaded.markup, /Saved synthetic/);
  await reloaded.action("next");
  assert.equal(reloaded.saved.stage, "guidance");
});
