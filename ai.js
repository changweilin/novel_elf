// AI helpers — wrap window.claude.complete with prompts shaped to the chronicle schema.
// Each generator returns JSON shaped to fit the data model.

async function aiGenerateCharacter(world, hint, year) {
  const era = world.eras.find((e) => year >= e.start && year <= e.end);
  const places = world.places.map((p) => p.name).join(", ");
  const prompt = `Setting bible for ${world.name} — ${world.subtitle}.
Era: ${era ? era.name + " (" + era.blurb + ")" : "—"}. Year: ${year}.
Known places: ${places}.
${hint ? "User direction: " + hint : ""}

Invent ONE new character. Spare, observed, oblique voice. No clichés. They have a wound, a want, a tell.

Reply STRICT JSON only:
{
  "name": "Full name with a byname if it fits",
  "role": "Their station, one phrase",
  "born": ${year - 30},
  "body": "Two to four sentences. Sensory. Specific.",
  "snapshots": [
    {"year": ${year - 20}, "place": "<pick one from known places>", "status": "Apprentice or similar", "body": "One sentence."},
    {"year": ${year}, "place": "<pick one>", "status": "Their station now", "body": "One sentence."}
  ]
}`;
  return parseJsonLoose(await window.claude.complete(prompt));
}

async function aiGenerateEvent(world, hint, year, placeId) {
  const era = world.eras.find((e) => year >= e.start && year <= e.end);
  const place = world.places.find((p) => p.id === placeId);
  const nearby = world.events.filter((ev) => Math.abs(ev.year - year) < 300).slice(0, 6).map((ev) => `  ${ev.year}: ${ev.title} — ${ev.body}`).join("\n");
  const cands = [...world.characters, ...world.organizations, ...world.countries].slice(0, 16).map((e) => `${e.id} (${e.name})`).join(", ");
  const prompt = `Chronicle of ${world.name}.
Year: ${year} (${era ? era.name : ""}). Place: ${place ? place.name : "anywhere"}.
Existing nearby events:
${nearby || "  (none)"}
Possible participants by id (pick 0–3 by id only): ${cands}
${hint ? "User hint: " + hint : ""}

Invent ONE event. Two sentences. One sensory detail.

Reply STRICT JSON only:
{"title":"Short evocative title","body":"Two sentences.","year":${year},"placeId":${place ? `"${place.id}"` : "null"},"participants":["id_or_empty"]}`;
  const out = parseJsonLoose(await window.claude.complete(prompt));
  // sanitize participants — keep only valid ids
  const ids = new Set([...world.characters, ...world.organizations, ...world.countries].map((e) => e.id));
  out.participants = (out.participants || []).filter((id) => ids.has(id));
  return out;
}

async function aiGenerateOrg(world, hint, year) {
  const era = world.eras.find((e) => year >= e.start && year <= e.end);
  const places = world.places.map((p) => p.name).join(", ");
  const prompt = `Setting bible for ${world.name}.
Era: ${era ? era.name : "—"}. Year: ${year}. Known places: ${places}.
${hint ? "User direction: " + hint : ""}

Invent ONE organization — guild, order, cabal, fleet, sect, brotherhood, league.
Voice: oblique, specific, no fantasy clichés. Give it a doctrine, an enemy, a smell.

Reply STRICT JSON only:
{
  "name":"Their name","accent":"#hexcolor","founded":${year - 50},"dissolved":null,
  "snapshots":[
    {"year":${year - 40},"hq":"<known place name>","leader":"First leader","members":12,"body":"Founding sentence."},
    {"year":${year},"hq":"<known place name>","leader":"Current leader","members":300,"body":"At its height."}
  ]
}`;
  return parseJsonLoose(await window.claude.complete(prompt));
}

async function aiGenerateCountry(world, hint, year) {
  const era = world.eras.find((e) => year >= e.start && year <= e.end);
  const places = world.places.map((p) => p.name).join(", ");
  const prompt = `Setting bible for ${world.name}.
Era: ${era ? era.name : "—"}. Year: ${year}. Known places: ${places}.
${hint ? "User direction: " + hint : ""}

Invent ONE country / realm / polity. Particular, slightly strange. Not "the kingdom of X". Give it a custom, a debt, a border quarrel.

Reply STRICT JSON only:
{
  "name":"Realm name","accent":"#hexcolor","founded":${year - 200},"dissolved":null,
  "snapshots":[
    {"year":${year - 180},"capital":"<known place name>","leader":"First named ruler","body":"Founding sentence."},
    {"year":${year},"capital":"<known place name>","leader":"Current ruler","body":"How it stands now."}
  ]
}`;
  return parseJsonLoose(await window.claude.complete(prompt));
}

