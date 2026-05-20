// Procedural parchment map with layer support.
// Layers (toggleable from app): terrain (always), countries, orgs, characters, events.
// Each layer renders entities at currentYear via AVN.snapAt.

const KIND_TO_LAYER = { country: "countries", organization: "orgs", character: "characters", event: "events" };

const WorldMap = ({ world, currentYear, layers, selectedRegionId, onSelectRegion, focusId, onFocus, drawing, onCommitDraw, onCancelDraw }) => {
  const W = 1000, H = 680;
  const svgRef = React.useRef(null);
  const [drawPts, setDrawPts] = React.useState([]);
  const [drawHover, setDrawHover] = React.useState(null);

  const isDrawing = !!drawing;

  // Convert client (x,y) → SVG viewBox (x,y)
  const toSvg = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return [0, 0];
    const pt = svg.createSVGPoint();
    pt.x = clientX; pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return [0, 0];
    const p = pt.matrixTransform(ctm.inverse());
    return [p.x, p.y];
  };

  const handleDrawStart = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    e.stopPropagation();
    const [x, y] = toSvg(e.clientX, e.clientY);
    setDrawPts([[x, y]]);

    const move = (ev) => {
      const [mx, my] = toSvg(ev.clientX, ev.clientY);
      setDrawPts((pts) => {
        const last = pts[pts.length - 1];
        if (!last || Math.hypot(mx - last[0], my - last[1]) > 3) return [...pts, [mx, my]];
        return pts;
      });
    };
    const up = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      setDrawPts((pts) => {
        const smooth = window.DRAW.smoothFreehand(pts);
        if (smooth.length >= 3) onCommitDraw(window.DRAW.pointsToStr(smooth));
        return [];
      });
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  };

  const handleDrawMoveHover = (e) => {
    if (!isDrawing || drawPts.length > 0) return;
    setDrawHover(toSvg(e.clientX, e.clientY));
  };

  const Mountain = ({ x, y }) => (
    <g transform={`translate(${x},${y})`}>
      <path d="M -10 6 L 0 -10 L 10 6 Z" fill="none" stroke="#3a2d20" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M -3 0 L 0 -4 L 3 0" fill="none" stroke="#3a2d20" strokeWidth="0.8" />
    </g>
  );
  const Tree = ({ x, y }) => (
    <g transform={`translate(${x},${y})`}>
      <circle cx="0" cy="-3" r="4.5" fill="none" stroke="#3a2d20" strokeWidth="1" />
      <line x1="0" y1="1" x2="0" y2="5" stroke="#3a2d20" strokeWidth="1" />
    </g>
  );
  const Ruin = ({ x, y, name }) => (
    <g transform={`translate(${x},${y})`}>
      <path d="M -5 4 L -5 -4 M -1 4 L -1 -2 M 3 4 L 3 -5 M 7 4 L 7 -1 M -7 5 L 9 5" stroke="#3a2d20" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <text x="12" y="6" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#5a4a37" fontStyle="italic">{name}</text>
    </g>
  );

  // ── Countries layer
  const countryShapes = (layers.countries ? world.countries : []).map((c) => {
    const s = AVN.snapAt(c, currentYear);
    if (!s || !s.territory) return null;
    const focused = focusId === c.id;
    return (
      <g key={c.id} className="map-country" onClick={(e) => { e.stopPropagation(); onFocus(c.id); }}>
        <polygon
          points={s.territory}
          fill={c.accent}
          fillOpacity={focused ? 0.45 : 0.22}
          stroke={c.accent}
          strokeWidth={focused ? 2.4 : 1.4}
          strokeDasharray={focused ? "0" : "5 4"}
          style={{ cursor: "pointer", transition: "fill-opacity 220ms ease, stroke-width 200ms ease" }}
        />
        {s.capital && (
          <g transform={`translate(${s.capital.x},${s.capital.y})`}>
            <path d="M -6 6 L 6 6 L 6 -3 L 3 -3 L 3 -7 L 0 -3 L -3 -7 L -3 -3 L -6 -3 Z" fill={c.accent} stroke="#2a1f15" strokeWidth="1.2" />
            <text x="9" y="9" fontFamily="Cormorant SC, serif" fontSize="13" fill="#2a1f15" letterSpacing="0.08em">{s.capital.name}</text>
          </g>
        )}
      </g>
    );
  });

  const countryLabels = (layers.countries ? world.countries : []).map((c) => {
    const s = AVN.snapAt(c, currentYear);
    if (!s || !s.territory) return null;
    const cen = polyCentroid(s.territory);
    return (
      <text key={c.id + "_lbl"} x={cen.x} y={cen.y + 28}
            fontFamily="Cormorant SC, serif" fontSize="15"
            fill={shade(c.accent, -45)} opacity="0.9"
            textAnchor="middle" letterSpacing="0.22em" style={{ pointerEvents: "none" }}>
        {c.name.toUpperCase()}
      </text>
    );
  });

  // ── Orgs layer (territory ring + HQ sigil)
  const orgShapes = (layers.orgs ? world.organizations : []).map((o) => {
    const s = AVN.snapAt(o, currentYear);
    if (!s) return null;
    const focused = focusId === o.id;
    return (
      <g key={o.id} onClick={(e) => { e.stopPropagation(); onFocus(o.id); }} style={{ cursor: "pointer" }}>
        {s.territory && (
          <polygon points={s.territory} fill="none" stroke={o.accent}
                   strokeWidth={focused ? 2.2 : 1.2} strokeDasharray="2 4" opacity={focused ? 0.95 : 0.65} />
        )}
        {s.hq && (
          <g transform={`translate(${s.hq.x},${s.hq.y})`}>
            <circle r={focused ? 10 : 7} fill="#f3e8d2" stroke={o.accent} strokeWidth="1.6" />
            <circle r={focused ? 3.5 : 2.5} fill={o.accent} />
            <text x={focused ? 14 : 11} y="4" fontFamily="EB Garamond, serif" fontStyle="italic"
                  fontSize="11" fill={shade(o.accent, -55)}>{o.name}</text>
          </g>
        )}
      </g>
    );
  });

  // ── Characters layer
  const charPins = (layers.characters ? world.characters : []).map((c) => {
    const s = AVN.snapAt(c, currentYear);
    if (!s) return null;
    const loc = AVN.placeOf(world, s.location);
    if (!loc) return null;
    const focused = focusId === c.id;
    // small jitter so multiple chars at same place don't fully overlap
    const dx = (hashStr(c.id) % 16) - 8;
    const dy = ((hashStr(c.id) >> 4) % 16) - 8;
    const initial = (c.name || "?").trim()[0].toUpperCase();
    return (
      <g key={c.id} transform={`translate(${loc.x + dx},${loc.y + dy})`}
         onClick={(e) => { e.stopPropagation(); onFocus(c.id); }} style={{ cursor: "pointer" }}>
        <circle r={focused ? 11 : 7} fill="#2a1f15" stroke="#f3e8d2" strokeWidth={focused ? 2 : 1.2} />
        <text textAnchor="middle" y={focused ? 4 : 3} fontFamily="Cormorant SC, serif"
              fontSize={focused ? 12 : 9} fill="#f3e8d2" letterSpacing="0.04em">{initial}</text>
        {focused && (
          <text x="14" y="4" fontFamily="EB Garamond, serif" fontStyle="italic" fontSize="11" fill="#2a1f15">{c.name}</text>
        )}
      </g>
    );
  });

  // Focused character trajectory (snapshots → polyline)
  const focusedChar = world.characters.find((c) => c.id === focusId);
  let trajectory = null;
  if (focusedChar && focusedChar.snapshots && layers.characters) {
    const pts = focusedChar.snapshots
      .filter((s) => s.year <= currentYear)
      .map((s) => AVN.placeOf(world, s.location))
      .filter(Boolean)
      .map((p) => `${p.x},${p.y}`);
    if (pts.length > 1) trajectory = pts.join(" ");
  }

  // ── Events layer (pins, near placeId)
  const eventPins = (layers.events ? world.events : [])
    .filter((ev) => Math.abs(ev.year - currentYear) <= (layers.eventsWindow || 200) / 2)
    .map((ev) => {
      const loc = AVN.placeOf(world, ev.placeId);
      if (!loc) return null;
      const dx = (hashStr(ev.id) % 60) - 30;
      const dy = ((hashStr(ev.id) >> 3) % 40) - 20;
      const focused = focusId === ev.id;
      return (
        <g key={ev.id} transform={`translate(${loc.x + dx},${loc.y + dy})`}
           onClick={(e) => { e.stopPropagation(); onFocus(ev.id); }} style={{ cursor: "pointer" }}>
          {focused && <circle r="14" fill="#8a2f2a" fillOpacity="0.18" stroke="#8a2f2a" strokeWidth="1.2" />}
          <path d="M 0 -7 L 6 0 L 0 7 L -6 0 Z" fill="#8a2f2a" stroke="#2a1f15" strokeWidth="0.8" />
          <text x="9" y="4" fontFamily="EB Garamond, serif" fontStyle="italic" fontSize="11" fill="#2a1f15">{ev.title}</text>
        </g>
      );
    });

  // ── Conflict zones: pairs of overlapping territories at currentYear (countries + organizations)
  const territoryEntities = [];
  if (layers.countries) world.countries.forEach((c) => { const s = AVN.snapAt(c, currentYear); if (s && s.territory) territoryEntities.push({ id: c.id, kind: "country", name: c.name, accent: c.accent, territory: s.territory }); });
  if (layers.orgs) world.organizations.forEach((o) => { const s = AVN.snapAt(o, currentYear); if (s && s.territory) territoryEntities.push({ id: o.id, kind: "org", name: o.name, accent: o.accent, territory: s.territory }); });
  const conflictPairs = [];
  if (layers.conflicts !== false) {
    for (let i = 0; i < territoryEntities.length; i++) {
      for (let j = i + 1; j < territoryEntities.length; j++) {
        const a = territoryEntities[i], b = territoryEntities[j];
        if (window.DRAW.polysOverlap(a.territory, b.territory)) conflictPairs.push({ a, b });
      }
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`worldmap ${isDrawing ? "is-drawing" : ""}`} preserveAspectRatio="xMidYMid meet"
         ref={svgRef}
         onClick={() => !isDrawing && onFocus(null)}
         onPointerDown={handleDrawStart}
         onPointerMove={handleDrawMoveHover}>
      <defs>
        <pattern id="parchmentNoise" x="0" y="0" width="180" height="180" patternUnits="userSpaceOnUse">
          <rect width="180" height="180" fill="#e8dcc4" />
          <circle cx="20" cy="40" r="1" fill="#c9b896" opacity="0.4" />
          <circle cx="80" cy="20" r="0.8" fill="#a89472" opacity="0.3" />
          <circle cx="140" cy="60" r="1.2" fill="#c9b896" opacity="0.35" />
          <circle cx="40" cy="100" r="0.9" fill="#a89472" opacity="0.3" />
          <circle cx="120" cy="130" r="1" fill="#c9b896" opacity="0.4" />
          <circle cx="60" cy="160" r="0.7" fill="#a89472" opacity="0.3" />
          <circle cx="160" cy="160" r="1" fill="#c9b896" opacity="0.35" />
        </pattern>
        <radialGradient id="vignette" cx="50%" cy="50%" r="72%">
          <stop offset="0%" stopColor="#e8dcc4" stopOpacity="0" />
          <stop offset="75%" stopColor="#8a6f3f" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#3d2914" stopOpacity="0.35" />
        </radialGradient>
        <pattern id="seaHatch" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M 0 7 Q 3.5 4 7 7 T 14 7" fill="none" stroke="#8a7559" strokeWidth="0.5" opacity="0.45" />
        </pattern>
        <filter id="inkBleed" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="1.4" />
        </filter>
        <pattern id="conflictHatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="7" height="7" fill="#8a2f2a" fillOpacity="0.42" />
          <line x1="0" y1="0" x2="0" y2="7" stroke="#3a1010" strokeWidth="1.4" />
        </pattern>
        {/* clipPaths for each entity with territory (for conflict intersections) */}
        {territoryEntities.map((t) => (
          <clipPath key={"clip_" + t.id} id={"clip_" + t.id}>
            <polygon points={t.territory} />
          </clipPath>
        ))}
      </defs>

      <rect width={W} height={H} fill="#dccfb3" />
      <rect width={W} height={H} fill="url(#seaHatch)" />

      <g style={{ filter: "url(#inkBleed)" }}>
        <path d={continentPath(world.regions)} fill="url(#parchmentNoise)" stroke="#3a2d20" strokeWidth="2.4" strokeLinejoin="round" />
      </g>

      {/* Regions — soft terrain tint */}
      <g>
        {world.regions.map((r) => (
          <polygon key={r.id} points={r.polygon}
                   fill={`oklch(0.78 0.04 ${r.hue})`} fillOpacity="0.16"
                   stroke={`oklch(0.35 0.06 ${r.hue})`} strokeWidth="0.5" strokeDasharray="2 3"
                   style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); onSelectRegion(r.id); }} />
        ))}
      </g>

      <g>{world.rivers.map((r) => <path key={r.id} d={r.path} fill="none" stroke="#3a6678" strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />)}</g>
      <g>{world.forests.map((f, i) => <Tree key={i} x={f.x} y={f.y} />)}</g>
      <g>{world.mountains.map((m, i) => <Mountain key={i} x={m.x} y={m.y} />)}</g>
      <g>{world.ruins.map((r, i) => <Ruin key={i} x={r.x} y={r.y} name={r.name} />)}</g>

      {/* Region labels (faint, terrain) */}
      <g>
        {world.regions.map((r) => {
          const c = polyCentroid(r.polygon);
          return (
            <text key={r.id} x={c.x} y={c.y - 30}
                  fontFamily="Cormorant SC, serif" fontSize="11" fill="#2a1f15"
                  opacity="0.35" textAnchor="middle" letterSpacing="0.22em"
                  style={{ pointerEvents: "none" }}>
              {r.name.toUpperCase()}
            </text>
          );
        })}
      </g>

      {/* Layers */}
      <g>{countryShapes}</g>
      <g>{countryLabels}</g>
      <g>{orgShapes}</g>

      {/* Conflict zones — overlap intersections rendered with hatch */}
      <g className="conflicts">
        {conflictPairs.map(({ a, b }) => (
          <g key={a.id + "_x_" + b.id}>
            <polygon points={a.territory} clipPath={`url(#clip_${b.id})`}
                     fill="url(#conflictHatch)" stroke="#3a1010" strokeWidth="0.6"
                     style={{ pointerEvents: "none" }} />
          </g>
        ))}
      </g>

      {trajectory && <polyline points={trajectory} fill="none" stroke="#2a1f15" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />}
      <g>{charPins}</g>
      <g>{eventPins}</g>

      {/* In-progress drawing */}
      {isDrawing && drawPts.length > 1 && (
        <g style={{ pointerEvents: "none" }}>
          <polyline points={drawPts.map((p) => `${p[0]},${p[1]}`).join(" ")}
                    fill={drawing.accent || "#c89859"} fillOpacity="0.18"
                    stroke={drawing.accent || "#c89859"} strokeWidth="1.8"
                    strokeLinejoin="round" strokeLinecap="round" strokeDasharray="4 3" />
          <circle cx={drawPts[0][0]} cy={drawPts[0][1]} r="4" fill={drawing.accent || "#c89859"} stroke="#2a1f15" strokeWidth="1" />
          <circle cx={drawPts[drawPts.length - 1][0]} cy={drawPts[drawPts.length - 1][1]} r="3.5" fill="#f3e8d2" stroke={drawing.accent || "#c89859"} strokeWidth="1.4" />
        </g>
      )}
      {isDrawing && drawPts.length === 0 && drawHover && (
        <g style={{ pointerEvents: "none" }}>
          <circle cx={drawHover[0]} cy={drawHover[1]} r="10" fill="none" stroke={drawing.accent || "#c89859"} strokeWidth="1" strokeDasharray="2 3" opacity="0.7" />
          <circle cx={drawHover[0]} cy={drawHover[1]} r="2" fill={drawing.accent || "#c89859"} />
        </g>
      )}

      {/* Compass + scale */}
      <g transform="translate(910, 600)">
        <circle r="36" fill="none" stroke="#3a2d20" strokeWidth="0.8" opacity="0.6" />
        <circle r="28" fill="none" stroke="#3a2d20" strokeWidth="0.5" opacity="0.4" />
        <path d="M 0 -32 L 4 -4 L 0 0 L -4 -4 Z" fill="#3a2d20" />
        <path d="M 0 32 L 4 4 L 0 0 L -4 4 Z" fill="none" stroke="#3a2d20" strokeWidth="0.8" />
        <path d="M -32 0 L -4 -4 L 0 0 L -4 4 Z" fill="none" stroke="#3a2d20" strokeWidth="0.8" />
        <path d="M 32 0 L 4 -4 L 0 0 L 4 4 Z" fill="none" stroke="#3a2d20" strokeWidth="0.8" />
        <text x="0" y="-40" textAnchor="middle" fontFamily="Cormorant SC, serif" fontSize="11" fill="#3a2d20" letterSpacing="0.2em">N</text>
      </g>
      <g transform="translate(60, 620)">
        <line x1="0" y1="0" x2="120" y2="0" stroke="#3a2d20" strokeWidth="1.2" />
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#3a2d20" strokeWidth="1.2" />
        <line x1="60" y1="-3" x2="60" y2="3" stroke="#3a2d20" strokeWidth="1" />
        <line x1="120" y1="-4" x2="120" y2="4" stroke="#3a2d20" strokeWidth="1.2" />
        <text x="60" y="18" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#3a2d20" letterSpacing="0.1em">200 LEAGUES</text>
      </g>
      <rect width={W} height={H} fill="url(#vignette)" pointerEvents="none" />

      {/* Cartouche */}
      <g transform="translate(36, 36)">
        <rect width="280" height="92" fill="#f3e8d2" stroke="#3a2d20" strokeWidth="1.4" />
        <rect x="6" y="6" width="268" height="80" fill="none" stroke="#3a2d20" strokeWidth="0.5" />
        <text x="140" y="38" textAnchor="middle" fontFamily="Cormorant SC, serif" fontSize="22" fill="#2a1f15" letterSpacing="0.16em">{world.name.toUpperCase()}</text>
        <text x="140" y="60" textAnchor="middle" fontFamily="EB Garamond, serif" fontStyle="italic" fontSize="13" fill="#5a4a37">{world.subtitle}</text>
        <text x="140" y="78" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill="#7a6648" letterSpacing="0.25em">— FOLIO I —</text>
      </g>
    </svg>
  );
};

