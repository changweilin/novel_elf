// Chapter editor — dual pane (rendered page | raw md),
// plus a right-rail with AI desk, illustrations, sync log, consistency warnings.

const { useState: useStateChap, useMemo: useMemoChap, useRef: useRefChap, useEffect: useEffectChap } = React;

function ChapterEditor({ world, setWorld, book, volume, chapter, updateChapter, onBack, onFocus, onJump }) {
  const [busy, setBusy] = useStateChap(null);
  const [hint, setHint] = useStateChap("");
  const [warnings, setWarnings] = useStateChap(null);   // null = never checked; [] = clean
  const [syncSummary, setSyncSummary] = useStateChap(null);
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

  // ── Word count + autosave (already in world state) ──
  const words = (chapter.md || "").trim().split(/\s+/).filter(Boolean).length;
  useEffectChap(() => {
    if (words !== chapter.words) updateChapter({ words });
  }, [words]);

  // ── Handlers ──
  const onContinue = async () => {
    setBusy("write"); setErr(null);
    try {
      const para = await window.aiWriteChapterParagraph(world, chapter, hint);
      updateChapter({ md: (chapter.md || "") + "\n\n" + para });
      setHint("");
    } catch (e) { setErr(String(e.message || e)); }
    setBusy(null);
  };

  const onCheck = async () => {
    setBusy("check"); setErr(null);
    try {
      const out = await window.aiCheckConsistency(world, chapter);
      setWarnings(out.warnings || []);
    } catch (e) { setErr(String(e.message || e)); }
    setBusy(null);
  };

  const onSync = async () => {
    setBusy("sync"); setErr(null);
    try {
      const out = await window.aiSyncChapterToWorld(world, chapter);
      setSyncSummary(out.summary || "(synced)");
      const stamps = [];

      setWorld((w) => {
        let W = { ...w };
        // snapshots
        for (const s of (out.snapshots || [])) {
          const kind = AVN.entityKind(W, s.entityId);
          if (!kind) continue;
          const key = kind === "character" ? "characters" : kind === "organization" ? "organizations" : "countries";
          const ent = W[key].find((e) => e.id === s.entityId);
          if (!ent) continue;
          const placeObj = world.places.find((p) => p.name?.toLowerCase() === (s.place || "").toLowerCase());
          const expanded = { year: s.year || chapter.year, body: s.body || "", status: s.status };
          if (kind === "character") expanded.location = placeObj ? { x: placeObj.x, y: placeObj.y, name: placeObj.name } : (AVN.snapAt(ent, s.year)?.location || ent.snapshots?.[0]?.location);
          if (kind === "organization") expanded.hq = placeObj ? { x: placeObj.x, y: placeObj.y, name: placeObj.name } : (AVN.snapAt(ent, s.year)?.hq || ent.snapshots?.[0]?.hq);
          if (kind === "country") expanded.capital = placeObj ? { x: placeObj.x, y: placeObj.y, name: placeObj.name } : (AVN.snapAt(ent, s.year)?.capital || ent.snapshots?.[0]?.capital);
          W = { ...W, [key]: W[key].map((e) => e.id === ent.id ? { ...e, snapshots: [...(e.snapshots || []), expanded] } : e) };
          stamps.push(`+ snapshot · ${ent.name} @ ${AVN.yearLabel(expanded.year)}`);
        }
        // events
        for (const ev of (out.events || [])) {
          const id = "ev_" + Math.random().toString(36).slice(2, 7);
          W = { ...W, events: [...W.events, { id, year: ev.year || chapter.year, title: ev.title, body: ev.body, placeId: ev.placeId || chapter.placeId, participants: ev.participants || [] }] };
          stamps.push(`+ event · ${ev.title}`);
        }
        // relationships
        for (const r of (out.relationships || [])) {
          if (!AVN.findEntity(W, r.a) || !AVN.findEntity(W, r.b)) continue;
          const id = "rl_" + Math.random().toString(36).slice(2, 7);
          W = { ...W, relationships: [...(W.relationships || []), { id, a: r.a, b: r.b, kind: r.kind || "ally", since: r.since || chapter.year, until: null, note: r.note || "" }] };
          stamps.push(`+ relationship · ${AVN.entityName(W, r.a)} ${r.kind} ${AVN.entityName(W, r.b)}`);
        }
        return W;
      });

      const ts = new Date();
      const tsStr = ts.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
      setSyncLog((L) => [{ ts: tsStr, msg: stamps.length ? stamps.join(" · ") : "synced — no changes proposed" }, ...L].slice(0, 12));
    } catch (e) { setErr(String(e.message || e)); }
    setBusy(null);
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
            </div>
            <div className="ai-row">
              <button className="ai-btn primary" disabled={busy === "write"} onClick={onContinue}>
                {busy === "write" ? "writing…" : "+ paragraph"}
              </button>
              <button className="ai-btn" disabled={busy === "write"} onClick={() => updateChapter({ md: (chapter.md || "").replace(/\n*\n[^\n]+$/, "") })}>↶ undo last</button>
            </div>
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
