// Main App. Composes map, multi-lane timeline, tabbed inspector, AI desk.

const { useState, useEffect, useMemo } = React;

const KIND_LABELS = { event: "Event", character: "Character", organization: "Organization", country: "Country" };

function uid(p) { return p + "_" + Math.random().toString(36).slice(2, 8); }

const LS_WORLD = "aevenmere.world.v2";
const LS_YEAR  = "aevenmere.year.v2";
const LS_ORIENT = "aevenmere.orient.v1";

const App = () => {
  const [world, setWorld] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_WORLD);
      if (raw) {
        const w = JSON.parse(raw);
        // Migrate forward: graft missing branches from the seed.
        if (!w.library) w.library = JSON.parse(JSON.stringify(window.WORLD_SEED.library));
        return w;
      }
    } catch {}
    return JSON.parse(JSON.stringify(window.WORLD_SEED));
  });
  const [currentYear, setCurrentYear] = useState(() => {
    try { const y = localStorage.getItem(LS_YEAR); if (y) return parseInt(y); } catch {}
    return 1209;
  });
  const [windowSize, setWindowSize] = useState(120);
  const [orient, setOrient] = useState(() => {
    try { return localStorage.getItem(LS_ORIENT) || "vertical"; } catch { return "vertical"; }
  });
  useEffect(() => { try { localStorage.setItem(LS_ORIENT, orient); } catch {} }, [orient]);
  const [folio, setFolio] = useState(() => {
    try { return localStorage.getItem("aevenmere.folio") || "atelier"; } catch { return "atelier"; }
  });
  useEffect(() => { try { localStorage.setItem("aevenmere.folio", folio); } catch {} }, [folio]);
  const [tab, setTab] = useState("events");
  const [focusId, setFocusId] = useState("ev_arrival");
  const [selectedRegionId, setSelectedRegionId] = useState("isles");
  const [layers, setLayers] = useState({ events: true, countries: true, orgs: true, characters: true, conflicts: true, eventsWindow: 200 });
  const [drawing, setDrawing] = useState(null); // { entityId, key:'countries'|'organizations', accent }
  const [story, setStory] = useState("");
  const [hint, setHint] = useState("");
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => { try { localStorage.setItem(LS_WORLD, JSON.stringify(world)); } catch {} }, [world]);
  useEffect(() => { try { localStorage.setItem(LS_YEAR, String(currentYear)); } catch {} }, [currentYear]);

  // Focus auto-switches tab to match entity kind
  useEffect(() => {
    if (!focusId) return;
    const k = AVN.entityKind(world, focusId);
    if (k === "event") setTab("events");
    else if (k === "character") setTab("characters");
    else if (k === "organization") setTab("orgs");
    else if (k === "country") setTab("countries");
  }, [focusId]);

  // ── Drawing territories ─────────────────────────────
  const startDrawing = (entityId, key) => {
    const ent = world[key].find((e) => e.id === entityId);
    if (!ent) return;
    setDrawing({ entityId, key, name: ent.name, accent: ent.accent });
    setFocusId(entityId);
  };
  const cancelDrawing = () => setDrawing(null);
  const commitDrawing = (territoryStr) => {
    if (!drawing) return;
    const { entityId, key } = drawing;
    const ent = world[key].find((e) => e.id === entityId);
    if (!ent) return;
    const snaps = ent.snapshots || [];
    const existing = snaps.find((s) => s.year === currentYear);
    if (existing) {
      setEnt(key, entityId, { snapshots: snaps.map((s) => s === existing ? { ...s, territory: territoryStr } : s) });
    } else {
      // Latest prior snapshot for inherited fields
      const prior = AVN.snapAt(ent, currentYear);
      const newSnap = prior ? { ...prior, year: currentYear, territory: territoryStr } : { year: currentYear, territory: territoryStr };
      setEnt(key, entityId, { snapshots: [...snaps, newSnap] });
    }
    setDrawing(null);
  };

  // ── Mutations ───────────────────────────────────────
  const setEnt = (key, id, patch) => setWorld((w) => ({ ...w, [key]: w[key].map((e) => e.id === id ? { ...e, ...patch } : e) }));
  const delEnt = (key, id) => setWorld((w) => ({ ...w, [key]: w[key].filter((e) => e.id !== id) }));

  const updateEvent = (id, patch) => setEnt("events", id, patch);
  const deleteEvent = (id) => { delEnt("events", id); if (focusId === id) setFocusId(null); };
  const updateChar = (id, patch) => setEnt("characters", id, patch);
  const deleteChar = (id) => { delEnt("characters", id); if (focusId === id) setFocusId(null); };
  const updateOrg = (id, patch) => setEnt("organizations", id, patch);
  const deleteOrg = (id) => { delEnt("organizations", id); if (focusId === id) setFocusId(null); };
  const updateCountry = (id, patch) => setEnt("countries", id, patch);
  const deleteCountry = (id) => { delEnt("countries", id); if (focusId === id) setFocusId(null); };

  // Snapshots — entity, snap object reference
  const snapMutator = (key) => ({
    add: (id, snap) => setEnt(key, id, { snapshots: [...(world[key].find((e) => e.id === id).snapshots || []), snap] }),
    update: (id) => (oldSnap, patch) => setEnt(key, id, { snapshots: world[key].find((e) => e.id === id).snapshots.map((s) => s === oldSnap ? { ...s, ...patch } : s) }),
    del: (id) => (snap) => setEnt(key, id, { snapshots: world[key].find((e) => e.id === id).snapshots.filter((s) => s !== snap) })
  });

  // Relationships
  const addRel = (entityId) => {
    const candidates = [...world.characters, ...world.organizations, ...world.countries].filter((e) => e.id !== entityId);
    const other = candidates[0];
    if (!other) return;
    const id = uid("rl");
    setWorld((w) => ({ ...w, relationships: [...(w.relationships || []), { id, a: entityId, b: other.id, kind: "ally", since: currentYear, until: null, note: "" }] }));
  };
  const updateRel = (id, patch) => setWorld((w) => ({ ...w, relationships: w.relationships.map((r) => r.id === id ? { ...r, ...patch } : r) }));
  const deleteRel = (id) => setWorld((w) => ({ ...w, relationships: w.relationships.filter((r) => r.id !== id) }));

  // ── Add blanks ──────────────────────────────────────
  const addBlankEvent = () => {
    const id = uid("ev");
    setWorld((w) => ({ ...w, events: [...w.events, { id, year: currentYear, title: "An unnamed happening", body: "", placeId: null, participants: [] }] }));
    setFocusId(id); setTab("events");
  };
  const addBlankChar = () => {
    const id = uid("ch");
    setWorld((w) => ({ ...w, characters: [...w.characters, { id, name: "Someone unnamed", role: "of the Reach", born: currentYear - 25, died: null, originRegionId: selectedRegionId, snapshots: [{ year: currentYear, location: { x: 500, y: 340, name: "" }, status: "alive", body: "" }] }] }));
    setFocusId(id); setTab("characters");
  };
  const addBlankOrg = () => {
    const id = uid("or");
    setWorld((w) => ({ ...w, organizations: [...w.organizations, { id, name: "An unnamed order", accent: "#c89859", founded: currentYear, dissolved: null, snapshots: [{ year: currentYear, hq: { x: 500, y: 340, name: "" }, leader: "", members: 1, body: "" }] }] }));
    setFocusId(id); setTab("orgs");
  };
  const addBlankCountry = () => {
    const id = uid("co");
    setWorld((w) => ({ ...w, countries: [...w.countries, { id, name: "An unnamed realm", accent: "#5a7a3a", founded: currentYear, dissolved: null, snapshots: [{ year: currentYear, capital: { x: 500, y: 340, name: "" }, leader: "", body: "", territory: "" }] }] }));
    setFocusId(id); setTab("countries");
  };

  // ── AI handlers ─────────────────────────────────────
  const placeIdForCurrent = () => {
    const reg = world.regions.find((r) => r.id === selectedRegionId);
    if (!reg) return null;
    const p = world.places.find((pp) => pp.name === reg.cap.name);
    return p?.id || null;
  };
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
        setFocusId(id); setTab("characters");
      } else if (kind === "event") {
        const out = await window.aiGenerateEvent(world, hint, currentYear, placeIdForCurrent());
        const id = uid("ev");
        setWorld((w) => ({ ...w, events: [...w.events, { id, year: out.year || currentYear, title: out.title, body: out.body, placeId: out.placeId || placeIdForCurrent(), participants: out.participants || [] }] }));
        setFocusId(id); setTab("events");
      } else if (kind === "org") {
        const out = await window.aiGenerateOrg(world, hint, currentYear);
        const id = uid("or");
        const snaps = (out.snapshots || []).map((s) => ({ year: s.year, leader: s.leader, members: s.members, body: s.body, hq: expandPlace(s.hq), territory: "" }));
        setWorld((w) => ({ ...w, organizations: [{ id, name: out.name, accent: out.accent || "#c89859", founded: out.founded ?? currentYear, dissolved: out.dissolved ?? null, snapshots: snaps }, ...w.organizations] }));
        setFocusId(id); setTab("orgs");
      } else if (kind === "country") {
        const out = await window.aiGenerateCountry(world, hint, currentYear);
        const id = uid("co");
        const snaps = (out.snapshots || []).map((s) => ({ year: s.year, leader: s.leader, body: s.body, capital: expandPlace(s.capital), territory: "" }));
        setWorld((w) => ({ ...w, countries: [{ id, name: out.name, accent: out.accent || "#5a7a3a", founded: out.founded ?? currentYear, dissolved: out.dissolved ?? null, snapshots: snaps }, ...w.countries] }));
        setFocusId(id); setTab("countries");
      } else if (kind === "story") {
        const out = await window.aiContinueStory(world, currentYear, focusId, hint);
        setStory(out);
      }
      if (kind !== "story") setHint("");
    } catch (e) { setErr(String(e.message || e)); }
    setBusy(null);
  };

  const onAIFill = async (kind, id) => {
    setBusy("fill"); setErr(null);
    try {
      const key = kind === "character" ? "characters" : kind === "organization" ? "organizations" : "countries";
      const ent = world[key].find((e) => e.id === id);
      const out = await window.aiFillEntity(world, kind, ent, currentYear);
      // snapshot
      if (out.snapshot) {
        const s = out.snapshot;
        const expanded = {
          year: s.year || currentYear,
          leader: s.leader, members: s.members, status: s.status, body: s.body, territory: s.territory || ""
        };
        if (kind === "character") expanded.location = expandPlace(s.place || s.location?.name);
        if (kind === "organization") expanded.hq = expandPlace(s.hq || s.location?.name);
        if (kind === "country") expanded.capital = expandPlace(s.capital || s.location?.name);
        setEnt(key, id, { snapshots: [...ent.snapshots, expanded] });
      }
      // relationship
      if (out.relationship && out.relationship.targetId) {
        const r = out.relationship;
        const rid = uid("rl");
        setWorld((w) => ({ ...w, relationships: [...w.relationships, { id: rid, a: id, b: r.targetId, kind: r.kind || "ally", since: r.since || currentYear, until: null, note: r.note || "" }] }));
      }
    } catch (e) { setErr(String(e.message || e)); }
    setBusy(null);
  };

  const onReset = () => {
    if (!confirm("Re-cast the world to its original seed? Edits will be lost.")) return;
    const fresh = JSON.parse(JSON.stringify(window.WORLD_SEED));
    setWorld(fresh); setCurrentYear(1209); setFocusId("ev_arrival");
  };

  // ── Render helpers ──────────────────────────────────
  const counts = {
    events: world.events.length,
    characters: world.characters.length,
    orgs: world.organizations.length,
    countries: world.countries.length
  };
  const onJump = (y) => setCurrentYear(y);

  const renderDetail = () => {
    if (!focusId) return null;
    const kind = AVN.entityKind(world, focusId);
    if (kind === "event") {
      const ev = world.events.find((e) => e.id === focusId);
      return <EventDetail ev={ev} world={world} currentYear={currentYear}
                          onUpdate={(p) => updateEvent(ev.id, p)} onDelete={() => deleteEvent(ev.id)}
                          onJump={onJump} onFocus={setFocusId} />;
    }
    if (kind === "character") {
      const c = world.characters.find((e) => e.id === focusId);
      const sm = snapMutator("characters");
      return <CharDetail c={c} world={world} currentYear={currentYear}
                         onUpdate={(p) => updateChar(c.id, p)} onDelete={() => deleteChar(c.id)}
                         onJump={onJump} onFocus={setFocusId}
                         onAddSnap={(s) => sm.add(c.id, s)} onUpdateSnap={sm.update(c.id)} onDeleteSnap={sm.del(c.id)}
                         onAddRel={addRel} onUpdateRel={updateRel} onDeleteRel={deleteRel}
                         onAIFill={onAIFill} />;
    }
    if (kind === "organization") {
      const o = world.organizations.find((e) => e.id === focusId);
      const sm = snapMutator("organizations");
      return <OrgDetail o={o} world={world} currentYear={currentYear}
                        onUpdate={(p) => updateOrg(o.id, p)} onDelete={() => deleteOrg(o.id)}
                        onJump={onJump} onFocus={setFocusId}
                        onAddSnap={(s) => sm.add(o.id, s)} onUpdateSnap={sm.update(o.id)} onDeleteSnap={sm.del(o.id)}
                        onAddRel={addRel} onUpdateRel={updateRel} onDeleteRel={deleteRel}
                        onAIFill={onAIFill} onDraw={startDrawing} />;
    }
    if (kind === "country") {
      const c = world.countries.find((e) => e.id === focusId);
      const sm = snapMutator("countries");
      return <CountryDetail c={c} world={world} currentYear={currentYear}
                            onUpdate={(p) => updateCountry(c.id, p)} onDelete={() => deleteCountry(c.id)}
                            onJump={onJump} onFocus={setFocusId}
                            onAddSnap={(s) => sm.add(c.id, s)} onUpdateSnap={sm.update(c.id)} onDeleteSnap={sm.del(c.id)}
                            onAddRel={addRel} onUpdateRel={updateRel} onDeleteRel={deleteRel}
                            onAIFill={onAIFill} onDraw={startDrawing} />;
    }
    return null;
  };

  const renderList = () => {
    if (tab === "events") {
      const inView = world.events.filter((ev) => Math.abs(ev.year - currentYear) <= windowSize / 2).sort((a, b) => a.year - b.year);
      return (
        <div className="list">
          {inView.length === 0 && <div className="ai-status">— widen the lens, or scrub the rail —</div>}
          {inView.map((ev) => (
            <button key={ev.id} className={`list-row ${focusId === ev.id ? "active" : ""}`} onClick={() => setFocusId(ev.id)}>
              <span className="row-year">{AVN.yearLabel(ev.year)}</span>
              <span className="row-title">{ev.title}</span>
            </button>
          ))}
        </div>
      );
    }
    const items = tab === "characters" ? world.characters : tab === "orgs" ? world.organizations : world.countries;
    return (
      <div className="list">
        {items.map((e) => {
          const alive = AVN.entityAlive(e, currentYear);
          return (
            <button key={e.id} className={`list-row ${focusId === e.id ? "active" : ""} ${alive ? "" : "muted"}`} onClick={() => setFocusId(e.id)}>
              <span className="row-swatch" style={{ background: e.accent || "#a89472" }} />
              <span className="row-title">{e.name}</span>
              <span className="row-year">{(e.born ?? e.founded) != null ? AVN.yearLabel(e.born ?? e.founded) : "—"}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const focusedKind = focusId ? AVN.entityKind(world, focusId) : null;
  const currentEra = world.eras.find((e) => currentYear >= e.start && currentYear <= e.end) || world.eras[world.eras.length - 1];

  const isHorizontal = orient === "horizontal";

  // ── Top-level folio switcher (Atelier vs Library) ──
  const switcher = (
    <div className="folio-switch">
      <div className="folio-switch-inner">
        <button className={`folio-tab ${folio === "atelier" ? "on" : ""}`} onClick={() => setFolio("atelier")}>
          <span className="folio-num">I·II</span> The Atelier
        </button>
        <button className={`folio-tab ${folio === "library" ? "on" : ""}`} onClick={() => setFolio("library")}>
          <span className="folio-num">III</span> The Library &nbsp;·&nbsp; 書冊
        </button>
      </div>
    </div>
  );

  if (folio === "library") {
    return (
      <div>
        {switcher}
        <Library world={world} setWorld={setWorld} currentYear={currentYear}
                 focusId={focusId} onFocus={(id) => { setFocusId(id); setFolio("atelier"); }}
                 onJump={(y) => { setCurrentYear(y); setFolio("atelier"); }} />
      </div>
    );
  }

  return (
    <div>
      {switcher}
      <div className={`atelier ${isHorizontal ? "stage-horizontal" : "stage-vertical"}`}>
      {/* LEFT — Inspector */}
      <aside className="left">
        <section className="panel">
          <div className="panel-head" style={{ paddingBottom: 0, borderBottom: "none" }}>
            <h3>The Chronicle</h3>
            <button className="ai-btn danger small" onClick={onReset} title="Restart">↺</button>
          </div>
          <Tabs tab={tab} onTab={setTab} counts={counts} />
          <div className="panel-body ins-body">
            <div className="ai-row" style={{ marginBottom: 8 }}>
              {tab === "events" && (
                <>
                  <button className="ai-btn" onClick={addBlankEvent}>+ blank</button>
                  <button className="ai-btn primary" disabled={busy === "event"} onClick={() => onAI("event")}>{busy === "event" ? "inking…" : "+ AI event"}</button>
                </>
              )}
              {tab === "characters" && (
                <>
                  <button className="ai-btn" onClick={addBlankChar}>+ blank</button>
                  <button className="ai-btn primary" disabled={busy === "char"} onClick={() => onAI("char")}>{busy === "char" ? "summoning…" : "+ AI character"}</button>
                </>
              )}
              {tab === "orgs" && (
                <>
                  <button className="ai-btn" onClick={addBlankOrg}>+ blank</button>
                  <button className="ai-btn primary" disabled={busy === "org"} onClick={() => onAI("org")}>{busy === "org" ? "founding…" : "+ AI organization"}</button>
                </>
              )}
              {tab === "countries" && (
                <>
                  <button className="ai-btn" onClick={addBlankCountry}>+ blank</button>
                  <button className="ai-btn primary" disabled={busy === "country"} onClick={() => onAI("country")}>{busy === "country" ? "drawing borders…" : "+ AI country"}</button>
                </>
              )}
            </div>
            {renderList()}
          </div>
        </section>

        <section className="panel" style={{ flex: 0 }}>
          <header className="panel-head"><h3>The Leaf</h3></header>
          <div className="panel-body ai-desk">
            <input className="ai-input" placeholder="Optional direction for AI — 'they meet in the rain'…"
                   value={hint} onChange={(e) => setHint(e.target.value)} />
            <div className="ai-row">
              <button className="ai-btn primary" disabled={busy === "story"} onClick={() => onAI("story")}>{busy === "story" ? "writing…" : "Write the next leaf"}</button>
              <button className="ai-btn" onClick={() => setStory("")}>clear</button>
            </div>
            <div className="story-out">{story}</div>
            {err && <div className="ai-status err">! {err}</div>}
          </div>
        </section>
      </aside>

      {/* CENTER — Map + Timeline */}
      <main className="stage">
        <div className="topbar">
          <h1>The Atelier <em>of Aevenmere</em></h1>
          <div className="layer-toggles">
            {[
              { k: "countries", l: "Countries" },
              { k: "orgs",      l: "Organizations" },
              { k: "characters",l: "Characters" },
              { k: "events",    l: "Events" },
              { k: "conflicts", l: "Conflicts" }
            ].map((t) => (
              <button key={t.k} className={`layer-toggle ${layers[t.k] ? "on" : ""} ${t.k === "conflicts" ? "conflict" : ""}`}
                      onClick={() => setLayers((L) => ({ ...L, [t.k]: !L[t.k] }))}>
                <span className="layer-dot" /> {t.l}
              </button>
            ))}
          </div>
          <div className="topmeta">
            <button className="orient-toggle" onClick={() => setOrient(isHorizontal ? "vertical" : "horizontal")}
                    title={isHorizontal ? "Switch to stacked (\u76f4\u5f0f)" : "Switch to side-by-side (\u6a6b\u5f0f)"}>
              <span className={`orient-glyph ${isHorizontal ? "is-h" : "is-v"}`}>
                <span className="orient-a" /><span className="orient-b" />
              </span>
              <span className="orient-label">{isHorizontal ? "\u6a6b\u5f0f" : "\u76f4\u5f0f"}</span>
            </button>
            <span className="topmeta-sep">·</span>
            <span>Folio I</span> · <b>{AVN.yearLabel(currentYear)}</b> · <span>{currentEra.name}</span>
          </div>
        </div>

        <div className="map-frame">
          <WorldMap world={world} currentYear={currentYear} layers={{ ...layers, eventsWindow: windowSize }}
                    selectedRegionId={selectedRegionId} onSelectRegion={setSelectedRegionId}
                    focusId={focusId} onFocus={(id) => id != null && setFocusId(id)}
                    drawing={drawing} onCommitDraw={commitDrawing} onCancelDraw={cancelDrawing} />
          <div className="cornermark">drawn by hand · folio of the reach</div>
          {drawing && (
            <div className="draw-banner">
              <span className="draw-dot" style={{ background: drawing.accent }} />
              <span className="draw-label">Drawing borders of</span>
              <span className="draw-name">{drawing.name}</span>
              <span className="draw-year">@ {AVN.yearLabel(currentYear)}</span>
              <span className="draw-hint">click + drag on the map · release to commit</span>
              <button className="ai-btn small danger" onClick={cancelDrawing}>cancel</button>
            </div>
          )}
        </div>

        <Timeline world={world} currentYear={currentYear} onScrub={setCurrentYear}
                  focusId={focusId} onFocus={setFocusId}
                  windowSize={windowSize} onWindowSize={setWindowSize}
                  lanes={layers} onToggleLane={(k) => setLayers((L) => ({ ...L, [k]: !L[k] }))}
                  vertical={isHorizontal} />
      </main>

      {/* RIGHT — Detail */}
      <aside className="right">
        <section className="panel">
          <header className="panel-head">
            <h3>The Detail</h3>
            <span className="panel-count">{focusedKind ? KIND_LABELS[focusedKind] : "—"}</span>
          </header>
          <div className="panel-body">
            {focusId ? renderDetail() : (
              <div className="ai-status" style={{ padding: 14 }}>
                — pick anything: an event dot, a character pin, a country shape, a lifespan bar, or a row in the list —
              </div>
            )}
          </div>
        </section>
      </aside>

      {/* BOTTOM — Codex spans the full width */}
      <Codex world={world} currentYear={currentYear}
             focusId={focusId} onFocus={setFocusId}
             onJump={(y) => y != null && setCurrentYear(y)} />
    </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
