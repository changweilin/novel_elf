import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
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

test("article API indexes chapters, reads article context, and writes safe drafts", async () => {
  const tmp = await mkdtemp(join(tmpdir(), "novel-elf-article-api-"));
  const port = 20000 + Math.floor(Math.random() * 1000);
  const storiesRoot = join(tmp, "stories");
  const server = spawn(process.execPath, [
    "dev-server.mjs",
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
    "--stories-root",
    storiesRoot
  ], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitForServer(server);
    const base = `http://127.0.0.1:${port}`;

    const listed = await request(`${base}/api/stories`);
    const storyId = listed.stories[0].id;
    const indexed = await request(`${base}/api/stories/${storyId}/articles`);
    const chapter = indexed.articles.find((article) => article.kind === "chapter");

    assert.ok(chapter, "expected at least one chapter in article index");
    assert.ok(chapter.id.startsWith("chapter:"));
    assert.ok(chapter.path.startsWith("library/"));
    assert.ok(chapter.wordCount >= 0);
    assert.ok(chapter.updatedAt);

    const detail = await request(`${base}/api/stories/${storyId}/articles/${encodeURIComponent(chapter.id)}`);
    assert.equal(detail.article.id, chapter.id);
    assert.equal(detail.frontmatter.id, chapter.chapterId);
    assert.equal(typeof detail.markdownBody, "string");
    assert.ok(Array.isArray(detail.outline));
    assert.ok(Array.isArray(detail.chunks));
    assert.ok(detail.relatedWorld.story.id);
    assert.ok("previous" in detail.adjacentChapters);
    assert.ok("next" in detail.adjacentChapters);

    const tasks = await request(`${base}/api/article-tasks`);
    assert.deepEqual(
      ["check_consistency", "continue_article", "propose_patch", "read_article", "rewrite_section", "summarize_article", "sync_article_to_world"].sort(),
      tasks.tasks.map((item) => item.task).sort()
    );
    assert.ok(tasks.tasks.find((item) => item.task === "propose_patch").allowedWrites.includes("draft"));

    const context = await request(`${base}/api/stories/${storyId}/articles/${encodeURIComponent(chapter.id)}/context?task=rewrite_section&maxChars=3000`);
    assert.equal(context.task, "rewrite_section");
    assert.equal(context.schema.task, "rewrite_section");
    assert.ok(context.budget.usedChars <= context.budget.maxChars);
    assert.ok(context.sections.some((section) => section.kind === "article"));
    assert.ok(context.sections.some((section) => section.kind === "article_body"));

    const quality = await request(`${base}/api/stories/${storyId}/articles/${encodeURIComponent(chapter.id)}/quality`);
    assert.equal(quality.ok, true);
    assert.equal(quality.checks.find((check) => check.id === "markdown_parse").status, "pass");
    assert.equal(quality.checks.find((check) => check.id === "world_sync").status, "pass");
    assert.equal(quality.checks.find((check) => check.id === "consistency").status, "pass");

    const nextBody = `${detail.markdownBody.trim()}\n\nDraft-only test line.`;
    const draft = await request(`${base}/api/stories/${storyId}/articles/${encodeURIComponent(chapter.id)}/drafts`, {
      method: "POST",
      body: JSON.stringify({
        markdownBody: nextBody,
        frontmatterPatch: { status: "revising" }
      })
    });

    assert.equal(draft.draft.articleId, chapter.id);
    assert.equal(draft.draft.applied, false);
    assert.ok(draft.draft.path.startsWith("_drafts/articles/"));
    assert.match(draft.diffPreview, /\+Draft-only test line\./);

    const draftText = await readFile(join(storiesRoot, storyId, draft.draft.path), "utf8");
    assert.match(draftText, /"status": "revising"/);
    assert.match(draftText, /Draft-only test line\./);

    const patchDraft = await request(`${base}/api/stories/${storyId}/articles/${encodeURIComponent(chapter.id)}/drafts`, {
      method: "POST",
      body: JSON.stringify({
        bodyPatch: { type: "append", text: "Patch-only test line." },
        frontmatterPatch: { status: "patch-proposed" }
      })
    });
    assert.equal(patchDraft.draft.patchType, "append");
    assert.match(patchDraft.diffPreview, /\+Patch-only test line\./);

    const patchDraftText = await readFile(join(storiesRoot, storyId, patchDraft.draft.path), "utf8");
    assert.match(patchDraftText, /"status": "patch-proposed"/);
    assert.match(patchDraftText, /Patch-only test line\./);

    const missingRefsDraft = await request(`${base}/api/stories/${storyId}/articles/${encodeURIComponent(chapter.id)}/drafts`, {
      method: "POST",
      body: JSON.stringify({
        bodyPatch: { type: "append", text: "[[missing_place_marker]]" },
        frontmatterPatch: {
          placeId: "pl_missing",
          focusIds: ["ch_missing"],
          eventIds: ["ev_missing"]
        }
      })
    });
    const missingRefsQuality = await request(`${base}/api/stories/${storyId}/articles/${encodeURIComponent(chapter.id)}/drafts/${encodeURIComponent(missingRefsDraft.draft.id)}/quality`);
    assert.equal(missingRefsQuality.ok, false);
    assert.equal(missingRefsQuality.checks.find((check) => check.id === "world_sync").status, "fail");
    assert.ok(missingRefsQuality.issues.some((issue) => issue.field === "frontmatter.placeId"));
    assert.ok(missingRefsQuality.issues.some((issue) => issue.field === "frontmatter.focusIds[0]"));
    assert.ok(missingRefsQuality.issues.some((issue) => issue.field === "frontmatter.eventIds[0]"));

    const contradictionDraft = await request(`${base}/api/stories/${storyId}/articles/${encodeURIComponent(chapter.id)}/drafts`, {
      method: "POST",
      body: JSON.stringify({
        bodyPatch: { type: "append", text: "Veshra steps onto the dock." },
        frontmatterPatch: {
          year: 1209,
          placeId: "pl_brackhold",
          focusIds: ["ch_veshra"],
          eventIds: []
        }
      })
    });
    const contradictionQuality = await request(`${base}/api/stories/${storyId}/articles/${encodeURIComponent(chapter.id)}/drafts/${encodeURIComponent(contradictionDraft.draft.id)}/quality`);
    assert.equal(contradictionQuality.ok, false);
    assert.equal(contradictionQuality.checks.find((check) => check.id === "consistency").status, "fail");
    assert.ok(contradictionQuality.issues.some((issue) => issue.message.includes("after death year 1178")));

    const malformedDraftId = "malformed_draft";
    await writeFile(
      join(storiesRoot, storyId, dirname(patchDraft.draft.path), `${malformedDraftId}.md`),
      "---\n{\"kind\":\"chapter\",\n---\nBroken draft body.\n",
      "utf8"
    );
    const malformedQuality = await request(`${base}/api/stories/${storyId}/articles/${encodeURIComponent(chapter.id)}/drafts/${malformedDraftId}/quality`);
    assert.equal(malformedQuality.ok, false);
    assert.equal(malformedQuality.checks.find((check) => check.id === "markdown_parse").status, "fail");
    assert.ok(malformedQuality.issues.some((issue) => issue.message.includes("Invalid JSON frontmatter")));

    await assert.rejects(
      request(`${base}/api/stories/${storyId}/articles/${encodeURIComponent(chapter.id)}/drafts/${encodeURIComponent(patchDraft.draft.id)}/apply`, {
        method: "POST",
        body: JSON.stringify({})
      }),
      /400/
    );

    const reread = await request(`${base}/api/stories/${storyId}/articles/${encodeURIComponent(chapter.id)}`);
    assert.equal(reread.markdownBody, detail.markdownBody);

    const applied = await request(`${base}/api/stories/${storyId}/articles/${encodeURIComponent(chapter.id)}/drafts/${encodeURIComponent(patchDraft.draft.id)}/apply`, {
      method: "POST",
      body: JSON.stringify({ confirmApply: true })
    });
    assert.equal(applied.ok, true);
    assert.equal(applied.draft.applied, true);
    assert.equal(applied.version.reason, "before_apply");
    assert.ok(applied.version.path.includes("/versions/"));
    assert.match(applied.diffPreview, /\+Patch-only test line\./);

    const appliedDraftText = await readFile(join(storiesRoot, storyId, patchDraft.draft.path), "utf8");
    assert.match(appliedDraftText, /"applied": true/);
    assert.match(appliedDraftText, /"versionId":/);

    const appliedArticle = await request(`${base}/api/stories/${storyId}/articles/${encodeURIComponent(chapter.id)}`);
    assert.match(appliedArticle.markdownBody, /Patch-only test line\./);
    assert.equal(appliedArticle.frontmatter.status, "patch-proposed");
    assert.equal(appliedArticle.frontmatter.draftOf, undefined);

    const versions = await request(`${base}/api/stories/${storyId}/articles/${encodeURIComponent(chapter.id)}/versions`);
    assert.ok(versions.versions.some((version) => version.id === applied.version.id));

    await assert.rejects(
      request(`${base}/api/stories/${storyId}/articles/${encodeURIComponent(chapter.id)}/versions/${encodeURIComponent(applied.version.id)}/restore`, {
        method: "POST",
        body: JSON.stringify({})
      }),
      /400/
    );

    const restored = await request(`${base}/api/stories/${storyId}/articles/${encodeURIComponent(chapter.id)}/versions/${encodeURIComponent(applied.version.id)}/restore`, {
      method: "POST",
      body: JSON.stringify({ confirmRestore: true })
    });
    assert.equal(restored.ok, true);
    assert.equal(restored.rollbackVersion.reason, "before_restore");

    const restoredArticle = await request(`${base}/api/stories/${storyId}/articles/${encodeURIComponent(chapter.id)}`);
    assert.equal(restoredArticle.markdownBody, detail.markdownBody);
    assert.equal(restoredArticle.frontmatter.status, detail.frontmatter.status);
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
