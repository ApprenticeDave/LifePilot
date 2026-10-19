const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const { DatabaseSync } = require("node:sqlite");
const { createStore, createServer, isLoopbackHost, isSameOrigin } = require("../server");
const { blankState } = require("../model");

function temporaryDatabase() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "lifepilot-test-"));
  return { directory, location: path.join(directory, "state.sqlite") };
}

test("SQLite profile and resume progress persist after store reopen", (t) => {
  const { directory, location } = temporaryDatabase();
  let store = createStore(location);
  t.after(() => { store.close(); fs.rmSync(directory, { recursive: true, force: true }); });
  const expected = blankState();
  expected.stage = "workspace";
  expected.resumeStage = "difficulty";
  expected.profile.nickname = "Sample nickname";
  expected.profile.guidance = ["smallerSteps", "overviewFirst"];
  expected.profile.responsibilities = ["financialGoals", "moneyBills"];
  expected.profile.difficulty = "finding";
  expected.profile.followup = "documents";
  assert.equal(store.getVersion(), 0);
  store.save(expected, 0);
  expected.profile.responsibilities = ["moneyBills"];
  store.close();

  store = createStore(location);
  assert.deepEqual(store.load(), expected);
  assert.deepEqual(store.loadTasks(), []);
  assert.equal(store.getVersion(), 1);
});

test("invalid state cannot overwrite existing saved profile", (t) => {
  const { directory, location } = temporaryDatabase();
  const store = createStore(location);
  t.after(() => { store.close(); fs.rmSync(directory, { recursive: true, force: true }); });
  const valid = blankState();
  valid.profile.nickname = "Keep this";
  store.save(valid, 0);
  assert.throws(() => store.save({ ...valid, profile: { ...valid.profile, timeZone: "Invalid/Zone" } }, 1), /valid time zone/);
  for (const version of [undefined, -1, 1.5, "1", Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => store.save(valid, version), /version/);
    assert.throws(() => store.clear(version), /version/);
  }
  assert.equal(store.load().profile.nickname, "Keep this");
  assert.equal(store.getVersion(), 1);
});

