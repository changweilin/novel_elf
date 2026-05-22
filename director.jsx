// Director's Desk -- narrative blueprint editor for AI-facing story structure.

const { useMemo: useMemoDirector } = React;

function directorArr(value) {
  return Array.isArray(value) ? value : [];
}

function directorSlug(value, fallback) {
  if (window.StoryStore?.slugify) return window.StoryStore.slugify(value, fallback);
  return String(value || fallback || "item").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || fallback || "item";
}

function defaultNarrative() {
  return {
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
}

function normalizeNarrativeUi(narrative) {
  const source = narrative || {};
  const base = defaultNarrative();
  return {
    ...base,
    ...source,
    themes: directorArr(source.themes),
    storylines: directorArr(source.storylines),
    characterArcs: directorArr(source.characterArcs),
    openLoops: directorArr(source.openLoops),
    style: {
      ...base.style,
      ...(source.style || {}),
      sensoryPriority: directorArr(source.style?.sensoryPriority),
      avoid: directorArr(source.style?.avoid)
    }
  };
}

function listText(value) {
  return directorArr(value).join(", ");
}

function parseList(value) {
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function percent(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 100) : 0;
}

function shareFromPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(1, number / 100));
}

function cloneNarrative(value) {
  return JSON.parse(JSON.stringify(value || defaultNarrative()));
}

function fantasyDefaultNarrative(world = {}) {
  const characterIds = directorArr(world.characters).map((character) => character.id).filter(Boolean);
  const pov = (...indexes) => indexes.map((index) => characterIds[index]).filter(Boolean);
  const arcCount = Math.max(3, Math.min(4, characterIds.length || 3));
  const arcTemplates = [
    {
      want: "Keep the people they love safe without accepting the larger call.",
      need: "Choose leadership as a service rather than a crown.",
      lie: "If they stay ordinary, the old war cannot touch them.",
      arcStage: "reluctant_call",
      nextRequiredBeat: "They must take responsibility for the first public consequence of the quest."
    },
    {
      want: "Earn trust, rank, or belonging inside a dangerous court or fellowship.",
      need: "Tell the truth before loyalty turns into silence.",
      lie: "Being useful is safer than being known.",
      arcStage: "guarded_ally",
      nextRequiredBeat: "A private debt forces them to choose between secrecy and the company."
    },
    {
      want: "Control forbidden knowledge before it harms the realm again.",
      need: "Admit that power without witnesses becomes another prison.",
      lie: "The cost is bearable if only one person pays it.",
      arcStage: "hidden_cost",
      nextRequiredBeat: "They reveal one rule of the magic and hide the worse rule behind it."
    },
    {
      want: "Survive the factional war by keeping every oath technically unbroken.",
      need: "Break the oath that serves fear and keep the one that serves mercy.",
      lie: "Neutrality will protect the people caught between crowns.",
      arcStage: "divided_oath",
      nextRequiredBeat: "They must betray a faction in public to save one person in private."
    }
  ];

  return {
    premise: "A reluctant heir, a dangerous relic, and an old war converge as a divided realm faces the return of a buried magic; every victory should reveal a deeper cost.",
    themes: [
      "power versus mercy",
      "found family and sworn duty",
      "old sins shaping new wars",
      "the price of magic"
    ],
    storylines: [
      {
        id: "line_relic_road",
        name: "The Relic Road",
        role: "main",
        targetShare: 0.4,
        povIds: pov(0, 1),
        promise: "The quest for a relic, cure, or throne keeps revealing that the enemy's version of history contains truth.",
        currentPressure: "The company must survive the first proof that the realm's founding story is incomplete."
      },
      {
        id: "line_throne_in_doubt",
        name: "The Throne in Doubt",
        role: "secondary",
        targetShare: 0.25,
        povIds: pov(1, 3),
        promise: "Court factions, guilds, temples, or noble houses turn the quest into a political weapon.",
        currentPressure: "A public alliance is offered at the exact moment its private cost becomes clear."
      },
      {
        id: "line_old_magic_cost",
        name: "The Old Magic's Cost",
        role: "shadow",
        targetShare: 0.2,
        povIds: pov(2),
        promise: "Magic can solve the visible problem only by opening a moral wound from the last age.",
        currentPressure: "Every use of power helps in the scene and worsens the book."
      },
      {
        id: "line_fellowship_fracture",
        name: "The Fellowship Fracture",
        role: "supporting",
        targetShare: 0.15,
        povIds: pov(0, 2, 3),
        promise: "Friendship, romance, rivalry, and oath-bonds make the external quest emotionally expensive.",
        currentPressure: "The group needs trust before any member has earned the right to ask for it."
      }
    ],
    characterArcs: arcTemplates.slice(0, arcCount).map((arc, index) => ({
      characterId: characterIds[index] || "",
      ...arc
    })),
    openLoops: [
      {
        id: "loop_buried_claim",
        raisedIn: "Act I",
        question: "Who has the stronger claim to rule, and what proof has been buried?",
        importance: "major",
        targetPayoff: "late Act II",
        status: "active"
      },
      {
        id: "loop_relic_price",
        raisedIn: "first magic scene",
        question: "What does the relic require each time it saves the company?",
        importance: "major",
        targetPayoff: "midpoint reversal",
        status: "deepening"
      },
      {
        id: "loop_traitor_oath",
        raisedIn: "first council scene",
        question: "Which ally is bound to the enemy by an older oath?",
        importance: "medium",
        targetPayoff: "Act III betrayal",
        status: "active"
      },
      {
        id: "loop_first_war",
        raisedIn: "prologue or archive",
        question: "What really happened in the first war against the buried magic?",
        importance: "shadow",
        targetPayoff: "finale",
        status: "active"
      }
    ],
    style: {
      narration: "close third, rotating POV, emotionally intimate, concrete wonder",
      tense: "past",
      sentenceRhythm: "Clean, propulsive scene work; shorter clauses under danger; longer tactile sentences for wonder, grief, and reveal.",
      sensoryPriority: ["sight", "sound", "touch", "smell"],
      metaphorRules: "Draw images from weather, iron, old roads, bloodlines, hearths, ruins, stars, oaths, debt, and hunger.",
      avoid: [
        "empty prophecy",
        "generic dark lord",
        "exposition dumps",
        "power levels without cost",
        "instant trust",
        "unearned chosen one certainty"
      ],
      dialogue: "Character-specific and status-aware; use subtext first, direct vows sparingly, and let humor appear under pressure."
    }
  };
}

