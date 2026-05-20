import { createServer } from "node:http";
import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, join, normalize, relative, resolve, sep } from "node:path";
import { networkInterfaces } from "node:os";
import { fileURLToPath } from "node:url";
import {
  archiveStory,
  createEmptyWorld,
  isSafeStoryId,
  listStories,
  loadSeedWorld,
  normalizeWorld,
  readWorldFromMarkdown,
  uniqueStoryId,
  writeWorldToMarkdown
} from "./story-md.mjs";

const root = fileURLToPath(new URL(".", import.meta.url));
const args = parseArgs(process.argv.slice(2));
const host = args.host || process.env.HOST || "0.0.0.0";
const port = Number(args.port || process.env.PORT || 8789);
const storiesRoot = resolve(args.storiesRoot || process.env.STORIES_ROOT || join(root, "stories"));

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".jsx", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".txt", "text/plain; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"]
]);

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${host}:${port}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }

    const filePath = await resolveRequestPath(request.url);
    const fileInfo = await stat(filePath);

    if (!fileInfo.isFile()) {
      send(response, 404, "Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes.get(extname(filePath).toLowerCase()) || "application/octet-stream",
      "Content-Length": fileInfo.size,
      "Cache-Control": "no-store"
    });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    if (error?.code === "ENOENT" || error?.code === "ENOTDIR") {
      send(response, 404, "Not found");
      return;
    }

    send(response, 500, "Internal server error");
    console.error(error);
  }
});

