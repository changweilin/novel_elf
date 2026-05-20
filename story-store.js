(function () {
  "use strict";

  const ACTIVE_KEY = "novelElf.activeStoryId.v1";
  const LEGACY_WORLD_KEY = "aevenmere.world.v2";

  function clone(value) {
    return JSON.parse(JSON.stringify(value || null));
  }

  function slugify(value, fallback) {
    const slug = String(value || "")
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
    return slug || fallback || "story";
  }

  function normalizeWorld(input) {
    const source = clone(input) || {};
    const eras = Array.isArray(source.eras) && source.eras.length ? source.eras : [{
      id: "present",
      name: "Present",
      start: 0,
      end: 1,
      compressed: 1,
      accent: "#c89859",
      blurb: "The first span of the story."
    }];

    const world = {
      ...source,
      storyId: source.storyId || source.id || slugify(source.name || "untitled-story"),
      name: source.name || "Untitled Story",
      subtitle: source.subtitle || "A new LLM wiki",
      defaultYear: Number.isFinite(Number(source.defaultYear)) ? Number(source.defaultYear) : inferDefaultYear(eras, source.events),
      regions: arr(source.regions),
      rivers: arr(source.rivers),
      mountains: arr(source.mountains),
      forests: arr(source.forests),
      ruins: arr(source.ruins),
      places: arr(source.places),
      eras,
      events: arr(source.events),
      countries: arr(source.countries),
      organizations: arr(source.organizations),
      characters: arr(source.characters),
      relationships: arr(source.relationships),
      library: normalizeLibrary(source.library)
    };
    return world;
  }

  function inferDefaultYear(eras, events) {
    const eventYears = arr(events).map((event) => Number(event.year)).filter(Number.isFinite);
    if (eventYears.length) return Math.max(...eventYears);
    const last = eras[eras.length - 1] || {};
    if (Number.isFinite(Number(last.end))) return Number(last.end);
    if (Number.isFinite(Number(last.start))) return Number(last.start);
    return 0;
  }

  function normalizeLibrary(library) {
    return {
      ...(library || {}),
      books: arr(library && library.books).map((book) => ({
        ...book,
        volumes: arr(book.volumes).map((volume) => ({
          ...volume,
          chapters: arr(volume.chapters)
        }))
      }))
    };
  }

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  async function api(path, options) {
    const init = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options && options.headers)
      }
    };
    const response = await fetch(path, init);
    if (!response.ok) {
      let message = `${response.status} ${response.statusText}`;
      try {
        const body = await response.json();
        if (body.error) message = body.error;
      } catch {}
      throw new Error(message);
    }
    return response.json();
  }

  async function loadInitial(seedWorld) {
    const seed = normalizeWorld(seedWorld);
    try {
      const listed = await api("/api/stories");
      const stories = listed.stories || [];
      const selected = selectStory(stories);
      const detail = await api(`/api/stories/${encodeURIComponent(selected.id)}`);
      const world = normalizeWorld(detail.world);
      saveActiveStoryId(selected.id);
      return {
        mode: "api",
        stories,
        activeStory: detail.story || selected,
        world
      };
    } catch (error) {
      const world = loadLegacyWorld(seed);
      return {
        mode: "static",
        stories: [storyFromWorld(world)],
        activeStory: storyFromWorld(world),
        world,
        error
      };
    }
  }

  async function loadStory(id) {
    const detail = await api(`/api/stories/${encodeURIComponent(id)}`);
    saveActiveStoryId(id);
    return {
      story: detail.story,
      world: normalizeWorld(detail.world)
    };
  }

  async function saveWorld(id, world, mode) {
    const normalized = normalizeWorld(world);
    if (mode !== "api") {
      try { localStorage.setItem(LEGACY_WORLD_KEY, JSON.stringify(normalized)); } catch {}
      return { story: storyFromWorld(normalized), world: normalized };
    }
    return api(`/api/stories/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({ world: normalized })
    });
  }

  async function createStory({ title, subtitle, sourceId, world }) {
    return api("/api/stories", {
      method: "POST",
      body: JSON.stringify({ title, subtitle, sourceId, world })
    });
  }

  async function renameStory(id, patch) {
    return api(`/api/stories/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch)
    });
  }

  async function archiveStory(id) {
    return api(`/api/stories/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  function loadLegacyWorld(seed) {
    try {
      const raw = localStorage.getItem(LEGACY_WORLD_KEY);
      if (raw) return normalizeWorld(JSON.parse(raw));
    } catch {}
    return seed;
  }

  function selectStory(stories) {
    if (!stories.length) throw new Error("No stories returned");
    let activeId = null;
    try { activeId = localStorage.getItem(ACTIVE_KEY); } catch {}
    return stories.find((story) => story.id === activeId) || stories[0];
  }

  function storyFromWorld(world) {
    const id = world.storyId || slugify(world.name || "story");
    return {
      id,
      name: world.name || "Untitled Story",
      subtitle: world.subtitle || "",
      defaultYear: world.defaultYear
    };
  }

  function saveActiveStoryId(id) {
    try { localStorage.setItem(ACTIVE_KEY, id); } catch {}
  }

  function uiKey(storyId, name) {
    return `novelElf.story.${storyId}.${name}.v1`;
  }

  function getUi(storyId, name, fallback) {
    try {
      const value = localStorage.getItem(uiKey(storyId, name));
      return value == null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function setUi(storyId, name, value) {
    try { localStorage.setItem(uiKey(storyId, name), String(value)); } catch {}
  }

  function getYear(storyId, world) {
    const stored = Number(getUi(storyId, "year", ""));
    if (Number.isFinite(stored)) return stored;
    return normalizeWorld(world).defaultYear;
  }

  function firstFocus(world) {
    return (
      world.events[0]?.id ||
      world.characters[0]?.id ||
      world.organizations[0]?.id ||
      world.countries[0]?.id ||
      null
    );
  }

  window.StoryStore = {
    archiveStory,
    createStory,
    firstFocus,
    getUi,
    getYear,
    loadInitial,
    loadStory,
    normalizeWorld,
    renameStory,
    saveActiveStoryId,
    saveWorld,
    setUi,
    slugify,
    storyFromWorld
  };
})();
