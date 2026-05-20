// Multi-lane chronicle. Lanes: era band, events, country lifespans, org lifespans, character lifespans.
// Click an event/snapshot tick = scrub year + focus. Lifespan bars are clickable to focus the entity.
// `vertical` prop renders the rail top-to-bottom for 橫式 (side-by-side stage) layouts.

const Timeline = ({ world, currentYear, onScrub, focusId, onFocus, windowSize, onWindowSize, lanes, onToggleLane, vertical }) => {
  const railRef = React.useRef(null);
  const [hover, setHover] = React.useState(null);
  const V = !!vertical;

  const segs = React.useMemo(() => {
    const total = world.eras.reduce((s, e) => s + (e.end - e.start) * e.compressed, 0);
    let acc = 0;
    return world.eras.map((e) => {
      const w = (e.end - e.start) * e.compressed;
      const start = acc / total; acc += w; const end = acc / total;
      return { ...e, _t0: start, _t1: end };
    });
  }, [world.eras]);

  const yearToT = (year) => {
    const seg = segs.find((s) => year >= s.start && year <= s.end);
    if (!seg) {
      if (year <= segs[0].start) return 0;
      if (year >= segs[segs.length - 1].end) return 1;
      return 0;
    }
    return seg._t0 + ((year - seg.start) / (seg.end - seg.start)) * (seg._t1 - seg._t0);
  };
  const tToYear = (t) => {
    const seg = segs.find((s) => t >= s._t0 && t <= s._t1) || segs[0];
    return Math.round(seg.start + ((t - seg._t0) / (seg._t1 - seg._t0 || 1)) * (seg.end - seg.start));
  };

  // Axis helpers — switch between left/width (horizontal) and top/height (vertical)
  const at = (t) => V ? { top: `${t * 100}%` } : { left: `${t * 100}%` };
  const span = (t0, t1, minPct = 0.6) => V
    ? { top: `${t0 * 100}%`, height: `${Math.max(minPct, (t1 - t0) * 100)}%` }
    : { left: `${t0 * 100}%`, width: `${Math.max(minPct, (t1 - t0) * 100)}%` };

  const onPointer = (e) => {
    const rect = railRef.current.getBoundingClientRect();
    if (V) return Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  };
  const handleDown = (e) => {
    onScrub(tToYear(onPointer(e)));
    const move = (ev) => onScrub(tToYear(onPointer(ev)));
    const up = () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up); };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  };

  const cursorT = yearToT(currentYear);
  const winT0 = yearToT(currentYear - windowSize / 2);
  const winT1 = yearToT(currentYear + windowSize / 2);

  // Lifespan bars
  const renderLifeBar = (ent, kind) => {
    const ls = AVN.entityLifespan(ent);
    const a = ls.a ?? segs[0].start;
    const b = ls.b ?? segs[segs.length - 1].end;
    const t0 = yearToT(a), t1 = yearToT(b);
    const focused = focusId === ent.id;
    const accent = ent.accent || "#c89859";
    return (
      <div key={ent.id} className={`lane-row ${focused ? "is-focus" : ""}`}>
        <button className="lane-label" onClick={() => onFocus(ent.id)} title={ent.name || ent.title}>
          <span className="lane-swatch" style={{ background: accent }} />
          <span className="lane-name">{ent.name || ent.title}</span>
        </button>
        <div className="lane-track">
          <div className="lane-bar" style={{
            ...span(t0, t1),
            background: accent,
            opacity: focused ? 0.85 : 0.5
          }} onClick={() => onFocus(ent.id)} />
          {(ent.snapshots || []).map((s, i) => (
            <button key={i} className="lane-snap" style={at(yearToT(s.year))}
                    title={`${AVN.yearLabel(s.year)} — ${s.leader || s.status || ""}`}
                    onClick={(e) => { e.stopPropagation(); onScrub(s.year); onFocus(ent.id); }} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`timeline ${V ? "is-vertical" : "is-horizontal"}`}>
      <div className="tl-head">
        <div className="tl-head-left">
          <div className="tl-label">Reckoning</div>
          <div className="tl-year">{AVN.yearLabel(currentYear)}</div>
          <div className="tl-era">{(segs.find((s) => currentYear >= s.start && currentYear <= s.end) || {}).name}</div>
        </div>
        <div className="tl-head-right">
          <div className="lane-toggles">
            {["events", "countries", "orgs", "characters"].map((k) => (
              <button key={k} className={`lane-toggle ${lanes[k] ? "on" : ""}`} onClick={() => onToggleLane(k)}>{k}</button>
            ))}
          </div>
          <label className="tl-window">
            <span>Lens</span>
            <input type="range" min={20} max={4000} step={10} value={windowSize} onChange={(e) => onWindowSize(parseInt(e.target.value))} />
            <span className="tl-window-val">± {Math.round(windowSize / 2)}y</span>
          </label>
        </div>
      </div>

      <div className="tl-body">
        <div className="tl-rail-wrap" ref={railRef}
             onPointerDown={handleDown}
             onPointerMove={(e) => setHover({ t: onPointer(e), year: tToYear(onPointer(e)) })}
             onPointerLeave={() => setHover(null)}>
          <div className="tl-bands">
            {segs.map((s) => (
              <div key={s.id} className="tl-band" style={{ ...span(s._t0, s._t1, 0), background: s.accent }}>
                <span className="tl-band-name">{s.name}</span>
                <span className="tl-band-span">{AVN.yearLabel(s.start)} — {AVN.yearLabel(s.end)}</span>
              </div>
            ))}
          </div>
          <div className="tl-window-overlay" style={span(winT0, winT1)} />
          <div className="tl-events">
            {(lanes.events ? world.events : []).map((ev) => {
              const t = yearToT(ev.year);
              const visible = Math.abs(ev.year - currentYear) <= windowSize / 2;
              return (
                <button key={ev.id}
                        className={`tl-event ${focusId === ev.id ? "is-focus" : ""} ${visible ? "is-vis" : ""}`}
                        style={at(t)} title={`${AVN.yearLabel(ev.year)} — ${ev.title}`}
                        onClick={(e) => { e.stopPropagation(); onFocus(ev.id); onScrub(ev.year); }}>
                  <span className="tl-event-dot" />
                </button>
              );
            })}
          </div>
          <div className="tl-cursor" style={at(cursorT)}>
            <div className="tl-cursor-stem" />
            <div className="tl-cursor-head" />
          </div>
          {hover && <div className="tl-hover" style={at(hover.t)}>{AVN.yearLabel(hover.year)}</div>}
        </div>

        {/* Lifespan lanes alongside / below the rail */}
        <div className="tl-lanes">
          {lanes.countries && world.countries.length > 0 && (
            <div className="lane">
              <div className="lane-title">Countries</div>
              <div className="lane-list">{world.countries.map((c) => renderLifeBar(c, "country"))}</div>
            </div>
          )}
          {lanes.orgs && world.organizations.length > 0 && (
            <div className="lane">
              <div className="lane-title">Organizations</div>
              <div className="lane-list">{world.organizations.map((o) => renderLifeBar(o, "organization"))}</div>
            </div>
          )}
          {lanes.characters && world.characters.length > 0 && (
            <div className="lane">
              <div className="lane-title">Characters</div>
              <div className="lane-list">{world.characters.map((c) => renderLifeBar({ ...c, accent: c.accent || "#a89472" }, "character"))}</div>
            </div>
          )}
        </div>
      </div>

      <div className="tl-foot">
        <span>{V ? "drag rail vertically to scrub" : "drag rail to scrub"}. dots are events. bars are lifespans — small marks are snapshots.</span>
        <span>the rail is non-linear: eras keep their visual room.</span>
      </div>
    </div>
  );
};

window.Timeline = Timeline;
