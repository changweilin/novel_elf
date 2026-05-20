// Aevenmere — Mobile (Phone) edition
// Reuses window.WorldMap, window.Codex, window.AVN, window.WORLD_SEED.
// Provides MobileApp (and Tabs equivalents) — a phone-native UX with
// 4 bottom tabs (Map · Chronicle · Codex · Leaf), a vertical year scrubber
// pinned to the right edge of the map view, and a slide-up bottom sheet
// for entity / region detail.

const { useState, useEffect, useMemo, useRef } = React;

const LSM_WORLD = "aevenmere.world.v2";
const LSM_YEAR  = "aevenmere.year.v2";

function mobT(s) {
  return window.AEVEN_I18N?.t ? window.AEVEN_I18N.t(s) : s;
}

const KIND_LABEL = {
  event: "Event", character: "Character",
  organization: "Organization", country: "Country", region: "Region"
};

function MobileApp() {
  // Share state with desktop app's localStorage so edits made on either side
  // surface on the other (read-only here).
  const [world, setWorld] = useState(() => {
    try {
      const raw = localStorage.getItem(LSM_WORLD);
      if (raw) {
        const w = JSON.parse(raw);
        if (!w.library) w.library = JSON.parse(JSON.stringify(window.WORLD_SEED.library || {}));
        return w;
      }
    } catch {}
    return JSON.parse(JSON.stringify(window.WORLD_SEED));
  });
  const [currentYear, setCurrentYear] = useState(() => {
    try { const y = localStorage.getItem(LSM_YEAR); if (y) return parseInt(y); } catch {}
    return 1209;
  });
  useEffect(() => { try { localStorage.setItem(LSM_WORLD, JSON.stringify(world)); } catch {} }, [world]);
  useEffect(() => { try { localStorage.setItem(LSM_YEAR, String(currentYear)); } catch {} }, [currentYear]);

  const [view, setView] = useState("map"); // map | chronicle | codex | leaf
  const [folio, setFolio] = useState("atelier"); // atelier | library
  const [chronTab, setChronTab] = useState("events"); // events|characters|orgs|countries
  const [layers, setLayers] = useState({
    events: true, countries: true, orgs: true, characters: true, conflicts: true, eventsWindow: 240
  });
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [focusId, setFocusId] = useState(null);
  const [hint, setHint] = useState("");
  const [story, setStory] = useState("");
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState(null);

  // Sheet state — opens when a region / entity is picked
  const sheetOpen = !!(focusId || selectedRegionId);

  const era = useMemo(
    () => world.eras.find((e) => currentYear >= e.start && currentYear <= e.end) || world.eras[world.eras.length - 1],
    [world.eras, currentYear]
  );

  const counts = {
    events: world.events.length,
    characters: world.characters.length,
    orgs: world.organizations.length,
    countries: world.countries.length
  };

  // ── Pick handlers ────────────────────────────────────
  const onMapFocus = (id) => {
    if (id == null) { setFocusId(null); return; }
    setFocusId(id); setSelectedRegionId(null);
  };
  const onSelectRegion = (id) => {
    setSelectedRegionId(id); setFocusId(null);
  };
  const closeSheet = () => { setFocusId(null); setSelectedRegionId(null); };

  const onChronJump = (y) => { setCurrentYear(y); };

  // ── Quick add (blank) ────────────────────────────────
  const uid = (p) => p + "_" + Math.random().toString(36).slice(2, 8);
  const addBlankEvent = () => {
    const id = uid("ev");
    setWorld((w) => ({ ...w, events: [...w.events, { id, year: currentYear, title: "An unnamed happening", body: "", placeId: null, participants: [] }] }));
    setView("chronicle"); setChronTab("events"); setFocusId(id);
  };
  const addBlankChar = () => {
    const id = uid("ch");
    setWorld((w) => ({ ...w, characters: [...w.characters, { id, name: "Someone unnamed", role: "of the Reach", born: currentYear - 25, died: null, snapshots: [{ year: currentYear, location: { x: 500, y: 340, name: "" }, status: "alive", body: "" }] }] }));
    setView("chronicle"); setChronTab("characters"); setFocusId(id);
  };

  // ── AI generate ──────────────────────────────────────
  const expandPlace = (name) => {
    const p = world.places.find((pp) => pp.name?.toLowerCase() === (name || "").toLowerCase());
    if (p) return { x: p.x, y: p.y, name: p.name };
    return { x: 500, y: 340, name: name || "" };
  };
  const onAI = async (kind) => {
    setBusy(kind); setErr(null);
    try {
      if (kind === "char") {
        const out = await window.aiGenerateCharacter(world, hint, currentYear);
        const id = uid("ch");
        const snaps = (out.snapshots || []).map((s) => ({ year: s.year, status: s.status, body: s.body, location: expandPlace(s.place) }));
        setWorld((w) => ({ ...w, characters: [{ id, name: out.name, role: out.role, born: out.born ?? currentYear - 25, died: null, snapshots: snaps, body: out.body }, ...w.characters] }));
        setView("chronicle"); setChronTab("characters"); setFocusId(id);
      } else if (kind === "event") {
        const out = await window.aiGenerateEvent(world, hint, currentYear, null);
        const id = uid("ev");
        setWorld((w) => ({ ...w, events: [...w.events, { id, year: out.year || currentYear, title: out.title, body: out.body, placeId: out.placeId || null, participants: out.participants || [] }] }));
        setView("chronicle"); setChronTab("events"); setFocusId(id);
      } else if (kind === "story") {
        const out = await window.aiContinueStory(world, currentYear, focusId, hint);
        setStory(out);
      }
      if (kind !== "story") setHint("");
    } catch (e) { setErr(String(e.message || e)); }
    setBusy(null);
  };

  // ── Library view — books → volumes → chapters ───────
  const renderLibrary = () => {
    const books = world.library?.books || [];
    let chapterIdx = 0;
    return (
      <div className="mob-scroll">
        <div className="mob-lib">
          {books.map((bk) => (
            <React.Fragment key={bk.id}>
              <div className="mob-lib-chap" style={{ background: "#15110b", color: "var(--paper)", border: "1px solid #2a2218" }}>
                <div className="mob-lib-num" style={{ color: "var(--gold-2)" }}>{mobT("Book")} · {mobT(bk.subtitle || "")}</div>
                <div className="mob-lib-title" style={{ color: "var(--paper)" }}>{mobT(bk.title)}</div>
                {bk.blurb && <div className="mob-lib-blurb" style={{ color: "#c9b896" }}>{mobT(bk.blurb)}</div>}
                <div className="mob-lib-meta" style={{ color: "var(--slate)" }}>
                  {(bk.volumes || []).length} volumes
                  {bk.year != null ? ` · ${AVN.yearLabel(bk.year)}` : ""}
                  {bk.status ? ` · ${bk.status}` : ""}
                </div>
              </div>
              {(bk.volumes || []).flatMap((vol) =>
                (vol.chapters || []).map((ch) => {
                  chapterIdx += 1;
                  return (
                    <div key={ch.id} className="mob-lib-chap">
                      <div className="mob-lib-num">
                        {mobT("Chapter")} {String(chapterIdx).padStart(2, "0")} · {mobT(vol.title)}
                      </div>
                      <div className="mob-lib-title">{mobT(ch.title)}</div>
                      {ch.md && (
                        <div className="mob-lib-blurb">
                          {mobT((ch.md.split("\n").find((l) => l.trim() && !l.startsWith("#") && !l.startsWith("!")) || "").replace(/^- /, "")).slice(0, 200)}…
                        </div>
                      )}
                      <div className="mob-lib-meta">
                        {ch.year != null ? AVN.yearLabel(ch.year) : ""}
                        {ch.status ? ` · ${ch.status}` : ""}
                        {ch.words != null ? ` · ${ch.words} words` : ""}
                      </div>
                    </div>
                  );
                })
              )}
            </React.Fragment>
          ))}
          {!books.length && (
            <div className="mob-chron-empty">— no folios yet —</div>
          )}
        </div>
      </div>
    );
  };

  // ── Render the active view ───────────────────────────
  const renderActive = () => {
    if (folio === "library") return renderLibrary();
    if (view === "map")       return <MobileMap world={world} currentYear={currentYear} layers={layers}
                                                setLayers={setLayers}
                                                selectedRegionId={selectedRegionId}
                                                onSelectRegion={onSelectRegion}
                                                focusId={focusId} onFocus={onMapFocus}
                                                onYear={setCurrentYear} />;
    if (view === "chronicle") return <MobileChronicle world={world} currentYear={currentYear}
                                                      onYear={setCurrentYear} tab={chronTab}
                                                      onTab={setChronTab} counts={counts}
                                                      focusId={focusId} onFocus={setFocusId}
                                                      onAddBlankEvent={addBlankEvent}
                                                      onAddBlankChar={addBlankChar} />;
    if (view === "codex")     return <MobileCodex world={world} currentYear={currentYear}
                                                  focusId={focusId} onFocus={setFocusId}
                                                  onJump={onChronJump} />;
    if (view === "leaf")      return <MobileLeaf world={world} currentYear={currentYear} era={era}
                                                 hint={hint} setHint={setHint}
                                                 story={story} setStory={setStory}
                                                 busy={busy} err={err} onAI={onAI}
                                                 counts={counts}
                                                 onAddBlankEvent={addBlankEvent}
                                                 onAddBlankChar={addBlankChar} />;
    return null;
  };

  return (
    <div className="mob">
      {/* TOP */}
      <header className="mob-top">
        <div>
          <h1 className="mob-title">Aevenmere<em>An atlas, in the palm</em></h1>
          <div className="mob-top-folio">
            <button className={folio === "atelier" ? "on" : ""} onClick={() => setFolio("atelier")}>I·II Atelier</button>
            <button className={folio === "library" ? "on" : ""} onClick={() => setFolio("library")}>III Library</button>
          </div>
        </div>
        <div className="mob-year-pill">
          <div className="mob-year">{AVN.yearLabel(currentYear)}</div>
          <div className="mob-era">{era.name}</div>
        </div>
      </header>

      {/* MAIN VIEW */}
      <div className="mob-view">
        {renderActive()}
      </div>

      {/* BOTTOM TABS */}
      {folio === "atelier" && (
        <nav className="mob-tabbar">
          {[
            { k: "map",       g: "✦",  l: "Map" },
            { k: "chronicle", g: "𝙏",  l: "Chronicle" },
            { k: "codex",     g: "❦",  l: "Codex" },
            { k: "leaf",      g: "✎",  l: "Leaf" }
          ].map((t) => (
            <button key={t.k} className={`mob-tab ${view === t.k ? "on" : ""}`} onClick={() => setView(t.k)}>
              <span className="mob-tab-glyph">{t.g}</span>
              <span className="mob-tab-label">{t.l}</span>
              <span className="mob-tab-dot" />
            </button>
          ))}
        </nav>
      )}

      {/* BOTTOM SHEET — detail */}
      {sheetOpen && (
        <>
          <div className="mob-sheet-backdrop" onClick={closeSheet} />
          <DetailSheet world={world} currentYear={currentYear}
                       focusId={focusId} selectedRegionId={selectedRegionId}
                       onClose={closeSheet}
                       onJump={(y) => { setCurrentYear(y); }}
                       onFocus={(id) => { setFocusId(id); setSelectedRegionId(null); }} />
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MobileMap — full-bleed map + side scrubber + layer chips
// ─────────────────────────────────────────────────────────────
function MobileMap({ world, currentYear, layers, setLayers, selectedRegionId, onSelectRegion, focusId, onFocus, onYear }) {
  const railRef = useRef(null);

  // World year domain
  const eras = world.eras;
  const yMin = eras[0].start;
  const yMax = eras[eras.length - 1].end;

  // Map a year → fraction (0 top — earliest, 1 bottom — latest)
  const yearToFrac = (y) => (y - yMin) / (yMax - yMin);
  const fracToYear = (f) => Math.round(yMin + f * (yMax - yMin));

  const onRailPointer = (e) => {
    const rail = railRef.current;
    if (!rail) return;
    const r = rail.getBoundingClientRect();
    const onMove = (ev) => {
      const cy = ev.clientY ?? ev.touches?.[0]?.clientY;
      if (cy == null) return;
      const f = Math.max(0, Math.min(1, (cy - r.top) / r.height));
      onYear(fracToYear(f));
    };
    onMove(e);
    const up = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", up);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", up);
  };

  const nowFrac = yearToFrac(currentYear);

  return (
    <div className="mob-map-wrap">
      {window.WorldMap && (
        <window.WorldMap
          world={world} currentYear={currentYear}
          layers={{ ...layers, eventsWindow: layers.eventsWindow ?? 240 }}
          selectedRegionId={selectedRegionId}
          onSelectRegion={onSelectRegion}
          focusId={focusId}
          onFocus={(id) => id != null && onFocus(id)}
          drawing={null} onCommitDraw={() => {}} onCancelDraw={() => {}}
        />
      )}
      <div className="mob-map-vignette" />
      <div className="mob-cornermark">drawn by hand · folio of the reach</div>

      {/* Layer chips */}
      <div className="mob-layers">
        {[
          { k: "countries",  l: "Realms" },
          { k: "orgs",       l: "Orders" },
          { k: "characters", l: "Souls" },
          { k: "events",     l: "Events" },
          { k: "conflicts",  l: "Conflict" }
        ].map((t) => (
          <button key={t.k}
                  className={`mob-layer-chip ${layers[t.k] ? "on" : ""} ${t.k === "conflicts" ? "conflict" : ""}`}
                  onClick={() => setLayers((L) => ({ ...L, [t.k]: !L[t.k] }))}>
            <span className="mob-layer-dot" /> {t.l}
          </button>
        ))}
      </div>

      {/* Vertical year scrubber */}
      <div className="mob-scrub">
        <div className="mob-scrub-head">{AVN.yearLabel(yMin)}</div>
        <div className="mob-scrub-rail" ref={railRef} onPointerDown={onRailPointer}>
          <div className="mob-scrub-track" />
          {eras.map((er) => {
            const top = yearToFrac(er.start) * 100;
            const bot = yearToFrac(er.end) * 100;
            return (
              <div key={er.id} className="mob-scrub-era"
                   style={{ top: `${top}%`, height: `${bot - top}%`, "--era": er.accent }} />
            );
          })}
          {world.events.slice(0, 60).map((ev) => (
            <div key={ev.id} className="mob-scrub-event"
                 style={{ top: `${yearToFrac(ev.year) * 100}%` }} />
          ))}
          <div className="mob-scrub-now" style={{ top: `${nowFrac * 100}%` }} />
        </div>
        <div className="mob-scrub-foot">{AVN.yearLabel(yMax)}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MobileChronicle — year strip + tabs + list of entries
// ─────────────────────────────────────────────────────────────
function MobileChronicle({ world, currentYear, onYear, tab, onTab, counts, focusId, onFocus, onAddBlankEvent, onAddBlankChar }) {
  // Build a year strip: era boundaries + every 50/100 yr tick
  const years = useMemo(() => {
    const out = [];
    world.eras.forEach((er) => {
      if (!out.includes(er.start)) out.push(er.start);
      if (!out.includes(er.end)) out.push(er.end);
    });
    [-8200, -3000, -1400, -200, 0, 100, 340, 720, 1100, 1180, 1209].forEach((y) => {
      if (!out.includes(y)) out.push(y);
    });
    return out.sort((a, b) => a - b);
  }, [world.eras]);

  const era = world.eras.find((e) => currentYear >= e.start && currentYear <= e.end);

  return (
    <>
      <div className="mob-chron-tabs">
        {[
          { k: "events",     l: "Events",  n: counts.events },
          { k: "characters", l: "Souls",   n: counts.characters },
          { k: "orgs",       l: "Orders",  n: counts.orgs },
          { k: "countries",  l: "Realms",  n: counts.countries }
        ].map((t) => (
          <button key={t.k} className={`mob-chron-tab ${tab === t.k ? "on" : ""}`} onClick={() => onTab(t.k)}>
            {t.l}<span className="mob-chron-n">·{t.n}</span>
          </button>
        ))}
      </div>

      <div className="mob-scroll">
        <div className="mob-chron-year-head">
          <div className="mob-chron-y">{AVN.yearLabel(currentYear)}</div>
          <div className="mob-chron-y-meta">{era?.name || "—"}</div>
        </div>

        <div className="mob-yearstrip">
          {years.map((y) => (
            <button key={y} className={`mob-year-chip ${y === currentYear ? "on" : ""}`} onClick={() => onYear(y)}>
              {AVN.yearLabel(y)}
            </button>
          ))}
        </div>

        <ChronicleList world={world} currentYear={currentYear} tab={tab}
                       focusId={focusId} onFocus={onFocus}
                       onAddBlankEvent={onAddBlankEvent}
                       onAddBlankChar={onAddBlankChar} />
      </div>
    </>
  );
}

function ChronicleList({ world, currentYear, tab, focusId, onFocus, onAddBlankEvent, onAddBlankChar }) {
  if (tab === "events") {
    const win = 240;
    const inView = world.events
      .filter((ev) => Math.abs(ev.year - currentYear) <= win / 2)
      .sort((a, b) => a.year - b.year);
    const all = world.events.slice().sort((a, b) => a.year - b.year);
    const list = inView.length ? inView : all.slice(0, 8);
    return (
      <div className="mob-chron-list">
        {!inView.length && (
          <div className="mob-chron-empty">— no events near {AVN.yearLabel(currentYear)} · showing earliest —</div>
        )}
        {list.map((ev) => {
          const place = ev.placeId ? world.places.find((p) => p.id === ev.placeId)?.name : null;
          return (
            <button key={ev.id} className={`mob-chron-row ${focusId === ev.id ? "is-focus" : ""}`}
                    style={{ "--accent": "#c89859" }}
                    onClick={() => onFocus(ev.id)}>
              <span className="mob-chron-swatch" />
              <span className="mob-chron-row-body">
                <span className="mob-chron-row-title">{ev.title}</span>
                <span className="mob-chron-row-meta">
                  <b>{AVN.yearLabel(ev.year)}</b>
                  {place ? <span>· {place}</span> : null}
                </span>
                {ev.body && <span className="mob-chron-row-blurb">{ev.body}</span>}
              </span>
            </button>
          );
        })}
      </div>
    );
  }
  const items =
    tab === "characters" ? world.characters :
    tab === "orgs"       ? world.organizations :
                           world.countries;
  return (
    <div className="mob-chron-list">
      {items.map((e) => {
        const alive = AVN.entityAlive(e, currentYear);
        const snap = AVN.snapAt(e, currentYear);
        const role = e.role ||
          (e.dissolved && currentYear > e.dissolved ? "dissolved" :
           (e.founded != null && currentYear < e.founded ? "not yet founded" : ""));
        const place = snap?.location?.name || snap?.hq?.name || snap?.capital?.name;
        return (
          <button key={e.id}
                  className={`mob-chron-row ${focusId === e.id ? "is-focus" : ""} ${alive ? "" : "muted"}`}
                  style={{ "--accent": e.accent || "#a89472" }}
                  onClick={() => onFocus(e.id)}>
            <span className="mob-chron-swatch" />
            <span className="mob-chron-row-body">
              <span className="mob-chron-row-title">{e.name}</span>
              <span className="mob-chron-row-meta">
                {role && <span>{role}</span>}
                {(e.born ?? e.founded) != null && (
                  <span>· {AVN.yearLabel(e.born ?? e.founded)}{e.died != null || e.dissolved != null ? `–${AVN.yearLabel(e.died ?? e.dissolved)}` : ""}</span>
                )}
                {place && <span>· {place}</span>}
              </span>
              {snap?.body && <span className="mob-chron-row-blurb">{snap.body}</span>}
            </span>
          </button>
        );
      })}
      {!items.length && <div className="mob-chron-empty">— nothing here yet —</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MobileCodex — reuses window.Codex with mobile-tweaked grid
// ─────────────────────────────────────────────────────────────
function MobileCodex({ world, currentYear, focusId, onFocus, onJump }) {
  return (
    <div className="mob-scroll">
      <div className="mob-codex">
        {window.Codex ? (
          <window.Codex world={world} currentYear={currentYear}
                         focusId={focusId} onFocus={onFocus} onJump={onJump} />
        ) : (
          <div className="mob-chron-empty">— codex unavailable —</div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MobileLeaf — AI desk + quick add
// ─────────────────────────────────────────────────────────────
function MobileLeaf({ world, currentYear, era, hint, setHint, story, setStory, busy, err, onAI, counts, onAddBlankEvent, onAddBlankChar }) {
  return (
    <div className="mob-scroll">
      <div className="mob-leaf">
        <section className="mob-leaf-section">
          <h3 className="mob-leaf-h">The Leaf · 葉</h3>
          <input className="ai-input" placeholder="Optional direction — 'they meet in the rain'…"
                 value={hint} onChange={(e) => setHint(e.target.value)} />
          <div className="ai-row">
            <button className="ai-btn primary" disabled={busy === "story"} onClick={() => onAI("story")}>
              {busy === "story" ? "writing…" : "Write the next leaf"}
            </button>
            <button className="ai-btn" onClick={() => setStory("")}>clear</button>
          </div>
          {err && <div className="ai-status err">! {err}</div>}
          <div className="story-out">{story}</div>
        </section>

        <section className="mob-leaf-section">
          <h3 className="mob-leaf-h">Summon · 喚</h3>
          <div className="ai-row" style={{ marginBottom: 10 }}>
            <button className="ai-btn primary" disabled={busy === "char"} onClick={() => onAI("char")}>
              {busy === "char" ? "summoning…" : "+ AI character"}
            </button>
            <button className="ai-btn primary" disabled={busy === "event"} onClick={() => onAI("event")}>
              {busy === "event" ? "inking…" : "+ AI event"}
            </button>
          </div>
          <div className="mob-quick-add">
            <button className="ai-btn" onClick={onAddBlankEvent}>+ blank event</button>
            <button className="ai-btn" onClick={onAddBlankChar}>+ blank soul</button>
          </div>
        </section>

        <section className="mob-leaf-section">
          <h3 className="mob-leaf-h">The Chronicle · 紀</h3>
          <div className="mob-sheet-meta" style={{ marginBottom: 4 }}>
            <span className="mob-sheet-pill gold">{AVN.yearLabel(currentYear)}</span>
            <span className="mob-sheet-pill">{era.name}</span>
            <span className="mob-sheet-pill">{counts.events} events</span>
            <span className="mob-sheet-pill">{counts.characters} souls</span>
            <span className="mob-sheet-pill">{counts.orgs} orders</span>
            <span className="mob-sheet-pill">{counts.countries} realms</span>
          </div>
          <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "#c9b896", fontSize: 13.5, lineHeight: 1.55, margin: "8px 0 0" }}>
            {mobT("Aevenmere, the sundered reach: highlands and marsh, ash and tide. Open a folio. Walk the years. Stay until something asks to be named.")}
          </p>
        </section>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DetailSheet — slide-up bottom sheet for entity/region
// ─────────────────────────────────────────────────────────────
function DetailSheet({ world, currentYear, focusId, selectedRegionId, onClose, onJump, onFocus }) {
  let body = null;
  let title = "—", eyebrow = "—", sub = "", accent = "#c89859", actions = null;

  if (focusId) {
    const kind = AVN.entityKind(world, focusId);
    if (kind === "event") {
      const ev = world.events.find((x) => x.id === focusId);
      const place = ev.placeId ? world.places.find((p) => p.id === ev.placeId) : null;
      title = ev.title;
      eyebrow = "Event";
      sub = place ? `at ${place.name}` : "";
      body = (
        <>
          <div className="mob-sheet-meta">
            <span className="mob-sheet-pill gold">{AVN.yearLabel(ev.year)}</span>
            {place && <span className="mob-sheet-pill">{place.name}</span>}
          </div>
          <p>{ev.body || "— no detail penned —"}</p>
          {!!(ev.participants?.length) && (
            <>
              <div className="mob-sheet-h">Participants</div>
              {ev.participants.map((pid) => {
                const ent = AVN.findEntity(world, pid);
                if (!ent) return null;
                return (
                  <div key={pid} className="mob-rel" onClick={() => onFocus(pid)}>
                    <div className="mob-rel-line">
                      <span className="mob-rel-kind">{KIND_LABEL[AVN.entityKind(world, pid)]}</span>
                      <span className="mob-rel-name">{ent.name}</span>
                      <span className="mob-rel-yr">→</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </>
      );
      actions = (
        <>
          <button className="ai-btn" onClick={() => onJump(ev.year)}>scrub to {AVN.yearLabel(ev.year)}</button>
          <button className="ai-btn" onClick={onClose}>close</button>
        </>
      );
    } else if (kind === "character" || kind === "organization" || kind === "country") {
      const key = kind === "character" ? "characters" : kind === "organization" ? "organizations" : "countries";
      const e = world[key].find((x) => x.id === focusId);
      const snap = AVN.snapAt(e, currentYear);
      const alive = AVN.entityAlive(e, currentYear);
      const lifeStart = e.born ?? e.founded;
      const lifeEnd   = e.died ?? e.dissolved;
      const place = snap?.location?.name || snap?.hq?.name || snap?.capital?.name;
      accent = e.accent || "#c89859";
      title = e.name;
      eyebrow = KIND_LABEL[kind];
      sub = e.role || (kind === "country" ? "a realm" : kind === "organization" ? "an order" : "");
      const rels = (world.relationships || []).filter((r) => r.a === focusId || r.b === focusId);
      body = (
        <>
          <div className="mob-sheet-meta">
            {lifeStart != null && (
              <span className={`mob-sheet-pill ${alive ? "gold" : "dead"}`}>
                {AVN.yearLabel(lifeStart)}{lifeEnd != null ? `–${AVN.yearLabel(lifeEnd)}` : (alive ? " · living" : "")}
              </span>
            )}
            {place && <span className="mob-sheet-pill">{place}</span>}
            {snap?.leader && <span className="mob-sheet-pill">led by {snap.leader}</span>}
            {snap?.members != null && <span className="mob-sheet-pill">{snap.members} members</span>}
          </div>
          {snap?.body && <p>{snap.body}</p>}
          {e.body && !snap?.body && <p>{e.body}</p>}

          {(e.snapshots || []).length > 0 && (
            <>
              <div className="mob-sheet-h">Through the years · {e.snapshots.length}</div>
              {e.snapshots.slice().sort((a, b) => a.year - b.year).map((s, i) => {
                const isActive = snap === s;
                const placeS = s.location?.name || s.hq?.name || s.capital?.name;
                return (
                  <div key={i} className={`mob-snap ${isActive ? "is-active" : ""}`}
                       style={{ "--accent": accent }}
                       onClick={() => onJump(s.year)}>
                    <div className="mob-snap-head">
                      <span className="mob-snap-year">{AVN.yearLabel(s.year)}</span>
                      {placeS && <span className="mob-snap-place">{placeS}</span>}
                    </div>
                    {s.body && <div className="mob-snap-body">{s.body}</div>}
                    {(s.leader || s.members != null || s.status) && (
                      <div className="mob-snap-fields">
                        {s.leader && <span>led by <b>{s.leader}</b></span>}
                        {s.members != null && <span>· <b>{s.members}</b> members</span>}
                        {s.status && <span>· {s.status}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {!!rels.length && (
            <>
              <div className="mob-sheet-h">Ties · {rels.length}</div>
              {rels.map((r) => {
                const otherId = r.a === focusId ? r.b : r.a;
                const other = AVN.findEntity(world, otherId);
                if (!other) return null;
                return (
                  <div key={r.id} className="mob-rel" onClick={() => onFocus(otherId)}>
                    <div className="mob-rel-line">
                      <span className="mob-rel-kind">{r.kind}</span>
                      <span className="mob-rel-name">{other.name}</span>
                      <span className="mob-rel-yr">{AVN.yearLabel(r.since)}{r.until ? `–${AVN.yearLabel(r.until)}` : ""}</span>
                    </div>
                    {r.note && <div className="mob-snap-body" style={{ marginTop: 4 }}>{r.note}</div>}
                  </div>
                );
              })}
            </>
          )}
        </>
      );
      actions = (
        <>
          {snap && <button className="ai-btn" onClick={() => onJump(snap.year)}>scrub to {AVN.yearLabel(snap.year)}</button>}
          <button className="ai-btn" onClick={onClose}>close</button>
        </>
      );
    }
  } else if (selectedRegionId) {
    const r = world.regions.find((x) => x.id === selectedRegionId);
    if (r) {
      accent = `oklch(0.55 0.08 ${r.hue})`;
      eyebrow = "Region";
      title = r.name;
      sub = r.cap?.name ? `seat: ${r.cap.name}` : "";
      const evCount = world.events.filter((e) => {
        if (!e.placeId) return false;
        const p = world.places.find((pp) => pp.id === e.placeId);
        if (!p) return false;
        // Simple "within region" — check capital match
        return p.name === r.cap?.name;
      }).length;
      body = (
        <>
          <div className="mob-sheet-meta">
            {r.cap?.name && <span className="mob-sheet-pill gold">{r.cap.name}</span>}
            <span className="mob-sheet-pill">hue {r.hue}°</span>
            <span className="mob-sheet-pill">{evCount} recorded events</span>
          </div>
          <p>{r.blurb}</p>
        </>
      );
      actions = (
        <>
          <button className="ai-btn" onClick={onClose}>close</button>
        </>
      );
    }
  }

  return (
    <div className="mob-sheet" style={{ "--accent": accent }}>
      <div className="mob-sheet-grab" />
      <div className="mob-sheet-head">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="mob-sheet-eyebrow"><span className="mob-sheet-dot" />{eyebrow}</div>
          <div className="mob-sheet-title">{title}</div>
          {sub && <div className="mob-sheet-sub">{sub}</div>}
        </div>
        <button className="mob-sheet-close" onClick={onClose}>×</button>
      </div>
      <div className="mob-sheet-body">{body}</div>
      {actions && <div className="mob-sheet-actions">{actions}</div>}
    </div>
  );
}

// Expose
window.MobileApp = MobileApp;
