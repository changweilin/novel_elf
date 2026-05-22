(function () {
  "use strict";

  const ACTIVE_KEY = "novelElf.activeStoryId.v1";
  const LEGACY_WORLD_KEY = "aevenmere.world.v2";
  const STATIC_STORIES_KEY = "novelElf.staticStories.v1";

  function runtime() {
    return window.NovelElfRuntime || {};
  }

  function isReadOnlyRuntime() {
    const config = runtime();
    return config.readOnly === true || config.publicDemo === true;
  }

  function canUseApiRuntime() {
    return runtime().apiEnabled !== false && !isReadOnlyRuntime();
  }

  function canUseStorageRuntime() {
    return runtime().storageEnabled !== false && !isReadOnlyRuntime();
  }

  function assertWritableRuntime() {
    if (isReadOnlyRuntime()) {
      throw new Error("Public demo is read-only. Run the local workspace to edit stories.");
    }
  }

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
      narrative: normalizeNarrative(source.narrative),
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

  function normalizeNarrative(narrative) {
    const source = clone(narrative) || {};
    const style = {
      narration: "",
      tense: "",
      sentenceRhythm: "",
      sensoryPriority: [],
      metaphorRules: "",
      avoid: [],
      dialogue: "",
      ...(source.style || {})
    };
    return {
      ...source,
      premise: source.premise || "",
      themes: arr(source.themes),
      storylines: arr(source.storylines).map((line, index) => ({
        ...line,
        id: line.id || `line_${index + 1}`,
        name: line.name || line.id || `Storyline ${index + 1}`,
        role: line.role || "supporting",
        targetShare: normalizeShare(line.targetShare),
        povIds: arr(line.povIds),
        actShares: arr(line.actShares)
      })),
      characterArcs: arr(source.characterArcs).map((arc) => ({
        ...arc,
        characterId: arc.characterId || "",
        want: arc.want || "",
        need: arc.need || "",
        lie: arc.lie || "",
        arcStage: arc.arcStage || "",
        nextRequiredBeat: arc.nextRequiredBeat || ""
      })),
      openLoops: arr(source.openLoops).map((loop, index) => ({
        ...loop,
        id: loop.id || `loop_${index + 1}`,
        question: loop.question || "",
        importance: loop.importance || "minor",
        status: loop.status || "active"
      })),
      style: {
        ...style,
        sensoryPriority: arr(style.sensoryPriority),
        avoid: arr(style.avoid)
      }
    };
  }

  function normalizeShare(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.max(0, Math.min(1, number));
  }

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function readStaticRecords(seedWorld) {
    if (!canUseStorageRuntime()) {
      return [recordFromWorld(seedWorld)];
    }

    let records = [];
    try {
      const raw = localStorage.getItem(STATIC_STORIES_KEY);
      if (raw) records = JSON.parse(raw);
    } catch {}

    records = arr(records)
      .map((record) => recordFromWorld(record.world || record, record.story || record))
      .filter(Boolean);

    if (!records.length) {
      records = [recordFromWorld(loadLegacyWorld(seedWorld))];
      writeStaticRecords(records);
    }

    return records;
  }

  function writeStaticRecords(records) {
    if (!canUseStorageRuntime()) return;
    try { localStorage.setItem(STATIC_STORIES_KEY, JSON.stringify(records)); } catch {}
  }

  function recordFromWorld(inputWorld, inputStory) {
    const world = normalizeWorld(inputWorld || {});
    const story = {
      ...storyFromWorld(world),
      ...(inputStory || {})
    };
    story.id = slugify(story.id || world.storyId || story.name, "story");
    story.name = story.name || world.name || "Untitled Story";
    story.subtitle = story.subtitle || world.subtitle || "";
    story.defaultYear = Number.isFinite(Number(story.defaultYear)) ? Number(story.defaultYear) : world.defaultYear;
    world.storyId = story.id;
    world.name = story.name;
    world.subtitle = story.subtitle || world.subtitle;
    world.defaultYear = story.defaultYear;
    return { id: story.id, story, world };
  }

  function selectStaticRecord(seedWorld, id) {
    const records = readStaticRecords(seedWorld);
    let activeId = id;
    if (canUseStorageRuntime()) {
      try { activeId = activeId || localStorage.getItem(ACTIVE_KEY); } catch {}
    }
    const record = records.find((item) => item.id === activeId) || records[0];
    saveActiveStoryId(record.id);
    return { records, record };
  }

  function uniqueStaticId(records, value) {
    const base = slugify(value, "story");
    const used = new Set(records.map((record) => record.id));
    if (!used.has(base)) return base;
    let index = 2;
    while (used.has(`${base}-${index}`)) index += 1;
    return `${base}-${index}`;
  }

  function createStaticStory({ title, subtitle, sourceId, world }) {
    assertWritableRuntime();
    const seed = normalizeWorld(window.WORLD_SEED);
    const records = readStaticRecords(seed);
    const source = world
      ? normalizeWorld(world)
      : sourceId
        ? clone(records.find((record) => record.id === sourceId)?.world || seed)
        : normalizeWorld({ name: title || "Untitled Story", subtitle: subtitle || "", defaultYear: seed.defaultYear });
    const id = uniqueStaticId(records, title || source.name || "Untitled Story");
    const nextWorld = normalizeWorld({ ...source, storyId: id, name: title || source.name || "Untitled Story" });
    if (subtitle != null) nextWorld.subtitle = subtitle;
    const record = recordFromWorld(nextWorld, { id });
    const nextRecords = [...records, record];
    writeStaticRecords(nextRecords);
    saveActiveStoryId(record.id);
    return { story: record.story, world: record.world, stories: nextRecords.map((item) => item.story) };
  }

  function renameStaticStory(id, patch) {
    assertWritableRuntime();
    const seed = normalizeWorld(window.WORLD_SEED);
    const records = readStaticRecords(seed);
    const nextRecords = records.map((record) => {
      if (record.id !== id) return record;
      const story = { ...record.story };
      const world = normalizeWorld(record.world);
      if (patch.name != null) {
        story.name = patch.name;
        world.name = patch.name;
      }
      if (patch.subtitle != null) {
        story.subtitle = patch.subtitle;
        world.subtitle = patch.subtitle;
      }
      if (patch.defaultYear != null) {
        story.defaultYear = Number(patch.defaultYear);
        world.defaultYear = Number(patch.defaultYear);
      }
      return recordFromWorld(world, story);
    });
    writeStaticRecords(nextRecords);
    const record = nextRecords.find((item) => item.id === id) || nextRecords[0];
    saveActiveStoryId(record.id);
    return { story: record.story, world: record.world, stories: nextRecords.map((item) => item.story) };
  }

  function archiveStaticStory(id) {
    assertWritableRuntime();
    const seed = normalizeWorld(window.WORLD_SEED);
    let records = readStaticRecords(seed).filter((record) => record.id !== id);
    if (!records.length) records = [recordFromWorld(normalizeWorld({ ...seed, storyId: "untitled-story", name: "Untitled Story" }))];
    writeStaticRecords(records);
    saveActiveStoryId(records[0].id);
    return { ok: true, archived: id, stories: records.map((item) => item.story) };
  }

  function requireStoryImport() {
    if (!window.StoryImport) {
      throw new Error("Story import tools are not loaded");
    }
    return window.StoryImport;
  }

  function storyTitleFromFileName(fileName) {
    return requireStoryImport().titleFromFileName(fileName);
  }

  function storyImportTemplateMarkdown() {
    return requireStoryImport().templateMarkdown();
  }

  function downloadStoryImportTemplate() {
    const importer = requireStoryImport();
    const blob = new Blob([importer.templateMarkdown()], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = importer.templateFileName || "novel-elf-story-settings-template.md";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  async function api(path, options) {
    if (!canUseApiRuntime()) {
      throw new Error("Local story API is disabled in the public demo.");
    }

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
    if (!canUseApiRuntime()) {
      const { records, record } = selectStaticRecord(seed);
      return {
        mode: runtime().publicDemo ? "demo" : "static",
        stories: records.map((item) => item.story),
        activeStory: record.story,
        world: record.world
      };
    }

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
      const { records, record } = selectStaticRecord(seed);
      return {
        mode: "static",
        stories: records.map((item) => item.story),
        activeStory: record.story,
        world: record.world,
        error
      };
    }
  }

  async function loadStory(id, mode) {
    if (mode !== "api") {
      const { record } = selectStaticRecord(window.WORLD_SEED, id);
      return { story: record.story, world: record.world };
    }
    const detail = await api(`/api/stories/${encodeURIComponent(id)}`);
    saveActiveStoryId(id);
    return {
      story: detail.story,
      world: normalizeWorld(detail.world)
    };
  }

  async function saveWorld(id, world, mode) {
    const normalized = normalizeWorld(world);
    if (isReadOnlyRuntime()) {
      normalized.storyId = id || normalized.storyId;
      return {
        story: storyFromWorld(normalized),
        world: normalized,
        stories: [storyFromWorld(normalized)]
      };
    }

    if (mode !== "api") {
      try { localStorage.setItem(LEGACY_WORLD_KEY, JSON.stringify(normalized)); } catch {}
      normalized.storyId = id || normalized.storyId;
      const seed = normalizeWorld(window.WORLD_SEED);
      const records = readStaticRecords(seed);
      const record = recordFromWorld(normalized, { id: normalized.storyId });
      const nextRecords = records.some((item) => item.id === record.id)
        ? records.map((item) => item.id === record.id ? record : item)
        : [...records, record];
      writeStaticRecords(nextRecords);
      saveActiveStoryId(record.id);
      return { story: record.story, world: record.world, stories: nextRecords.map((item) => item.story) };
    }
    return api(`/api/stories/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({ world: normalized })
    });
  }

  async function createStory({ title, subtitle, sourceId, world }, mode) {
    assertWritableRuntime();
    if (mode !== "api") return createStaticStory({ title, subtitle, sourceId, world });
    return api("/api/stories", {
      method: "POST",
      body: JSON.stringify({ title, subtitle, sourceId, world })
    });
  }

  async function createStoryFromMarkdown({ markdown, fileName, title }, mode) {
    const parsed = requireStoryImport().parseStoryMarkdown(markdown, { fileName, title });
    const created = await createStory({
      title: parsed.world.name,
      subtitle: parsed.world.subtitle,
      world: parsed.world
    }, mode);
    return {
      ...created,
      importSummary: parsed.summary
    };
  }

  async function renameStory(id, patch, mode) {
    assertWritableRuntime();
    if (mode !== "api") return renameStaticStory(id, patch);
    return api(`/api/stories/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch)
    });
  }

  async function archiveStory(id, mode) {
    assertWritableRuntime();
    if (mode !== "api") return archiveStaticStory(id);
    return api(`/api/stories/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  function loadLegacyWorld(seed) {
    if (!canUseStorageRuntime()) return seed;
    try {
      const raw = localStorage.getItem(LEGACY_WORLD_KEY);
      if (raw) return normalizeWorld(JSON.parse(raw));
    } catch {}
    return seed;
  }

  function selectStory(stories) {
    if (!stories.length) throw new Error("No stories returned");
    let activeId = null;
    if (canUseStorageRuntime()) {
      try { activeId = localStorage.getItem(ACTIVE_KEY); } catch {}
    }
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
    if (!canUseStorageRuntime()) return;
    try { localStorage.setItem(ACTIVE_KEY, id); } catch {}
  }

  function uiKey(storyId, name) {
    return `novelElf.story.${storyId}.${name}.v1`;
  }

  function getUi(storyId, name, fallback) {
    if (!canUseStorageRuntime()) return fallback;
    try {
      const value = localStorage.getItem(uiKey(storyId, name));
      return value == null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function setUi(storyId, name, value) {
    if (!canUseStorageRuntime()) return;
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
    createStoryFromMarkdown,
    createStory,
    downloadStoryImportTemplate,
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
    storyImportTemplateMarkdown,
    storyTitleFromFileName,
    storyFromWorld
  };
})();
