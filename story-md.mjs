import { constants as fsConstants } from "node:fs";
import { access, mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import vm from "node:vm";

export const STORY_SCHEMA = "novel-elf.story-md.v1";

const COLLECTIONS = [
  ["eras", "era", "eras"],
  ["places", "place", "places"],
  ["events", "event", "events"],
  ["characters", "character", "characters"],
  ["organizations", "organization", "organizations"],
  ["countries", "country", "countries"]
];

const DEFAULT_ERA = {
  id: "present",
  name: "Present",
  start: 0,
  end: 1,
  compressed: 1,
  accent: "#c89859",
  blurb: "The first span of the story."
};

const DEFAULT_NARRATIVE = {
  premise: "",
  themes: [],
  storylines: [],
  characterArcs: [],
  openLoops: [],
  style: {
    narration: "",
    tense: "",
    sentenceRhythm: "",
    sensoryPriority: [],
    metaphorRules: "",
    avoid: [],
    dialogue: ""
  }
};

export function cloneJson(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

export function slugify(value, fallback = "story") {
  const slug = String(value || "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || fallback;
}

export function isSafeStoryId(id) {
  return /^[a-z0-9][a-z0-9_-]*$/.test(id || "");
}

export function normalizeWorld(input = {}) {
  const world = cloneJson(input) || {};
  const eras = Array.isArray(world.eras) && world.eras.length ? world.eras : [cloneJson(DEFAULT_ERA)];
  const normalized = {
    ...world,
    storyId: world.storyId || world.id || slugify(world.name || "untitled-story"),
    name: world.name || "Untitled Story",
    subtitle: world.subtitle || "A new LLM wiki",
    defaultYear: Number.isFinite(Number(world.defaultYear)) ? Number(world.defaultYear) : inferDefaultYear(eras, world.events),
    regions: arrayOf(world.regions),
    rivers: arrayOf(world.rivers),
    mountains: arrayOf(world.mountains),
    forests: arrayOf(world.forests),
    ruins: arrayOf(world.ruins),
    places: arrayOf(world.places),
    eras,
    events: arrayOf(world.events),
    countries: arrayOf(world.countries),
    organizations: arrayOf(world.organizations),
    characters: arrayOf(world.characters),
    relationships: arrayOf(world.relationships),
    narrative: normalizeNarrative(world.narrative),
    library: normalizeLibrary(world.library)
  };
  return normalized;
}

export function createEmptyWorld({ id, name, subtitle, defaultYear } = {}) {
  return normalizeWorld({
    storyId: id || slugify(name || "untitled-story"),
    name: name || "Untitled Story",
    subtitle: subtitle || "A new LLM wiki",
    defaultYear: Number.isFinite(Number(defaultYear)) ? Number(defaultYear) : 0,
    eras: [{ ...DEFAULT_ERA }],
    regions: [],
    rivers: [],
    mountains: [],
    forests: [],
    ruins: [],
    places: [],
    events: [],
    countries: [],
    organizations: [],
    characters: [],
    relationships: [],
    narrative: normalizeNarrative(),
    library: { books: [] }
  });
}

export async function loadSeedWorld(projectRoot) {
  const seedPath = join(projectRoot, "data.js");
  const code = await readFile(seedPath, "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox, { filename: seedPath });
  if (!sandbox.window.WORLD_SEED) {
    throw new Error("data.js did not define window.WORLD_SEED");
  }
  return normalizeWorld(sandbox.window.WORLD_SEED);
}

export async function listStories(storiesRoot) {
  await mkdir(storiesRoot, { recursive: true });
  const entries = await readdir(storiesRoot, { withFileTypes: true });
  const stories = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
    const storyDir = join(storiesRoot, entry.name);
    const storyPath = join(storyDir, "story.md");
    if (!(await exists(storyPath))) continue;

    try {
      const parsed = await readMarkdown(storyPath);
      const info = await stat(storyPath);
      stories.push({
        id: parsed.meta.id || entry.name,
        name: parsed.meta.name || entry.name,
        subtitle: parsed.meta.subtitle || "",
        defaultYear: parsed.meta.defaultYear,
        updatedAt: info.mtime.toISOString()
      });
    } catch {
      // A malformed story should not make the whole shelf unreadable.
    }
  }

  return stories.sort((a, b) => a.name.localeCompare(b.name));
}

export async function uniqueStoryId(storiesRoot, base) {
  const cleanBase = slugify(base || "story");
  let candidate = cleanBase;
  let suffix = 2;
  while (await exists(join(storiesRoot, candidate))) {
    candidate = `${cleanBase}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function readWorldFromMarkdown(storyDir) {
  const story = await readMarkdown(join(storyDir, "story.md"));
  const atlas = await readOptionalMarkdown(join(storyDir, "atlas.md"));
  const rels = await readOptionalMarkdown(join(storyDir, "relationships.md"));
  const narrative = await readOptionalMarkdown(join(storyDir, "narrative.md"));

  const world = normalizeWorld({
    ...story.meta,
    ...pick(atlas?.meta || {}, ["regions", "rivers", "mountains", "forests", "ruins"]),
    relationships: rels?.meta?.relationships || [],
    narrative: narrative ? cleanReadMeta(narrative.meta) : undefined
  });

  world.storyId = story.meta.id || basename(storyDir);
  world.name = story.meta.name || world.name;
  world.subtitle = story.meta.subtitle || world.subtitle;
  world.defaultYear = Number.isFinite(Number(story.meta.defaultYear)) ? Number(story.meta.defaultYear) : world.defaultYear;

  for (const [key, kind, dirName] of COLLECTIONS) {
    world[key] = await readCollection(join(storyDir, dirName), kind);
  }

  world.library = await readLibrary(join(storyDir, "library"));
  return normalizeWorld(world);
}

export async function writeWorldToMarkdown(storyDir, storyId, inputWorld, options = {}) {
  const archiveMissing = options.archiveMissing !== false;
  const world = normalizeWorld({ ...inputWorld, storyId });
  const expected = new Set();
  const now = new Date().toISOString();

  await mkdir(storyDir, { recursive: true });

  await writeMarkdownFile(storyDir, "story.md", {
    schema: STORY_SCHEMA,
    kind: "story",
    id: storyId,
    name: world.name,
    subtitle: world.subtitle,
    defaultYear: world.defaultYear,
    savedAt: now
  }, `# ${world.name}\n\n${world.subtitle || ""}`, expected);

  await writeMarkdownFile(storyDir, "atlas.md", {
    schema: STORY_SCHEMA,
    kind: "atlas",
    regions: world.regions,
    rivers: world.rivers,
    mountains: world.mountains,
    forests: world.forests,
    ruins: world.ruins,
    savedAt: now
  }, "# Atlas\n\nMap geometry and terrain features for this story.", expected);

  await writeMarkdownFile(storyDir, "relationships.md", {
    schema: STORY_SCHEMA,
    kind: "relationships",
    relationships: world.relationships,
    savedAt: now
  }, "# Relationships\n\nRelationship records are stored in JSON frontmatter.", expected);

  await writeMarkdownFile(storyDir, "narrative.md", {
    schema: STORY_SCHEMA,
    kind: "narrative",
    ...world.narrative,
    savedAt: now
  }, narrativeBodyFor(world.narrative), expected);

  for (const [key, kind, dirName] of COLLECTIONS) {
    await writeCollection(storyDir, dirName, kind, world[key], expected, now);
  }

  await writeLibrary(storyDir, world.library, expected, now);

  if (archiveMissing) {
    await archiveMissingMarkdown(storyDir, expected);
  }

  return world;
}

export async function archiveStory(storiesRoot, storyId) {
  if (!isSafeStoryId(storyId)) throw new Error("Unsafe story id");
  const source = join(storiesRoot, storyId);
  if (!(await exists(source))) throw new Error("Story not found");
  const archivedRoot = join(storiesRoot, "_archived");
  await mkdir(archivedRoot, { recursive: true });
  const targetBase = join(archivedRoot, `${storyId}_${timestamp()}`);
  const target = await uniquePath(targetBase);
  await rename(source, target);
  return target;
}

async function writeCollection(storyDir, dirName, kind, items, expected, savedAt) {
  const used = new Set();
  for (const [index, item] of arrayOf(items).entries()) {
    const id = item.id || `${kind}_${index + 1}`;
    const fileName = uniqueFileName(used, `${slugify(id, kind)}.md`);
    const relPath = join(dirName, fileName);
    await writeMarkdownFile(storyDir, relPath, {
      schema: STORY_SCHEMA,
      kind,
      __order: index,
      ...item,
      id,
      savedAt
    }, humanBodyFor(item), expected);
  }
}

async function writeLibrary(storyDir, library, expected, savedAt) {
  const books = arrayOf(library?.books);
  const usedBooks = new Set();

  for (const [bookIndex, book] of books.entries()) {
    const bookId = book.id || `book_${bookIndex + 1}`;
    const bookDir = join("library", uniqueDirName(usedBooks, slugify(bookId, "book")));
    const bookMeta = withoutKeys(book, ["volumes"]);
    await writeMarkdownFile(storyDir, join(bookDir, "book.md"), {
      schema: STORY_SCHEMA,
      kind: "book",
      __order: bookIndex,
      ...bookMeta,
      id: bookId,
      savedAt
    }, book.blurb || `# ${book.title || bookId}`, expected);

    const usedVolumes = new Set();
    for (const [volumeIndex, volume] of arrayOf(book.volumes).entries()) {
      const volumeId = volume.id || `volume_${volumeIndex + 1}`;
      const volumeDir = join(bookDir, uniqueDirName(usedVolumes, slugify(volumeId, "volume")));
      const volumeMeta = withoutKeys(volume, ["chapters"]);
      await writeMarkdownFile(storyDir, join(volumeDir, "volume.md"), {
        schema: STORY_SCHEMA,
        kind: "volume",
        __order: volumeIndex,
        ...volumeMeta,
        id: volumeId,
        savedAt
      }, `# ${volume.title || volumeId}\n\n${volume.subtitle || ""}`, expected);

      const usedChapters = new Set();
      for (const [chapterIndex, chapter] of arrayOf(volume.chapters).entries()) {
        const chapterId = chapter.id || `chapter_${chapterIndex + 1}`;
        const chapterMeta = withoutKeys(chapter, ["md"]);
        const chapterFile = uniqueFileName(usedChapters, `${slugify(chapterId, "chapter")}.md`);
        await writeMarkdownFile(storyDir, join(volumeDir, chapterFile), {
          schema: STORY_SCHEMA,
          kind: "chapter",
          __order: chapterIndex,
          ...chapterMeta,
          id: chapterId,
          savedAt
        }, chapter.md || `# ${chapter.title || chapterId}\n`, expected);
      }
    }
  }
}

async function readCollection(dirPath, kind) {
  if (!(await exists(dirPath))) return [];
  const files = (await readdir(dirPath, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === ".md")
    .map((entry) => entry.name)
    .sort();
  const items = [];

  for (const file of files) {
    const parsed = await readMarkdown(join(dirPath, file));
    if (parsed.meta.kind && parsed.meta.kind !== kind) continue;
    const item = cleanReadMeta(parsed.meta);
    if (item.body == null && parsed.body.trim()) item.body = parsed.body.trim();
    items.push({ item, order: parsed.meta.__order ?? items.length });
  }

  return items.sort((a, b) => a.order - b.order).map((entry) => entry.item);
}

async function readLibrary(libraryDir) {
  if (!(await exists(libraryDir))) return { books: [] };
  const bookDirs = await readDirs(libraryDir);
  const books = [];

  for (const bookDirName of bookDirs) {
    const bookPath = join(libraryDir, bookDirName, "book.md");
    if (!(await exists(bookPath))) continue;
    const parsedBook = await readMarkdown(bookPath);
    const book = cleanReadMeta(parsedBook.meta);
    const volumes = [];
    const volumeDirs = await readDirs(join(libraryDir, bookDirName));

    for (const volumeDirName of volumeDirs) {
      const volumePath = join(libraryDir, bookDirName, volumeDirName, "volume.md");
      if (!(await exists(volumePath))) continue;
      const parsedVolume = await readMarkdown(volumePath);
      const volume = cleanReadMeta(parsedVolume.meta);
      const chapterFiles = (await readdir(join(libraryDir, bookDirName, volumeDirName), { withFileTypes: true }))
        .filter((entry) => entry.isFile() && entry.name !== "volume.md" && extname(entry.name).toLowerCase() === ".md")
        .map((entry) => entry.name)
        .sort();

      const chapters = [];
      for (const chapterFile of chapterFiles) {
        const parsedChapter = await readMarkdown(join(libraryDir, bookDirName, volumeDirName, chapterFile));
        const chapter = cleanReadMeta(parsedChapter.meta);
        chapter.md = parsedChapter.body;
        chapters.push({ item: chapter, order: parsedChapter.meta.__order ?? chapters.length });
      }

      volume.chapters = chapters.sort((a, b) => a.order - b.order).map((entry) => entry.item);
      volumes.push({ item: volume, order: parsedVolume.meta.__order ?? volumes.length });
    }

    book.volumes = volumes.sort((a, b) => a.order - b.order).map((entry) => entry.item);
    books.push({ item: book, order: parsedBook.meta.__order ?? books.length });
  }

  return { books: books.sort((a, b) => a.order - b.order).map((entry) => entry.item) };
}

async function writeMarkdownFile(rootDir, relPath, meta, body, expected) {
  const filePath = join(rootDir, relPath);
  assertInside(rootDir, filePath);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, formatMarkdown(meta, body), "utf8");
  expected.add(normalizeRel(relPath));
}

async function archiveMissingMarkdown(storyDir, expected) {
  const files = await listMarkdownFiles(storyDir);
  const stamp = timestamp();

  for (const relPath of files) {
    const safeRel = normalizeRel(relPath);
    if (safeRel.startsWith("_archived/") || expected.has(safeRel)) continue;
    const source = join(storyDir, relPath);
    const target = await uniquePath(join(storyDir, "_archived", stamp, relPath));
    assertInside(storyDir, target);
    await mkdir(dirname(target), { recursive: true });
    await rename(source, target);
  }
}

async function listMarkdownFiles(dirPath, prefix = "") {
  if (!(await exists(dirPath))) return [];
  const out = [];
  const entries = await readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const rel = prefix ? join(prefix, entry.name) : entry.name;
    if (entry.isDirectory()) {
      out.push(...await listMarkdownFiles(join(dirPath, entry.name), rel));
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === ".md") {
      out.push(rel);
    }
  }
  return out;
}

async function readDirs(dirPath) {
  if (!(await exists(dirPath))) return [];
  const entries = await readdir(dirPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith("_")).map((entry) => entry.name).sort();
}

async function readOptionalMarkdown(filePath) {
  if (!(await exists(filePath))) return null;
  return readMarkdown(filePath);
}

async function readMarkdown(filePath) {
  const raw = await readFile(filePath, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { meta: {}, body: raw };
  }
  const meta = JSON.parse(match[1]);
  return {
    meta,
    body: raw.slice(match[0].length)
  };
}

function formatMarkdown(meta, body) {
  const cleanMeta = stripUndefined(meta);
  const text = body == null ? "" : String(body).replace(/\s+$/g, "");
  return `---\n${JSON.stringify(cleanMeta, null, 2)}\n---\n${text}\n`;
}

function cleanReadMeta(meta) {
  const clean = cloneJson(meta);
  delete clean.schema;
  delete clean.kind;
  delete clean.__order;
  delete clean.savedAt;
  return clean;
}

function humanBodyFor(item) {
  if (item.md) return item.md;
  if (item.body) return item.body;
  if (item.blurb) return item.blurb;
  if (item.title) return `# ${item.title}`;
  if (item.name) return `# ${item.name}`;
  return "";
}

function normalizeLibrary(library) {
  return {
    ...library,
    books: arrayOf(library?.books).map((book) => ({
      ...book,
      volumes: arrayOf(book.volumes).map((volume) => ({
        ...volume,
        chapters: arrayOf(volume.chapters)
      }))
    }))
  };
}

function normalizeNarrative(narrative = {}) {
  const source = cloneJson(narrative) || {};
  const style = { ...DEFAULT_NARRATIVE.style, ...(source.style || {}) };
  return {
    ...source,
    premise: source.premise || "",
    themes: arrayOf(source.themes),
    storylines: arrayOf(source.storylines).map((line, index) => ({
      ...line,
      id: line.id || `line_${index + 1}`,
      name: line.name || line.id || `Storyline ${index + 1}`,
      role: line.role || "supporting",
      targetShare: normalizeShare(line.targetShare),
      povIds: arrayOf(line.povIds),
      actShares: arrayOf(line.actShares)
    })),
    characterArcs: arrayOf(source.characterArcs).map((arc) => ({
      ...arc,
      characterId: arc.characterId || "",
      want: arc.want || "",
      need: arc.need || "",
      lie: arc.lie || "",
      arcStage: arc.arcStage || "",
      nextRequiredBeat: arc.nextRequiredBeat || ""
    })),
    openLoops: arrayOf(source.openLoops).map((loop, index) => ({
      ...loop,
      id: loop.id || `loop_${index + 1}`,
      question: loop.question || "",
      importance: loop.importance || "minor",
      status: loop.status || "active"
    })),
    style: {
      ...style,
      sensoryPriority: arrayOf(style.sensoryPriority),
      avoid: arrayOf(style.avoid)
    }
  };
}

function normalizeShare(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(1, number));
}

function narrativeBodyFor(narrative) {
  const lines = ["# Narrative Blueprint"];
  if (narrative?.premise) lines.push("", narrative.premise);
  if (arrayOf(narrative?.storylines).length) {
    lines.push("", "## Storylines", "");
    for (const line of narrative.storylines) {
      const share = line.targetShare ? ` (${Math.round(line.targetShare * 100)}%)` : "";
      lines.push(`- ${line.name || line.id}${share}: ${line.promise || line.currentPressure || line.role || ""}`.trim());
    }
  }
  if (narrative?.style?.narration || narrative?.style?.metaphorRules) {
    lines.push("", "## Style", "");
    if (narrative.style.narration) lines.push(`- Narration: ${narrative.style.narration}`);
    if (narrative.style.tense) lines.push(`- Tense: ${narrative.style.tense}`);
    if (narrative.style.metaphorRules) lines.push(`- Metaphor rules: ${narrative.style.metaphorRules}`);
  }
  return lines.join("\n");
}

function inferDefaultYear(eras, events = []) {
  const eventYears = arrayOf(events).map((event) => Number(event.year)).filter(Number.isFinite);
  if (eventYears.length) return Math.max(...eventYears);
  const last = eras[eras.length - 1] || DEFAULT_ERA;
  if (Number.isFinite(Number(last.end))) return Number(last.end);
  if (Number.isFinite(Number(last.start))) return Number(last.start);
  return 0;
}

function arrayOf(value) {
  return Array.isArray(value) ? value : [];
}

function pick(obj, keys) {
  return Object.fromEntries(keys.filter((key) => key in obj).map((key) => [key, obj[key]]));
}

function withoutKeys(obj, keys) {
  const out = { ...(obj || {}) };
  for (const key of keys) delete out[key];
  return out;
}

function stripUndefined(value) {
  if (Array.isArray(value)) return value.map(stripUndefined);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)])
    );
  }
  return value;
}

function uniqueFileName(used, name) {
  const ext = extname(name);
  const base = basename(name, ext);
  let candidate = `${base}${ext}`;
  let index = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${index}${ext}`;
    index += 1;
  }
  used.add(candidate);
  return candidate;
}

function uniqueDirName(used, name) {
  let candidate = name;
  let index = 2;
  while (used.has(candidate)) {
    candidate = `${name}-${index}`;
    index += 1;
  }
  used.add(candidate);
  return candidate;
}

async function uniquePath(pathBase) {
  let candidate = pathBase;
  let index = 2;
  while (await exists(candidate)) {
    candidate = `${pathBase}-${index}`;
    index += 1;
  }
  return candidate;
}

async function exists(path) {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function assertInside(rootDir, targetPath) {
  const safeRoot = resolve(rootDir);
  const safeTarget = resolve(targetPath);
  const rel = relative(safeRoot, safeTarget);
  if (rel.startsWith("..") || rel.includes(`..${sep}`) || rel === "") {
    throw new Error(`Refusing to write outside story root: ${targetPath}`);
  }
}

function normalizeRel(relPath) {
  return relPath.split(sep).join("/");
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}
