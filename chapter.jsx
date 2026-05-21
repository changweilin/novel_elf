// Chapter editor — dual pane (rendered page | raw md),
// plus a right-rail with AI desk, illustrations, sync log, consistency warnings.

const { useState: useStateChap, useMemo: useMemoChap, useRef: useRefChap, useEffect: useEffectChap } = React;

function chapterArr(value) {
  return Array.isArray(value) ? value : [];
}

function chapterSlug(value, fallback) {
  if (window.StoryStore?.slugify) return window.StoryStore.slugify(value, fallback);
  return String(value || fallback || "item").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || fallback || "item";
}

function ChapterEditor({ world, setWorld, book, volume, chapter, updateChapter, onBack, onFocus, onJump }) {
  const [busy, setBusy] = useStateChap(null);
  const [hint, setHint] = useStateChap("");
  const [warnings, setWarnings] = useStateChap(null);   // null = never checked; [] = clean
  const [syncSummary, setSyncSummary] = useStateChap(null);
  const [pendingSync, setPendingSync] = useStateChap(null);
  const [syncLog, setSyncLog] = useStateChap(() => {
    try { return JSON.parse(localStorage.getItem("aevenmere.lib.synclog." + chapter.id) || "[]"); } catch { return []; }
  });
  const [err, setErr] = useStateChap(null);
  const [mdOpen, setMdOpen] = useStateChap(true);
  const taRef = useRefChap(null);

  useEffectChap(() => {
    try { localStorage.setItem("aevenmere.lib.synclog." + chapter.id, JSON.stringify(syncLog)); } catch {}
  }, [syncLog, chapter.id]);

  // ── Context that AI sees (also shown in the rail) ──
  const place = world.places.find((p) => p.id === chapter.placeId);
  const era = world.eras.find((e) => chapter.year >= e.start && chapter.year <= e.end);
  const focuses = (chapter.focusIds || []).map((id) => AVN.findEntity(world, id)).filter(Boolean);
  const chapterSourceRef = { bookId: book.id, volumeId: volume.id, chapterId: chapter.id };
  const writingContext = useMemoChap(() => (
    window.buildWritingContext ? window.buildWritingContext(world, chapter, book, volume) : { sections: {} }
  ), [world, chapter, book, volume]);

  // ── Word count + autosave (already in world state) ──
  const words = (chapter.md || "").trim().split(/\s+/).filter(Boolean).length;
  useEffectChap(() => {
    if (words !== chapter.words) updateChapter({ words });
  }, [words]);

  // ── Handlers ──
  const onContinue = async () => {
    setBusy("write"); setErr(null);
    try {
      const para = await window.aiWriteChapterParagraph(world, chapter, hint, book, volume);
      updateChapter({ md: (chapter.md || "") + "\n\n" + para });
      setHint("");
    } catch (e) { setErr(String(e.message || e)); }
    setBusy(null);
  };

  const onCheck = async () => {
    setBusy("check"); setErr(null);
    try {
      const out = await window.aiCheckConsistency(world, chapter, book, volume);
      setWarnings(out.warnings || []);
    } catch (e) { setErr(String(e.message || e)); }
    setBusy(null);
  };

  const normalizeSyncProposal = (out) => ({
    summary: out?.summary || "",
    snapshots: chapterArr(out?.snapshots).filter((s) => s?.entityId && s?.body),
    events: chapterArr(out?.events).filter((ev) => ev?.title || ev?.body),
    relationships: chapterArr(out?.relationships).filter((r) => r?.a && r?.b)
  });

  const proposalCount = (proposal) => (
    chapterArr(proposal?.snapshots).length +
    chapterArr(proposal?.events).length +
    chapterArr(proposal?.relationships).length
  );

  const onSync = async () => {
    setBusy("sync"); setErr(null);
    try {
      const out = await window.aiSyncChapterToWorld(world, chapter, book, volume);
      const proposal = normalizeSyncProposal(out);
      setPendingSync(proposal);
      setSyncSummary(proposal.summary || "(review ready)");

      if (!proposalCount(proposal)) {
        const ts = new Date();
        const tsStr = ts.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
        setSyncLog((L) => [{ ts: tsStr, msg: "reviewed — no canon changes proposed" }, ...L].slice(0, 12));
      }
    } catch (e) { setErr(String(e.message || e)); }
    setBusy(null);
  };

  const uniqueRecordId = (items, prefix, seed) => {
    const used = new Set(chapterArr(items).map((item) => item.id));
    const tail = chapterSlug(seed, "sync").replace(new RegExp(`^${prefix}[-_]?`), "") || "sync";
    const base = `${prefix}_${tail}`.slice(0, 58).replace(/_+$/g, "");
    let id = base;
    let i = 2;
    while (used.has(id)) {
      id = `${base}_${i}`.slice(0, 64);
      i += 1;
    }
    return id;
  };

  const placeByName = (W, name) => {
    if (!name) return null;
    return chapterArr(W.places).find((p) => p.id === name || p.name?.toLowerCase() === String(name).toLowerCase()) || null;
  };

  const applySyncProposal = (proposal) => {
    if (!proposal) return;
    const stamps = [];
    let W = { ...world };

    for (const s of chapterArr(proposal.snapshots)) {
      const kind = AVN.entityKind(W, s.entityId);
      if (kind !== "character" && kind !== "organization" && kind !== "country") continue;
      const key = kind === "character" ? "characters" : kind === "organization" ? "organizations" : "countries";
      const ent = W[key].find((e) => e.id === s.entityId);
      if (!ent) continue;
      const year = Number.isFinite(Number(s.year)) ? Number(s.year) : chapter.year;
      const body = String(s.body || "").trim();
      if (!body) continue;
      const duplicate = chapterArr(ent.snapshots).some((snap) => Number(snap.year) === year && String(snap.body || "").trim() === body);
      if (duplicate) continue;

      const placeObj = placeByName(W, s.place);
      const prior = AVN.snapAt(ent, year) || ent.snapshots?.[0] || {};
      const expanded = {
        year,
        body,
        status: s.status || prior.status,
        sourceRefs: [chapterSourceRef]
      };
      if (kind === "character") expanded.location = placeObj ? { x: placeObj.x, y: placeObj.y, name: placeObj.name } : prior.location;
      if (kind === "organization") expanded.hq = placeObj ? { x: placeObj.x, y: placeObj.y, name: placeObj.name } : prior.hq;
      if (kind === "country") expanded.capital = placeObj ? { x: placeObj.x, y: placeObj.y, name: placeObj.name } : prior.capital;
      W = { ...W, [key]: W[key].map((e) => e.id === ent.id ? { ...e, snapshots: [...chapterArr(e.snapshots), expanded] } : e) };
      stamps.push(`+ snapshot · ${ent.name} @ ${AVN.yearLabel(year)}`);
    }

    for (const ev of chapterArr(proposal.events)) {
      const title = String(ev.title || "Untitled event").trim();
      const year = Number.isFinite(Number(ev.year)) ? Number(ev.year) : chapter.year;
      const duplicate = chapterArr(W.events).some((item) => item.title === title && Number(item.year) === year);
      if (duplicate) continue;
      const id = uniqueRecordId(W.events, "ev", `${year}-${title}`);
      const participants = chapterArr(ev.participants).filter((id) => AVN.findEntity(W, id));
      const placeId = W.places.some((p) => p.id === ev.placeId) ? ev.placeId : chapter.placeId;
      W = {
        ...W,
        events: [...chapterArr(W.events), {
          id,
          year,
          title,
          body: ev.body || "",
          placeId: placeId || null,
          participants,
          sourceRefs: [chapterSourceRef]
        }]
      };
      stamps.push(`+ event · ${title}`);
    }

    for (const r of chapterArr(proposal.relationships)) {
      if (!AVN.findEntity(W, r.a) || !AVN.findEntity(W, r.b)) continue;
      const since = Number.isFinite(Number(r.since)) ? Number(r.since) : chapter.year;
      const kind = r.kind || "ally";
      const duplicate = chapterArr(W.relationships).some((item) => (
        item.a === r.a && item.b === r.b && item.kind === kind && Number(item.since) === since
      ));
      if (duplicate) continue;
      const id = uniqueRecordId(W.relationships, "rl", `${r.a}-${kind}-${r.b}-${since}`);
      W = {
        ...W,
        relationships: [...chapterArr(W.relationships), {
          id,
          a: r.a,
          b: r.b,
          kind,
          since,
          until: null,
          note: r.note || "",
          sourceRefs: [chapterSourceRef]
        }]
      };
      stamps.push(`+ relationship · ${AVN.entityName(W, r.a)} ${kind} ${AVN.entityName(W, r.b)}`);
    }

    setWorld(W);
    const ts = new Date();
    const tsStr = ts.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    setSyncLog((L) => [{ ts: tsStr, msg: stamps.length ? stamps.join(" · ") : "accepted — no new canon after dedupe" }, ...L].slice(0, 12));
  };

  const acceptSyncItem = (kind, index) => {
    const proposal = {
      summary: pendingSync?.summary || "",
      snapshots: kind === "snapshots" ? [pendingSync.snapshots[index]] : [],
      events: kind === "events" ? [pendingSync.events[index]] : [],
      relationships: kind === "relationships" ? [pendingSync.relationships[index]] : []
    };
    applySyncProposal(proposal);
    setPendingSync((prev) => {
      const next = { ...prev, [kind]: chapterArr(prev?.[kind]).filter((_, i) => i !== index) };
      return proposalCount(next) ? next : null;
    });
  };

  const dropSyncItem = (kind, index) => {
    setPendingSync((prev) => {
      const next = { ...prev, [kind]: chapterArr(prev?.[kind]).filter((_, i) => i !== index) };
      return proposalCount(next) ? next : null;
    });
  };

  const acceptAllSync = () => {
    applySyncProposal(pendingSync);
    setPendingSync(null);
  };

  // ── Render ──
  return (
    <div className="chapter-view">
      <div className="chap-head">
        <span className="chap-head-tag">— {book.title} · {volume.title} —</span>
        <h1 className="chap-head-title"
            contentEditable suppressContentEditableWarning
            onBlur={(e) => updateChapter({ title: e.currentTarget.textContent.trim() })}>
          {chapter.title}
        </h1>
        <div className="chap-head-meta">
          <span className="chap-head-pill gold">{AVN.yearLabel(chapter.year)}</span>
          {era && <span className="chap-head-pill">{era.name}</span>}
          {place && <span className="chap-head-pill">{place.name}</span>}
          {focuses.map((f) => (
            <button key={f.id} className="chap-head-focus" onClick={() => onFocus(f.id)} title="open in chronicle">
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="chap-tools">
        <button className="ai-btn" onClick={onBack}>← back to book</button>
        <button className="ai-btn primary" disabled={busy === "write"} onClick={onContinue}>
          {busy === "write" ? "writing…" : "✎ write the next paragraph"}
        </button>
        <input className="ai-input" style={{ minWidth: 220, fontSize: 12, padding: "6px 10px" }}
               placeholder="direction for AI — 'they hear a bell at dusk'…"
               value={hint} onChange={(e) => setHint(e.target.value)} />
        <button className="ai-btn" onClick={() => setMdOpen((x) => !x)}>{mdOpen ? "hide md ⌗" : "show md ⌗"}</button>
        <span className="chap-words">{words.toLocaleString()} words · {chapter.status}</span>
      </div>

      {/* Dual pane */}
      <div className="chap-editor" style={!mdOpen ? { gridTemplateColumns: "1fr" } : {}}>
        <section className="chap-pane">
          <div className="chap-pane-head">
            <span className="chap-pane-label">— Rendered Page —</span>
            <span className="chap-pane-icon">¶ {words} w</span>
          </div>
          <div className="chap-page">
            {window.renderMd(chapter.md, chapter.illustrations)}
          </div>
        </section>

        {mdOpen && (
          <section className="chap-pane">
            <div className="chap-pane-head">
              <span className="chap-pane-label">— Source · markdown —</span>
              <span className="chap-pane-icon">⌗ {(chapter.md || "").split("\n").length} lines</span>
            </div>
            <div className="chap-md">
              <div className="chap-md-gutter">
                {(chapter.md || "").split("\n").map((_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <textarea
                ref={taRef}
                className="chap-md-text"
                spellCheck={false}
                value={chapter.md || ""}
                onChange={(e) => updateChapter({ md: e.target.value })}
              />
            </div>
          </section>
        )}
      </div>

      {/* Right rail */}
      <aside className="chap-rail">
        {/* AI desk */}
        <section className="rail-panel">
          <header className="rail-head">
            <span className="rail-label">— The Quill</span>
            <span className="rail-count">AI</span>
          </header>
          <div className="rail-body">
            <div className="ai-context">
              <div className="ai-context-row"><span className="ai-context-key">Year</span><span className="ai-context-val">{AVN.yearLabel(chapter.year)} {era && <em style={{ color: "var(--gold-2)", fontStyle: "italic" }}>· {era.name}</em>}</span></div>
              <div className="ai-context-row"><span className="ai-context-key">Place</span><span className="ai-context-val">{place ? place.name : <em style={{ color: "var(--slate)" }}>anywhere</em>}</span></div>
              <div className="ai-context-row"><span className="ai-context-key">Focus</span><span className="ai-context-val">{focuses.length ? focuses.map((f) => f.name).join(" · ") : <em style={{ color: "var(--slate)" }}>none bound</em>}</span></div>
              <div className="ai-context-row"><span className="ai-context-key">Goal</span><span className="ai-context-val">{chapter.sceneGoal || <em style={{ color: "var(--slate)" }}>unset</em>}</span></div>
              <div className="ai-context-row"><span className="ai-context-key">Canon</span><span className="ai-context-val">{writingContext.sections?.neighboringChapters ? "scene + neighboring chapters" : "basic context"}</span></div>
            </div>
            <div className="ai-row">
              <button className="ai-btn primary" disabled={busy === "write"} onClick={onContinue}>
                {busy === "write" ? "writing…" : "+ paragraph"}
              </button>
              <button className="ai-btn" disabled={busy === "write"} onClick={() => updateChapter({ md: (chapter.md || "").replace(/\n*\n[^\n]+$/, "") })}>↶ undo last</button>
            </div>
          </div>
        </section>

        {/* Scene card */}
        <section className="rail-panel">
          <header className="rail-head">
            <span className="rail-label">— Scene Card</span>
            <span className="rail-count">context</span>
          </header>
          <div className="rail-body">
            <label className="scene-field">
              <span>POV</span>
              <select value={chapter.povId || ""} onChange={(e) => updateChapter({ povId: e.target.value || null })}>
                <option value="">Unassigned</option>
                {world.characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="scene-field">
              <span>Goal</span>
              <textarea value={chapter.sceneGoal || ""} onChange={(e) => updateChapter({ sceneGoal: e.target.value })} />
            </label>
            <label className="scene-field">
              <span>Conflict</span>
              <textarea value={chapter.conflict || ""} onChange={(e) => updateChapter({ conflict: e.target.value })} />
            </label>
            <label className="scene-field">
              <span>Turn</span>
              <textarea value={chapter.turn || ""} onChange={(e) => updateChapter({ turn: e.target.value })} />
            </label>
            <label className="scene-field">
              <span>Emotion</span>
              <input value={chapter.emotionalDelta || ""} onChange={(e) => updateChapter({ emotionalDelta: e.target.value })} />
            </label>
            <label className="scene-field">
              <span>Continuity</span>
              <textarea value={chapter.continuityNotes || ""} onChange={(e) => updateChapter({ continuityNotes: e.target.value })} />
            </label>
            <label className="scene-field">
              <span>Summary</span>
              <textarea value={chapter.summary || ""} onChange={(e) => updateChapter({ summary: e.target.value })} />
            </label>
            <label className="scene-field">
              <span>Style</span>
              <input value={chapter.styleKey || ""} onChange={(e) => updateChapter({ styleKey: e.target.value })} />
            </label>
          </div>
        </section>

        {/* Illustrations */}
        <section className="rail-panel">
          <header className="rail-head">
            <span className="rail-label">— Plates &amp; Engravings</span>
            <span className="rail-count">{(chapter.illustrations || []).length}</span>
          </header>
          <div className="rail-body">
            {(chapter.illustrations || []).length === 0 && (
              <div className="warn-empty" style={{ marginTop: 0 }}>— no plates · drop into source as <code style={{ fontFamily: "var(--mono)" }}>![[ill_id]]</code> —</div>
            )}
            <div className="rail-ill-list">
              {(chapter.illustrations || []).map((ill) => (
                <div key={ill.id} className="rail-ill">
                  <div className="rail-ill-frame" />
                  <div className="rail-ill-body">
                    <div>
                      <div className="rail-ill-cap">{ill.caption}</div>
                      <div className="rail-ill-placeholder">{ill.placeholder}</div>
                    </div>
                    <div className="rail-ill-actions">
                      <button className="ai-btn">upload</button>
                      <button className="ai-btn">+ AI</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="ai-btn" style={{ alignSelf: "flex-start" }}
                    onClick={() => {
                      const id = "ill_" + Math.random().toString(36).slice(2, 6);
                      updateChapter({ illustrations: [...(chapter.illustrations || []), { id, caption: "An unnamed plate", placeholder: "drop description here", url: null }] });
                    }}>+ new plate</button>
          </div>
        </section>

        {/* Consistency */}
        <section className="rail-panel">
          <header className="rail-head">
            <span className="rail-label">— Continuity</span>
            <span className="rail-count">{warnings ? warnings.length : "—"}</span>
          </header>
          <div className="rail-body">
            <div className="ai-row">
              <button className="ai-btn" disabled={busy === "check"} onClick={onCheck}>
                {busy === "check" ? "reading…" : "⌕ check against bible"}
              </button>
            </div>
            {warnings === null && (
              <div className="warn-empty">— not yet checked —</div>
            )}
            {warnings && warnings.length === 0 && (
              <div className="warn-empty" style={{ color: "var(--gold-2)", borderColor: "var(--gold-2)" }}>
                ✓ no contradictions
              </div>
            )}
            {warnings && warnings.length > 0 && (
              <div className="warn-list">
                {warnings.map((w, i) => {
                  const ent = w.entityId ? AVN.findEntity(world, w.entityId) : null;
                  return (
                    <div key={i} className={`warn-row ${w.severity || "medium"}`}>
                      <div className="warn-line">
                        {w.severity?.toUpperCase() || "MEDIUM"}
                        {w.field && <> · {w.field}</>}
                      </div>
                      {ent && (
                        <button className="warn-line entity" onClick={() => onFocus(ent.id)}>{ent.name}</button>
                      )}
                      <div className="warn-says"><strong>bible:</strong> {w.says}</div>
                      <div className="warn-says"><strong>chapter:</strong> {w.contradicts}</div>
                      {w.suggestion && <div className="warn-suggest">→ {w.suggestion}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Sync */}
        <section className="rail-panel">
          <header className="rail-head">
            <span className="rail-label">— Sync to Codex</span>
            <span className="rail-count">{syncLog.length}</span>
          </header>
          <div className="rail-body">
            <div className="ai-row">
              <button className="ai-btn primary" disabled={busy === "sync"} onClick={onSync}>
                {busy === "sync" ? "scribing…" : "↻ sync chapter → bible"}
              </button>
            </div>
            {syncSummary && <div className="sync-summary">{syncSummary}</div>}
            {pendingSync && proposalCount(pendingSync) > 0 && (
              <div className="sync-proposal">
                <div className="sync-proposal-head">
                  <span>{proposalCount(pendingSync)} pending canon notes</span>
                  <div className="sync-proposal-actions">
                    <button className="ai-btn small primary" onClick={acceptAllSync}>accept all</button>
                    <button className="ai-btn small" onClick={() => setPendingSync(null)}>discard</button>
                  </div>
                </div>
                {pendingSync.snapshots.length > 0 && (
                  <div className="sync-proposal-group">
                    <div className="sync-proposal-kind">Snapshots</div>
                    {pendingSync.snapshots.map((s, i) => (
                      <div key={`snap-${i}`} className="sync-proposal-row">
                        <div className="sync-proposal-text">
                          <strong>{entityNameById(world, s.entityId)}</strong>
                          <span>{AVN.yearLabel(s.year || chapter.year)} · {s.status || "state"}</span>
                          <p>{s.body}</p>
                        </div>
                        <div className="sync-proposal-actions">
                          <button className="ai-btn small primary" onClick={() => acceptSyncItem("snapshots", i)}>accept</button>
                          <button className="ai-btn small" onClick={() => dropSyncItem("snapshots", i)}>drop</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {pendingSync.events.length > 0 && (
                  <div className="sync-proposal-group">
                    <div className="sync-proposal-kind">Events</div>
                    {pendingSync.events.map((ev, i) => (
                      <div key={`ev-${i}`} className="sync-proposal-row">
                        <div className="sync-proposal-text">
                          <strong>{ev.title || "Untitled event"}</strong>
                          <span>{AVN.yearLabel(ev.year || chapter.year)}</span>
                          <p>{ev.body}</p>
                        </div>
                        <div className="sync-proposal-actions">
                          <button className="ai-btn small primary" onClick={() => acceptSyncItem("events", i)}>accept</button>
                          <button className="ai-btn small" onClick={() => dropSyncItem("events", i)}>drop</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {pendingSync.relationships.length > 0 && (
                  <div className="sync-proposal-group">
                    <div className="sync-proposal-kind">Relationships</div>
                    {pendingSync.relationships.map((r, i) => (
                      <div key={`rel-${i}`} className="sync-proposal-row">
                        <div className="sync-proposal-text">
                          <strong>{entityNameById(world, r.a)} · {r.kind || "ally"} · {entityNameById(world, r.b)}</strong>
                          <span>{AVN.yearLabel(r.since || chapter.year)}</span>
                          <p>{r.note}</p>
                        </div>
                        <div className="sync-proposal-actions">
                          <button className="ai-btn small primary" onClick={() => acceptSyncItem("relationships", i)}>accept</button>
                          <button className="ai-btn small" onClick={() => dropSyncItem("relationships", i)}>drop</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {syncLog.length === 0 && (
              <div className="warn-empty">— this chapter has not yet bled into the bible —</div>
            )}
            {syncLog.length > 0 && (
              <div className="sync-log">
                {syncLog.map((row, i) => (
                  <div key={i} className="sync-row">
                    <span className="sync-row-ts">{row.ts}</span>
                    <span className="sync-row-msg">{row.msg}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {err && <div className="ai-status err">! {err}</div>}
      </aside>
    </div>
  );
}

window.ChapterEditor = ChapterEditor;