test("two store connections reject stale writes and preserve clear revisions across reopen", (t) => {
  const { directory, location } = temporaryDatabase();
  let first = createStore(location);
  const second = createStore(location);
  t.after(() => {
    first.close();
    second.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const oldState = blankState();
  oldState.profile.nickname = "Older synthetic profile";
  const newerState = blankState();
  newerState.profile.nickname = "Newer synthetic profile";
  const oldVersion = first.getVersion();
  second.save(newerState, second.getVersion());
  assert.throws(() => first.save(oldState, oldVersion), /stale.*Reload/);
  assert.throws(() => first.clear(oldVersion), /stale.*Reload/);
  assert.deepEqual(first.load(), newerState);
  assert.equal(first.getVersion(), 1);
  second.clear(1);
  assert.equal(first.getVersion(), 2);
  first.close();
  first = createStore(location);
  assert.deepEqual(first.load(), blankState());
  assert.equal(first.getVersion(), 2);
  assert.throws(() => first.save(oldState, 1), /stale.*Reload/);
  assert.deepEqual(second.load(), blankState());
  assert.equal(second.getVersion(), 2);
  first.clear(2);
  assert.equal(second.getVersion(), 3, "even an already blank clear advances the tombstone");
  second.save(newerState, 3);
  assert.equal(first.getVersion(), 4);
  assert.deepEqual(first.load(), newerState);
});

test("existing profile database gains revision metadata without losing profile data", (t) => {
  const { directory, location } = temporaryDatabase();
  const legacy = new DatabaseSync(location);
  const expected = blankState();
  expected.profile.nickname = "Synthetic legacy profile";
  legacy.exec(`CREATE TABLE local_state (
    id INTEGER PRIMARY KEY CHECK (id = 1), state_json TEXT NOT NULL, updated_at TEXT NOT NULL
  )`);
  legacy.prepare("INSERT INTO local_state VALUES (1, ?, ?)").run(JSON.stringify(expected), "2026-01-01");
  legacy.close();
  const store = createStore(location);
  t.after(() => { store.close(); fs.rmSync(directory, { recursive: true, force: true }); });
  assert.deepEqual(store.load(), expected);
  assert.equal(store.getVersion(), 0);
  store.save(expected, 0);
  assert.equal(store.getVersion(), 1);
});

test("failed SQL write rolls back revision and leaves the connection usable", (t) => {
  const { directory, location } = temporaryDatabase();
  const store = createStore(location);
  const control = new DatabaseSync(location);
  t.after(() => {
    control.close();
    store.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });
  control.exec(`CREATE TRIGGER reject_save BEFORE INSERT ON local_state
    BEGIN SELECT RAISE(ABORT, 'synthetic write failure'); END`);
  assert.throws(() => store.save(blankState(), 0), /synthetic write failure/);
  assert.equal(store.getVersion(), 0);
  assert.deepEqual(store.load(), blankState());
  control.exec("DROP TRIGGER reject_save");
  control.exec(`CREATE TRIGGER reject_save BEFORE INSERT ON local_state
    BEGIN SELECT RAISE(ROLLBACK, 'synthetic automatic rollback'); END`);
  assert.throws(() => store.save(blankState(), 0), /synthetic automatic rollback/);
  assert.equal(store.getVersion(), 0);
  control.exec("DROP TRIGGER reject_save");
  store.save(blankState(), 0);
  control.exec(`CREATE TRIGGER reject_clear BEFORE DELETE ON local_state
    BEGIN SELECT RAISE(ABORT, 'synthetic clear failure'); END`);
  assert.throws(() => store.clear(1), /synthetic clear failure/);
  assert.equal(store.getVersion(), 1);
  control.exec("DROP TRIGGER reject_clear");
  store.clear(1);
  assert.equal(store.getVersion(), 2);
});

test("HTTP allowlist serves app files, rejects arbitrary paths and protects mutations", async (t) => {
  const { directory, location } = temporaryDatabase();
  const store = createStore(location);
  const server = createServer({ store });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    store.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;
  const read = await fetch(`${base}/`);
  assert.equal(read.status, 200);
  assert.match(read.headers.get("content-type"), /text\/html/);
  assert.equal((await fetch(`${base}/server.js`)).status, 404);
  assert.equal((await fetch(`${base}/%2e%2e/server.js`)).status, 404);
  const initial = await fetch(`${base}/api/state`);
  assert.equal(initial.status, 200);
  assert.deepEqual(await initial.json(), { state: blankState(), tasks: [], version: 0 });

  const body = JSON.stringify({ ...blankState(), profile: { ...blankState().profile, nickname: "Saved locally" } });
  const invalidOrigin = await fetch(`${base}/api/state`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-LifePilot-Request": "1", "X-LifePilot-Version": "0", Origin: "http://attacker.invalid" },
    body,
  });
  assert.equal(invalidOrigin.status, 403);
  const missingHeader = await fetch(`${base}/api/state`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-LifePilot-Version": "0", Origin: base },
    body,
  });
  assert.equal(missingHeader.status, 403);
  const headers = { "Content-Type": "application/json", "X-LifePilot-Request": "1", Origin: base };
  for (const endpoint of ["state", "clear"]) {
    for (const version of [undefined, "", "-1", "1.5", "NaN", "1e0", "0x0", "9007199254740992", "0, 0"]) {
      const invalid = await fetch(`${base}/api/${endpoint}`, {
        method: "POST",
        headers: { ...headers, ...(version === undefined ? {} : { "X-LifePilot-Version": version }) },
        body: endpoint === "clear" ? "{}" : body,
      });
      assert.equal(invalid.status, 400, `${endpoint}: ${version}`);
      assert.deepEqual(Object.keys(await invalid.json()), ["error"]);
      assert.equal(store.getVersion(), 0);
    }
  }
  const wrongType = await fetch(`${base}/api/state`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "text/plain", "X-LifePilot-Version": "0" },
    body,
  });
  assert.equal(wrongType.status, 403);
  const saved = await fetch(`${base}/api/state`, {
    method: "POST",
    headers: { ...headers, "X-LifePilot-Version": "0" },
    body,
  });
  assert.equal(saved.status, 200);
  assert.deepEqual(await saved.json(), { state: JSON.parse(body), version: 1 });
  for (const endpoint of ["state", "clear"]) {
    const stale = await fetch(`${base}/api/${endpoint}`, {
      method: "POST",
      headers: { ...headers, "X-LifePilot-Version": "0" },
      body: endpoint === "clear" ? "{}" : JSON.stringify(blankState()),
    });
    assert.equal(stale.status, 409);
    const error = await stale.json();
    assert.deepEqual(Object.keys(error), ["error"]);
    assert.match(error.error, /stale.*Reload/);
    assert.equal(store.load().profile.nickname, "Saved locally");
    assert.equal(store.getVersion(), 1);
  }
  for (const [endpoint, invalidBody] of [["state", "{}"], ["state", "{"], ["clear", '{"unexpected":true}']]) {
    const invalid = await fetch(`${base}/api/${endpoint}`, {
      method: "POST", headers: { ...headers, "X-LifePilot-Version": "1" }, body: invalidBody,
    });
    assert.equal(invalid.status, 400);
    assert.equal(store.getVersion(), 1);
  }
  const tooLarge = await fetch(`${base}/api/clear`, {
    method: "POST",
    headers: { ...headers, "X-LifePilot-Version": "1" },
    body: JSON.stringify({ pad: "x".repeat(33 * 1024) }),
  });
  assert.equal(tooLarge.status, 413);
  assert.equal((await (await fetch(`${base}/api/state`)).json()).state.profile.nickname, "Saved locally");
  const cleared = await fetch(`${base}/api/clear`, {
    method: "POST",
    headers: { ...headers, "X-LifePilot-Version": "1" },
    body: "{}",
  });
  assert.equal(cleared.status, 200);
  assert.deepEqual(await cleared.json(), { state: blankState(), tasks: [], version: 2 });
  const resurrection = await fetch(`${base}/api/state`, {
    method: "POST", headers: { ...headers, "X-LifePilot-Version": "1" }, body,
  });
  assert.equal(resurrection.status, 409);
  assert.deepEqual(await (await fetch(`${base}/api/state`)).json(), { state: blankState(), tasks: [], version: 2 });

  for (const host of [`example.invalid:${address.port}`, "localhost", "127.0.0.1", `localhost:${address.port === 4173 ? 4174 : 4173}`]) {
    const wrongHost = await new Promise((resolve, reject) => {
      const request = http.request({ hostname: "127.0.0.1", port: address.port, path: "/", headers: { Host: host } }, (response) => {
        response.resume();
        resolve(response);
      });
      request.on("error", reject);
      request.end();
    });
    assert.equal(wrongHost.statusCode, 421, host);
  }
});

