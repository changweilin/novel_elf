// Codex / Compendium — full-width gallery below the map+chronicle.
// Three sub-sections: Characters, Organizations, Countries.
// Each card is a heraldic placeholder + summary, linked to the focus system.
// Click = setFocusId (auto-switches tab in left inspector + populates right Detail panel).
// "Jump" pin = scrub the chronicle to the entity's birth/founding year.

const Codex = ({ world, currentYear, focusId, onFocus, onJump }) => {
  const [filter, setFilter] = React.useState("all"); // all | characters | orgs | countries
  const [query, setQuery] = React.useState("");

  const q = query.trim().toLowerCase();
  const match = (s) => !q || (s || "").toLowerCase().includes(q);

  const chars     = world.characters.filter((c) => match(c.name) || match(c.role));
  const orgs      = world.organizations.filter((o) => match(o.name));
  const countries = world.countries.filter((c) => match(c.name));

  // ── Character card ────────────────────────────────────
  const renderChar = (c) => {
    const alive = AVN.entityAlive(c, currentYear);
    const snap = AVN.snapAt(c, currentYear) || c.snapshots?.[0];
    const initial = (c.name || "?").trim()[0] || "?";
    const region = world.regions.find((r) => r.id === c.originRegionId);
    const hue = region?.hue ?? 30;
    const accent = c.accent || `oklch(0.62 0.10 ${hue})`;
    const focused = focusId === c.id;
    const dim = !alive ? "is-gone" : "";
    return (
      <div role="button" tabIndex={0} key={c.id} className={`cx-card char ${focused ? "is-focus" : ""} ${dim}`}
              onClick={() => onFocus(c.id)}
              style={{ "--cx-hue": hue, "--cx-accent": accent }}>
        <div className="cx-art cx-art-char">
          <span className="cx-art-hatch" />
          <span className="cx-art-initial">{initial}</span>
          <span className="cx-art-corner" title={alive ? "living" : "passed"} />
          <span className="cx-art-plaque" />
        </div>
        <div className="cx-body">
          <div className="cx-name">{c.name}</div>
          <div className="cx-role">{c.role}</div>
          <div className="cx-meta">
            <span className="cx-pill">{alive ? (snap?.status || "alive") : "passed"}</span>
            <span className="cx-span">
              {c.born != null ? AVN.yearLabel(c.born) : "—"}{c.died != null ? ` – ${AVN.yearLabel(c.died)}` : ""}
            </span>
          </div>
          {snap?.location?.name && <div className="cx-place">at {snap.location.name}</div>}
          {alive && c.born != null && (
            <button className="cx-jump" onClick={(e) => { e.stopPropagation(); onJump(c.born); onFocus(c.id); }}>
              ↺ scrub to birth
            </button>
          )}
        </div>
      </div>
    );
  };

  // ── Organization card ────────────────────────────────
  // Heraldic sigil = a geometric shape stamped on dark ground.
  // Pick shape from first-letter hash so the same org always has the same sigil.
  const sigilShape = (name) => {
    const h = (name || "").charCodeAt(0) || 65;
    return ["circle", "diamond", "triangle", "ring", "cross"][h % 5];
  };
  const renderOrg = (o) => {
    const snap = AVN.snapAt(o, currentYear);
    const lifespan = AVN.entityLifespan(o);
    const alive = currentYear >= (o.founded ?? -99999) && (o.dissolved == null || currentYear <= o.dissolved);
    const focused = focusId === o.id;
    const shape = sigilShape(o.name);
    return (
      <div role="button" tabIndex={0} key={o.id} className={`cx-card org ${focused ? "is-focus" : ""} ${alive ? "" : "is-gone"}`}
              onClick={() => onFocus(o.id)}
              style={{ "--cx-accent": o.accent || "#c89859" }}>
        <div className="cx-art cx-art-org">
          <span className="cx-art-hatch" />
          <span className={`cx-sigil cx-sigil-${shape}`} />
          <span className="cx-stamp-border" />
        </div>
        <div className="cx-body">
          <div className="cx-name">{o.name}</div>
          <div className="cx-role">
            {snap?.leader ? snap.leader : (o.dissolved != null ? "dissolved" : "—")}
          </div>
          <div className="cx-meta">
            <span className="cx-pill">{snap?.members != null ? `${snap.members} hands` : (alive ? "active" : "ended")}</span>
            <span className="cx-span">
              {AVN.yearLabel(o.founded)}{o.dissolved != null ? ` – ${AVN.yearLabel(o.dissolved)}` : " — "}
            </span>
          </div>
          {snap?.hq?.name && <div className="cx-place">seated at {snap.hq.name}</div>}
          <button className="cx-jump" onClick={(e) => { e.stopPropagation(); onJump(o.founded); onFocus(o.id); }}>
            ↺ scrub to founding
          </button>
        </div>
      </div>
    );
  };

  // ── Country card ─────────────────────────────────────
  const renderCountry = (c) => {
    const snap = AVN.snapAt(c, currentYear);
    const alive = currentYear >= (c.founded ?? -99999) && (c.dissolved == null || currentYear <= c.dissolved);
    const focused = focusId === c.id;
    return (
      <div role="button" tabIndex={0} key={c.id} className={`cx-card country ${focused ? "is-focus" : ""} ${alive ? "" : "is-gone"}`}
              onClick={() => onFocus(c.id)}
              style={{ "--cx-accent": c.accent || "#5a7a3a" }}>
        <div className="cx-art cx-art-country">
          <span className="cx-banner-field" />
          <span className="cx-banner-stripe" />
          <span className="cx-banner-crest">{(c.name || "?").trim()[0]}</span>
          <span className="cx-banner-tail" />
        </div>
        <div className="cx-body">
          <div className="cx-name">{c.name}</div>
          <div className="cx-role">{snap?.leader || (c.dissolved != null ? "dissolved" : "—")}</div>
          <div className="cx-meta">
            <span className="cx-pill">{alive ? "extant" : "fallen"}</span>
            <span className="cx-span">
              {AVN.yearLabel(c.founded)}{c.dissolved != null ? ` – ${AVN.yearLabel(c.dissolved)}` : " — "}
            </span>
          </div>
          {snap?.capital?.name && <div className="cx-place">capital · {snap.capital.name}</div>}
          <button className="cx-jump" onClick={(e) => { e.stopPropagation(); onJump(c.founded); onFocus(c.id); }}>
            ↺ scrub to founding
          </button>
        </div>
      </div>
    );
  };

  const showChars = filter === "all" || filter === "characters";
  const showOrgs  = filter === "all" || filter === "orgs";
  const showCos   = filter === "all" || filter === "countries";

  return (
    <section className="codex">
      <header className="cx-head">
        <div className="cx-head-l">
          <span className="cx-tag">— Folio II —</span>
          <h2 className="cx-title">The Compendium</h2>
          <span className="cx-sub">a roll of names, sigils, &amp; standards · at {AVN.yearLabel(currentYear)}</span>
        </div>
        <div className="cx-head-r">
          <div className="cx-filters">
            {[
              { k: "all",        l: "All",          n: chars.length + orgs.length + countries.length },
              { k: "characters", l: "Characters",   n: chars.length },
              { k: "orgs",       l: "Organizations",n: orgs.length },
              { k: "countries",  l: "Countries",    n: countries.length }
            ].map((f) => (
              <button key={f.k} className={`cx-filter ${filter === f.k ? "on" : ""}`} onClick={() => setFilter(f.k)}>
                {f.l}<span className="cx-filter-n">{f.n}</span>
              </button>
            ))}
          </div>
          <input className="cx-search" placeholder="search the rolls…"
                 value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </header>

      <div className="cx-shelves">
        {showChars && chars.length > 0 && (
          <div className="cx-shelf">
            <div className="cx-shelf-head"><span className="cx-shelf-label">Characters</span><span className="cx-shelf-count">{chars.length}</span></div>
            <div className="cx-row">{chars.map(renderChar)}</div>
          </div>
        )}
        {showOrgs && orgs.length > 0 && (
          <div className="cx-shelf">
            <div className="cx-shelf-head"><span className="cx-shelf-label">Organizations</span><span className="cx-shelf-count">{orgs.length}</span></div>
            <div className="cx-row">{orgs.map(renderOrg)}</div>
          </div>
        )}
        {showCos && countries.length > 0 && (
          <div className="cx-shelf">
            <div className="cx-shelf-head"><span className="cx-shelf-label">Countries</span><span className="cx-shelf-count">{countries.length}</span></div>
            <div className="cx-row">{countries.map(renderCountry)}</div>
          </div>
        )}
        {chars.length + orgs.length + countries.length === 0 && (
          <div className="cx-empty">— nothing matches that name —</div>
        )}
      </div>
    </section>
  );
};

window.Codex = Codex;
