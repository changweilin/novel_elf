// Entity detail panels — render header + snapshot list + relationships for one focused entity.

const SourceBadges = ({ refs }) => (
  <div className="source-badges">
    <span className="source-badges-label">Source</span>
    {refs && refs.length ? refs.map((ref) => (
      <span key={ref.key || ref.chapterId || ref.label} className="source-badge" title={AVN.sourceLabel(ref)}>
        {AVN.compactSourceLabel(ref)}
      </span>
    )) : <span className="source-badge empty">unbound</span>}
  </div>
);

function detailReadOnly(readOnly) {
  const runtime = window.NovelElfRuntime || {};
  return readOnly || runtime.readOnly === true || runtime.publicDemo === true;
}

const EventDetail = ({ ev, world, onUpdate, onDelete, onJump, onFocus, currentYear, sourceRefs, readOnly }) => {
  const locked = detailReadOnly(readOnly);
  return (
  <div className="detail">
    <div className="detail-head">
      <Editable className="detail-year" value={ev.year} asNumber onChange={(v) => onUpdate({ year: v ?? ev.year })} />
      <Editable className="detail-title" value={ev.title} onChange={(v) => onUpdate({ title: v })} />
      {!locked && <button className="ai-btn danger small" onClick={onDelete}>strike</button>}
    </div>
    <div className="detail-meta">
      <span>at</span>
      <Editable className="detail-place" value={world.places.find((p) => p.id === ev.placeId)?.name || ev.placeId || ""}
                onChange={(v) => {
                  const p = world.places.find((pp) => pp.name.toLowerCase() === v.toLowerCase());
                  onUpdate({ placeId: p?.id || null });
                }} placeholder="a place" />
      <button className="ai-btn small" onClick={() => onJump(ev.year)}>jump</button>
    </div>
    <SourceBadges refs={sourceRefs} />
    <Editable className="detail-body" multiline value={ev.body || ""}
              onChange={(v) => onUpdate({ body: v })}
              placeholder="What happened. Who saw it. What it cost." />
    <div className="detail-block">
      <div className="snap-head"><span>Participants</span></div>
      <div className="parts">
        {(ev.participants || []).map((id) => (
          <button key={id} className="part-chip" onClick={() => onFocus(id)}>
            <span className="part-kind">{(AVN.entityKind(world, id) || "?")[0]}</span> {AVN.entityName(world, id)}
            {!locked && <span className="part-x" onClick={(e) => { e.stopPropagation(); onUpdate({ participants: ev.participants.filter((x) => x !== id) }); }}>×</span>}
          </button>
        ))}
        {!locked && <PartAdder world={world} onAdd={(id) => onUpdate({ participants: [...(ev.participants || []), id] })} />}
      </div>
    </div>
  </div>
  );
};

const PartAdder = ({ world, onAdd }) => {
  if (detailReadOnly()) return null;
  const [q, setQ] = React.useState("");
  const all = [...world.characters, ...world.organizations, ...world.countries].filter((e) => e.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6);
  return (
    <div className="part-adder">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="add by name…" />
      {q && (
        <div className="part-dd">
          {all.map((e) => (
            <button key={e.id} onClick={() => { onAdd(e.id); setQ(""); }}>
              <span className="part-kind">{(AVN.entityKind(world, e.id) || "?")[0]}</span> {e.name}
            </button>
          ))}
          {all.length === 0 && <div className="ai-status" style={{ padding: 6 }}>— no matches —</div>}
        </div>
      )}
    </div>
  );
};

const CharDetail = ({ c, world, currentYear, onUpdate, onDelete, onJump, onFocus, onAddSnap, onUpdateSnap, onDeleteSnap, onAddRel, onUpdateRel, onDeleteRel, onAIFill, sourceRefs, readOnly, aiAvailable }) => {
  const locked = detailReadOnly(readOnly);
  return (
    <div className="detail">
      <div className="detail-head">
        <Editable className="detail-title" value={c.name} onChange={(v) => onUpdate({ name: v })} />
        {!locked && <button className="ai-btn danger small" onClick={onDelete}>forget</button>}
      </div>
      <Editable className="detail-role" value={c.role || ""} onChange={(v) => onUpdate({ role: v })} placeholder="their station" />
      <SourceBadges refs={sourceRefs} />
      <div className="detail-meta">
        <span>born</span>
        <Editable className="detail-num" asNumber value={c.born} onChange={(v) => onUpdate({ born: v })} placeholder="?" />
        <span>died</span>
        <Editable className="detail-num" asNumber value={c.died} onChange={(v) => onUpdate({ died: v })} placeholder="—" />
        {!locked && aiAvailable && <button className="ai-btn small" onClick={() => onAIFill("character", c.id)}>AI flesh out</button>}
      </div>
      <SnapList snaps={c.snapshots} accent="#a89472"
                fields={[
                  { key: "status", label: "status", placeholder: "what they are now" },
                  { key: "location", label: "place", kind: "place" },
                  { key: "body", label: "note", kind: "multi", placeholder: "What they are doing. Who they meet." }
                ]}
                onAdd={() => onAddSnap({ year: currentYear, status: "", location: { x: 500, y: 340, name: "" }, body: "" })}
                onUpdate={onUpdateSnap} onDelete={onDeleteSnap} onJump={onJump} currentYear={currentYear} />
      <RelList world={world} entityId={c.id} onAdd={() => onAddRel(c.id)} onUpdate={onUpdateRel} onDelete={onDeleteRel} onFocus={onFocus} />
    </div>
  );
};

