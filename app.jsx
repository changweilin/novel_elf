// Main App. Composes map, multi-lane timeline, tabbed inspector, AI desk.

const { useState, useEffect, useMemo } = React;

const KIND_LABELS = { event: "Event", character: "Character", organization: "Organization", country: "Country" };

function uid(p) { return p + "_" + Math.random().toString(36).slice(2, 8); }

const LS_ORIENT = "aevenmere.orient.v1";

const App = () => {
  const seedWorld = useMemo(() => window.StoryStore.normalizeWorld(window.WORLD_SEED), []);
  const [world, setWorld] = useState(seedWorld);
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [storyReady, setStoryReady] = useState(false);
  const [storeMode, setStoreMode] = useState("loading");
  const [storyStatus, setStoryStatus] = useState("loading");
  const [storyError, setStoryError] = useState(null);
  const [currentYear, setCurrentYear] = useState(seedWorld.defaultYear);
  const [windowSize, setWindowSize] = useState(120);
  const [orient, setOrient] = useState(() => {
    try { return localStorage.getItem(LS_ORIENT) || "vertical"; } catch { return "vertical"; }
  });
  useEffect(() => { try { localStorage.setItem(LS_ORIENT, orient); } catch {} }, [orient]);
  const [folio, setFolio] = useState("atelier");
  const [tab, setTab] = useState("events");
  const [focusId, setFocusId] = useState(() => window.StoryStore.firstFocus(seedWorld));
  const [selectedRegionId, setSelectedRegionId] = useState(seedWorld.regions[0]?.id || null);
  const [layers, setLayers] = useState({ events: true, countries: true, orgs: true, characters: true, conflicts: true, eventsWindow: 200 });
  const [drawing, setDrawing] = useState(null); // { entityId, key:'countries'|'organizations', accent }
  const [story, setStory] = useState("");
  const [hint, setHint] = useState("");
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    setStoryStatus("loading");
    window.StoryStore.loadInitial(seedWorld)
      .then((loaded) => {
        if (!alive) return;
        setStories(loaded.stories || []);
        setActiveStory(loaded.activeStory);
        setWorld(loaded.world);
        setCurrentYear(window.StoryStore.getYear(loaded.activeStory.id, loaded.world));
        setFolio(window.StoryStore.getUi(loaded.activeStory.id, "folio", "atelier"));
        setFocusId(window.StoryStore.firstFocus(loaded.world));
        setSelectedRegionId(loaded.world.regions[0]?.id || null);
        setStoreMode(loaded.mode);
        setStoryError(loaded.error ? String(loaded.error.message || loaded.error) : null);
        setStoryReady(true);
        setStoryStatus(loaded.mode === "api" ? "ready" : "static");
      })
      .catch((error) => {
        if (!alive) return;
        setStoryError(String(error.message || error));
        setStoryReady(true);
        setStoreMode("static");
        setStoryStatus("error");
      });
    return () => { alive = false; };
  }, [seedWorld]);

  useEffect(() => {
    if (!storyReady || !activeStory) return;
    const timer = window.setTimeout(() => {
      setStoryStatus(storeMode === "api" ? "saving" : "static");
      window.StoryStore.saveWorld(activeStory.id, world, storeMode)
        .then((saved) => {
          if (saved.stories) setStories(saved.stories);
          if (saved.story) setActiveStory(saved.story);
          setStoryError(null);
          setStoryStatus(storeMode === "api" ? "saved" : "static");
        })
        .catch((error) => {
          setStoryError(String(error.message || error));
          setStoryStatus("error");
        });
    }, 650);
    return () => window.clearTimeout(timer);
  }, [world, activeStory?.id, storyReady, storeMode]);

  useEffect(() => {
    if (!storyReady || !activeStory) return;
    window.StoryStore.setUi(activeStory.id, "year", currentYear);
  }, [currentYear, activeStory?.id, storyReady]);

  useEffect(() => {
    if (!storyReady || !activeStory) return;
    window.StoryStore.setUi(activeStory.id, "folio", folio);
  }, [folio, activeStory?.id, storyReady]);

  const applyLoadedStory = (loaded) => {
    const nextWorld = window.StoryStore.normalizeWorld(loaded.world);
    const nextStory = loaded.story || window.StoryStore.storyFromWorld(nextWorld);
    setActiveStory(nextStory);
    setWorld(nextWorld);
    setCurrentYear(window.StoryStore.getYear(nextStory.id, nextWorld));
    setFolio(window.StoryStore.getUi(nextStory.id, "folio", "atelier"));
    setFocusId(window.StoryStore.firstFocus(nextWorld));
    setSelectedRegionId(nextWorld.regions[0]?.id || null);
    setDrawing(null);
    setStory("");
    setHint("");
    setErr(null);
    window.StoryStore.saveActiveStoryId(nextStory.id);
  };

  const onSelectStory = async (storyId) => {
    if (!storyId || storyId === activeStory?.id || storeMode !== "api") return;
    setStoryStatus("loading");
    try {
      const loaded = await window.StoryStore.loadStory(storyId);
      applyLoadedStory(loaded);
      setStoryError(null);
      setStoryStatus("ready");
    } catch (error) {
      setStoryError(String(error.message || error));
      setStoryStatus("error");
    }
  };

  const onCreateStory = async () => {
    if (storeMode !== "api") return;
    const title = prompt("Name this new story", "Untitled Story");
    if (!title) return;
    setStoryStatus("loading");
    try {
      const created = await window.StoryStore.createStory({ title });
      setStories(created.stories || []);
      applyLoadedStory(created);
      setStoryError(null);
      setStoryStatus("ready");
    } catch (error) {
      setStoryError(String(error.message || error));
      setStoryStatus("error");
    }
  };

  const onDuplicateStory = async () => {
    if (storeMode !== "api" || !activeStory) return;
    const title = prompt("Name the duplicate story", `${world.name} Copy`);
    if (!title) return;
    setStoryStatus("loading");
    try {
      const created = await window.StoryStore.createStory({ title, sourceId: activeStory.id });
      setStories(created.stories || []);
      applyLoadedStory(created);
      setStoryError(null);
      setStoryStatus("ready");
    } catch (error) {
      setStoryError(String(error.message || error));
      setStoryStatus("error");
    }
  };

  const onRenameStory = async () => {
    if (storeMode !== "api" || !activeStory) return;
    const name = prompt("Rename this story", world.name);
    if (!name || name === world.name) return;
    setStoryStatus("saving");
    try {
      const renamed = await window.StoryStore.renameStory(activeStory.id, { name });
      setStories(renamed.stories || stories);
      applyLoadedStory(renamed);
      setStoryError(null);
      setStoryStatus("saved");
    } catch (error) {
      setStoryError(String(error.message || error));
      setStoryStatus("error");
    }
  };

  const onArchiveStory = async () => {
    if (storeMode !== "api" || !activeStory) return;
    if (!confirm(`Archive "${world.name}"? Its Markdown files will move into stories/_archived.`)) return;
    setStoryStatus("loading");
    try {
      const archived = await window.StoryStore.archiveStory(activeStory.id);
      const remaining = archived.stories || [];
      setStories(remaining);
      if (remaining.length) {
        const loaded = await window.StoryStore.loadStory(remaining[0].id);
        applyLoadedStory(loaded);
      } else {
        const created = await window.StoryStore.createStory({ title: "Untitled Story" });
        setStories(created.stories || []);
        applyLoadedStory(created);
      }
      setStoryError(null);
      setStoryStatus("ready");
    } catch (error) {
      setStoryError(String(error.message || error));
      setStoryStatus("error");
    }
  };

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
    const ent = (world[key] || []).find((e) => e.id === entityId);
    if (!ent) return;
    setDrawing({ entityId, key, name: ent.name, accent: ent.accent });
    setFocusId(entityId);
  };
  const cancelDrawing = () => setDrawing(null);
  const commitDrawing = (territoryStr) => {
    if (!drawing) return;
    const { entityId, key } = drawing;
    const ent = (world[key] || []).find((e) => e.id === entityId);
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
  const setEnt = (key, id, patch) => setWorld((w) => ({ ...w, [key]: (w[key] || []).map((e) => e.id === id ? { ...e, ...patch } : e) }));
  const delEnt = (key, id) => setWorld((w) => ({ ...w, [key]: (w[key] || []).filter((e) => e.id !== id) }));

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
    add: (id, snap) => {
      const ent = (world[key] || []).find((e) => e.id === id);
      if (ent) setEnt(key, id, { snapshots: [...(ent.snapshots || []), snap] });
    },
    update: (id) => (oldSnap, patch) => {
      const ent = (world[key] || []).find((e) => e.id === id);
      if (ent) setEnt(key, id, { snapshots: (ent.snapshots || []).map((s) => s === oldSnap ? { ...s, ...patch } : s) });
    },
    del: (id) => (snap) => {
      const ent = (world[key] || []).find((e) => e.id === id);
      if (ent) setEnt(key, id, { snapshots: (ent.snapshots || []).filter((s) => s !== snap) });
    }
  });

  // Relationships
  const addRel = (entityId) => {
    const candidates = [...world.characters, ...world.organizations, ...world.countries].filter((e) => e.id !== entityId);
    const other = candidates[0];
    if (!other) return;
    const id = uid("rl");
    setWorld((w) => ({ ...w, relationships: [...(w.relationships || []), { id, a: entityId, b: other.id, kind: "ally", since: currentYear, until: null, note: "" }] }));
  };
  const updateRel = (id, patch) => setWorld((w) => ({ ...w, relationships: (w.relationships || []).map((r) => r.id === id ? { ...r, ...patch } : r) }));
  const deleteRel = (id) => setWorld((w) => ({ ...w, relationships: (w.relationships || []).filter((r) => r.id !== id) }));

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
    if (!confirm(window.AEVEN_I18N?.t("Re-cast the world to its original seed? Edits will be lost.") || "Re-cast the world to its original seed? Edits will be lost.")) return;
    const fresh = window.StoryStore.normalizeWorld({ ...window.WORLD_SEED, storyId: activeStory?.id || "aevenmere" });
    setWorld(fresh);
    setCurrentYear(fresh.defaultYear);
    setFocusId(window.StoryStore.firstFocus(fresh));
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
  const currentEra = world.eras.find((e) => currentYear >= e.start && currentYear <= e.end) || world.eras[world.eras.length - 1] || { name: "" };

  const isHorizontal = orient === "horizontal";
  const canUseStoryApi = storeMode === "api";

  const storyBar = (
    <StoryWorkspaceBar
      stories={stories}
      activeStory={activeStory}
      mode={storeMode}
      status={storyStatus}
      error={storyError}
      disabled={!storyReady}
      canUseApi={canUseStoryApi}
      onSelectStory={onSelectStory}
      onCreateStory={onCreateStory}
      onDuplicateStory={onDuplicateStory}
      onRenameStory={onRenameStory}
      onArchiveStory={onArchiveStory}
    />
  );

  // ── Top-level folio switcher (Atelier vs Library) ──
  const switcher = (
    <div className="folio-switch">
      <div className="folio-switch-inner">
        <button className={`folio-tab ${folio === "atelier" ? "on" : ""}`} onClick={() => setFolio("atelier")}>
          <span className="folio-num">I·II</span> The Atelier
        </button>
        <button className={`folio-tab ${folio === "library" ? "on" : ""}`} onClick={() => setFolio("library")}>
          <span className="folio-num">III</span> The Library · Books
        </button>
      </div>
    </div>
  );

  if (folio === "library") {
    return (
      <div>
        {storyBar}
        {switcher}
        <Library world={world} setWorld={setWorld} currentYear={currentYear}
                 focusId={focusId} onFocus={(id) => { setFocusId(id); setFolio("atelier"); }}
                 onJump={(y) => { setCurrentYear(y); setFolio("atelier"); }} />
      </div>
    );
  }

  return (
    <div>
      {storyBar}
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

        <section className="panel" style={{ flex: "0 0 auto" }}>
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
          <h1>The Atelier of {world.name}</h1>
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

function StoryWorkspaceBar({
  stories,
  activeStory,
  mode,
  status,
  error,
  disabled,
  canUseApi,
  onSelectStory,
  onCreateStory,
  onDuplicateStory,
  onRenameStory,
  onArchiveStory
}) {
  const statusLabel =
    status === "saving" ? "saving" :
    status === "saved" ? "saved" :
    status === "loading" ? "loading" :
    status === "static" ? "static fallback" :
    status === "error" ? "error" :
    mode === "api" ? "markdown wiki" : mode;

  return (
    <div className={`story-switch ${canUseApi ? "is-api" : "is-static"}`}>
      <div className="story-switch-main">
        <span className="story-switch-kicker">Story wiki</span>
        <select
          className="story-select"
          value={activeStory?.id || ""}
          disabled={disabled || !canUseApi}
          onChange={(event) => onSelectStory(event.target.value)}
        >
          {(stories || []).map((story) => (
            <option key={story.id} value={story.id}>{story.name}</option>
          ))}
        </select>
        <span className={`story-save-state ${status === "error" ? "is-error" : ""}`}>{statusLabel}</span>
      </div>
      <div className="story-actions">
        <button className="story-action" disabled={!canUseApi || disabled} onClick={onCreateStory}>New</button>
        <button className="story-action" disabled={!canUseApi || disabled || !activeStory} onClick={onDuplicateStory}>Duplicate</button>
        <button className="story-action" disabled={!canUseApi || disabled || !activeStory} onClick={onRenameStory}>Rename</button>
        <button className="story-action danger" disabled={!canUseApi || disabled || !activeStory} onClick={onArchiveStory}>Archive</button>
      </div>
      <div className="i18n-slot story-i18n-slot" data-i18n-slot="desktop" />
      {error && <div className="story-switch-error">{error}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
