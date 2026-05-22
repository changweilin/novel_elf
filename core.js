// Shared helpers: at-year state resolution, palette utils, id-to-entity.

window.AVN = (function () {
  function entityAlive(ent, year) {
    if (ent.born != null && year < ent.born) return false;
    if (ent.died != null && year > ent.died) return false;
    if (ent.founded != null && year < ent.founded) return false;
    if (ent.dissolved != null && year > ent.dissolved) return false;
    return true;
  }
  function snapAt(ent, year) {
    if (!ent || !ent.snapshots || ent.snapshots.length === 0) return null;
    if (!entityAlive(ent, year)) return null;
    let best = null;
    for (const s of ent.snapshots) {
      if (s.year <= year && (!best || s.year > best.year)) best = s;
    }
    return best;
  }
  function entityLifespan(ent) {
    const a = ent.born ?? ent.founded;
    const b = ent.died ?? ent.dissolved;
    return { a, b };
  }
  function findEntity(world, id) {
    if (!id) return null;
    return (
      world.characters?.find((x) => x.id === id) ||
      world.organizations?.find((x) => x.id === id) ||
      world.countries?.find((x) => x.id === id) ||
      world.events?.find((x) => x.id === id) ||
      world.places?.find((x) => x.id === id) ||
      null
    );
  }
  function entityKind(world, id) {
    if (world.characters?.some((x) => x.id === id)) return "character";
    if (world.organizations?.some((x) => x.id === id)) return "organization";
    if (world.countries?.some((x) => x.id === id)) return "country";
    if (world.events?.some((x) => x.id === id)) return "event";
    if (world.places?.some((x) => x.id === id)) return "place";
    return null;
  }
  function entityName(world, id) {
    const e = findEntity(world, id);
    if (!e) return id;
    return e.name || e.title || id;
  }
  function relsFor(world, id, year) {
    return (world.relationships || []).filter((r) => {
      if (r.a !== id && r.b !== id) return false;
      if (r.since != null && r.since > year) return false;
      if (r.until != null && r.until < year) return false;
      return true;
    });
  }
  function eventsForEntity(world, id) {
    return (world.events || []).filter((ev) => (ev.participants || []).includes(id));
  }
  function yearLabel(y) {
    if (window.AEVEN_I18N?.yearLabel) return window.AEVEN_I18N.yearLabel(y);
    return y < 0 ? `${-y} BR` : `${y} AR`;
  }
  function placeOf(world, locOrPlaceId) {
    if (!locOrPlaceId) return null;
    if (typeof locOrPlaceId === "string") return world.places.find((p) => p.id === locOrPlaceId) || null;
    return locOrPlaceId; // {x,y,name}
  }

  function list(value) {
    return Array.isArray(value) ? value : [];
  }

  function buildSourceIndex(world) {
    const chapters = [];
    const byKey = new Map();
    const byChapterId = new Map();
    const refsByEntityId = new Map();
    let order = 0;
    let globalChapterNo = 0;

    const addEntityRef = (id, ref) => {
      if (!id) return;
      const key = String(id);
      const refs = refsByEntityId.get(key) || [];
      refs.push(ref);
      refsByEntityId.set(key, refs);
    };

    list(world?.library?.books).forEach((book, bookIndex) => {
      const bookId = book.id || `book_${bookIndex + 1}`;
      list(book.volumes).forEach((volume, volumeIndex) => {
        const volumeId = volume.id || `volume_${volumeIndex + 1}`;
        list(volume.chapters).forEach((chapter, chapterIndex) => {
          globalChapterNo += 1;
          const chapterId = chapter.id || `chapter_${globalChapterNo}`;
          const key = `${bookId}/${volumeId}/${chapterId}`;
          const ref = {
            key,
            id: chapterId,
            order,
            bookId,
            bookTitle: book.title || bookId,
            bookIndex,
            bookNo: bookIndex + 1,
            partId: bookId,
            partTitle: book.title || bookId,
            partIndex: bookIndex,
            partNo: bookIndex + 1,
            volumeId,
            volumeTitle: volume.title || volumeId,
            volumeIndex,
            volumeNo: volumeIndex + 1,
            episodeId: chapter.episodeId || chapterId,
            episodeTitle: chapter.episodeTitle || chapter.title || chapterId,
            episodeIndex: chapter.episodeIndex ?? chapterIndex,
            episodeNo: Number.isFinite(Number(chapter.episodeNo)) ? Number(chapter.episodeNo) : chapterIndex + 1,
            chapterId,
            chapterTitle: chapter.title || chapterId,
            chapterIndex,
            chapterNo: chapterIndex + 1,
            globalChapterNo,
            year: chapter.year,
            placeId: chapter.placeId || null,
            povId: chapter.povId || null,
            focusIds: list(chapter.focusIds),
            eventIds: list(chapter.eventIds),
            storylineIds: list(chapter.storylineIds),
            sceneType: chapter.sceneType || null,
            tensionLevel: chapter.tensionLevel ?? null
          };
          ref.label = sourceLabel(ref);
          ref.compactLabel = compactSourceLabel(ref);
          chapters.push(ref);
          byKey.set(key, ref);
          byKey.set(chapterId, ref);
          byChapterId.set(chapterId, ref);
          addEntityRef(chapter.placeId, ref);
          list(chapter.focusIds).forEach((id) => addEntityRef(id, ref));
          list(chapter.eventIds).forEach((id) => {
            addEntityRef(id, ref);
            const event = list(world?.events).find((item) => item.id === id);
            addEntityRef(event?.placeId, ref);
            list(event?.participants).forEach((participantId) => addEntityRef(participantId, ref));
          });
          order += 1;
        });
      });
    });

    return { chapters, byKey, byChapterId, refsByEntityId };
  }

  function sourceLabel(ref) {
    if (!ref) return "";
    const parts = [];
    if (ref.bookNo != null) parts.push(`Part ${ref.bookNo}: ${ref.bookTitle || ref.bookId}`);
    if (ref.volumeNo != null) parts.push(`Volume ${ref.volumeNo}: ${ref.volumeTitle || ref.volumeId}`);
    if (ref.episodeNo != null && ref.episodeNo !== ref.chapterNo) parts.push(`Episode ${ref.episodeNo}`);
    if (ref.chapterNo != null) parts.push(`Chapter ${ref.chapterNo}: ${ref.chapterTitle || ref.chapterId}`);
    return parts.filter(Boolean).join(" / ") || ref.label || ref.chapterId || "";
  }

  function compactSourceLabel(ref) {
    if (!ref) return "";
    const parts = [];
    if (ref.bookNo != null) parts.push(`P${ref.bookNo}`);
    if (ref.volumeNo != null) parts.push(`V${ref.volumeNo}`);
    if (ref.episodeNo != null && ref.episodeNo !== ref.chapterNo) parts.push(`E${ref.episodeNo}`);
    if (ref.chapterNo != null) parts.push(`Ch${ref.chapterNo}`);
    return parts.join("/");
  }

  function hydrateSourceRef(raw, sourceIndex) {
    if (!raw) return null;
    const index = sourceIndex || { chapters: [], byKey: new Map(), byChapterId: new Map() };
    if (typeof raw === "string") {
      return index.byKey.get(raw) || index.byChapterId.get(raw) || null;
    }

    const id = raw.chapterId || raw.id || raw.key;
    let match = id ? (index.byKey.get(id) || index.byChapterId.get(id)) : null;
    if (!match && raw.bookId && raw.volumeId && raw.chapterId) {
      match = index.byKey.get(`${raw.bookId}/${raw.volumeId}/${raw.chapterId}`);
    }
    if (!match && raw.bookId && raw.volumeId) {
      match = index.chapters.find((ref) => {
        if (ref.bookId !== raw.bookId || ref.volumeId !== raw.volumeId) return false;
        if (raw.chapterNo != null) return ref.chapterNo === Number(raw.chapterNo);
        if (raw.episodeNo != null) return ref.episodeNo === Number(raw.episodeNo);
        return false;
      }) || null;
    }
    if (!match && raw.bookId) {
      match = index.chapters.find((ref) => ref.bookId === raw.bookId) || null;
    }

    const ref = { ...(match || {}), ...raw };
    if (ref.order == null && match) ref.order = match.order;
    if (!ref.key) ref.key = match?.key || ref.chapterId || ref.id || "";
    if (!ref.label) ref.label = sourceLabel(ref);
    if (!ref.compactLabel) ref.compactLabel = compactSourceLabel(ref);
    return ref.key || ref.label ? ref : null;
  }

  function sourceRefsFromValue(value, sourceIndex) {
    const values = Array.isArray(value) ? value : value ? [value] : [];
    return uniqueSourceRefs(values.map((raw) => hydrateSourceRef(raw, sourceIndex)).filter(Boolean));
  }

  function explicitSourceRefs(item, sourceIndex) {
    if (!item) return [];
    const refs = [
      ...sourceRefsFromValue(item.sourceRefs, sourceIndex),
      ...sourceRefsFromValue(item.sources, sourceIndex)
    ];
    list(item.snapshots).forEach((snap) => {
      refs.push(...sourceRefsFromValue(snap.sourceRefs, sourceIndex));
      refs.push(...sourceRefsFromValue(snap.sources, sourceIndex));
    });
    return uniqueSourceRefs(refs);
  }

  function uniqueSourceRefs(refs) {
    const seen = new Set();
    return list(refs).filter((ref) => {
      const key = ref.key || ref.chapterId || ref.id || ref.label;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => {
      const ao = Number.isFinite(Number(a.order)) ? Number(a.order) : Number.MAX_SAFE_INTEGER;
      const bo = Number.isFinite(Number(b.order)) ? Number(b.order) : Number.MAX_SAFE_INTEGER;
      return ao - bo;
    });
  }

  function sourceRefsForRecord(world, record, sourceIndex) {
    if (!record) return [];
    const index = sourceIndex || buildSourceIndex(world);
    const refs = [...explicitSourceRefs(record, index)];
    if (record.id) refs.push(...list(index.refsByEntityId.get(String(record.id))));
    return uniqueSourceRefs(refs);
  }

  function sourceRefsForEntity(world, id, sourceIndex) {
    const entity = findEntity(world, id);
    return sourceRefsForRecord(world, entity || { id }, sourceIndex);
  }

  function resolveSourceScope(sourceIndex, state = {}) {
    const chapters = list(sourceIndex?.chapters);
    const enabled = !!state.enabled && chapters.length > 0;
    const first = chapters[0] || null;
    const last = chapters[chapters.length - 1] || null;
    const start = chapters.find((ref) => ref.key === state.startKey || ref.chapterId === state.startKey) || first;
    const end = chapters.find((ref) => ref.key === state.endKey || ref.chapterId === state.endKey) || last || start;
    const a = start && end && start.order > end.order ? end : start;
    const b = start && end && start.order > end.order ? start : end;
    return {
      enabled,
      startKey: a?.key || "",
      endKey: b?.key || "",
      startOrder: a?.order ?? 0,
      endOrder: b?.order ?? -1,
      start: a,
      end: b,
      count: enabled && a && b ? Math.max(0, b.order - a.order + 1) : chapters.length,
      total: chapters.length,
      label: enabled && a && b ? `${compactSourceLabel(a)} to ${compactSourceLabel(b)}` : "All sources"
    };
  }

  function sourceInScope(ref, scope) {
    if (!scope?.enabled) return true;
    const order = Number(ref?.order);
    return Number.isFinite(order) && order >= scope.startOrder && order <= scope.endOrder;
  }

  function minimalSourceRef(ref) {
    if (!ref) return null;
    return {
      bookId: ref.bookId,
      volumeId: ref.volumeId,
      chapterId: ref.chapterId
    };
  }

  function filterWorldBySourceScope(world, scope, sourceIndex) {
    if (!scope?.enabled) return world;
    const index = sourceIndex || buildSourceIndex(world);
    const hasScopedSource = (item) => sourceRefsForRecord(world, item, index).some((ref) => sourceInScope(ref, scope));
    const events = list(world.events).filter(hasScopedSource);
    const characters = list(world.characters).filter(hasScopedSource);
    const organizations = list(world.organizations).filter(hasScopedSource);
    const countries = list(world.countries).filter(hasScopedSource);
    const visibleIds = new Set([...events, ...characters, ...organizations, ...countries].map((item) => item.id));
    const relationships = list(world.relationships).filter((rel) => {
      const refs = sourceRefsForRecord(world, rel, index);
      if (refs.length) return refs.some((ref) => sourceInScope(ref, scope));
      return visibleIds.has(rel.a) && visibleIds.has(rel.b);
    });

    return {
      ...world,
      events,
      characters,
      organizations,
      countries,
      relationships
    };
  }

  return {
    entityAlive,
    snapAt,
    entityLifespan,
    findEntity,
    entityKind,
    entityName,
    relsFor,
    eventsForEntity,
    yearLabel,
    placeOf,
    buildSourceIndex,
    compactSourceLabel,
    filterWorldBySourceScope,
    minimalSourceRef,
    resolveSourceScope,
    sourceInScope,
    sourceLabel,
    sourceRefsForEntity,
    sourceRefsForRecord
  };
})();