const OrgDetail = ({ o, world, currentYear, onUpdate, onDelete, onJump, onFocus, onAddSnap, onUpdateSnap, onDeleteSnap, onAddRel, onUpdateRel, onDeleteRel, onAIFill, onDraw, sourceRefs, readOnly, aiAvailable }) => {
  const locked = detailReadOnly(readOnly);
  return (
  <div className="detail">
    <div className="detail-head">
      <Editable className="detail-title" value={o.name} onChange={(v) => onUpdate({ name: v })} />
      <input type="color" value={o.accent || "#c89859"} disabled={locked} onChange={(e) => onUpdate({ accent: e.target.value })} className="color-pick" />
      {!locked && <button className="ai-btn danger small" onClick={onDelete}>dissolve</button>}
    </div>
    <div className="detail-meta">
      <span>founded</span>
      <Editable className="detail-num" asNumber value={o.founded} onChange={(v) => onUpdate({ founded: v })} placeholder="?" />
      <span>dissolved</span>
      <Editable className="detail-num" asNumber value={o.dissolved} onChange={(v) => onUpdate({ dissolved: v })} placeholder="—" />
      {!locked && aiAvailable && <button className="ai-btn small" onClick={() => onAIFill("organization", o.id)}>AI flesh out</button>}
      {!locked && <button className="ai-btn small primary" onClick={() => onDraw(o.id, "organizations")}>✎ draw domain @ {AVN.yearLabel(currentYear)}</button>}
    </div>
    <SourceBadges refs={sourceRefs} />
    <SnapList snaps={o.snapshots} accent={o.accent}
              fields={[
                { key: "leader", label: "leader", placeholder: "who runs it now" },
                { key: "hq", label: "HQ", kind: "place" },
                { key: "members", label: "size", placeholder: "members" },
                { key: "territory", label: "domain", placeholder: "x,y x,y x,y …" },
                { key: "body", label: "note", kind: "multi", placeholder: "What they want, what they fear." }
              ]}
              onAdd={() => onAddSnap({ year: currentYear, leader: "", hq: { x: 500, y: 340, name: "" }, members: 0, territory: "", body: "" })}
              onUpdate={onUpdateSnap} onDelete={onDeleteSnap} onJump={onJump} currentYear={currentYear} />
    <RelList world={world} entityId={o.id} onAdd={() => onAddRel(o.id)} onUpdate={onUpdateRel} onDelete={onDeleteRel} onFocus={onFocus} />
  </div>
  );
};

const CountryDetail = ({ c, world, currentYear, onUpdate, onDelete, onJump, onFocus, onAddSnap, onUpdateSnap, onDeleteSnap, onAddRel, onUpdateRel, onDeleteRel, onAIFill, onDraw, sourceRefs, readOnly, aiAvailable }) => {
  const locked = detailReadOnly(readOnly);
  return (
  <div className="detail">
    <div className="detail-head">
      <Editable className="detail-title" value={c.name} onChange={(v) => onUpdate({ name: v })} />
      <input type="color" value={c.accent || "#3b7a4d"} disabled={locked} onChange={(e) => onUpdate({ accent: e.target.value })} className="color-pick" />
      {!locked && <button className="ai-btn danger small" onClick={onDelete}>fall</button>}
    </div>
    <div className="detail-meta">
      <span>founded</span>
      <Editable className="detail-num" asNumber value={c.founded} onChange={(v) => onUpdate({ founded: v })} placeholder="?" />
      <span>fell</span>
      <Editable className="detail-num" asNumber value={c.dissolved} onChange={(v) => onUpdate({ dissolved: v })} placeholder="—" />
      {!locked && aiAvailable && <button className="ai-btn small" onClick={() => onAIFill("country", c.id)}>AI flesh out</button>}
      {!locked && <button className="ai-btn small primary" onClick={() => onDraw(c.id, "countries")}>✎ draw borders @ {AVN.yearLabel(currentYear)}</button>}
    </div>
    <SourceBadges refs={sourceRefs} />
    <SnapList snaps={c.snapshots} accent={c.accent}
              fields={[
                { key: "leader", label: "ruler", placeholder: "who sits the throne" },
                { key: "capital", label: "capital", kind: "place" },
                { key: "territory", label: "borders", placeholder: "x,y x,y x,y …" },
                { key: "body", label: "note", kind: "multi", placeholder: "How the realm stands." }
              ]}
              onAdd={() => onAddSnap({ year: currentYear, leader: "", capital: { x: 500, y: 340, name: "" }, territory: "", body: "" })}
              onUpdate={onUpdateSnap} onDelete={onDeleteSnap} onJump={onJump} currentYear={currentYear} />
    <RelList world={world} entityId={c.id} onAdd={() => onAddRel(c.id)} onUpdate={onUpdateRel} onDelete={onDeleteRel} onFocus={onFocus} />
  </div>
  );
};

window.EventDetail = EventDetail;
window.CharDetail = CharDetail;
window.OrgDetail = OrgDetail;
window.CountryDetail = CountryDetail;