async function aiFillEntity(world, kind, ent, year) {
  const prompt = `Continue the setting bible for ${world.name}. Flesh out the following ${kind}, adding a NEW snapshot in or after year ${year} and ONE new relationship to an existing entity.

EXISTING ${kind.toUpperCase()}:
${JSON.stringify(ent, null, 2)}

EXISTING ENTITIES (id → name):
${[...world.characters, ...world.organizations, ...world.countries].map((e) => `  ${e.id} → ${e.name}`).join("\n")}

Reply STRICT JSON:
{
  "snapshot": { ... a new snapshot, schema matches the existing ones above, set year >= ${year} ... },
  "relationship": { "targetId":"<id from list>", "kind":"ally|war|feud|trade|vassal|oath|rival|leads|loves|mentor", "since":${year}, "note":"one line" }
}`;
  return parseJsonLoose(await window.claude.complete(prompt));
}

async function aiContinueStory(world, currentYear, focusId, hint) {
  const focus = AVN.findEntity(world, focusId);
  const era = world.eras.find((e) => currentYear >= e.start && currentYear <= e.end);
  const visibleEvents = world.events.filter((ev) => Math.abs(ev.year - currentYear) <= 50).map((ev) => `${ev.year}: ${ev.title} — ${ev.body}`).join("\n");
  const focusBlock = focus ? `Focus: ${focus.name || focus.title}${focus.role ? " — " + focus.role : ""}.\nDetails: ${focus.body || ""}` : "No specific focus.";
  const prompt = `Continue the novel of ${world.name}. Write ONE paragraph (80–130 words). Literary, image-led, present tense.

Year: ${currentYear} (${era ? era.name : ""}).
${focusBlock}
Recent events:
${visibleEvents || "(none)"}
${hint ? "Direction: " + hint : ""}

Prose only — no JSON, no preamble. One concrete object that does work in the paragraph.`;
  return (await window.claude.complete(prompt)).trim();
}

// ─────────────────────────────────────────────────────────────────
// Library / 書冊系統 — AI helpers for writing & syncing chapters
// ─────────────────────────────────────────────────────────────────

function entityNameById(world, id) {
  const e = AVN.findEntity(world, id);
  return e ? (e.name || e.title) : id;
}

function arr(value) {
  return Array.isArray(value) ? value : [];
}

