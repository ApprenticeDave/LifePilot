const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");
const { validateState, validateTask, blankState, InvalidState } = require("./model");

const PORT = Number(process.env.PORT || 4173);
const DATA_DIR = path.join(__dirname, ".data");
const DB_PATH = process.env.LIFEPILOT_DB_PATH || path.join(DATA_DIR, "lifepilot.sqlite");
const MAX_BODY = 32 * 1024;
const STATIC = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
]);

class StaleVersion extends Error {
  constructor() {
    super("This local data is stale. Reload LifePilot before making changes.");
  }
}

class TaskNotFound extends Error {
  constructor() {
    super("That task could not be found. Reload LifePilot to see saved tasks.");
  }
}

function validateVersion(version) {
  if (!Number.isSafeInteger(version) || version < 0) {
    throw new InvalidState("A valid nonnegative setup version is required.");
  }
}

function createStore(databasePath) {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new DatabaseSync(databasePath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = FULL;
    CREATE TABLE IF NOT EXISTS local_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      state_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS local_revision (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      version INTEGER NOT NULL CHECK (version >= 0 AND version <= 9007199254740991)
    );
    INSERT OR IGNORE INTO local_revision (id, version) VALUES (1, 0);
    CREATE TABLE IF NOT EXISTS local_tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 240),
      completed INTEGER NOT NULL CHECK (completed IN (0, 1))
    );
  `);
  function mutate(expectedVersion, write) {
    validateVersion(expectedVersion);
    db.exec("BEGIN IMMEDIATE");
    try {
      const result = db.prepare(`UPDATE local_revision SET version = version + 1
        WHERE id = 1 AND version = ? AND version < 9007199254740991`).run(expectedVersion);
      if (result.changes !== 1) throw new StaleVersion();
      const state = write();
      db.exec("COMMIT");
      return state;
    } catch (error) {
      // SQLite can already have rolled back (for example, a RAISE(ROLLBACK) trigger).
      // Preserve the original failure rather than replacing it with a rollback error.
      try { db.exec("ROLLBACK"); } catch {}
      throw error;
    }
  }
  function loadTasks() {
    return db.prepare("SELECT id, title, completed FROM local_tasks ORDER BY rowid DESC").all()
      .map((row) => ({ id: row.id, ...validateTask({ title: row.title, completed: row.completed === 1 }) }));
  }
  return {
    getVersion() {
      return db.prepare("SELECT version FROM local_revision WHERE id = 1").get().version;
    },
    load() {
      const row = db.prepare("SELECT state_json FROM local_state WHERE id = 1").get();
      if (!row) return blankState();
      try {
        return validateState(JSON.parse(row.state_json));
      } catch {
        throw new Error("Saved setup data could not be read safely.");
      }
    },
    save(state, expectedVersion) {
      const valid = validateState(state);
      return mutate(expectedVersion, () => {
        db.prepare(`INSERT INTO local_state (id, state_json, updated_at) VALUES (1, ?, ?)
          ON CONFLICT(id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at`)
          .run(JSON.stringify(valid), new Date().toISOString());
        return valid;
      });
    },
    loadTasks,
    addTask(task, expectedVersion) {
      const valid = validateTask(task);
      if (valid.completed) throw new InvalidState("New tasks must start unfinished.");
      return mutate(expectedVersion, () => {
        db.prepare("INSERT INTO local_tasks (id, title, completed) VALUES (?, ?, 0)")
          .run(randomUUID(), valid.title);
        return loadTasks();
      });
    },
    updateTask(id, task, expectedVersion) {
      const valid = validateTask(task);
      return mutate(expectedVersion, () => {
        const result = db.prepare("UPDATE local_tasks SET title = ?, completed = ? WHERE id = ?")
          .run(valid.title, Number(valid.completed), id);
        if (result.changes !== 1) throw new TaskNotFound();
        return loadTasks();
      });
    },
    clear(expectedVersion) {
      return mutate(expectedVersion, () => {
        db.prepare("DELETE FROM local_tasks").run();
        db.prepare("DELETE FROM local_state WHERE id = 1").run();
        return blankState();
      });
    },
    close() { db.close(); },
  };
}

function json(response, status, value) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  });
  response.end(JSON.stringify(value));
}

function isLoopbackHost(host, expectedPort) {
  if (typeof host !== "string") return false;
  if (!/^(localhost|127\.0\.0\.1)(?::\d{1,5})?$/i.test(host)) return false;
  try {
    const parsed = new URL(`http://${host}`);
    const port = Number(parsed.port || 80);
    return port >= 1 && port <= 65535 && (expectedPort === undefined || port === expectedPort);
  } catch {
    return false;
  }
}

