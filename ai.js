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

function chapterContext(world, chapter) {
  const place = world.places.find((p) => p.id === chapter.placeId);
  const era = world.eras.find((e) => chapter.year >= e.start && chapter.year <= e.end);
  const focuses = (chapter.focusIds || []).map((id) => {
    const e = AVN.findEntity(world, id);
    if (!e) return id;
    const snap = AVN.snapAt(e, chapter.year);
    return `${e.name || e.title} (${e.role || "—"})${snap?.body ? " · " + snap.body : ""}`;
  }).join("\n  ");
  const events = (chapter.eventIds || []).map((id) => {
    const ev = world.events.find((x) => x.id === id);
    return ev ? `${ev.year}: ${ev.title} — ${ev.body}` : id;
  }).join("\n  ");
  return `Year ${chapter.year}${era ? " (" + era.name + ")" : ""}. Place: ${place ? place.name : "—"}.
Focus characters:
  ${focuses || "(none)"}
Bound events:
  ${events || "(none)"}`;
}

async function aiWriteChapterParagraph(world, chapter, hint) {
  const ctx = chapterContext(world, chapter);
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

async function aiSyncChapterToWorld(world, chapter) {
  const ctx = chapterContext(world, chapter);
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

Return STRICT JSON only. Use empty arrays if nothing to add.
{
  "snapshots":   [ {"entityId":"<id from list>","year":${chapter.year},"body":"one sentence of new info","status":"optional","place":"optional place name"} ],
  "events":      [ {"title":"...","body":"two sentences","year":${chapter.year},"placeId":"optional","participants":["entityIds"]} ],
  "relationships":[ {"a":"<id>","b":"<id>","kind":"ally|war|feud|trade|vassal|oath|rival|leads|loves|mentor","since":${chapter.year},"note":"one line"} ],
  "summary": "one-line summary of what this chapter contributes to the bible"
}`;
  return parseJsonLoose(await window.claude.complete(prompt));
}

async function aiCheckConsistency(world, chapter) {
  const ctx = chapterContext(world, chapter);
  const relevant = [...(chapter.focusIds || []), ...(chapter.eventIds || [])].map((id) => {
    const e = AVN.findEntity(world, id);
    if (!e) return null;
    return `${id} — ${e.name || e.title}\n${JSON.stringify(e, null, 2).slice(0, 800)}`;
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