function cleanLine(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function clampText(value, max = 700) {
  const text = cleanLine(value);
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

function firstText(...values) {
  for (const value of values) {
    const text = cleanLine(value);
    if (text) return text;
  }
  return "";
}

function mdSummary(md, max = 360) {
  return clampText(String(md || "")
    .replace(/^---[\s\S]*?---/m, "")
    .replace(/^#+\s+/gm, "")
    .replace(/!\[\[[^\]]+\]\]/g, "")
    .replace(/\*|\_/g, " "), max);
}

function findChapterFrame(world, chapter, bookArg, volumeArg) {
  if (bookArg && volumeArg) {
    const chapters = arr(volumeArg.chapters);
    const index = chapters.findIndex((item) => item.id === chapter.id);
    return { book: bookArg, volume: volumeArg, chapters, index };
  }

  for (const book of arr(world.library?.books)) {
    for (const volume of arr(book.volumes)) {
      const chapters = arr(volume.chapters);
      const index = chapters.findIndex((item) => item.id === chapter.id);
      if (index >= 0) return { book, volume, chapters, index };
    }
  }

  return { book: null, volume: null, chapters: [chapter], index: 0 };
}

function renderSceneCard(world, chapter) {
  const pov = chapter.povId ? AVN.findEntity(world, chapter.povId) : null;
  const lines = [
    `POV: ${pov ? pov.name || pov.title : chapter.povId || "—"}`,
    `Storylines: ${renderChapterStorylines(world, chapter)}`,
    `Scene type: ${chapter.sceneType || "unset"}`,
    `Narrative function: ${chapter.narrativeFunction || "unset"}`,
    `Tension level: ${chapter.tensionLevel || "unset"}`,
    `Scene goal: ${chapter.sceneGoal || "—"}`,
    `Conflict: ${chapter.conflict || "—"}`,
    `Turn: ${chapter.turn || "—"}`,
    `Emotional delta: ${chapter.emotionalDelta || "—"}`,
    `Promises raised: ${arr(chapter.promiseRaised).join("; ") || "(none)"}`,
    `Promises paid: ${arr(chapter.promisePaid).join("; ") || "(none)"}`,
    `Continuity notes: ${chapter.continuityNotes || "—"}`,
    `Chapter summary so far: ${chapter.summary || mdSummary(chapter.md, 280) || "—"}`,
    `Style key: ${chapter.styleKey || "match the surrounding chapter voice"}`
  ];
  return lines.join("\n");
}

function renderChapterStorylines(world, chapter) {
  const lines = arr(world.narrative?.storylines);
  const selected = arr(chapter.storylineIds)
    .map((id) => lines.find((line) => line.id === id))
    .filter(Boolean);
  const inferred = !selected.length && chapter.povId
    ? lines.filter((line) => arr(line.povIds).includes(chapter.povId))
    : [];
  const active = selected.length ? selected : inferred;
  return active.map((line) => {
    const share = Number(line.targetShare);
    const pct = Number.isFinite(share) && share > 0 ? ` ${Math.round(share * 100)}%` : "";
    return `${line.name || line.id}${pct}${line.promise ? " - " + line.promise : ""}`;
  }).join("; ") || "(none)";
}

function renderNarrativeDossier(world, chapter) {
  const narrative = world.narrative || {};
  const storylines = arr(narrative.storylines);
  const selectedIds = new Set(arr(chapter.storylineIds));
  const activeStorylines = storylines.filter((line) => (
    selectedIds.has(line.id) ||
    (chapter.povId && arr(line.povIds).includes(chapter.povId))
  ));
  const lines = activeStorylines.length
    ? activeStorylines
    : storylines.filter((line) => line.role === "main" || line.role === "secondary").slice(0, 4);
  const focusIds = new Set([chapter.povId, ...arr(chapter.focusIds)].filter(Boolean));
  const arcs = arr(narrative.characterArcs).filter((arc) => focusIds.has(arc.characterId));
  const raisedOrPaid = new Set([...arr(chapter.promiseRaised), ...arr(chapter.promisePaid)]);
  const loops = arr(narrative.openLoops)
    .filter((loop) => loop.status !== "closed" || raisedOrPaid.has(loop.id))
    .slice(0, 8);
  const style = narrative.style || {};

  return [
    narrative.premise ? `Premise: ${narrative.premise}` : "",
    arr(narrative.themes).length ? `Themes: ${arr(narrative.themes).join("; ")}` : "",
    lines.length ? `Storyline balance:\n${lines.map((line) => {
      const share = Number(line.targetShare);
      const pct = Number.isFinite(share) && share > 0 ? `${Math.round(share * 100)}%` : "unweighted";
      return `  ${line.id}: ${line.name || line.id} (${line.role || "supporting"}, target ${pct}) - ${line.currentPressure || line.promise || ""}`;
    }).join("\n")}` : "",
    arcs.length ? `Character arcs:\n${arcs.map((arc) => `  ${arc.characterId}: want=${arc.want || "-"}; need=${arc.need || "-"}; lie=${arc.lie || "-"}; stage=${arc.arcStage || "-"}; next=${arc.nextRequiredBeat || "-"}`).join("\n")}` : "",
    loops.length ? `Open loops:\n${loops.map((loop) => `  ${loop.id}: ${loop.question || ""} (${loop.importance || "minor"}, ${loop.status || "active"}, target ${loop.targetPayoff || "unset"})`).join("\n")}` : "",
    style.narration || style.tense || style.sentenceRhythm || style.metaphorRules || arr(style.avoid).length ? `Style bible:
  narration: ${style.narration || "-"}
  tense: ${style.tense || "-"}
  rhythm: ${style.sentenceRhythm || "-"}
  sensory priority: ${arr(style.sensoryPriority).join(", ") || "-"}
  metaphor rules: ${style.metaphorRules || "-"}
  dialogue: ${style.dialogue || "-"}
  avoid: ${arr(style.avoid).join(", ") || "-"}` : ""
  ].filter(Boolean).join("\n");
}

function renderRelatedChapters(frame) {
  const rows = [];
  for (const offset of [-2, -1, 1]) {
    const chapter = frame.chapters[frame.index + offset];
    if (!chapter) continue;
    rows.push(`${offset < 0 ? "Previous" : "Next"} ${Math.abs(offset)}: ${chapter.title || chapter.id} — ${chapter.summary || mdSummary(chapter.md, 260) || chapter.status || "no summary"}`);
  }
  return rows.join("\n") || "(none)";
}

function renderFocusDossier(world, chapter) {
  return arr(chapter.focusIds).map((id) => {
    const e = AVN.findEntity(world, id);
    if (!e) return id;
    const snap = AVN.snapAt(e, chapter.year);
    const rels = AVN.relsFor(world, id, chapter.year)
      .slice(0, 5)
      .map((r) => `${r.kind}: ${entityNameById(world, r.a === id ? r.b : r.a)}${r.note ? " — " + r.note : ""}`)
      .join("; ");
    const events = AVN.eventsForEntity(world, id)
      .filter((ev) => Math.abs(Number(ev.year) - Number(chapter.year)) <= 80)
      .slice(0, 4)
      .map((ev) => `${ev.year}: ${ev.title}`)
      .join("; ");
    return [
      `${e.id}: ${e.name || e.title}${e.role ? " — " + e.role : ""}`,
      `  state: ${snap ? `${snap.status || ""} ${snap.body || ""}`.trim() : "not active at this year"}`,
      `  relationships: ${rels || "(none nearby)"}`,
      `  nearby events: ${events || "(none)"}`
    ].join("\n");
  }).join("\n") || "(none)";
}

function renderWorldDossier(world, chapter) {
  const place = arr(world.places).find((p) => p.id === chapter.placeId);
  const era = arr(world.eras).find((e) => chapter.year >= e.start && chapter.year <= e.end);
  const boundEvents = arr(chapter.eventIds).map((id) => {
    const ev = world.events.find((x) => x.id === id);
    return ev ? `${ev.year}: ${ev.title} — ${ev.body}` : id;
  }).join("\n");
  const nearbyEvents = arr(world.events)
    .filter((ev) => Math.abs(Number(ev.year) - Number(chapter.year)) <= 50)
    .slice(0, 8)
    .map((ev) => `${ev.year}: ${ev.title} — ${clampText(ev.body, 180)}`)
    .join("\n");

  return [
    `Year: ${chapter.year}${era ? " (" + era.name + ")" : ""}`,
    `Place: ${place ? `${place.name}${place.body ? " — " + clampText(place.body, 220) : ""}` : "—"}`,
    `Bound events:\n${boundEvents || "(none)"}`,
    `Nearby chronology:\n${nearbyEvents || "(none)"}`
  ].join("\n");
}

function buildWritingContext(world, chapter, bookArg, volumeArg) {
  const frame = findChapterFrame(world, chapter, bookArg, volumeArg);
  const book = frame.book || {};
  const volume = frame.volume || {};
  const sections = {
    story: [
      `Story: ${world.name}${world.subtitle ? " — " + world.subtitle : ""}`,
      `Book: ${book.title || "—"}${book.subtitle ? " — " + book.subtitle : ""}`,
      `Book promise: ${firstText(book.blurb, world.outline, world.worldview, world.subtitle, "—")}`,
      `Volume: ${volume.title || "—"}${volume.subtitle ? " — " + volume.subtitle : ""}`
    ].join("\n"),
    scene: renderSceneCard(world, chapter),
    narrative: renderNarrativeDossier(world, chapter),
    canon: renderWorldDossier(world, chapter),
    focus: renderFocusDossier(world, chapter),
    neighboringChapters: renderRelatedChapters(frame)
  };

  return {
    sections,
    prompt: `STORY DOSSIER
${sections.story}

SCENE CARD
${sections.scene}

NARRATIVE BLUEPRINT
${sections.narrative || "(none)"}

CANON CONTEXT
${sections.canon}

FOCUS DOSSIER
${sections.focus}

NEIGHBORING CHAPTERS
${sections.neighboringChapters}`
  };
}

function chapterContext(world, chapter, book, volume) {
  return buildWritingContext(world, chapter, book, volume).prompt;
}

async function aiWriteChapterParagraph(world, chapter, hint, book, volume) {
  const ctx = chapterContext(world, chapter, book, volume);
  const tail = (chapter.md || "").split(/\n+/).slice(-6).join("\n");
  const prompt = `Continue this chapter of "${world.name}". Write ONE paragraph (80–140 words). Literary, image-led, present tense. One concrete object that does real work in the paragraph. No fantasy clichés.

Chapter: "${chapter.title}"
${ctx}

Tail of what is already on the page:
"""
${tail || "(blank page)"}
"""

${hint ? "Direction: " + hint : ""}

Reply with the paragraph only. No preamble, no JSON, no headings.`;
  return (await window.claude.complete(prompt)).trim();
}

async function aiSyncChapterToWorld(world, chapter, book, volume) {
  const ctx = chapterContext(world, chapter, book, volume);
  const knownIds = [...world.characters, ...world.organizations, ...world.countries, ...world.events]
    .map((e) => `  ${e.id} → ${e.name || e.title}`).join("\n");
  const prompt = `You are a Setting-Bible Scribe for ${world.name}.
The following chapter has been newly written or edited. Extract any facts about characters, organizations, countries, places, or events that should update the world bible.

Chapter "${chapter.title}":
"""
${(chapter.md || "").slice(0, 4000)}
"""

Context: ${ctx}

Existing entities (id → name):
${knownIds}

Return STRICT JSON only. This is a REVIEW PROPOSAL, not an automatic save. Use empty arrays if nothing to add.
{
  "snapshots":   [ {"entityId":"<id from list>","year":${chapter.year},"body":"one sentence of new info","status":"optional","place":"optional place name"} ],
  "events":      [ {"title":"...","body":"two sentences","year":${chapter.year},"placeId":"optional","participants":["entityIds"]} ],
  "relationships":[ {"a":"<id>","b":"<id>","kind":"ally|war|feud|trade|vassal|oath|rival|leads|loves|mentor","since":${chapter.year},"note":"one line"} ],
  "summary": "one-line summary of what this chapter contributes to the bible"
}`;
  return parseJsonLoose(await window.claude.complete(prompt));
}

async function aiCheckConsistency(world, chapter, book, volume) {
  const ctx = chapterContext(world, chapter, book, volume);
  const relevant = [...(chapter.focusIds || []), ...(chapter.eventIds || [])].map((id) => {
    const e = AVN.findEntity(world, id);
    if (!e) return null;
    return `${id} — ${e.name || e.title}\n${JSON.stringify(e, null, 2).slice(0, 1400)}`;
  }).filter(Boolean).join("\n\n");
  const prompt = `You are a continuity reader for ${world.name}. Read the chapter against the setting bible and report any contradictions — not stylistic notes, only facts.

Chapter "${chapter.title}":
"""
${(chapter.md || "").slice(0, 4000)}
"""

Context: ${ctx}

Relevant bible entries:
${relevant || "(none)"}

Return STRICT JSON only:
{
  "warnings": [
    {"severity":"high|medium|low","entityId":"<id or null>","field":"<short name e.g. location/status/year>","says":"what the bible says","contradicts":"what the chapter says","suggestion":"one line — reconcile by …"}
  ]
}
If there are no contradictions, return {"warnings": []}.`;
  return parseJsonLoose(await window.claude.complete(prompt));
}

window.aiWriteChapterParagraph = aiWriteChapterParagraph;
window.aiSyncChapterToWorld = aiSyncChapterToWorld;
window.aiCheckConsistency = aiCheckConsistency;
window.buildWritingContext = buildWritingContext;

function parseJsonLoose(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("No JSON returned: " + text.slice(0, 200));
  return JSON.parse(m[0]);
}

function resolvePlaceName(world, name) {
  if (!name) return null;
  return world.places.find((p) => p.name.toLowerCase() === name.toLowerCase()) || null;
}

window.aiGenerateCharacter = aiGenerateCharacter;
window.aiGenerateEvent = aiGenerateEvent;
window.aiGenerateOrg = aiGenerateOrg;
window.aiGenerateCountry = aiGenerateCountry;
window.aiFillEntity = aiFillEntity;
window.aiContinueStory = aiContinueStory;
window.resolvePlaceName = resolvePlaceName;
