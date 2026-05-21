import { constants as fsConstants } from "node:fs";
import { access, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { readWorldFromMarkdown, slugify } from "./story-md.mjs";

const ARTICLE_KINDS = new Set(["story", "book", "volume", "chapter"]);
const ARTICLE_TASK_SCHEMAS = [
  {
    task: "read_article",
    purpose: "Read one selected story article with frontmatter, body, outline, chunks, and nearby context.",
    input: { required: ["storyId", "articleId"], optional: ["maxChars"] },
    output: { article: "Article metadata", contextPack: "Bounded context for reading" },
    allowedWrites: []
  },
  {
    task: "summarize_article",
    purpose: "Produce a concise summary from an article and its neighboring chapter context.",
    input: { required: ["storyId", "articleId"], optional: ["focus", "maxChars"] },
    output: { summary: "Short summary", bullets: "Key facts and unresolved questions" },
    allowedWrites: []
  },
  {
    task: "continue_article",
    purpose: "Draft continuation prose for the selected article without changing the formal story file.",
    input: { required: ["storyId", "articleId"], optional: ["direction", "targetWords", "maxChars"] },
    output: { markdownBody: "Proposed continuation", bodyPatch: "append patch" },
    allowedWrites: ["draft"]
  },
  {
    task: "rewrite_section",
    purpose: "Rewrite a specific outline section or paragraph chunk while preserving the rest of the article.",
    input: { required: ["storyId", "articleId", "sectionId"], optional: ["direction", "maxChars"] },
    output: { bodyPatch: "replace_section patch" },
    allowedWrites: ["draft"]
  },
  {
    task: "sync_article_to_world",
    purpose: "Extract proposed world bible changes implied by the selected article.",
    input: { required: ["storyId", "articleId"], optional: ["maxChars"] },
    output: { snapshots: [], events: [], relationships: [], summary: "" },
    allowedWrites: ["draft"]
  },
  {
    task: "check_consistency",
    purpose: "Report factual contradictions between the article and existing world data.",
    input: { required: ["storyId", "articleId"], optional: ["maxChars"] },
    output: { warnings: [{ severity: "high|medium|low", field: "", says: "", contradicts: "", suggestion: "" }] },
    allowedWrites: []
  },
  {
    task: "propose_patch",
    purpose: "Return a safe patch proposal and diff preview without applying it to the official story.",
    input: { required: ["storyId", "articleId", "bodyPatch"], optional: ["frontmatterPatch", "reason"] },
    output: { draft: "Draft path", diffPreview: "Unified-style preview" },
    allowedWrites: ["draft"]
  }
];

export function listArticleTaskSchemas() {
  return ARTICLE_TASK_SCHEMAS.map((schema) => JSON.parse(JSON.stringify(schema)));
}

export async function listStoryArticles(storyDir) {
  const rootDir = resolve(storyDir);
  const articles = [];
  const storyPath = join(rootDir, "story.md");

  if (await exists(storyPath)) {
    const parsed = await readMarkdownFile(storyPath);
    const info = await stat(storyPath);
    if ((parsed.meta.kind || "story") === "story") {
      articles.push(articleSummary({
        id: "story:story",
        kind: "story",
        filePath: storyPath,
        relPath: "story.md",
        meta: parsed.meta,
        body: parsed.body,
        updatedAt: info.mtime.toISOString()
      }));
    }
  }

  const libraryDir = join(rootDir, "library");
  if (await exists(libraryDir)) {
    const bookDirs = await readDirs(libraryDir);
    for (const [bookOrder, bookDirName] of bookDirs.entries()) {
      const bookPath = join(libraryDir, bookDirName, "book.md");
      if (!(await exists(bookPath))) continue;

      const bookParsed = await readMarkdownFile(bookPath);
      const bookInfo = await stat(bookPath);
      const bookId = bookParsed.meta.id || bookDirName;
      const bookTitle = titleFor(bookParsed.meta, bookId);

      articles.push(articleSummary({
        id: `book:${bookId}`,
        kind: "book",
        filePath: bookPath,
        relPath: normalizeRel(relative(rootDir, bookPath)),
        meta: bookParsed.meta,
        body: bookParsed.body,
        bookId,
        bookTitle,
        order: bookParsed.meta.__order ?? bookOrder,
        updatedAt: bookInfo.mtime.toISOString()
      }));

      const volumeDirs = await readDirs(join(libraryDir, bookDirName));
      for (const [volumeOrder, volumeDirName] of volumeDirs.entries()) {
        const volumePath = join(libraryDir, bookDirName, volumeDirName, "volume.md");
        if (!(await exists(volumePath))) continue;

        const volumeParsed = await readMarkdownFile(volumePath);
        const volumeInfo = await stat(volumePath);
        const volumeId = volumeParsed.meta.id || volumeDirName;
        const volumeTitle = titleFor(volumeParsed.meta, volumeId);

        articles.push(articleSummary({
          id: `volume:${bookId}/${volumeId}`,
          kind: "volume",
          filePath: volumePath,
          relPath: normalizeRel(relative(rootDir, volumePath)),
          meta: volumeParsed.meta,
          body: volumeParsed.body,
          bookId,
          bookTitle,
          volumeId,
          volumeTitle,
          order: volumeParsed.meta.__order ?? volumeOrder,
          updatedAt: volumeInfo.mtime.toISOString()
        }));

        const chapterFiles = (await readdir(join(libraryDir, bookDirName, volumeDirName), { withFileTypes: true }))
          .filter((entry) => entry.isFile() && entry.name !== "volume.md" && extname(entry.name).toLowerCase() === ".md")
          .map((entry) => entry.name)
          .sort();

        for (const [chapterOrder, chapterFile] of chapterFiles.entries()) {
          const chapterPath = join(libraryDir, bookDirName, volumeDirName, chapterFile);
          const chapterParsed = await readMarkdownFile(chapterPath);
          if (chapterParsed.meta.kind && chapterParsed.meta.kind !== "chapter") continue;

          const chapterInfo = await stat(chapterPath);
          const chapterId = chapterParsed.meta.id || basename(chapterFile, extname(chapterFile));
          articles.push(articleSummary({
            id: `chapter:${bookId}/${volumeId}/${chapterId}`,
            kind: "chapter",
            filePath: chapterPath,
            relPath: normalizeRel(relative(rootDir, chapterPath)),
            meta: chapterParsed.meta,
            body: chapterParsed.body,
            bookId,
            bookTitle,
            volumeId,
            volumeTitle,
            chapterId,
            order: chapterParsed.meta.__order ?? chapterOrder,
            updatedAt: chapterInfo.mtime.toISOString()
          }));
        }
      }
    }
  }

  return articles.sort((a, b) => a.sortKey.localeCompare(b.sortKey)).map(({ filePath, sortKey, ...item }) => item);
}

export async function readStoryArticle(storyDir, articleId) {
  assertSafeArticleId(articleId);
  const rootDir = resolve(storyDir);
  const found = await findArticle(rootDir, articleId);
  const parsed = await readMarkdownFile(found.filePath);
  const world = await readWorldFromMarkdown(rootDir);
  const articles = await listStoryArticles(rootDir);

  return {
    article: stripRuntimeFields(found),
    frontmatter: cleanMeta(parsed.meta),
    markdownBody: parsed.body,
    outline: buildOutline(parsed.body),
    chunks: buildChunks(parsed.body),
    relatedWorld: buildRelatedWorld(world, found, parsed.meta),
    adjacentChapters: adjacentChapters(articles, found)
  };
}

export async function buildArticleContextPack(storyDir, articleId, options = {}) {
  assertSafeArticleId(articleId);
  const rootDir = resolve(storyDir);
  const task = normalizeTask(options.task || "read_article");
  const maxChars = clamp(Number(options.maxChars) || defaultMaxChars(task), 1200, 24000);
  const detail = await readStoryArticle(rootDir, articleId);
  const world = await readWorldFromMarkdown(rootDir);
  const schema = ARTICLE_TASK_SCHEMAS.find((item) => item.task === task);
  const sections = [
    packSection("task", {
      task,
      purpose: schema.purpose,
      allowedWrites: schema.allowedWrites,
      writeRule: "Never modify official story files from this context pack. Use draft APIs for proposed writes."
    }, 2200),
    packSection("article", {
      article: detail.article,
      frontmatter: detail.frontmatter,
      outline: detail.outline,
      adjacentChapters: detail.adjacentChapters
    }, 4200),
    packSection("article_body", detail.markdownBody, bodyBudgetFor(task)),
    packSection("chunks", detail.chunks, 5000),
    packSection("related_world", detail.relatedWorld, 4200),
    packSection("nearby_timeline", nearbyTimeline(world, detail.frontmatter.year), 4200),
    packSection("world_indexes", worldIndexes(world), 5200)
  ];
  const bounded = fitSections(sections, maxChars);

  return {
    task,
    schema,
    article: detail.article,
    budget: {
      maxChars,
      usedChars: bounded.reduce((sum, section) => sum + section.content.length, 0)
    },
    sections: bounded
  };
}

export async function writeStoryArticleDraft(storyDir, articleId, input = {}) {
  assertSafeArticleId(articleId);
  const rootDir = resolve(storyDir);
  const found = await findArticle(rootDir, articleId);
  const parsed = await readMarkdownFile(found.filePath);
  const bodyPatch = input.bodyPatch || input.patch || null;
  const now = new Date().toISOString();
  const nextMeta = {
    ...parsed.meta,
    ...(input.frontmatterPatch && typeof input.frontmatterPatch === "object" ? input.frontmatterPatch : {}),
    draftOf: articleId,
    draftCreatedAt: now
  };
  const nextBody = input.markdownBody ?? input.body ?? applyBodyPatch(parsed.body, bodyPatch);
  const draftId = `${safeDraftName(articleId)}_${now.replace(/[:.]/g, "-")}`;
  const draftRelPath = normalizeRel(join("_drafts", "articles", safeDraftName(articleId), `${draftId}.md`));
  const draftPath = join(rootDir, draftRelPath);

  assertInside(rootDir, draftPath);
  await mkdir(dirname(draftPath), { recursive: true });
  await writeFile(draftPath, formatMarkdown(nextMeta, nextBody), "utf8");

  return {
    draft: {
      id: draftId,
      articleId,
      path: draftRelPath,
      createdAt: now,
      applied: false,
      patchType: bodyPatch?.type || null
    },
    article: stripRuntimeFields(found),
    diffPreview: diffLines(parsed.body, nextBody)
  };
}

async function findArticle(rootDir, articleId) {
  const article = (await listStoryArticles(rootDir)).find((item) => item.id === articleId);
  if (!article) {
    const error = new Error(`Article not found: ${articleId}`);
    error.statusCode = 404;
    throw error;
  }
  return {
    ...article,
    filePath: join(rootDir, article.path)
  };
}

function articleSummary({ id, kind, filePath, relPath, meta, body, bookId, bookTitle, volumeId, volumeTitle, chapterId, order = 0, updatedAt }) {
  if (!ARTICLE_KINDS.has(kind)) {
    throw new Error(`Unsupported article kind: ${kind}`);
  }

  return {
    id,
    kind,
    title: titleFor(meta, id),
    path: relPath,
    wordCount: countWords(body),
    year: finiteOrNull(meta.year ?? meta.defaultYear),
    status: meta.status || null,
    updatedAt,
    sourceRefs: Array.isArray(meta.sourceRefs) ? meta.sourceRefs : [],
    bookId,
    bookTitle,
    volumeId,
    volumeTitle,
    chapterId,
    sortKey: `${kindRank(kind)}:${String(bookId || "").padStart(4, "0")}:${String(volumeId || "").padStart(4, "0")}:${String(order).padStart(6, "0")}:${id}`,
    filePath
  };
}

function buildRelatedWorld(world, article, meta) {
  if (article.kind !== "chapter") {
    return {
      story: { id: world.storyId, name: world.name, defaultYear: world.defaultYear },
      era: null,
      place: null,
      focus: [],
      events: []
    };
  }

  const year = finiteOrNull(meta.year);
  const era = world.eras.find((item) => year != null && year >= item.start && year <= item.end) || null;
  const place = meta.placeId ? world.places.find((item) => item.id === meta.placeId) || null : null;
  const focus = arrayOf(meta.focusIds).map((id) => summarizeEntity(world, id, year)).filter(Boolean);
  const events = arrayOf(meta.eventIds).map((id) => {
    const event = world.events.find((item) => item.id === id);
    if (!event) return null;
    return {
      id: event.id,
      title: event.title,
      year: event.year,
      placeId: event.placeId || null,
      summary: trimText(event.body, 240)
    };
  }).filter(Boolean);

  return {
    story: { id: world.storyId, name: world.name, defaultYear: world.defaultYear },
    era: era ? { id: era.id, name: era.name, start: era.start, end: era.end } : null,
    place: place ? { id: place.id, name: place.name, x: place.x, y: place.y } : null,
    focus,
    events
  };
}

function summarizeEntity(world, id, year) {
  const pools = [
    ["character", world.characters],
    ["organization", world.organizations],
    ["country", world.countries]
  ];

  for (const [kind, items] of pools) {
    const entity = items.find((item) => item.id === id);
    if (!entity) continue;
    const snap = snapshotAt(entity, year);
    return {
      id: entity.id,
      kind,
      name: entity.name,
      role: entity.role || null,
      status: snap?.status || null,
      place: snap?.location?.name || snap?.hq?.name || snap?.capital?.name || null,
      summary: trimText(snap?.body || entity.body || "", 240)
    };
  }

  return null;
}

function adjacentChapters(articles, article) {
  if (article.kind !== "chapter") return { previous: null, next: null };
  const siblings = articles.filter((item) => (
    item.kind === "chapter" &&
    item.bookId === article.bookId &&
    item.volumeId === article.volumeId
  ));
  const index = siblings.findIndex((item) => item.id === article.id);
  return {
    previous: summarizeAdjacent(siblings[index - 1]),
    next: summarizeAdjacent(siblings[index + 1])
  };
}

function summarizeAdjacent(article) {
  if (!article) return null;
  return {
    id: article.id,
    title: article.title,
    path: article.path,
    year: article.year,
    status: article.status,
    wordCount: article.wordCount
  };
}

function buildOutline(body) {
  return String(body || "").split(/\r?\n/).reduce((items, line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (match) {
      items.push({ level: match[1].length, title: match[2].trim(), line: index + 1 });
    }
    return items;
  }, []);
}

function buildChunks(body) {
  const lines = String(body || "").split(/\r?\n/);
  const headings = buildOutline(body);
  if (!headings.length) {
    return paragraphChunks(body);
  }

  return headings.map((heading, index) => {
    const next = headings[index + 1]?.line || lines.length + 1;
    const sectionLines = lines.slice(heading.line - 1, next - 1);
    return {
      id: `section-${index + 1}`,
      title: heading.title,
      startLine: heading.line,
      endLine: next - 1,
      preview: trimText(sectionLines.join("\n"), 900)
    };
  });
}

function paragraphChunks(body) {
  return String(body || "")
    .split(/\n{2,}/)
    .map((text) => text.trim())
    .filter(Boolean)
    .slice(0, 12)
    .map((text, index) => ({
      id: `paragraph-${index + 1}`,
      title: `Paragraph ${index + 1}`,
      startLine: null,
      endLine: null,
      preview: trimText(text, 900)
    }));
}

function applyBodyPatch(body, patch) {
  if (!patch) return body;
  const type = patch.type || "replace_text";
  const text = String(body || "");

  if (type === "append") {
    const addition = patch.text ?? patch.markdown ?? patch.markdownBody;
    if (addition == null) throw new Error("append bodyPatch requires text");
    return `${text.replace(/\s+$/g, "")}\n\n${String(addition).trim()}\n`;
  }

  if (type === "prepend") {
    const addition = patch.text ?? patch.markdown ?? patch.markdownBody;
    if (addition == null) throw new Error("prepend bodyPatch requires text");
    return `${String(addition).trim()}\n\n${text.replace(/^\s+/g, "")}`;
  }

  if (type === "replace_text") {
    if (!patch.oldText) throw new Error("replace_text bodyPatch requires oldText");
    if (!text.includes(patch.oldText)) throw new Error("replace_text bodyPatch oldText was not found");
    return text.replace(patch.oldText, patch.newText ?? "");
  }

  if (type === "replace_section") {
    const replacement = patch.markdownBody ?? patch.markdown ?? patch.text;
    if (replacement == null) throw new Error("replace_section bodyPatch requires replacement markdown");
    return replaceSection(text, patch, String(replacement));
  }

  if (type === "replace_body") {
    const replacement = patch.markdownBody ?? patch.markdown ?? patch.text;
    if (replacement == null) throw new Error("replace_body bodyPatch requires replacement markdown");
    return String(replacement);
  }

  throw new Error(`Unsupported bodyPatch type: ${type}`);
}

function replaceSection(body, patch, replacement) {
  const lines = String(body || "").split(/\r?\n/);
  const chunks = buildChunks(body);
  const target = patch.sectionId ? chunks.find((chunk) => chunk.id === patch.sectionId) : null;
  let startLine = target?.startLine ?? finiteOrNull(patch.startLine);
  let endLine = target?.endLine ?? finiteOrNull(patch.endLine);

  if (patch.heading && !target) {
    const headingIndex = lines.findIndex((line) => line.replace(/^#+\s+/, "").trim() === String(patch.heading).trim());
    if (headingIndex >= 0) {
      startLine = headingIndex + 1;
      const currentLevel = (lines[headingIndex].match(/^(#{1,6})\s+/)?.[1] || "").length;
      const nextHeadingIndex = lines.findIndex((line, index) => (
        index > headingIndex &&
        line.match(/^(#{1,6})\s+/) &&
        line.match(/^(#{1,6})\s+/)[1].length <= currentLevel
      ));
      endLine = nextHeadingIndex >= 0 ? nextHeadingIndex : lines.length;
    }
  }

  if (!startLine || !endLine || startLine < 1 || endLine < startLine) {
    throw new Error("replace_section bodyPatch requires sectionId, heading, or valid startLine/endLine");
  }

  const before = lines.slice(0, startLine - 1);
  const after = lines.slice(endLine);
  return [...before, ...String(replacement).replace(/\s+$/g, "").split(/\r?\n/), ...after].join("\n");
}

function normalizeTask(task) {
  const known = new Set(ARTICLE_TASK_SCHEMAS.map((item) => item.task));
  if (!known.has(task)) {
    throw new Error(`Unsupported article task: ${task}`);
  }
  return task;
}

function defaultMaxChars(task) {
  return task === "read_article" ? 14000 : task === "rewrite_section" ? 9000 : 12000;
}

function bodyBudgetFor(task) {
  if (task === "rewrite_section") return 3600;
  if (task === "summarize_article") return 5200;
  if (task === "continue_article") return 6400;
  return 7000;
}

function packSection(kind, value, maxChars) {
  const raw = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return {
    kind,
    content: trimText(raw, maxChars),
    truncated: raw.length > maxChars
  };
}

function fitSections(sections, maxChars) {
  const out = [];
  let remaining = maxChars;

  for (const section of sections) {
    if (remaining <= 0) break;
    const content = trimText(section.content, remaining);
    out.push({
      ...section,
      content,
      truncated: section.truncated || content.length < section.content.length
    });
    remaining -= content.length;
  }

  return out;
}

function nearbyTimeline(world, year) {
  const numericYear = finiteOrNull(year);
  const events = arrayOf(world.events)
    .map((event) => ({
      id: event.id,
      title: event.title,
      year: event.year,
      placeId: event.placeId || null,
      summary: trimText(event.body, 180),
      distance: numericYear == null ? 0 : Math.abs(Number(event.year) - numericYear)
    }))
    .sort((a, b) => a.distance - b.distance || Number(a.year) - Number(b.year))
    .slice(0, 12)
    .map(({ distance, ...event }) => event);
  return events;
}

function worldIndexes(world) {
  return {
    characters: arrayOf(world.characters).slice(0, 40).map((item) => ({
      id: item.id,
      name: item.name,
      role: item.role || null,
      born: item.born ?? null,
      died: item.died ?? null
    })),
    places: arrayOf(world.places).slice(0, 40).map((item) => ({
      id: item.id,
      name: item.name,
      regionId: item.regionId || null
    })),
    events: arrayOf(world.events).slice(0, 40).map((item) => ({
      id: item.id,
      title: item.title,
      year: item.year
    })),
    organizations: arrayOf(world.organizations).slice(0, 30).map((item) => ({
      id: item.id,
      name: item.name,
      founded: item.founded ?? null,
      dissolved: item.dissolved ?? null
    })),
    countries: arrayOf(world.countries).slice(0, 30).map((item) => ({
      id: item.id,
      name: item.name,
      founded: item.founded ?? null,
      dissolved: item.dissolved ?? null
    }))
  };
}

function diffLines(before, after) {
  const beforeLines = String(before || "").replace(/\s+$/g, "").split(/\r?\n/);
  const afterLines = String(after || "").replace(/\s+$/g, "").split(/\r?\n/);
  const max = Math.max(beforeLines.length, afterLines.length);
  const lines = [];

  for (let index = 0; index < max; index += 1) {
    const oldLine = beforeLines[index];
    const newLine = afterLines[index];
    if (oldLine === newLine) continue;
    if (oldLine != null) lines.push(`-${oldLine}`);
    if (newLine != null) lines.push(`+${newLine}`);
    if (lines.length >= 80) {
      lines.push("...diff truncated...");
      break;
    }
  }

  return lines.length ? lines.join("\n") : "No markdown body changes.";
}

async function readMarkdownFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { meta: {}, body: raw };
  }
  return {
    meta: JSON.parse(match[1]),
    body: raw.slice(match[0].length)
  };
}

function formatMarkdown(meta, body) {
  const text = body == null ? "" : String(body).replace(/\s+$/g, "");
  return `---\n${JSON.stringify(stripUndefined(meta), null, 2)}\n---\n${text}\n`;
}

async function readDirs(dirPath) {
  if (!(await exists(dirPath))) return [];
  const entries = await readdir(dirPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith("_")).map((entry) => entry.name).sort();
}

async function exists(path) {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function assertSafeArticleId(articleId) {
  if (!/^(story|book|volume|chapter):[A-Za-z0-9_/-]+$/.test(articleId || "")) {
    throw new Error(`Unsafe article id: ${articleId}`);
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

function stripRuntimeFields(article) {
  const { filePath, sortKey, ...clean } = article;
  return clean;
}

function cleanMeta(meta) {
  const clean = { ...(meta || {}) };
  delete clean.schema;
  delete clean.kind;
  delete clean.__order;
  delete clean.savedAt;
  return clean;
}

function snapshotAt(entity, year) {
  const snapshots = arrayOf(entity.snapshots);
  if (!snapshots.length) return null;
  const numericYear = finiteOrNull(year);
  if (numericYear == null) return snapshots[snapshots.length - 1];
  return snapshots
    .filter((snap) => finiteOrNull(snap.year) != null && Number(snap.year) <= numericYear)
    .sort((a, b) => Number(a.year) - Number(b.year))
    .at(-1) || snapshots[0];
}

function titleFor(meta, fallback) {
  return meta.title || meta.name || meta.subtitle || fallback;
}

function countWords(body) {
  return String(body || "").trim().split(/\s+/).filter(Boolean).length;
}

function finiteOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function arrayOf(value) {
  return Array.isArray(value) ? value : [];
}

function trimText(value, max) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function safeDraftName(articleId) {
  return slugify(articleId.replace(/:/g, "-").replace(/\//g, "-"), "article");
}

function kindRank(kind) {
  return { story: 0, book: 1, volume: 2, chapter: 3 }[kind] ?? 9;
}

function normalizeRel(relPath) {
  return relPath.split(sep).join("/");
}

function stripUndefined(value) {
  if (Array.isArray(value)) return value.map(stripUndefined);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, stripUndefined(item)])
    );
  }
  return value;
}