function chapterList(world) {
  return directorArr(world.library?.books).flatMap((book) => (
    directorArr(book.volumes).flatMap((volume) => (
      directorArr(volume.chapters).map((chapter) => ({ book, volume, chapter }))
    ))
  ));
}

function DirectorDesk({ world, setWorld, readOnly = false, compact = false, onFocus }) {
  const narrative = normalizeNarrativeUi(world.narrative);
  const characters = directorArr(world.characters);
  const chapters = useMemoDirector(() => chapterList(world), [world.library]);
  const totalWords = chapters.reduce((sum, item) => sum + (Number(item.chapter.words) || 0), 0);
  const activeLoops = narrative.openLoops.filter((loop) => loop.status !== "closed").length;
  const targetTotal = narrative.storylines.reduce((sum, line) => sum + (Number(line.targetShare) || 0), 0);

  const patchNarrative = (patch) => {
    if (readOnly) return;
    setWorld((value) => ({
      ...value,
      narrative: normalizeNarrativeUi({ ...value.narrative, ...patch })
    }));
  };

  const patchStyle = (patch) => {
    patchNarrative({ style: { ...narrative.style, ...patch } });
  };

  const patchArrayItem = (key, index, patch) => {
    if (readOnly) return;
    patchNarrative({
      [key]: narrative[key].map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)
    });
  };

  const removeArrayItem = (key, index) => {
    if (readOnly) return;
    patchNarrative({ [key]: narrative[key].filter((_, itemIndex) => itemIndex !== index) });
  };

  const addStoryline = () => {
    const index = narrative.storylines.length + 1;
    patchNarrative({
      storylines: [
        ...narrative.storylines,
        {
          id: directorSlug(`line_${index}`, `line_${index}`),
          name: `Storyline ${index}`,
          role: "supporting",
          targetShare: 0,
          povIds: [],
          promise: "",
          currentPressure: ""
        }
      ]
    });
  };

  const addArc = () => {
    patchNarrative({
      characterArcs: [
        ...narrative.characterArcs,
        {
          characterId: characters[0]?.id || "",
          want: "",
          need: "",
          lie: "",
          arcStage: "",
          nextRequiredBeat: ""
        }
      ]
    });
  };

  const addLoop = () => {
    const index = narrative.openLoops.length + 1;
    patchNarrative({
      openLoops: [
        ...narrative.openLoops,
        {
          id: `loop_${index}`,
          question: "",
          importance: "minor",
          targetPayoff: "",
          status: "active"
        }
      ]
    });
  };

  const restoreFantasyDefaults = () => {
    if (readOnly) return;
    const message = window.AEVEN_I18N?.t("Restore Director's Desk fantasy defaults? Current Director's Desk values will be replaced.") || "Restore Director's Desk fantasy defaults? Current Director's Desk values will be replaced.";
    if (!confirm(message)) return;
    setWorld((value) => ({
      ...value,
      narrative: normalizeNarrativeUi(cloneNarrative(fantasyDefaultNarrative(value)))
    }));
  };

  const storylineStats = narrative.storylines.map((line) => {
    const matching = chapters.filter((item) => directorArr(item.chapter.storylineIds).includes(line.id));
    const words = matching.reduce((sum, item) => sum + (Number(item.chapter.words) || 0), 0);
    return {
      chapters: matching.length,
      words,
      actualShare: totalWords > 0 ? words / totalWords : 0
    };
  });

  return (
    <div className={`director ${compact ? "is-compact" : ""} ${readOnly ? "is-readonly" : ""}`}>
      <header className="director-head">
        <div>
          <span className="director-kicker">Folio IV</span>
          <h2>Director's Desk</h2>
        </div>
        <div className="director-head-actions">
          <div className="director-stats">
            <span>{narrative.storylines.length} lines</span>
            <span>{activeLoops} open loops</span>
            <span>{Math.round(targetTotal * 100)}% target</span>
          </div>
          {!readOnly && <button className="director-mini director-restore" onClick={restoreFantasyDefaults}>Restore defaults</button>}
        </div>
      </header>

      <section className="director-panel director-span">
        <header className="director-panel-head">
          <span>Story Shape</span>
        </header>
        <div className="director-grid two">
          <label className="director-field">
            <span>Premise</span>
            <textarea value={narrative.premise} readOnly={readOnly} onChange={(e) => patchNarrative({ premise: e.target.value })} />
          </label>
          <label className="director-field">
            <span>Themes</span>
            <textarea value={listText(narrative.themes)} readOnly={readOnly} onChange={(e) => patchNarrative({ themes: parseList(e.target.value) })} />
          </label>
        </div>
      </section>

      <section className="director-panel">
        <header className="director-panel-head">
          <span>Style Bible</span>
        </header>
        <div className="director-grid">
          <label className="director-field">
            <span>Narration</span>
            <input value={narrative.style.narration || ""} readOnly={readOnly} onChange={(e) => patchStyle({ narration: e.target.value })} />
          </label>
          <label className="director-field">
            <span>Tense</span>
            <select value={narrative.style.tense || ""} disabled={readOnly} onChange={(e) => patchStyle({ tense: e.target.value })}>
              <option value="">Unset</option>
              <option value="present">Present</option>
              <option value="past">Past</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
          <label className="director-field">
            <span>Sentence Rhythm</span>
            <textarea value={narrative.style.sentenceRhythm || ""} readOnly={readOnly} onChange={(e) => patchStyle({ sentenceRhythm: e.target.value })} />
          </label>
          <label className="director-field">
            <span>Sensory Priority</span>
            <input value={listText(narrative.style.sensoryPriority)} readOnly={readOnly} onChange={(e) => patchStyle({ sensoryPriority: parseList(e.target.value) })} />
          </label>
          <label className="director-field">
            <span>Metaphor Rules</span>
            <textarea value={narrative.style.metaphorRules || ""} readOnly={readOnly} onChange={(e) => patchStyle({ metaphorRules: e.target.value })} />
          </label>
          <label className="director-field">
            <span>Avoid</span>
            <textarea value={listText(narrative.style.avoid)} readOnly={readOnly} onChange={(e) => patchStyle({ avoid: parseList(e.target.value) })} />
          </label>
          <label className="director-field director-wide">
            <span>Dialogue</span>
            <textarea value={narrative.style.dialogue || ""} readOnly={readOnly} onChange={(e) => patchStyle({ dialogue: e.target.value })} />
          </label>
        </div>
      </section>

      <section className="director-panel">
        <header className="director-panel-head">
          <span>Storyline Mix</span>
          {!readOnly && <button className="director-mini" onClick={addStoryline}>+ line</button>}
        </header>
        <div className="director-stack">
          {narrative.storylines.map((line, index) => {
            const stat = storylineStats[index] || { chapters: 0, words: 0, actualShare: 0 };
            const targetPct = percent(line.targetShare);
            const actualPct = percent(stat.actualShare);
            return (
              <article key={line.id || index} className="director-card">
                <div className="director-card-head">
                  <input className="director-title-input" value={line.name || ""} readOnly={readOnly} onChange={(e) => patchArrayItem("storylines", index, { name: e.target.value })} />
                  {!readOnly && <button className="director-icon" onClick={() => removeArrayItem("storylines", index)}>x</button>}
                </div>
                <div className="director-grid line">
                  <label className="director-field">
                    <span>ID</span>
                    <input value={line.id || ""} readOnly={readOnly} onChange={(e) => patchArrayItem("storylines", index, { id: directorSlug(e.target.value, line.id || "line") })} />
                  </label>
                  <label className="director-field">
                    <span>Role</span>
                    <select value={line.role || "supporting"} disabled={readOnly} onChange={(e) => patchArrayItem("storylines", index, { role: e.target.value })}>
                      <option value="main">Main</option>
                      <option value="secondary">Secondary</option>
                      <option value="shadow">Shadow</option>
                      <option value="supporting">Supporting</option>
                    </select>
                  </label>
                  <label className="director-field">
                    <span>Target %</span>
                    <input type="number" min="0" max="100" value={targetPct} readOnly={readOnly} onChange={(e) => patchArrayItem("storylines", index, { targetShare: shareFromPercent(e.target.value) })} />
                  </label>
                  <label className="director-field">
                    <span>POV IDs</span>
                    <input value={listText(line.povIds)} readOnly={readOnly} onChange={(e) => patchArrayItem("storylines", index, { povIds: parseList(e.target.value) })} />
                  </label>
                  <label className="director-field director-wide">
                    <span>Promise</span>
                    <textarea value={line.promise || ""} readOnly={readOnly} onChange={(e) => patchArrayItem("storylines", index, { promise: e.target.value })} />
                  </label>
                  <label className="director-field director-wide">
                    <span>Current Pressure</span>
                    <textarea value={line.currentPressure || ""} readOnly={readOnly} onChange={(e) => patchArrayItem("storylines", index, { currentPressure: e.target.value })} />
                  </label>
                </div>
                <div className="director-meter-row">
                  <span>{actualPct}% actual · {stat.chapters} chapters · {stat.words.toLocaleString()} words</span>
                  <div className="director-meter"><i style={{ width: `${Math.min(100, actualPct)}%` }} />{targetPct > 0 && <b style={{ left: `${Math.min(100, targetPct)}%` }} />}</div>
                </div>
              </article>
            );
          })}
          {!narrative.storylines.length && <div className="director-empty">No storylines yet</div>}
        </div>
      </section>

      <section className="director-panel">
        <header className="director-panel-head">
          <span>Character Arcs</span>
          {!readOnly && <button className="director-mini" onClick={addArc}>+ arc</button>}
        </header>
        <div className="director-stack">
          {narrative.characterArcs.map((arc, index) => (
            <article key={`${arc.characterId || "arc"}_${index}`} className="director-card">
              <div className="director-card-head">
                <select className="director-title-input" value={arc.characterId || ""} disabled={readOnly} onChange={(e) => patchArrayItem("characterArcs", index, { characterId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {characters.map((character) => <option key={character.id} value={character.id}>{character.name}</option>)}
                </select>
                <div className="director-card-actions">
                  {arc.characterId && onFocus && <button className="director-mini" onClick={() => onFocus(arc.characterId)}>open</button>}
                  {!readOnly && <button className="director-icon" onClick={() => removeArrayItem("characterArcs", index)}>x</button>}
                </div>
              </div>
              <div className="director-grid two">
                {[
                  ["want", "Want"],
                  ["need", "Need"],
                  ["lie", "Lie"],
                  ["arcStage", "Stage"],
                  ["nextRequiredBeat", "Next Beat"]
                ].map(([key, label]) => (
                  <label key={key} className={`director-field ${key === "nextRequiredBeat" ? "director-wide" : ""}`}>
                    <span>{label}</span>
                    <textarea value={arc[key] || ""} readOnly={readOnly} onChange={(e) => patchArrayItem("characterArcs", index, { [key]: e.target.value })} />
                  </label>
                ))}
              </div>
            </article>
          ))}
          {!narrative.characterArcs.length && <div className="director-empty">No arcs yet</div>}
        </div>
      </section>

      <section className="director-panel director-span">
        <header className="director-panel-head">
          <span>Open Loops</span>
          {!readOnly && <button className="director-mini" onClick={addLoop}>+ loop</button>}
        </header>
        <div className="director-loop-grid">
          {narrative.openLoops.map((loop, index) => (
            <article key={loop.id || index} className="director-card">
              <div className="director-card-head">
                <input className="director-title-input" value={loop.id || ""} readOnly={readOnly} onChange={(e) => patchArrayItem("openLoops", index, { id: directorSlug(e.target.value, loop.id || "loop") })} />
                {!readOnly && <button className="director-icon" onClick={() => removeArrayItem("openLoops", index)}>x</button>}
              </div>
              <div className="director-grid loop">
                <label className="director-field director-wide">
                  <span>Question</span>
                  <textarea value={loop.question || ""} readOnly={readOnly} onChange={(e) => patchArrayItem("openLoops", index, { question: e.target.value })} />
                </label>
                <label className="director-field">
                  <span>Importance</span>
                  <select value={loop.importance || "minor"} disabled={readOnly} onChange={(e) => patchArrayItem("openLoops", index, { importance: e.target.value })}>
                    <option value="major">Major</option>
                    <option value="medium">Medium</option>
                    <option value="minor">Minor</option>
                    <option value="shadow">Shadow</option>
                  </select>
                </label>
                <label className="director-field">
                  <span>Status</span>
                  <select value={loop.status || "active"} disabled={readOnly} onChange={(e) => patchArrayItem("openLoops", index, { status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="deepening">Deepening</option>
                    <option value="ready_to_pay">Ready to Pay</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>
                <label className="director-field">
                  <span>Raised In</span>
                  <input value={loop.raisedIn || ""} readOnly={readOnly} onChange={(e) => patchArrayItem("openLoops", index, { raisedIn: e.target.value })} />
                </label>
                <label className="director-field">
                  <span>Target Payoff</span>
                  <input value={loop.targetPayoff || ""} readOnly={readOnly} onChange={(e) => patchArrayItem("openLoops", index, { targetPayoff: e.target.value })} />
                </label>
              </div>
            </article>
          ))}
          {!narrative.openLoops.length && <div className="director-empty">No loops yet</div>}
        </div>
      </section>
    </div>
  );
}

window.DirectorDesk = DirectorDesk;