server.on("error", (error) => {
  if (error?.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Try: npm run dev -- --port 8790`);
    process.exit(1);
  }

  throw error;
});

server.listen(port, host, () => {
  const urls = getNetworkUrls(port);
  console.log(`novel-elf dev server running from ${root}`);
  console.log(`Stories:   ${storiesRoot}`);
  console.log(`Local:     http://localhost:${port}/`);

  for (const url of urls.tailscale) {
    console.log(`Tailscale: ${url}`);
  }

  for (const url of urls.network) {
    console.log(`Network:   ${url}`);
  }
});

async function resolveRequestPath(requestUrl) {
  const url = new URL(requestUrl || "/", `http://${host}:${port}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname.endsWith("/")) {
    pathname += "index.html";
  }

  const requestedPath = normalize(join(root, pathname));
  const safeRoot = resolve(root);
  const relativePath = relative(safeRoot, requestedPath);

  if (relativePath.startsWith("..") || relativePath.includes(`..${sep}`) || resolve(requestedPath) === safeRoot) {
    return join(root, "index.html");
  }

  const fileInfo = await stat(requestedPath).catch((error) => {
    if (error?.code === "ENOENT" || error?.code === "ENOTDIR") {
      return null;
    }
    throw error;
  });

  if (fileInfo?.isDirectory()) {
    return join(requestedPath, "index.html");
  }

  return requestedPath;
}

async function handleApi(request, response, url) {
  if (url.pathname === "/api/stories" && request.method === "GET") {
    const stories = await ensureStories();
    sendJson(response, 200, { stories });
    return;
  }

  if (url.pathname === "/api/stories" && request.method === "POST") {
    const body = await readJsonBody(request);
    const sourceWorld = await resolveSourceWorld(body);
    const title = body.title || body.name || sourceWorld?.name || "Untitled Story";
    const id = await uniqueStoryId(storiesRoot, body.id || title);
    const world = normalizeWorld(sourceWorld || createEmptyWorld({ name: title }));
    world.storyId = id;
    world.name = title;
    if (body.subtitle != null) world.subtitle = body.subtitle;
    if (body.defaultYear != null) world.defaultYear = Number(body.defaultYear);
    const saved = await writeWorldToMarkdown(storyDir(id), id, world, { archiveMissing: false });
    sendJson(response, 201, { story: storySummary(id, saved), world: saved, stories: await listStories(storiesRoot) });
    return;
  }

  const storyMatch = url.pathname.match(/^\/api\/stories\/([^/]+)$/);
  if (storyMatch) {
    const id = decodeURIComponent(storyMatch[1]);
    assertStoryId(id);

    if (request.method === "GET") {
      const world = await readWorldFromMarkdown(storyDir(id));
      sendJson(response, 200, { story: storySummary(id, world), world });
      return;
    }

    if (request.method === "PUT") {
      const body = await readJsonBody(request);
      if (!body.world) {
        sendJson(response, 400, { error: "Expected body.world" });
        return;
      }
      const world = normalizeWorld({ ...body.world, storyId: id });
      const saved = await writeWorldToMarkdown(storyDir(id), id, world);
      sendJson(response, 200, { story: storySummary(id, saved), world: saved, stories: await listStories(storiesRoot) });
      return;
    }

    if (request.method === "PATCH") {
      const body = await readJsonBody(request);
      const world = await readWorldFromMarkdown(storyDir(id));
      if (body.name != null || body.title != null) world.name = body.name || body.title;
      if (body.subtitle != null) world.subtitle = body.subtitle;
      if (body.defaultYear != null) world.defaultYear = Number(body.defaultYear);
      const saved = await writeWorldToMarkdown(storyDir(id), id, world);
      sendJson(response, 200, { story: storySummary(id, saved), world: saved, stories: await listStories(storiesRoot) });
      return;
    }

    if (request.method === "DELETE") {
      await archiveStory(storiesRoot, id);
      sendJson(response, 200, { ok: true, archived: id, stories: await listStories(storiesRoot) });
      return;
    }
  }

  sendJson(response, 404, { error: "API route not found" });
}

async function ensureStories() {
  let stories = await listStories(storiesRoot);
  if (stories.length > 0) return stories;

  const seed = await loadSeedWorld(root);
  const id = await uniqueStoryId(storiesRoot, "aevenmere");
  seed.storyId = id;
  await writeWorldToMarkdown(storyDir(id), id, seed, { archiveMissing: false });
  stories = await listStories(storiesRoot);
  return stories;
}

async function resolveSourceWorld(body) {
  if (body.world) return normalizeWorld(body.world);
  if (body.sourceId) {
    const sourceId = String(body.sourceId);
    assertStoryId(sourceId);
    return readWorldFromMarkdown(storyDir(sourceId));
  }
  return null;
}

function storyDir(id) {
  assertStoryId(id);
  const dir = resolve(storiesRoot, id);
  const rel = relative(resolve(storiesRoot), dir);
  if (rel.startsWith("..") || rel.includes(`..${sep}`) || rel === "") {
    throw new Error("Unsafe story path");
  }
  return dir;
}

function assertStoryId(id) {
  if (!isSafeStoryId(id)) {
    throw new Error(`Unsafe story id: ${id}`);
  }
}

function storySummary(id, world) {
  return {
    id,
    name: world.name,
    subtitle: world.subtitle || "",
    defaultYear: world.defaultYear
  };
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 15 * 1024 * 1024) {
      throw new Error("Request body too large");
    }
    chunks.push(chunk);
  }

  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

function send(response, status, text) {
  response.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(text);
}

function sendJson(response, status, payload) {
  const text = JSON.stringify(payload, null, 2);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(text),
    "Cache-Control": "no-store"
  });
  response.end(text);
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--host") {
      parsed.host = argv[index + 1];
      index += 1;
    } else if (value.startsWith("--host=")) {
      parsed.host = value.slice("--host=".length);
    } else if (value === "--port") {
      parsed.port = argv[index + 1];
      index += 1;
    } else if (value.startsWith("--port=")) {
      parsed.port = value.slice("--port=".length);
    } else if (value === "--stories-root") {
      parsed.storiesRoot = argv[index + 1];
      index += 1;
    } else if (value.startsWith("--stories-root=")) {
      parsed.storiesRoot = value.slice("--stories-root=".length);
    }
  }

  return parsed;
}

function getNetworkUrls(serverPort) {
  const urls = {
    tailscale: [],
    network: []
  };

  for (const entries of Object.values(networkInterfaces())) {
    for (const entry of entries || []) {
      if (entry.internal || entry.family !== "IPv4") {
        continue;
      }

      const url = `http://${entry.address}:${serverPort}/`;
      if (isTailscaleAddress(entry.address)) {
        urls.tailscale.push(url);
      } else {
        urls.network.push(url);
      }
    }
  }

  return urls;
}

function isTailscaleAddress(address) {
  const [first, second] = address.split(".").map(Number);
  return first === 100 && second >= 64 && second <= 127;
}
