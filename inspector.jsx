// Inspector: tabbed entity browser. Tabs: Events | Characters | Orgs | Countries.
// Each tab lists entities, with a detail view when one is focused.
// All fields are editable; relationships and snapshots can be added/removed.

const KIND_LABELS = { country: "Country", organization: "Organization", character: "Character", event: "Event" };
const REL_KINDS = ["ally", "war", "feud", "trade", "vassal", "oath", "rival", "leads", "loves", "mentor"];

const Editable = ({ value, onChange, multiline, placeholder, className, asNumber }) => {
  const ref = React.useRef(null);
  const [f, setF] = React.useState(false);
  React.useEffect(() => {
    if (ref.current && !f) {
      const v = value == null ? "" : String(value);
      if (ref.current.innerText !== v) ref.current.innerText = v;
    }
  }, [value, f]);
  return (
    <div ref={ref} className={`editable ${className || ""} ${multiline ? "multi" : ""}`}
         contentEditable suppressContentEditableWarning
         onFocus={() => setF(true)}
         onBlur={(e) => {
           setF(false);
           const t = e.currentTarget.innerText;
           onChange(asNumber ? (t === "" ? null : parseInt(t)) : t);
         }}
         data-placeholder={placeholder} />
  );
};

const Tabs = ({ tab, onTab, counts }) => (
  <div className="ins-tabs">
    {["events", "characters", "orgs", "countries"].map((k) => (
      <button key={k} className={`ins-tab ${tab === k ? "active" : ""}`} onClick={() => onTab(k)}>
        <span>{k}</span>
        <span className="ins-count">{counts[k]}</span>
      </button>
    ))}
  </div>
);

const SnapList = ({ snaps, fields, onUpdate, onAdd, onDelete, onJump, currentYear, accent }) => (
  <div className="snap-list">
    <div className="snap-head">
      <span>Development</span>
      <button className="ai-btn" onClick={onAdd}>+ snapshot</button>
    </div>
    {(snaps || []).slice().sort((a,b) => a.year - b.year).map((s, i) => {
      const isLatest = snaps.every((x) => x === s || x.year <= s.year || x.year > currentYear);
      const active = s.year <= currentYear && isLatest;
      return (
        <div key={i} className={`snap-row ${active ? "is-active" : ""}`} style={{ "--accent": accent }}>
          <div className="snap-row-head">
            <Editable className="snap-year" value={s.year} asNumber onChange={(v) => onUpdate(s, { year: v ?? s.year })} />
            <button className="snap-jump" onClick={() => onJump(s.year)}>jump</button>
            <button className="snap-del" onClick={() => onDelete(s)}>×</button>
          </div>
          {fields.map((f) => (
            <div key={f.key} className="snap-field">
              <span className="snap-key">{f.label}</span>
              {f.kind === "place" ? (
                <Editable className="snap-val" value={s[f.key]?.name || ""}
                          onChange={(v) => onUpdate(s, { [f.key]: { ...(s[f.key] || {}), name: v, x: s[f.key]?.x ?? 500, y: s[f.key]?.y ?? 340 } })}
                          placeholder="A named place" />
              ) : f.kind === "multi" ? (
                <Editable className="snap-val multi" multiline value={s[f.key] || ""}
                          onChange={(v) => onUpdate(s, { [f.key]: v })} placeholder={f.placeholder} />
              ) : (
                <Editable className="snap-val" value={s[f.key] || ""}
                          onChange={(v) => onUpdate(s, { [f.key]: v })} placeholder={f.placeholder} />
              )}
            </div>
          ))}
        </div>
      );
    })}
    {(!snaps || snaps.length === 0) && <div className="ai-status" style={{ padding: 6 }}>— no snapshots yet —</div>}
  </div>
);

const RelList = ({ world, entityId, onAdd, onUpdate, onDelete, onFocus }) => {
  const rels = (world.relationships || []).filter((r) => r.a === entityId || r.b === entityId);
  return (
    <div className="rel-list">
      <div className="snap-head">
        <span>Relationships</span>
        <button className="ai-btn" onClick={onAdd}>+ relation</button>
      </div>
      {rels.length === 0 && <div className="ai-status" style={{ padding: 6 }}>— no relations —</div>}
      {rels.map((r) => {
        const otherId = r.a === entityId ? r.b : r.a;
        const otherName = AVN.entityName(world, otherId);
        const otherKind = AVN.entityKind(world, otherId);
        return (
          <div key={r.id} className="rel-row">
            <div className="rel-line">
              <select className="rel-kind" value={r.kind} onChange={(e) => onUpdate(r.id, { kind: e.target.value })}>
                {REL_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <button className="rel-other" onClick={() => onFocus(otherId)}>
                <span className="rel-arrow">→</span> {otherName}
                <span className="rel-kindtag">{otherKind}</span>
              </button>
              <button className="snap-del" onClick={() => onDelete(r.id)}>×</button>
            </div>
            <div className="rel-meta">
              <span>since</span>
              <Editable className="rel-since" value={r.since} asNumber onChange={(v) => onUpdate(r.id, { since: v })} />
              <span>until</span>
              <Editable className="rel-until" value={r.until} asNumber onChange={(v) => onUpdate(r.id, { until: v })} placeholder="—" />
            </div>
            <Editable className="rel-note" value={r.note || ""} onChange={(v) => onUpdate(r.id, { note: v })} placeholder="A line about the bond." />
          </div>
        );
      })}
    </div>
  );
};

window.Editable = Editable;
window.Tabs = Tabs;
window.SnapList = SnapList;
window.RelList = RelList;
window.REL_KINDS = REL_KINDS;
