// Main App. Composes map, multi-lane timeline, tabbed inspector, AI desk.

const { useState, useEffect, useMemo, useRef } = React;

const KIND_LABELS = { event: "Event", character: "Character", organization: "Organization", country: "Country" };

function uid(p) { return p + "_" + Math.random().toString(36).slice(2, 8); }

const LS_ORIENT = "aevenmere.orient.v1";

const App = () => {
  const [windowSize, setWindowSize] = useState(120);
  const [orient, setOrient] = useState(() => {
    try { return localStorage.getItem(LS_ORIENT) || "vertical"; } catch { return "vertical"; }
  });
  useEffect(() => { try { localStorage.setItem(LS_ORIENT, orient); } catch {} }, [orient]);
  const [tab, setTab] = useState("events");
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [layers, setLayers] = useState({ events: true, countries: true, orgs: true, characters: true, conflicts: true, eventsWindow: 200 });
  const [drawing, setDrawing] = useState(null); // { entityId, key:'countries'|'organizations', accent }

  const workspace = window.useAevenmereWorkspace({
    afterEntityCreated: (kind) => {
      if (kind === "event") setTab("events");
      else if (kind === "character") setTab("characters");
      else if (kind === "organization") setTab("orgs");
      else if (kind === "country") setTab("countries");
    },
    getEventPlaceId: ({ world }) => {
      const reg = world.regions.find((region) => region.id === selectedRegionId);
      if (!reg) return null;
      const place = world.places.find((item) => item.name === reg.cap.name);
      return place?.id || null;
    }
  });

  const { state, storyActions, entityActions, aiActions, sourceState } = workspace;
  const {
    world, setWorld,
    stories, activeStory, storyReady, storeMode, storyStatus, storyError,
    currentYear, setCurrentYear,
    folio, setFolio,
    focusId, setFocusId,
    currentEra, canUseStoryApi
  } = state;
  const {
    sourceRange, setSourceRange,
    sourceIndex, sourceScope, scopedWorld, counts, totalCounts
  } = sourceState;
  const {
    onSelectStory, onCreateStory, onDuplicateStory, onRenameStory, onArchiveStory,
    onImportStoryFile, onExportStoryTemplate
  } = storyActions;
  const {
    setEnt,
    updateEvent, deleteEvent, updateChar, deleteChar, updateOrg, deleteOrg, updateCountry, deleteCountry,
    snapMutator, addRel, updateRel, deleteRel, withCurrentSourceRef,
    addBlankEvent, addBlankChar: addBlankCharBase, addBlankOrg, addBlankCountry,
    onReset
  } = entityActions;
  const {
    story, setStory,
    hint, setHint,
    busy, err,
    onAI, onAIFill
  } = aiActions;

  useEffect(() => {
    setSelectedRegionId(world.regions[0]?.id || null);
    setDrawing(null);
  }, [activeStory?.id]);

  // Focus auto-switches tab to match entity kind
  useEffect(() => {
    if (!focusId) return;
    const k = AVN.entityKind(world, focusId);
    if (k === "event") setTab("events");
    else if (k === "character") setTab("characters");
    else if (k === "organization") setTab("orgs");
    else if (k === "country") setTab("countries");
  }, [focusId]);

  const addBlankChar = () => addBlankCharBase(selectedRegionId);

  // Drawing territories
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

  // Render helpers
  const onJump = (y) => setCurrentYear(y);

  const renderDetail = () => {
    if (!focusId) return null;
    const kind = AVN.entityKind(world, focusId);
    const sourceRefs = AVN.sourceRefsForEntity(world, focusId, sourceIndex);
    if (kind === "event") {
      const ev = world.events.find((e) => e.id === focusId);
      return <EventDetail ev={ev} world={world} currentYear={currentYear}
                          onUpdate={(p) => updateEvent(ev.id, p)} onDelete={() => deleteEvent(ev.id)}
                          onJump={onJump} onFocus={setFocusId} sourceRefs={sourceRefs} />;
    }
    if (kind === "character") {
      const c = world.characters.find((e) => e.id === focusId);
      const sm = snapMutator("characters");
      return <CharDetail c={c} world={world} currentYear={currentYear}
                         onUpdate={(p) => updateChar(c.id, p)} onDelete={() => deleteChar(c.id)}
                         onJump={onJump} onFocus={setFocusId}
                         onAddSnap={(s) => sm.add(c.id, withCurrentSourceRef(s))} onUpdateSnap={sm.update(c.id)} onDeleteSnap={sm.del(c.id)}
                         onAddRel={addRel} onUpdateRel={updateRel} onDeleteRel={deleteRel}
                         onAIFill={onAIFill} sourceRefs={sourceRefs} />;
    }
    if (kind === "organization") {
      const o = world.organizations.find((e) => e.id === focusId);
      const sm = snapMutator("organizations");
      return <OrgDetail o={o} world={world} currentYear={currentYear}
                        onUpdate={(p) => updateOrg(o.id, p)} onDelete={() => deleteOrg(o.id)}
                        onJump={onJump} onFocus={setFocusId}
                        onAddSnap={(s) => sm.add(o.id, withCurrentSourceRef(s))} onUpdateSnap={sm.update(o.id)} onDeleteSnap={sm.del(o.id)}
                        onAddRel={addRel} onUpdateRel={updateRel} onDeleteRel={deleteRel}
                        onAIFill={onAIFill} onDraw={startDrawing} sourceRefs={sourceRefs} />;
    }
    if (kind === "country") {
      const c = world.countries.find((e) => e.id === focusId);
      const sm = snapMutator("countries");
      return <CountryDetail c={c} world={world} currentYear={currentYear}
                            onUpdate={(p) => updateCountry(c.id, p)} onDelete={() => deleteCountry(c.id)}
                            onJump={onJump} onFocus={setFocusId}
                            onAddSnap={(s) => sm.add(c.id, withCurrentSourceRef(s))} onUpdateSnap={sm.update(c.id)} onDeleteSnap={sm.del(c.id)}
                            onAddRel={addRel} onUpdateRel={updateRel} onDeleteRel={deleteRel}
                            onAIFill={onAIFill} onDraw={startDrawing} sourceRefs={sourceRefs} />;
    }
    return null;
  };

  const renderList = () => {
    if (tab === "events") {
      const inView = scopedWorld.events.filter((ev) => Math.abs(ev.year - currentYear) <= windowSize / 2).sort((a, b) => a.year - b.year);
      return (
        <div className="list">
          {inView.length === 0 && <div className="ai-status">— widen the lens, or scrub the rail —</div>}
          {inView.map((ev) => {
            const refs = AVN.sourceRefsForEntity(world, ev.id, sourceIndex);
            return (
              <button key={ev.id} className={`list-row ${focusId === ev.id ? "active" : ""}`} onClick={() => setFocusId(ev.id)}>
                <span className="row-year">{AVN.yearLabel(ev.year)}</span>
                <span className="row-title">{ev.title}</span>
                <span className="row-source">{refs[0] ? AVN.compactSourceLabel(refs[0]) : "unbound"}</span>
              </button>
            );
          })}
        </div>
      );
    }
    const items = tab === "characters" ? scopedWorld.characters : tab === "orgs" ? scopedWorld.organizations : scopedWorld.countries;
    return (
      <div className="list">
        {items.map((e) => {
          const alive = AVN.entityAlive(e, currentYear);
          const refs = AVN.sourceRefsForEntity(world, e.id, sourceIndex);
          return (
            <button key={e.id} className={`list-row ${focusId === e.id ? "active" : ""} ${alive ? "" : "muted"}`} onClick={() => setFocusId(e.id)}>
              <span className="row-swatch" style={{ background: e.accent || "#a89472" }} />
              <span className="row-title">{e.name}</span>
              <span className="row-source">{refs[0] ? AVN.compactSourceLabel(refs[0]) : "unbound"}</span>
              <span className="row-year">{(e.born ?? e.founded) != null ? AVN.yearLabel(e.born ?? e.founded) : "—"}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const focusedKind = focusId ? AVN.entityKind(world, focusId) : null;
  const isHorizontal = orient === "horizontal";

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
      onImportStoryFile={onImportStoryFile}
      onExportStoryTemplate={onExportStoryTemplate}
    />
  );

  // ── Top-level folio switcher ──
  const switcher = (
    <div className="folio-switch">
      <div className="folio-switch-inner">
        <button className={`folio-tab ${folio === "atelier" ? "on" : ""}`} onClick={() => setFolio("atelier")}>
          <span className="folio-num">I·II</span> The Atelier
        </button>
        <button className={`folio-tab ${folio === "library" ? "on" : ""}`} onClick={() => setFolio("library")}>
          <span className="folio-num">III</span> The Library · Books
        </button>
        <button className={`folio-tab ${folio === "about" ? "on" : ""}`} onClick={() => setFolio("about")}>
          <span className="folio-num">IV</span> About Me
        </button>
      </div>
    </div>
  );

  if (folio === "about") {
    return (
      <div>
        {storyBar}
        {switcher}
        <window.AevenAboutMe />
      </div>
    );
  }

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

        <SourceScopeControl
          sourceIndex={sourceIndex}
          sourceScope={sourceScope}
          value={sourceRange}
          counts={counts}
          totalCounts={totalCounts}
          onChange={setSourceRange}
        />

        <div className="map-frame">
          <WorldMap world={scopedWorld} currentYear={currentYear} layers={{ ...layers, eventsWindow: windowSize }}
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

        <Timeline world={scopedWorld} currentYear={currentYear} onScrub={setCurrentYear}
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

function SourceScopeControl({ sourceIndex, sourceScope, value, counts, totalCounts, onChange }) {
  const chapters = sourceIndex.chapters || [];
  const disabled = chapters.length === 0;
  const enabled = !!value.enabled && !disabled;
  const startKey = sourceScope.startKey || chapters[0]?.key || "";
  const endKey = sourceScope.endKey || chapters[chapters.length - 1]?.key || "";
  const visibleTotal = counts.events + counts.characters + counts.orgs + counts.countries;
  const fullTotal = totalCounts.events + totalCounts.characters + totalCounts.orgs + totalCounts.countries;

  const setEnabled = (nextEnabled) => {
    onChange((prev) => ({
      ...prev,
      enabled: nextEnabled,
      startKey: prev.startKey || chapters[0]?.key || "",
      endKey: prev.endKey || chapters[chapters.length - 1]?.key || ""
    }));
  };

  const optionLabel = (ref) => `${AVN.compactSourceLabel(ref)} - ${ref.chapterTitle}`;

  return (
    <div className={`source-scope ${enabled ? "is-on" : ""}`}>
      <div className="source-scope-main">
        <button
          className={`source-mode ${enabled ? "on" : ""}`}
          disabled={disabled}
          onClick={() => setEnabled(!enabled)}
        >
          {enabled ? "Source range" : "All sources"}
        </button>
        <div className="source-range">
          <label>
            <span>from</span>
            <select
              disabled={!enabled}
              value={startKey}
              onChange={(event) => onChange((prev) => ({ ...prev, enabled: true, startKey: event.target.value }))}
            >
              {chapters.map((ref) => <option key={ref.key} value={ref.key}>{optionLabel(ref)}</option>)}
            </select>
          </label>
          <label>
            <span>to</span>
            <select
              disabled={!enabled}
              value={endKey}
              onChange={(event) => onChange((prev) => ({ ...prev, enabled: true, endKey: event.target.value }))}
            >
              {chapters.map((ref) => <option key={ref.key} value={ref.key}>{optionLabel(ref)}</option>)}
            </select>
          </label>
        </div>
      </div>
      <div className="source-scope-meta">
        {disabled ? "No chapter sources yet" : `${enabled ? sourceScope.label : "entire canon"} / ${visibleTotal} of ${fullTotal} records`}
      </div>
    </div>
  );
}

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
  onArchiveStory,
  onImportStoryFile,
  onExportStoryTemplate
}) {
  const importInputRef = useRef(null);
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
          disabled={disabled}
          onChange={(event) => onSelectStory(event.target.value)}
        >
          {(stories || []).map((story) => (
            <option key={story.id} value={story.id}>{story.name}</option>
          ))}
        </select>
        <span className={`story-save-state ${status === "error" ? "is-error" : ""}`}>{statusLabel}</span>
      </div>
      <div className="story-actions">
        <button className="story-action" disabled={disabled} onClick={onCreateStory}>New</button>
        <button className="story-action" disabled={disabled} onClick={() => importInputRef.current?.click()}>Import</button>
        <button className="story-action" onClick={onExportStoryTemplate}>Template</button>
        <button className="story-action" disabled={disabled || !activeStory} onClick={onDuplicateStory}>Duplicate</button>
        <button className="story-action" disabled={disabled || !activeStory} onClick={onRenameStory}>Rename</button>
        <button className="story-action danger" disabled={disabled || !activeStory} onClick={onArchiveStory}>Archive</button>
        <input
          ref={importInputRef}
          hidden
          type="file"
          accept=".md,text/markdown,text/plain"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImportStoryFile(file);
            event.target.value = "";
          }}
        />
      </div>
      <window.ThemeToggle className="story-theme-toggle" />
      <div className="i18n-slot story-i18n-slot" data-i18n-slot="desktop" />
      {error && <div className="story-switch-error">{error}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
