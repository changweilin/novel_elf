import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  createEmptyWorld,
  loadSeedWorld,
  readWorldFromMarkdown,
  writeWorldToMarkdown
} from "./story-md.mjs";

const projectRoot = dirname(fileURLToPath(import.meta.url));

test("Aevenmere seed round-trips through Markdown wiki files", async () => {
  const tmp = await mkdtemp(join(tmpdir(), "novel-elf-md-"));
  try {
    const seed = await loadSeedWorld(projectRoot);
    await writeWorldToMarkdown(join(tmp, "aevenmere"), "aevenmere", seed, { archiveMissing: false });
    const readBack = await readWorldFromMarkdown(join(tmp, "aevenmere"));

    assert.equal(readBack.name, seed.name);
    assert.equal(readBack.events.length, seed.events.length);
    assert.equal(readBack.characters.length, seed.characters.length);
    assert.equal(readBack.organizations.length, seed.organizations.length);
    assert.equal(readBack.countries.length, seed.countries.length);
    assert.equal(chapterCount(readBack), chapterCount(seed));
    assert.deepEqual(readBack.events.map((event) => event.id), seed.events.map((event) => event.id));
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test("empty stories keep the minimum fields needed by map and timeline", async () => {
  const tmp = await mkdtemp(join(tmpdir(), "novel-elf-empty-"));
  try {
    const empty = createEmptyWorld({ id: "blank", name: "Blank Story" });
    await writeWorldToMarkdown(join(tmp, "blank"), "blank", empty, { archiveMissing: false });
    const readBack = await readWorldFromMarkdown(join(tmp, "blank"));

    assert.equal(readBack.name, "Blank Story");
    assert.ok(readBack.eras.length >= 1);
    assert.ok(Array.isArray(readBack.regions));
    assert.ok(Array.isArray(readBack.events));
    assert.ok(Array.isArray(readBack.library.books));
    assert.equal(readBack.defaultYear, 0);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test("chapter scene card metadata round-trips through Markdown frontmatter", async () => {
  const tmp = await mkdtemp(join(tmpdir(), "novel-elf-scene-"));
  try {
    const world = createEmptyWorld({ id: "scene", name: "Scene Story", defaultYear: 12 });
    world.library.books.push({
      id: "bk_scene",
      title: "Scene Book",
      subtitle: "",
      author: "Test",
      status: "draft",
      year: 12,
      blurb: "A controlled scene.",
      volumes: [{
        id: "vol_scene",
        title: "Volume",
        subtitle: "",
        chapters: [{
          id: "ch_scene",
          title: "Scene Card",
          year: 12,
          placeId: null,
          focusIds: [],
          eventIds: [],
          status: "outline",
          words: 0,
          povId: "ch_a",
          sceneGoal: "Find the missing ledger.",
          conflict: "The witness will only answer in numbers.",
          turn: "The ledger is already blank.",
          emotionalDelta: "certainty to dread",
          continuityNotes: "The bell cannot ring before dusk.",
          summary: "A witness changes the investigation.",
          styleKey: "close third, tactile",
          md: "# Scene Card\n\nDraft.",
          illustrations: []
        }]
      }]
    });

    await writeWorldToMarkdown(join(tmp, "scene"), "scene", world, { archiveMissing: false });
    const readBack = await readWorldFromMarkdown(join(tmp, "scene"));
    const chapter = readBack.library.books[0].volumes[0].chapters[0];

    assert.equal(chapter.povId, "ch_a");
    assert.equal(chapter.sceneGoal, "Find the missing ledger.");
    assert.equal(chapter.conflict, "The witness will only answer in numbers.");
    assert.equal(chapter.turn, "The ledger is already blank.");
    assert.equal(chapter.emotionalDelta, "certainty to dread");
    assert.equal(chapter.continuityNotes, "The bell cannot ring before dusk.");
    assert.equal(chapter.summary, "A witness changes the investigation.");
    assert.equal(chapter.styleKey, "close third, tactile");
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

function chapterCount(world) {
  return (world.library?.books || []).reduce((bookSum, book) => {
    return bookSum + (book.volumes || []).reduce((volumeSum, volume) => {
      return volumeSum + (volume.chapters || []).length;
    }, 0);
  }, 0);
}
