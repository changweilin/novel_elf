// The Library / 書冊系統 — top-level shell.
// Holds three nested views: shelf → book → chapter.
// The chapter view itself is in chapter.jsx.

const { useState: useStateLib, useMemo: useMemoLib } = React;

function trText(s) {
  return window.AEVEN_I18N?.t ? window.AEVEN_I18N.t(s) : s;
}

// ── Tiny markdown renderer ────────────────────────────────────────
// Supports: # H1, ## H2, paragraphs, **bold**, *italic*, > blockquote,
// horizontal rule (---), and the Obsidian-style ![[ill_id]] illustration directive.
// We keep it intentionally small — it's a writing surface, not a CMS.
function renderInline(s) {
  s = trText(s);
  const parts = [];
  let i = 0; let key = 0;
  const push = (node) => parts.push(<React.Fragment key={key++}>{node}</React.Fragment>);
  // Walk the string, alternating between **bold**, *italic*, plain.
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let m; let last = 0;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) push(s.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("**")) push(<strong>{t.slice(2, -2)}</strong>);
    else push(<em>{t.slice(1, -1)}</em>);
    last = m.index + t.length;
    i = last;
  }
  if (last < s.length) push(s.slice(last));
  return parts;
}

function renderMd(md, illustrations) {
  if (!md) return <p style={{ fontStyle: "italic", color: "#7a6b54" }}>{trText("— this page is bare —")}</p>;
  const lines = md.split(/\n/);
  const out = [];
  let para = [];
  let key = 0;
  const flushPara = () => {
    if (para.length) {
      out.push(<p key={"p" + key++}>{renderInline(para.join(" "))}</p>);
      para = [];
    }
  };
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    const trim = ln.trim();
    if (!trim) { flushPara(); continue; }
    // illustration directive
    const illM = trim.match(/^!\[\[([^\]]+)\]\]$/);
    if (illM) {
      flushPara();
      const id = illM[1];
      const ill = (illustrations || []).find((x) => x.id === id);
      out.push(
        <div key={"i" + key++} className="ill-slot">
          <span className="ill-slot-label">{trText("illustration")} · {id}</span>
          {ill && <span className="ill-slot-cap">{trText(ill.caption)}</span>}
        </div>
      );
      continue;
    }
    if (trim.startsWith("# ")) { flushPara(); out.push(<h1 key={"h" + key++}>{renderInline(trim.slice(2))}</h1>); continue; }
    if (trim.startsWith("## ")) { flushPara(); out.push(<h2 key={"h" + key++}>{renderInline(trim.slice(3))}</h2>); continue; }
    if (trim === "---") { flushPara(); out.push(<hr key={"hr" + key++} />); continue; }
    if (trim.startsWith("- ")) {
      flushPara();
      out.push(<p key={"li" + key++} className="md-list-item">• {renderInline(trim.slice(2))}</p>);
      continue;
    }
    if (trim.startsWith("> ")) {
      flushPara();
      out.push(<blockquote key={"bq" + key++}>{renderInline(trim.slice(2))}</blockquote>);
      continue;
    }
    para.push(trim);
  }
  flushPara();
  return out;
}

window.renderMd = renderMd;

// ── Cover art (small SVG-free placeholders) ────────────────────
function CoverArt({ motif }) {
  if (motif === "compass") return (
    <div className="book-art-compass"><span className="needle" /><span className="needle south" /></div>
  );
  if (motif === "sigil") return <div className="book-art-sigil" />;
  if (motif === "banner") return <div className="book-art-banner" />;
  if (motif === "leaf") return <div className="book-art-leaf" />;
  if (motif === "tide") return <div className="book-art-tide" />;
  return <div className="book-art-sigil" />;
}
window.CoverArt = CoverArt;

// ── A single book on the shelf ─────────────────────────────────
function BookCard({ book, onOpen }) {
  return (
    <button className="book-card" onClick={() => onOpen(book.id)}>
      <div className="book-cover" style={{ "--cover-accent": book.accent }}>
        <span className="book-status">{book.status}</span>
        <div className="book-tag">— {book.year != null ? AVN.yearLabel(book.year) : "—"} —</div>
        <div className="book-title">{book.title}</div>
        <div className="book-sub">{book.subtitle}</div>
        <div className="book-art"><CoverArt motif={book.motif} /></div>
        <div className="book-author">{book.author}</div>
      </div>
      <div className="book-meta">
        <span className="book-meta-title">{book.title}</span>
      </div>
    </button>
  );
}