test("only loopback Host headers are accepted", () => {
  assert.equal(isLoopbackHost("127.0.0.1:4173"), true);
  assert.equal(isLoopbackHost("localhost:4173"), true);
  assert.equal(isLoopbackHost("example.org:4173"), false);
  assert.equal(isLoopbackHost("127.0.0.1.evil:4173"), false);
  for (const host of ["localhost", "127.0.0.1", "localhost:80", "127.0.0.1:80", "LOCALHOST:80"]) {
    assert.equal(isLoopbackHost(host, 80), true, host);
    assert.equal(isLoopbackHost(host, 4173), false, host);
  }
  assert.equal(isLoopbackHost("localhost:4173", 4173), true);
  for (const host of [undefined, "", "localhost:", "localhost:0", "localhost:65536", "localhost:abc",
    "localhost:80/path", "localhost:80?", "localhost:80#fragment", "user@localhost:80",
    " localhost:80", "localhost:80 ", "localhost.:80", "127.1:80", "2130706433:80", "[::1]:80",
    "localhost:80:90", "localhost:80\\evil", "localhost:000080"]) {
    assert.equal(isLoopbackHost(host), false, String(host));
  }
});

test("same-origin checks normalize default HTTP port but preserve exact loopback origin", () => {
  const sameOrigin = (host, origin, port = 80) => isSameOrigin({ headers: { host, origin } }, port);
  assert.equal(sameOrigin("localhost", "http://localhost"), true);
  assert.equal(sameOrigin("localhost:80", "http://localhost"), true);
  assert.equal(sameOrigin("localhost", "http://localhost:80"), true);
  assert.equal(sameOrigin("127.0.0.1", "http://127.0.0.1:80"), true);
  assert.equal(sameOrigin("LOCALHOST:80", "http://localhost"), true);
  assert.equal(sameOrigin("localhost:4173", "http://localhost:4173", 4173), true);
  assert.equal(sameOrigin("localhost:4173", "http://localhost:4173", 4174), false);
  for (const origin of [undefined, "null", "https://localhost", "http://127.0.0.1", "http://localhost:81",
    "http://localhost/", "http://localhost?query", "http://user@localhost", "http://localhost.evil",
    "http://localhost#fragment", "http://localhost:80/path"]) {
    assert.equal(sameOrigin("localhost", origin), false, String(origin));
  }
});

