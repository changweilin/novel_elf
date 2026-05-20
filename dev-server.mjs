import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, join, normalize, relative, resolve, sep } from "node:path";
import { networkInterfaces } from "node:os";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const args = parseArgs(process.argv.slice(2));
const host = args.host || process.env.HOST || "0.0.0.0";
const port = Number(args.port || process.env.PORT || 8789);

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

function send(response, status, text) {
  response.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
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