// ── Bookshelf ──────────────────────────────────────────────────
function Shelf({ books, onOpen, onNew }) {
  const total = books.length;
  const inProgress = books.filter((b) => b.status === "in-progress" || b.status === "draft").length;
  return (
    <div>
      <header className="shelf-head">
        <div className="shelf-head-l">
          <span className="shelf-tag">— Folio III —</span>
          <h2 className="shelf-title">The Library</h2>
          <span className="shelf-sub">books underway, drafts in progress, fragments yet to gather</span>
        </div>
        <div className="shelf-head-r">
          <span className="book-info-pill">{total} volumes</span>
          <span className="book-info-pill accent">{inProgress} on the writing desk</span>
        </div>
      </header>
      <div className="shelf-grid">
        {books.map((b) => <BookCard key={b.id} book={b} onOpen={onOpen} />)}
        <button className="book-card" onClick={onNew}>
          <div className="book-cover is-empty">
            <div className="book-tag">— new —</div>
            <div className="book-title" style={{ color: "var(--slate)" }}>An empty book</div>
            <div className="book-sub" style={{ color: "var(--slate)" }}>awaiting a first leaf</div>
          </div>
          <div className="book-meta"><span className="book-empty-label">+ begin a new book</span></div>
        </button>
      </div>
    </div>
  );
}

