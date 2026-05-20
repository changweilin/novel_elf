import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("story API seeds, creates, saves, renames, and archives Markdown stories", async () => {
  const tmp = await mkdtemp(join(tmpdir(), "novel-elf-api-"));
  const port = 19000 + Math.floor(Math.random() * 1000);
  const server = spawn(process.execPath, [
    "dev-server.mjs",
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
    "--stories-root",
    join(tmp, "stories")
  ], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitForServer(server);
    const base = `http://127.0.0.1:${port}`;

    const listed = await request(`${base}/api/stories`);
    assert.ok(listed.stories.length >= 1);
    assert.equal(listed.stories[0].id, "aevenmere");

    const created = await request(`${base}/api/stories`, {
      method: "POST",
      body: JSON.stringify({ title: "Empty Draft" })
    });
    assert.equal(created.story.name, "Empty Draft");
    assert.equal(created.world.events.length, 0);
    assert.ok(created.world.eras.length >= 1);

    created.world.events.push({
      id: "ev_first",
      year: 0,
      title: "First Mark",
      body: "A test event.",
      placeId: null,
      participants: []
    });
    const saved = await request(`${base}/api/stories/${created.story.id}`, {
      method: "PUT",
      body: JSON.stringify({ world: created.world })
    });
    assert.equal(saved.world.events.length, 1);

    const renamed = await request(`${base}/api/stories/${created.story.id}`, {
      method: "PATCH",
      body: JSON.stringify({ name: "Renamed Draft" })
    });
    assert.equal(renamed.story.name, "Renamed Draft");

    const detail = await request(`${base}/api/stories/${created.story.id}`);
    assert.equal(detail.world.events[0].id, "ev_first");

    const archived = await request(`${base}/api/stories/${created.story.id}`, { method: "DELETE" });
    assert.ok(archived.ok);
    assert.ok(!archived.stories.some((story) => story.id === created.story.id));
  } finally {
    server.kill();
    await onceExit(server);
    await rm(tmp, { recursive: true, force: true });
  }
});

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`);
  }
  return response.json();
}

function waitForServer(server) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timed out waiting for dev server")), 8000);
    const onData = (chunk) => {
      const text = chunk.toString("utf8");
      if (text.includes("Local:")) {
        clearTimeout(timeout);
        cleanup();
        resolve();
      }
    };
    const onError = (chunk) => {
      const text = chunk.toString("utf8");
      if (text.includes("EADDRINUSE")) {
        clearTimeout(timeout);
        cleanup();
        reject(new Error(text));
      }
    };
    const onExit = (code) => {
      clearTimeout(timeout);
      cleanup();
      reject(new Error(`Server exited before ready: ${code}`));
    };
    const cleanup = () => {
      server.stdout.off("data", onData);
      server.stderr.off("data", onError);
      server.off("exit", onExit);
    };
    server.stdout.on("data", onData);
    server.stderr.on("data", onError);
    server.on("exit", onExit);
  });
}

function onceExit(server) {
  return new Promise((resolve) => {
    if (server.exitCode != null || server.signalCode != null) {
      resolve();
      return;
    }
    server.once("exit", resolve);
  });
}
