import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const routerSource = await readFile(join(projectRoot, "viewport-router.js"), "utf8");

test("viewport router sends wide index traffic to the desktop atelier", () => {
  const page = runRouter({ href: "http://aevenmere.test/index.html", innerWidth: 1280 });

  assert.equal(page.layout, "desktop");
  assert.equal(page.path, "/Aevenmere%20Atelier.html");
  assert.deepEqual(page.consoleErrors, []);
});

test("viewport router sends narrow index traffic to the mobile atelier", () => {
  const page = runRouter({ href: "http://aevenmere.test/index.html", innerWidth: 390 });

  assert.equal(page.layout, "mobile");
  assert.equal(page.path, "/Aevenmere%20Atelier%20-%20Mobile.html");
  assert.deepEqual(page.consoleErrors, []);
});

test("viewport router honors forced desktop and mobile query params first", () => {
  const forcedDesktop = runRouter({
    href: "http://aevenmere.test/index.html?view=desktop&story=aevenmere#library",
    innerWidth: 390
  });
  const forcedMobile = runRouter({
    href: "http://aevenmere.test/index.html?view=mobile&story=aevenmere#codex",
    innerWidth: 1280
  });

  assert.equal(forcedDesktop.layout, "desktop");
  assert.equal(forcedDesktop.path, "/Aevenmere%20Atelier.html");
  assert.equal(forcedDesktop.search, "?view=desktop&story=aevenmere");
  assert.equal(forcedDesktop.hash, "#library");

  assert.equal(forcedMobile.layout, "mobile");
  assert.equal(forcedMobile.path, "/Aevenmere%20Atelier%20-%20Mobile.html");
  assert.equal(forcedMobile.search, "?view=mobile&story=aevenmere");
  assert.equal(forcedMobile.hash, "#codex");
});

test("viewport router does not switch pages after resize on loaded layouts", () => {
  const desktopPage = runRouter({
    current: "desktop",
    href: "http://aevenmere.test/Aevenmere%20Atelier.html",
    innerWidth: 1280
  });
  const mobilePage = runRouter({
    current: "mobile",
    href: "http://aevenmere.test/Aevenmere%20Atelier%20-%20Mobile.html",
    innerWidth: 390
  });

  desktopPage.resizeTo(390);
  mobilePage.resizeTo(1280);

  assert.equal(desktopPage.href, "http://aevenmere.test/Aevenmere%20Atelier.html");
  assert.equal(mobilePage.href, "http://aevenmere.test/Aevenmere%20Atelier%20-%20Mobile.html");
  assert.deepEqual(desktopPage.replacements, []);
  assert.deepEqual(mobilePage.replacements, []);
  assert.deepEqual(desktopPage.consoleErrors, []);
  assert.deepEqual(mobilePage.consoleErrors, []);
});

function runRouter({
  current = "auto",
  href,
  innerWidth,
  clientWidth = innerWidth,
  mobileMaxWidth = 820
}) {
  let locationUrl = new URL(href);
  const replacements = [];
  const consoleErrors = [];
  const listeners = new Map();
  const documentElement = {
    clientWidth,
    dataset: {}
  };
  const location = {
    get href() {
      return locationUrl.href;
    },
    get search() {
      return locationUrl.search;
    },
    get hash() {
      return locationUrl.hash;
    },
    replace(nextHref) {
      replacements.push(nextHref);
      locationUrl = new URL(nextHref);
    }
  };
  const window = {
    innerWidth,
    location,
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatchEvent(event) {
      for (const listener of listeners.get(event.type) || []) {
        listener.call(window, event);
      }
    }
  };
  const context = {
    URL,
    URLSearchParams,
    Number,
    document: {
      currentScript: {
        dataset: {
          current,
          mobileMaxWidth: String(mobileMaxWidth)
        }
      },
      documentElement
    },
    console: {
      error(...args) {
        consoleErrors.push(args.map(String).join(" "));
      }
    },
    window
  };

  vm.runInNewContext(routerSource, context, { filename: "viewport-router.js" });

  return {
    get href() {
      return locationUrl.href;
    },
    get path() {
      return locationUrl.pathname;
    },
    get search() {
      return locationUrl.search;
    },
    get hash() {
      return locationUrl.hash;
    },
    get layout() {
      return documentElement.dataset.viewportLayout;
    },
    consoleErrors,
    replacements,
    resizeTo(width) {
      window.innerWidth = width;
      documentElement.clientWidth = width;
      window.dispatchEvent({ type: "resize" });
    }
  };
}
