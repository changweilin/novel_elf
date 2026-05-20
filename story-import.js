(function () {
  "use strict";

  const TEMPLATE_FILE_NAME = "novel-elf-story-settings-template.md";
  const TEMPLATE_SCHEMA = "novel-elf.import-template.v1";
  const DEFAULT_ACCENTS = ["#c89859", "#5f8f7a", "#8a6fb0", "#b36a54", "#6388b6", "#9a8c42"];

  function templateMarkdown() {
    return `# Novel Elf story settings import

> Exported blank format. Fill the fields you need, then import this .md as a new story.
> You can leave sections blank. Headings under each section become names in the story wiki.
> Coordinates use the map canvas: x,y from roughly 0,0 to 960,620.

## 故事
- 名稱:
- 副標題:
- 預設年份: 0

## 世界觀

> Write the world premise, tone, magic/technology rules, themes, and any setting constraints here.

## 故事大綱

> Write the prepared outline here. You can use paragraphs or bullet lists.

## 年代

### 年代名稱
- 起始:
- 結束:
- 壓縮倍率:
- 色彩:
- 摘要:

## 地點

### 地點名稱
- 座標:
- 描述:

## 國家

### 國家名稱
- 成立:
- 滅亡:
- 首都:
- 領袖:
- 色彩:
- 疆域:
- 描述:

## 組織

### 組織名稱
- 成立:
- 解散:
- 總部:
- 領袖:
- 成員:
- 色彩:
- 勢力範圍:
- 描述:

## 角色

### 角色名稱
- 定位:
- 出生:
- 死亡:
- 出身:
- 所在地:
- 狀態:
- 描述:

## 事件

### 事件名稱
- 年份:
- 地點:
- 參與者:
- 描述:

## 關係

### 關係名稱
- A:
- B:
- 類型:
- 起始:
- 結束:
- 備註:
`;
  }

  function parseStoryMarkdown(markdown, options = {}) {
    const sourceText = normalizeNewlines(markdown || "");
    const sections = splitSections(sourceText);
    const storyFields = readFields(sections.story?.content || "");
    const fileTitle = titleFromFileName(options.fileName || "");
    const title = cleanText(options.title)
      || cleanText(valueOf(storyFields, ["名稱", "name", "title", "故事名稱", "story name"]))
      || firstHeading(sourceText)
      || fileTitle
      || "Untitled Story";
    const subtitle = cleanText(valueOf(storyFields, ["副標題", "subtitle", "tagline"]))
      || cleanText(firstBodyLine(sections.worldview?.content || sections.outline?.content || ""))
      || "Imported story settings";
    const defaultYear = toNumber(valueOf(storyFields, ["預設年份", "defaultYear", "default year", "currentYear", "current year", "年份"]), 0);

    const world = {
      schema: TEMPLATE_SCHEMA,
      storyId: slugify(title, "story"),
      name: title,
      subtitle,
      defaultYear,
      worldview: noteBody(sections.worldview?.content || ""),
      outline: noteBody(sections.outline?.content || ""),
      regions: [],
      rivers: [],
      mountains: [],
      forests: [],
      ruins: [],
      places: [],
      eras: [],
      events: [],
      countries: [],
      organizations: [],
      characters: [],
      relationships: [],
      library: { books: [] }
    };

    const placeBook = new Map();
    const addPlace = (name, data = {}) => {
      const cleanName = cleanText(name);
      if (!cleanName || isBlankPlaceholder(cleanName)) return null;
      const key = normalizeName(cleanName);
      const existing = placeBook.get(key);
      if (existing) {
        if (data.x != null) existing.x = data.x;
        if (data.y != null) existing.y = data.y;
        if (data.body && !existing.body) existing.body = data.body;
        return existing;
      }
      const point = data.x != null && data.y != null ? { x: data.x, y: data.y } : autoPoint(placeBook.size);
      const place = {
        id: uniqueId(world.places, "pl", cleanName),
        name: cleanName,
        x: point.x,
        y: point.y
      };
      if (data.body) place.body = data.body;
      world.places.push(place);
      placeBook.set(key, place);
      return place;
    };

    for (const block of itemBlocks(sections.places?.content || "")) {
      const fields = readFields(block.content);
      const name = cleanText(valueOf(fields, ["名稱", "name", "title"])) || block.title;
      const body = cleanText(valueOf(fields, ["描述", "說明", "body", "description", "blurb"])) || sectionBody(block.content);
      if (skipEmptyItem(name, fields, body)) continue;
      const point = parsePoint(valueOf(fields, ["座標", "coords", "coordinate", "coordinates", "xy", "位置"]));
      addPlace(name, { ...point, body });
    }

    world.eras = itemBlocks(sections.eras?.content || "").map((block, index) => {
      const fields = readFields(block.content);
      const name = cleanText(valueOf(fields, ["名稱", "name", "title"])) || block.title;
      const body = cleanText(valueOf(fields, ["摘要", "描述", "blurb", "body", "description"])) || sectionBody(block.content);
      if (skipEmptyItem(name, fields, body)) return null;
      return stripEmpty({
        id: uniqueId(world.eras, "era", name || `Era ${index + 1}`),
        name: name || `Era ${index + 1}`,
        start: toNumber(valueOf(fields, ["起始", "開始", "start", "from"]), index === 0 ? defaultYear : defaultYear + index),
        end: toNumber(valueOf(fields, ["結束", "end", "to"]), index === 0 ? defaultYear + 1 : defaultYear + index + 1),
        compressed: toNumber(valueOf(fields, ["壓縮倍率", "compressed", "scale"]), 1),
        accent: cleanText(valueOf(fields, ["色彩", "顏色", "accent", "color", "colour"])) || DEFAULT_ACCENTS[index % DEFAULT_ACCENTS.length],
        blurb: body
      });
    }).filter(Boolean);

    if (!world.eras.length) {
      world.eras.push({
        id: "present",
        name: "Present",
        start: defaultYear,
        end: defaultYear + 1,
        compressed: 1,
        accent: "#c89859",
        blurb: "Imported present day."
      });
    }

    world.countries = itemBlocks(sections.countries?.content || "").map((block, index) => {
      const fields = readFields(block.content);
      const name = cleanText(valueOf(fields, ["名稱", "name", "title"])) || block.title;
      const body = cleanText(valueOf(fields, ["描述", "說明", "body", "description", "blurb"])) || sectionBody(block.content);
      if (skipEmptyItem(name, fields, body)) return null;
      const capital = addPlace(valueOf(fields, ["首都", "capital", "capital city"]));
      const founded = toNumber(valueOf(fields, ["成立", "建國", "founded", "born"]), defaultYear);
      const territory = cleanText(valueOf(fields, ["疆域", "領土", "territory", "borders"])) || (capital ? territoryFor(capital, index) : "");
      return stripEmpty({
        id: uniqueId(world.countries, "co", name),
        name,
        accent: cleanText(valueOf(fields, ["色彩", "顏色", "accent", "color", "colour"])) || DEFAULT_ACCENTS[index % DEFAULT_ACCENTS.length],
        founded,
        dissolved: nullableNumber(valueOf(fields, ["滅亡", "解體", "dissolved", "ended"])),
        snapshots: [stripEmpty({
          year: toNumber(valueOf(fields, ["年份", "year", "snapshot year"]), founded),
          capital: capital ? locationFromPlace(capital) : undefined,
          leader: cleanText(valueOf(fields, ["領袖", "統治者", "leader", "ruler"])),
          body,
          territory
        })]
      });
    }).filter(Boolean);

    world.organizations = itemBlocks(sections.organizations?.content || "").map((block, index) => {
      const fields = readFields(block.content);
      const name = cleanText(valueOf(fields, ["名稱", "name", "title"])) || block.title;
      const body = cleanText(valueOf(fields, ["描述", "說明", "body", "description", "blurb"])) || sectionBody(block.content);
      if (skipEmptyItem(name, fields, body)) return null;
      const hq = addPlace(valueOf(fields, ["總部", "據點", "hq", "headquarters", "base"]));
      const founded = toNumber(valueOf(fields, ["成立", "founded", "born"]), defaultYear);
      return stripEmpty({
        id: uniqueId(world.organizations, "or", name),
        name,
        accent: cleanText(valueOf(fields, ["色彩", "顏色", "accent", "color", "colour"])) || DEFAULT_ACCENTS[(index + 2) % DEFAULT_ACCENTS.length],
        founded,
        dissolved: nullableNumber(valueOf(fields, ["解散", "滅亡", "dissolved", "ended"])),
        snapshots: [stripEmpty({
          year: toNumber(valueOf(fields, ["年份", "year", "snapshot year"]), founded),
          hq: hq ? locationFromPlace(hq) : undefined,
          leader: cleanText(valueOf(fields, ["領袖", "leader"])),
          members: nullableNumber(valueOf(fields, ["成員", "人數", "members"])),
          body,
          territory: cleanText(valueOf(fields, ["勢力範圍", "territory", "domain", "borders"]))
        })]
      });
    }).filter(Boolean);

    world.characters = itemBlocks(sections.characters?.content || "").map((block, index) => {
      const fields = readFields(block.content);
      const name = cleanText(valueOf(fields, ["名稱", "name", "title"])) || block.title;
      const body = cleanText(valueOf(fields, ["描述", "說明", "body", "description", "blurb"])) || sectionBody(block.content);
      if (skipEmptyItem(name, fields, body)) return null;
      const place = addPlace(valueOf(fields, ["所在地", "位置", "location", "place", "where"]));
      const born = toNumber(valueOf(fields, ["出生", "born", "birth"]), defaultYear - 25);
      return stripEmpty({
        id: uniqueId(world.characters, "ch", name),
        name,
        role: cleanText(valueOf(fields, ["定位", "角色定位", "身份", "role", "job"])) || "Imported character",
        born,
        died: nullableNumber(valueOf(fields, ["死亡", "died", "death"])),
        originRegionId: null,
        snapshots: [stripEmpty({
          year: toNumber(valueOf(fields, ["年份", "year", "snapshot year"]), Math.max(born, defaultYear)),
          location: place ? locationFromPlace(place) : undefined,
          status: cleanText(valueOf(fields, ["狀態", "status"])) || "present",
          body
        })],
        body
      });
    }).filter(Boolean);

    const entityIndex = entityLookup(world);

    world.events = itemBlocks(sections.events?.content || "").map((block, index) => {
      const fields = readFields(block.content);
      const title = cleanText(valueOf(fields, ["名稱", "標題", "name", "title"])) || block.title;
      const body = cleanText(valueOf(fields, ["描述", "說明", "body", "description", "blurb"])) || sectionBody(block.content);
      if (skipEmptyItem(title, fields, body)) return null;
      const place = addPlace(valueOf(fields, ["地點", "所在地", "place", "location"]));
      return stripEmpty({
        id: uniqueId(world.events, "ev", title || `Event ${index + 1}`),
        year: toNumber(valueOf(fields, ["年份", "year", "date"]), defaultYear),
        title,
        body,
        placeId: place?.id || null,
        participants: splitList(valueOf(fields, ["參與者", "participants", "people", "entities"]))
          .map((name) => entityIndex.get(normalizeName(name)) || name)
          .filter(Boolean)
      });
    }).filter(Boolean);

    world.relationships = parseRelationships(sections.relationships?.content || "", world);
    world.library = libraryFromImport(world);

    return {
      title: world.name,
      world,
      summary: {
        characters: world.characters.length,
        organizations: world.organizations.length,
        countries: world.countries.length,
        places: world.places.length,
        events: world.events.length,
        eras: world.eras.length,
        relationships: world.relationships.length
      }
    };
  }

  function parseRelationships(content, world) {
    const blocks = itemBlocks(content);
    const entityIndex = entityLookup(world);
    const relationships = [];

    if (blocks.length) {
      for (const block of blocks) {
        const fields = readFields(block.content);
        const a = cleanText(valueOf(fields, ["A", "a", "甲", "from", "來源"]));
        const b = cleanText(valueOf(fields, ["B", "b", "乙", "to", "目標"]));
        const note = cleanText(valueOf(fields, ["備註", "note", "notes", "描述", "description"])) || sectionBody(block.content);
        if (!a || !b) continue;
        relationships.push(stripEmpty({
          id: uniqueId(relationships, "rl", block.title || `${a}-${b}`),
          a: entityIndex.get(normalizeName(a)) || a,
          b: entityIndex.get(normalizeName(b)) || b,
          kind: cleanText(valueOf(fields, ["類型", "關係", "kind", "type"])) || "ally",
          since: nullableNumber(valueOf(fields, ["起始", "開始", "since", "from"])),
          until: nullableNumber(valueOf(fields, ["結束", "until", "to"])),
          note
        }));
      }
      return relationships;
    }

    for (const line of content.split("\n")) {
      const text = line.replace(/^\s*[-*]\s+/, "").trim();
      if (!text) continue;
      const match = text.match(/^(.+?)(?:->|=>|--|—|：|:)(.+?)(?:[;；](.*))?$/);
      if (!match) continue;
      const a = cleanText(match[1]);
      const rest = cleanText(match[2]);
      const parts = rest.split(/[;；]/).map(cleanText).filter(Boolean);
      const b = parts.shift() || rest;
      relationships.push(stripEmpty({
        id: uniqueId(relationships, "rl", `${a}-${b}`),
        a: entityIndex.get(normalizeName(a)) || a,
        b: entityIndex.get(normalizeName(b)) || b,
        kind: parts[0] || "ally",
        note: match[3] || ""
      }));
    }
    return relationships;
  }

  function libraryFromImport(world) {
    const chapters = [];
    if (world.worldview) {
      chapters.push({
        id: "chap_worldview",
        title: "世界觀",
        year: world.defaultYear,
        placeId: null,
        focusIds: [],
        eventIds: [],
        status: "outline",
        words: wordCount(world.worldview),
        md: `# 世界觀\n\n${world.worldview}`,
        illustrations: []
      });
    }
    if (world.outline) {
      chapters.push({
        id: "chap_outline",
        title: "故事大綱",
        year: world.defaultYear,
        placeId: null,
        focusIds: [],
        eventIds: [],
        status: "outline",
        words: wordCount(world.outline),
        md: `# 故事大綱\n\n${world.outline}`,
        illustrations: []
      });
    }
    if (!chapters.length) return { books: [] };
    return {
      books: [{
        id: "bk_imported_setting",
        title: "匯入設定與大綱",
        subtitle: world.name,
        author: "Novel Elf Import",
        year: world.defaultYear,
        status: "outline",
        motif: "leaf",
        accent: "#c89859",
        blurb: world.worldview || world.outline || "",
        volumes: [{
          id: "vol_imported_notes",
          title: "設定筆記",
          subtitle: "World bible and outline",
          chapters
        }]
      }]
    };
  }

  function splitSections(text) {
    const sections = {};
    let current = "intro";
    let title = "";
    const push = (line) => {
      if (!sections[current]) sections[current] = { title, content: "" };
      sections[current].content += `${line}\n`;
    };

    for (const line of text.split("\n")) {
      const match = line.match(/^##\s+(.+?)\s*$/);
      if (match && !line.startsWith("###")) {
        title = match[1].trim();
        current = sectionKey(title) || slugify(title, "section");
        if (!sections[current]) sections[current] = { title, content: "" };
        continue;
      }
      push(line);
    }
    return sections;
  }

  function sectionKey(value) {
    const text = normalizeName(value);
    if (hasAny(text, ["故事大綱", "大綱", "outline", "plot"])) return "outline";
    if (hasAny(text, ["世界觀", "設定", "worldview", "world bible", "premise"])) return "worldview";
    if (hasAny(text, ["故事", "基本", "story", "metadata", "meta"])) return "story";
    if (hasAny(text, ["年代", "時代", "eras", "era", "timeline spans"])) return "eras";
    if (hasAny(text, ["地點", "場所", "places", "place", "locations", "location"])) return "places";
    if (hasAny(text, ["國家", "countries", "country", "nations", "realms"])) return "countries";
    if (hasAny(text, ["組織", "organizations", "organization", "factions", "guilds"])) return "organizations";
    if (hasAny(text, ["角色", "人物", "characters", "character", "people"])) return "characters";
    if (hasAny(text, ["事件", "events", "event"])) return "events";
    if (hasAny(text, ["關係", "relationships", "relationship", "relations"])) return "relationships";
    return null;
  }

  function itemBlocks(content) {
    const blocks = [];
    let title = null;
    let lines = [];

    const flush = () => {
      if (title == null) return;
      blocks.push({ title: cleanText(title), content: lines.join("\n") });
    };

    for (const line of normalizeNewlines(content).split("\n")) {
      const match = line.match(/^###\s+(.+?)\s*$/);
      if (match) {
        flush();
        title = match[1];
        lines = [];
      } else if (title != null) {
        lines.push(line);
      }
    }

    flush();
    return blocks;
  }

  function readFields(content) {
    const fields = new Map();
    for (const line of normalizeNewlines(content).split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(">") || trimmed.startsWith("<!--")) continue;
      const match = trimmed.match(/^(?:[-*]\s*)?([^:：]+?)\s*[:：]\s*(.*)$/);
      if (!match) continue;
      const key = normalizeFieldKey(match[1]);
      if (!key) continue;
      fields.set(key, cleanText(match[2]));
    }
    return fields;
  }

  function valueOf(fields, keys) {
    for (const key of keys) {
      const value = fields.get(normalizeFieldKey(key));
      if (!isBlank(value)) return value;
    }
    return "";
  }

  function sectionBody(content) {
    return normalizeNewlines(content)
      .split("\n")
      .filter((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(">") || trimmed.startsWith("<!--")) return false;
        if (/^(?:[-*]\s*)?[^:：]+?\s*[:：]\s*$/.test(trimmed)) return false;
        return !/^(?:[-*]\s*)?[^:：]+?\s*[:：]\s*.+$/.test(trimmed);
      })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function noteBody(content) {
    return normalizeNewlines(content)
      .split("\n")
      .filter((line) => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith(">") && !trimmed.startsWith("<!--") && !trimmed.startsWith("### ");
      })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function firstBodyLine(content) {
    return sectionBody(content).split("\n").map(cleanText).find(Boolean) || "";
  }

  function firstHeading(text) {
    const match = normalizeNewlines(text).match(/^#\s+(.+?)\s*$/m);
    const heading = cleanText(match?.[1] || "");
    if (!heading || heading.toLowerCase().includes("novel elf")) return "";
    return heading;
  }

  function titleFromFileName(fileName) {
    const base = String(fileName || "")
      .split(/[\\/]/)
      .pop()
      .replace(/\.[^.]+$/, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return base || "Untitled Story";
  }

  function entityLookup(world) {
    const lookup = new Map();
    for (const item of [...world.characters, ...world.organizations, ...world.countries]) {
      lookup.set(normalizeName(item.name), item.id);
      lookup.set(normalizeName(item.id), item.id);
    }
    return lookup;
  }

  function skipEmptyItem(name, fields, body) {
    const fieldValues = [...fields.values()].filter((value) => !isBlank(value));
    return isBlankPlaceholder(name) && !fieldValues.length && !cleanText(body);
  }

  function isBlankPlaceholder(value) {
    const text = normalizeName(value);
    return !text || hasAny(text, [
      "名稱", "故事名稱", "年代名稱", "地點名稱", "國家名稱", "組織名稱", "角色名稱", "事件名稱", "關係名稱",
      "name", "title", "place name", "country name", "organization name", "character name", "event name"
    ]);
  }

  function isBlank(value) {
    const text = cleanText(value).toLowerCase();
    return !text || ["-", "n/a", "na", "none", "null", "無", "沒有", "未定", "待填"].includes(text);
  }

  function cleanText(value) {
    return String(value ?? "")
      .replace(/^["'“”]+|["'“”]+$/g, "")
      .trim();
  }

  function normalizeNewlines(value) {
    return String(value || "").replace(/\r\n?/g, "\n");
  }

  function normalizeFieldKey(value) {
    return normalizeName(String(value || "").replace(/^[#\s-]+/, ""));
  }

  function normalizeName(value) {
    return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function hasAny(value, needles) {
    return needles.some((needle) => value.includes(normalizeName(needle)));
  }

  function toNumber(value, fallback) {
    const text = cleanText(value).replace(/[,，]/g, "");
    const match = text.match(/-?\d+(?:\.\d+)?/);
    if (!match) return fallback;
    const number = Number(match[0]);
    return Number.isFinite(number) ? number : fallback;
  }

  function nullableNumber(value) {
    if (isBlank(value)) return null;
    return toNumber(value, null);
  }

  function parsePoint(value) {
    const nums = cleanText(value).match(/-?\d+(?:\.\d+)?/g);
    if (!nums || nums.length < 2) return {};
    return {
      x: clamp(Number(nums[0]), 20, 940),
      y: clamp(Number(nums[1]), 20, 600)
    };
  }

  function splitList(value) {
    return cleanText(value).split(/[,，、;；\n]/).map(cleanText).filter(Boolean);
  }

  function autoPoint(index) {
    const columns = 5;
    const col = index % columns;
    const row = Math.floor(index / columns);
    return {
      x: 150 + col * 175 + (row % 2) * 35,
      y: 130 + (row % 4) * 115
    };
  }

  function territoryFor(place, index) {
    const radius = 58 + (index % 3) * 12;
    const points = [];
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI * 2 * i) / 6 + 0.32;
      points.push(`${Math.round(clamp(place.x + Math.cos(angle) * radius, 20, 940))},${Math.round(clamp(place.y + Math.sin(angle) * radius, 20, 600))}`);
    }
    return points.join(" ");
  }

  function locationFromPlace(place) {
    return { x: place.x, y: place.y, name: place.name };
  }

  function uniqueId(items, prefix, name) {
    const base = `${prefix}_${slugify(name, prefix)}`.replace(new RegExp(`^${prefix}_${prefix}$`), prefix);
    const used = new Set(items.map((item) => item.id));
    let candidate = base;
    let index = 2;
    while (used.has(candidate)) {
      candidate = `${base}_${index}`;
      index += 1;
    }
    return candidate;
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

  function stripEmpty(value) {
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      if (item === undefined) continue;
      if (typeof item === "string" && item.trim() === "") continue;
      out[key] = item;
    }
    return out;
  }

  function wordCount(value) {
    return cleanText(value).split(/\s+/).filter(Boolean).length;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  window.StoryImport = {
    parseStoryMarkdown,
    templateMarkdown,
    titleFromFileName,
    templateFileName: TEMPLATE_FILE_NAME
  };
})();