function isSameOrigin(request, expectedPort) {
  if (!isLoopbackHost(request.headers.host, expectedPort)) return false;
  const origin = request.headers.origin;
  if (typeof origin !== "string" || !origin.startsWith("http://") ||
      !isLoopbackHost(origin.slice(7), expectedPort)) return false;
  try {
    const parsed = new URL(origin);
    return parsed.host === new URL(`http://${request.headers.host}`).host;
  } catch {
    return false;
  }
}

async function readBody(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY) throw Object.assign(new Error("Request is too large."), { status: 413 });
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function createServer({ store = createStore(DB_PATH), publicDir = path.join(__dirname, "public") } = {}) {
  return http.createServer(async (request, response) => {
    const pathname = (() => {
      try { return new URL(request.url, "http://localhost").pathname; }
      catch { return ""; }
    })();
    const boundPort = request.socket.localPort;
    if (!isLoopbackHost(request.headers.host, boundPort)) {
      response.writeHead(421, { "Cache-Control": "no-store" });
      response.end("Local access only");
      return;
    }
    if (pathname.startsWith("/api/")) {
      if (request.method === "GET" && pathname === "/api/state") {
        try {
          // Retry if another database connection writes between these synchronous reads.
          let version, state, tasks;
          do {
            version = store.getVersion();
            state = store.load();
            tasks = store.loadTasks();
          } while (version !== store.getVersion());
          return json(response, 200, { state, tasks, version });
        }
        catch { return json(response, 500, { error: "Could not read saved local data. Your local data has not been changed." }); }
      }
      const taskMatch = /^\/api\/tasks\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/.exec(pathname);
      if (request.method === "POST" && (pathname === "/api/state" || pathname === "/api/clear" ||
          pathname === "/api/tasks" || taskMatch)) {
        if (!isSameOrigin(request, boundPort) || request.headers["x-lifepilot-request"] !== "1" ||
            !/^application\/json(?:\s*;|$)/i.test(request.headers["content-type"] || "")) {
          return json(response, 403, { error: "This local request was not accepted. Reload LifePilot and try again." });
        }
        const header = request.headers["x-lifepilot-version"];
        if (typeof header !== "string" || !/^\d+$/.test(header) ||
            !Number.isSafeInteger(Number(header))) {
          return json(response, 400, { error: "A valid nonnegative setup version is required." });
        }
        const expectedVersion = Number(header);
        try {
          const input = await readBody(request);
          if (pathname === "/api/clear") {
            if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).length !== 0) {
              return json(response, 400, { error: "The clear request was not valid." });
            }
            return json(response, 200, { state: store.clear(expectedVersion), tasks: [], version: expectedVersion + 1 });
          }
          if (pathname === "/api/tasks" || taskMatch) {
            const tasks = taskMatch ? store.updateTask(taskMatch[1], input, expectedVersion) :
              store.addTask(input, expectedVersion);
            return json(response, 200, { tasks, version: expectedVersion + 1 });
          }
          return json(response, 200, { state: store.save(input, expectedVersion), version: expectedVersion + 1 });
        } catch (error) {
          if (error instanceof StaleVersion) return json(response, 409, { error: error.message });
          if (error instanceof TaskNotFound) return json(response, 404, { error: error.message });
          if (error.status === 413) return json(response, 413, { error: "Request is too large." });
          if (error instanceof InvalidState) return json(response, 400, { error: error.message });
          if (error instanceof SyntaxError) return json(response, 400, { error: "Request must contain valid JSON." });
          return json(response, 500, { error: "Could not save local data. Check that the database is available and retry." });
        }
      }
      return json(response, 404, { error: "Not found." });
    }
    if (request.method !== "GET" || !STATIC.has(pathname)) {
      response.writeHead(404, { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
      response.end("Not found");
      return;
    }
    const [filename, contentType] = STATIC.get(pathname);
    try {
      const content = fs.readFileSync(path.join(publicDir, filename));
      response.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
        "Referrer-Policy": "no-referrer",
      });
      response.end(content);
    } catch {
      response.writeHead(500, { "Cache-Control": "no-store" });
      response.end("LifePilot could not open its local interface.");
    }
  });
}

if (require.main === module) {
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    console.error("PORT must be an integer between 1 and 65535.");
    process.exit(1);
  }
  const store = createStore(DB_PATH);
  const server = createServer({ store });
  server.listen(PORT, "127.0.0.1", () => {
    console.log(`LifePilot is available at http://127.0.0.1:${PORT}`);
    console.log("Local-only server. Profile and task data stay on this computer.");
  });
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => server.close(() => { store.close(); process.exit(0); }));
  }
}

module.exports = { createStore, createServer, isSameOrigin, isLoopbackHost };