// ── Book view ─────────────────────────────────────────────────
function BookView({ book, onOpenChapter, onBack, onAddChapter, world, currentYear }) {
  const chapCount = (book.volumes || []).reduce((s, v) => s + (v.chapters?.length || 0), 0);
  const drafted = (book.volumes || []).reduce((s, v) => s + (v.chapters || []).filter((c) => c.status !== "outline").length, 0);
  const wordCount = (book.volumes || []).reduce((s, v) => s + (v.chapters || []).reduce((ss, c) => ss + (c.words || 0), 0), 0);

  let chapNum = 0;
  return (
    <div className="book-view">
      <div className="book-cover" style={{ "--cover-accent": book.accent }}>
        <span className="book-status">{book.status}</span>
        <div className="book-tag">— {AVN.yearLabel(book.year)} —</div>
        <div className="book-title">{book.title}</div>
        <div className="book-sub">{book.subtitle}</div>
        <div className="book-art"><CoverArt motif={book.motif} /></div>
        <div className="book-author">{book.author}</div>
      </div>
      <div className="book-info">
        <div className="book-info-blurb">{book.blurb}</div>
        <div className="book-info-meta">
          <span className="book-info-pill">{(book.volumes || []).length} volumes</span>
          <span className="book-info-pill">{chapCount} chapters</span>
          <span className="book-info-pill">{drafted} drafted</span>
          <span className="book-info-pill accent">{wordCount.toLocaleString()} words</span>
        </div>
        <div className="toc">
          <div className="toc-head">Table of Contents</div>
          {(book.volumes || []).length === 0 && (
            <div className="warn-empty" style={{ marginTop: 0 }}>— no volumes yet · begin the first —</div>
          )}
          {(book.volumes || []).map((vol) => (
            <div key={vol.id} className="toc-volume">
              <div className="toc-vol-title">{vol.title}</div>
              <div className="toc-vol-sub">{vol.subtitle}</div>
              {(vol.chapters || []).map((c) => {
                chapNum += 1;
                const place = world.places.find((p) => p.id === c.placeId);
                return (
                  <button key={c.id} className="toc-chap" onClick={() => onOpenChapter(book.id, vol.id, c.id)}>
                    <span className="toc-chap-num">{String(chapNum).padStart(2, "0")}</span>
                    <span className="toc-chap-title">{c.title}</span>
                    <span className="toc-chap-meta">{AVN.yearLabel(c.year)}{place ? " · " + place.name : ""}{c.words ? " · " + c.words + " w" : ""}</span>
                    <span className={`toc-chap-status ${c.status}`}>{c.status}</span>
                  </button>
                );
              })}
              <button className="toc-add" onClick={() => onAddChapter(book.id, vol.id)}>+ new chapter</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Library shell ─────────────────────────────────────────────
function Library({ world, setWorld, currentYear, onJump, onFocus, focusId }) {
  // route: { view: 'shelf'|'book'|'chapter', bookId, volumeId, chapterId }
  const [route, setRoute] = useStateLib(() => {
    try { const raw = localStorage.getItem("aevenmere.lib.route"); if (raw) return JSON.parse(raw); } catch {}
    return { view: "shelf" };
  });
  React.useEffect(() => { try { localStorage.setItem("aevenmere.lib.route", JSON.stringify(route)); } catch {} }, [route]);

  const books = world.library?.books || [];
  const book = useMemoLib(() => books.find((b) => b.id === route.bookId), [books, route.bookId]);
  const volume = useMemoLib(() => book?.volumes?.find((v) => v.id === route.volumeId), [book, route.volumeId]);
  const chapter = useMemoLib(() => volume?.chapters?.find((c) => c.id === route.chapterId), [volume, route.chapterId]);

  // ── Mutators ──
  const updateChapter = (patch) => {
    if (!route.bookId || !route.volumeId || !route.chapterId) return;
    setWorld((w) => ({
      ...w,
      library: {
        ...w.library,
        books: w.library.books.map((b) => b.id !== route.bookId ? b : {
          ...b,
          volumes: b.volumes.map((v) => v.id !== route.volumeId ? v : {
            ...v,
            chapters: v.chapters.map((c) => c.id !== route.chapterId ? c : { ...c, ...patch })
          })
        })
      }
    }));
  };

  const addChapter = (bookId, volumeId) => {
    const id = "ch_" + Math.random().toString(36).slice(2, 7);
    const newChap = {
      id, title: "An untitled chapter", year: currentYear,
      placeId: null, focusIds: [], eventIds: [],
      status: "outline", words: 0,
      md: `# An untitled chapter\n\n*[a fresh leaf — begin]*`,
      illustrations: []
    };
    setWorld((w) => ({
      ...w,
      library: {
        ...w.library,
        books: w.library.books.map((b) => b.id !== bookId ? b : {
          ...b,
          volumes: b.volumes.map((v) => v.id !== volumeId ? v : { ...v, chapters: [...(v.chapters || []), newChap] })
        })
      }
    }));
    setRoute({ view: "chapter", bookId, volumeId, chapterId: id });
  };

  const addBook = () => {
    const id = "bk_" + Math.random().toString(36).slice(2, 6);
    const accents = ["#c89859", "#8a2f2a", "#6b8a7a", "#4a8a9a", "#7a4a9c"];
    const motifs = ["compass", "sigil", "banner", "leaf", "tide"];
    const i = (world.library?.books || []).length;
    const newBook = {
      id, title: "An untitled book", subtitle: "A new work, yet to find its shape",
      author: "Drafted in the Atelier", accent: accents[i % accents.length],
      motif: motifs[i % motifs.length], status: "outline", year: currentYear,
      blurb: "What this book is for has not yet been written.",
      volumes: [{
        id: "vol_" + id, title: "Volume the First", subtitle: "Of beginnings",
        chapters: []
      }]
    };
    setWorld((w) => ({ ...w, library: { ...w.library, books: [...(w.library?.books || []), newBook] } }));
    setRoute({ view: "book", bookId: id });
  };

  // ── Render ──
  const crumbs = () => (
    <div className="lib-crumbs">
      <button className={`lib-crumb ${route.view === "shelf" ? "is-end" : ""}`}
              onClick={() => setRoute({ view: "shelf" })}>The Library</button>
      {book && (
        <>
          <span className="lib-crumb-sep">·</span>
          <button className={`lib-crumb ${route.view === "book" ? "is-end" : ""}`}
                  onClick={() => setRoute({ view: "book", bookId: book.id })}>{book.title}</button>
        </>
      )}
      {chapter && (
        <>
          <span className="lib-crumb-sep">·</span>
          <button className="lib-crumb is-end">{chapter.title}</button>
        </>
      )}
    </div>
  );

  if (route.view === "chapter" && chapter && book && volume) {
    return (
      <div className="library">
        {crumbs()}
        <ChapterEditor
          world={world}
          setWorld={setWorld}
          book={book}
          volume={volume}
          chapter={chapter}
          updateChapter={updateChapter}
          onBack={() => setRoute({ view: "book", bookId: book.id })}
          onFocus={onFocus}
          onJump={onJump}
        />
      </div>
    );
  }

  if (route.view === "book" && book) {
    return (
      <div className="library">
        {crumbs()}
        <BookView
          book={book} world={world} currentYear={currentYear}
          onOpenChapter={(bookId, volumeId, chapterId) => setRoute({ view: "chapter", bookId, volumeId, chapterId })}
          onAddChapter={addChapter}
          onBack={() => setRoute({ view: "shelf" })}
        />
      </div>
    );
  }

  return (
    <div className="library">
      {crumbs()}
      <Shelf books={books} onOpen={(id) => setRoute({ view: "book", bookId: id })} onNew={addBook} />
    </div>
  );
}

window.Library = Library;