test("tasks persist independently of setup, support edit/complete/reopen, and clear atomically", (t) => {
  const { directory, location } = temporaryDatabase();
  let store = createStore(location);
  const second = createStore(location);
  const control = new DatabaseSync(location);
  t.after(() => {
    control.close();
    second.close();
    store.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const profile = blankState();
  profile.profile.nickname = "Synthetic task owner";
  store.save(profile, 0);
  const [first] = store.addTask({ title: "  Arrange a boiler service  ", completed: false }, 1);
  assert.match(first.id, /^[0-9a-f-]{36}$/);
  assert.equal(first.title, "Arrange a boiler service");
  const newest = store.addTask({ title: "Find the synthetic manual", completed: false }, 2);
  assert.equal(newest[1].id, first.id, "newest capture is listed first");
  assert.deepEqual(store.load(), profile);
  store.save({ ...profile, stage: "workspace" }, 3);
  assert.deepEqual(store.loadTasks(), newest, "profile saves never overwrite tasks");
  assert.throws(() => second.updateTask(first.id, { title: "Stale edit", completed: true }, 3), /stale/);
  assert.throws(() => second.clear(3), /stale/);
  store.updateTask(first.id, { title: "Arrange the service", completed: true }, 4);
  store.close();
  store = createStore(location);
  assert.deepEqual(store.loadTasks()[1], { id: first.id, title: "Arrange the service", completed: true });
  store.updateTask(first.id, { title: "Arrange the service", completed: false }, 5);
  assert.equal(store.loadTasks()[1].completed, false);
  assert.equal(store.load().stage, "workspace");

  control.exec(`CREATE TRIGGER reject_clear_tasks BEFORE DELETE ON local_state
    BEGIN SELECT RAISE(ABORT, 'synthetic clear failure'); END`);
  assert.throws(() => store.clear(6), /synthetic clear failure/);
  assert.equal(store.loadTasks().length, 2, "failed clear rolls back task deletion too");
  assert.equal(store.getVersion(), 6);
  control.exec("DROP TRIGGER reject_clear_tasks");
  store.clear(6);
  assert.deepEqual(store.loadTasks(), []);
  assert.deepEqual(store.load(), blankState());
  store.close();
  store = createStore(location);
  assert.equal(store.getVersion(), 7);
  assert.deepEqual(store.loadTasks(), []);
  assert.throws(() => second.addTask({ title: "Must not restore anything", completed: false }, 6), /stale/);
});

test("task validation, missing records and SQL failures do not consume a revision", (t) => {
  const { directory, location } = temporaryDatabase();
  const store = createStore(location);
  const control = new DatabaseSync(location);
  t.after(() => {
    control.close();
    store.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });
  for (const task of [{ title: "", completed: false }, { title: "x".repeat(241), completed: false },
    { title: "Task", completed: true }, { title: "Task", completed: false, extra: true }]) {
    assert.throws(() => store.addTask(task, 0));
    assert.equal(store.getVersion(), 0);
  }
  assert.throws(() => store.updateTask("missing", { title: "Task", completed: false }, 0), /not be found/);
  assert.equal(store.getVersion(), 0);
  control.exec(`CREATE TRIGGER reject_task BEFORE INSERT ON local_tasks
    BEGIN SELECT RAISE(ABORT, 'synthetic task failure'); END`);
  assert.throws(() => store.addTask({ title: "Task", completed: false }, 0), /synthetic task failure/);
  assert.equal(store.getVersion(), 0);
  assert.deepEqual(store.loadTasks(), []);
  control.exec("DROP TRIGGER reject_task");
  const [task] = store.addTask({ title: "Task", completed: false }, 0);
  assert.throws(() => store.updateTask(task.id, { title: " ", completed: false }, 1));
  assert.equal(store.getVersion(), 1);
  assert.deepEqual(store.loadTasks(), [task]);
});

test("HTTP task API shares revision and origin protections with profile and clear", async (t) => {
  const { directory, location } = temporaryDatabase();
  const store = createStore(location);
  const server = createServer({ store });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    store.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const headers = { "Content-Type": "application/json", "X-LifePilot-Request": "1", Origin: base };
  const post = (endpoint, data, version) => fetch(`${base}/api/${endpoint}`, {
    method: "POST", headers: { ...headers, "X-LifePilot-Version": String(version) }, body: JSON.stringify(data),
  });
  const input = { title: '<img src=x onerror="alert(1)">', completed: false };
  const newTask = await post("tasks", input, 0);
  assert.equal(newTask.status, 200);
  const added = await newTask.json();
  assert.equal(added.version, 1);
  assert.equal(added.tasks[0].title, input.title, "text is stored verbatim, not interpreted");
  const endpoint = `tasks/${added.tasks[0].id}`;
  for (const target of ["tasks", endpoint]) {
    for (const override of [
      { Origin: "http://attacker.invalid" }, { "X-LifePilot-Request": "" },
      { "Content-Type": "text/plain" }, { Origin: "null" },
    ]) {
      assert.equal((await fetch(`${base}/api/${target}`, {
        method: "POST", headers: { ...headers, "X-LifePilot-Version": "1", ...override }, body: JSON.stringify(input),
      })).status, 403);
    }
    assert.equal((await post(target, input, 0)).status, 409);
    assert.equal((await post(target, input, "invalid")).status, 400);
    assert.equal((await post(target, { ...input, title: " " }, 1)).status, 400);
    assert.equal((await post(target, { ...input, title: "x".repeat(241) }, 1)).status, 400);
    assert.equal((await post(target, { ...input, title: "x".repeat(33 * 1024) }, 1)).status, 413);
  }
  assert.equal((await post("state", blankState(), 0)).status, 409);
  assert.equal((await post("tasks/00000000-0000-0000-0000-000000000000", input, 1)).status, 404);
  assert.equal((await post("tasks/invalid", input, 1)).status, 404);
  assert.equal(store.getVersion(), 1);
  const edited = await post(endpoint, { title: "Arrange a boiler service", completed: true }, 1);
  assert.equal(edited.status, 200);
  assert.equal((await edited.json()).tasks[0].completed, true);
  assert.equal((await post(endpoint, { title: "Arrange a boiler service", completed: false }, 2)).status, 200);
  const read = await fetch(`${base}/api/state`);
  assert.equal(read.headers.get("cache-control"), "no-store");
  const saved = await read.json();
  assert.equal(saved.tasks[0].completed, false);
  assert.equal(saved.version, 3);
  assert.equal((await post("clear", {}, 3)).status, 200);
  assert.equal((await post(endpoint, input, 3)).status, 409);
  assert.equal((await post("tasks", input, 3)).status, 409);
  assert.deepEqual((await (await fetch(`${base}/api/state`)).json()).tasks, []);
});