function polyCentroid(pointsStr) {
  const pts = pointsStr.split(/\s+/).filter(Boolean).map((p) => p.split(",").map(Number));
  let x = 0, y = 0;
  pts.forEach((p) => { x += p[0]; y += p[1]; });
  return { x: x / pts.length, y: y / pts.length };
}

function continentPath(regions) {
  const pts = [];
  regions.forEach((r) => r.polygon.split(/\s+/).filter(Boolean).forEach((p) => pts.push(p.split(",").map(Number))));
  const hull = convexHull(pts);
  if (hull.length < 3) return "";
  let d = `M ${hull[0][0]} ${hull[0][1]}`;
  for (let i = 0; i < hull.length; i++) {
    const a = hull[i];
    const b = hull[(i + 1) % hull.length];
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const nx = -(b[1] - a[1]);
    const ny = (b[0] - a[0]);
    const len = Math.hypot(nx, ny) || 1;
    const wobble = 14 + ((i * 7) % 9);
    const cx = mx + (nx / len) * wobble;
    const cy = my + (ny / len) * wobble;
    d += ` Q ${cx} ${cy} ${b[0]} ${b[1]}`;
  }
  return d + " Z";
}

function convexHull(points) {
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (O, A, B) => (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop(); lower.pop();
  return lower.concat(upper);
}

function hashStr(s) {
  let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function shade(hex, amt) {
  // amt in percent, negative = darker
  if (!hex || hex[0] !== "#") return hex;
  let n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
  r = Math.max(0, Math.min(255, r + Math.round(255 * amt / 100)));
  g = Math.max(0, Math.min(255, g + Math.round(255 * amt / 100)));
  b = Math.max(0, Math.min(255, b + Math.round(255 * amt / 100)));
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

window.WorldMap = WorldMap;
window.hashStr = hashStr;
window.shade = shade;
