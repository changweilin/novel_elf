(function () {
  "use strict";

  const { useState, useEffect, useMemo } = React;

  function uid(prefix) {
    return prefix + "_" + Math.random().toString(36).slice(2, 8);
  }

  function wsT(source) {
    return window.AEVEN_I18N?.t ? window.AEVEN_I18N.t(source) : source;
  }

  function useAevenmereWorkspace(options = {}) {
    const { afterEntityCreated, getEventPlaceId } = options;
    const seedWorld = useMemo(() => window.StoryStore.normalizeWorld(window.WORLD_SEED), []);
    const [world, setWorld] = useState(seedWorld);
    const [stories, setStories] = useState([]);
    const [activeStory, setActiveStory] = useState(null);
    const [storyReady, setStoryReady] = useState(false);
    const [storeMode, setStoreMode] = useState("loading");
    const [storyStatus, setStoryStatus] = useState("loading");
    const [storyError, setStoryError] = useState(null);
    const [currentYear, setCurrentYear] = useState(seedWorld.defaultYear);
    const [folio, setFolio] = useState("atelier");
    const [focusId, setFocusId] = useState(() => window.StoryStore.firstFocus(seedWorld));
    const [sourceRange, setSourceRange] = useState({ enabled: false, startKey: "", endKey: "" });
    const [story, setStory] = useState("");
    const [hint, setHint] = useState("");
    const [busy, setBusy] = useState(null);
    const [err, setErr] = useState(null);

    const sourceIndex = useMemo(() => AVN.buildSourceIndex(world), [world.library]);
    const sourceScope = useMemo(() => AVN.resolveSourceScope(sourceIndex, sourceRange), [sourceIndex, sourceRange]);
    const scopedWorld = useMemo(() => AVN.filterWorldBySourceScope(world, sourceScope, sourceIndex), [world, sourceScope, sourceIndex]);
    const currentEra = useMemo(
      () => world.eras.find((era) => currentYear >= era.start && currentYear <= era.end) || world.eras[world.eras.length - 1] || { name: "" },
      [world.eras, currentYear]
    );

    const counts = {
      events: scopedWorld.events.length,
      characters: scopedWorld.characters.length,
      orgs: scopedWorld.organizations.length,
      countries: scopedWorld.countries.length
    };
    const totalCounts = {
      events: world.events.length,
      characters: world.characters.length,
      orgs: world.organizations.length,
      countries: world.countries.length
    };

    const runtime = window.NovelElfRuntime || {};
    const readOnly = runtime.readOnly === true || runtime.publicDemo === true;
    const publicDemo = runtime.publicDemo === true;
    const aiAvailable = !readOnly && runtime.aiEnabled !== false;
    const canUseStoryApi = !readOnly && storeMode === "api";
    const writableSetWorld = readOnly ? (() => {}) : setWorld;

    useEffect(() => {
      let alive = true;
      setStoryStatus("loading");
      window.StoryStore.loadInitial(seedWorld)
        .then((loaded) => {
          if (!alive) return;
          setStories(loaded.stories || []);
          applyLoadedStory(loaded);
          setStoreMode(loaded.mode);
          setStoryError(loaded.error ? String(loaded.error.message || loaded.error) : null);
          setStoryReady(true);
          setStoryStatus(loaded.mode === "api" ? "ready" : loaded.mode === "demo" ? "demo" : "static");
        })
        .catch((error) => {
          if (!alive) return;
          setStoryError(String(error.message || error));
          setStoryReady(true);
          setStoreMode("static");
          setStoryStatus("error");
        });
      return () => { alive = false; };
    }, [seedWorld]);

    useEffect(() => {
      if (!storyReady || !activeStory || readOnly) return;
      const timer = window.setTimeout(() => {
        setStoryStatus(storeMode === "api" ? "saving" : "static");
        window.StoryStore.saveWorld(activeStory.id, world, storeMode)
          .then((saved) => {
            if (saved.stories) setStories(saved.stories);
            if (saved.story) setActiveStory(saved.story);
            setStoryError(null);
            setStoryStatus(storeMode === "api" ? "saved" : "static");
          })
          .catch((error) => {
            setStoryError(String(error.message || error));
            setStoryStatus("error");
          });
      }, 650);
      return () => window.clearTimeout(timer);
    }, [world, activeStory?.id, storyReady, storeMode]);

    useEffect(() => {
      if (!storyReady || !activeStory) return;
      window.StoryStore.setUi(activeStory.id, "year", currentYear);
    }, [currentYear, activeStory?.id, storyReady]);

    useEffect(() => {
      if (!storyReady || !activeStory) return;
      window.StoryStore.setUi(activeStory.id, "folio", folio);
    }, [folio, activeStory?.id, storyReady]);

    useEffect(() => {
      if (!sourceScope.enabled || !focusId) return;
      if (!AVN.findEntity(scopedWorld, focusId)) setFocusId(null);
    }, [sourceScope.enabled, sourceScope.startKey, sourceScope.endKey, scopedWorld, focusId]);

    function applyLoadedStory(loaded) {
      const nextWorld = window.StoryStore.normalizeWorld(loaded.world);
      const nextStory = loaded.story || window.StoryStore.storyFromWorld(nextWorld);
      setActiveStory(nextStory);
      setWorld(nextWorld);
      setCurrentYear(window.StoryStore.getYear(nextStory.id, nextWorld));
      setFolio(window.StoryStore.getUi(nextStory.id, "folio", "atelier"));
      setFocusId(window.StoryStore.firstFocus(nextWorld));
      setSourceRange({ enabled: false, startKey: "", endKey: "" });
      setStory("");
      setHint("");
      setErr(null);
      window.StoryStore.saveActiveStoryId(nextStory.id);
    }

    async function onSelectStory(storyId) {
      if (!storyId || storyId === activeStory?.id || !storyReady) return;
      setStoryStatus("loading");
      try {
        const loaded = await window.StoryStore.loadStory(storyId, storeMode);
        applyLoadedStory(loaded);
        setStoryError(null);
        setStoryStatus("ready");
      } catch (error) {
        setStoryError(String(error.message || error));
        setStoryStatus("error");
      }
    }

    async function onCreateStory() {
      if (readOnly) return;
      if (!storyReady) return;
      const title = prompt(wsT("Name this new story"), wsT("Untitled Story"));
      if (!title) return;
      setStoryStatus("loading");
      try {
        const created = await window.StoryStore.createStory({ title }, storeMode);
        setStories(created.stories || []);
        applyLoadedStory(created);
        setStoryError(null);
        setStoryStatus("ready");
      } catch (error) {
        setStoryError(String(error.message || error));
        setStoryStatus("error");
      }
    }

    async function onDuplicateStory() {
      if (readOnly) return;
      if (!storyReady || !activeStory) return;
      const title = prompt(wsT("Name the duplicate story"), `${world.name} ${wsT("Copy")}`);
      if (!title) return;
      setStoryStatus("loading");
      try {
        const created = await window.StoryStore.createStory({ title, sourceId: activeStory.id }, storeMode);
        setStories(created.stories || []);
        applyLoadedStory(created);
        setStoryError(null);
        setStoryStatus("ready");
      } catch (error) {
        setStoryError(String(error.message || error));
        setStoryStatus("error");
      }
    }

    async function onRenameStory() {
      if (readOnly) return;
      if (!storyReady || !activeStory) return;
      const name = prompt(wsT("Rename this story"), world.name);
      if (!name || name === world.name) return;
      setStoryStatus("saving");
      try {
        const renamed = await window.StoryStore.renameStory(activeStory.id, { name }, storeMode);
        setStories(renamed.stories || stories);
        applyLoadedStory(renamed);
        setStoryError(null);
        setStoryStatus("saved");
      } catch (error) {
        setStoryError(String(error.message || error));
        setStoryStatus("error");
      }
    }

    async function onArchiveStory() {
      if (readOnly) return;
      if (!storyReady || !activeStory) return;
      if (!confirm(`${wsT("Archive")} "${world.name}"? ${wsT("Its Markdown files will move into stories/_archived.")}`)) return;
      setStoryStatus("loading");
      try {
        const archived = await window.StoryStore.archiveStory(activeStory.id, storeMode);
        const remaining = archived.stories || [];
        setStories(remaining);
        if (remaining.length) {
          const loaded = await window.StoryStore.loadStory(remaining[0].id, storeMode);
          applyLoadedStory(loaded);
        } else {
          const created = await window.StoryStore.createStory({ title: wsT("Untitled Story") }, storeMode);
          setStories(created.stories || []);
          applyLoadedStory(created);
        }
        setStoryError(null);
        setStoryStatus("ready");
      } catch (error) {
        setStoryError(String(error.message || error));
        setStoryStatus("error");
      }
    }

    function onExportStoryTemplate() {
      try {
        window.StoryStore.downloadStoryImportTemplate();
      } catch (error) {
        setStoryError(String(error.message || error));
        setStoryStatus("error");
      }
    }

    async function onImportStoryFile(file) {
      if (readOnly) return;
      if (!storyReady || !file) return;
      const defaultTitle = window.StoryStore.storyTitleFromFileName(file.name);
      const title = prompt(wsT("Name this imported story"), defaultTitle);
      if (!title) return;
      setStoryStatus("loading");
      try {
        const markdown = await file.text();
        const created = await window.StoryStore.createStoryFromMarkdown({ markdown, fileName: file.name, title }, storeMode);
        setStories(created.stories || []);
        applyLoadedStory(created);
        setStoryError(null);
        setStoryStatus(storeMode === "api" ? "saved" : "static");
      } catch (error) {
        setStoryError(String(error.message || error));
        setStoryStatus("error");
      }
    }

    function setEnt(key, id, patch) {
      if (readOnly) return;
      setWorld((value) => ({
        ...value,
        [key]: (value[key] || []).map((entity) => entity.id === id ? { ...entity, ...patch } : entity)
      }));
    }

    function delEnt(key, id) {
      if (readOnly) return;
      setWorld((value) => ({
        ...value,
        [key]: (value[key] || []).filter((entity) => entity.id !== id)
      }));
    }

    const updateEvent = (id, patch) => setEnt("events", id, patch);
    const deleteEvent = (id) => { delEnt("events", id); if (focusId === id) setFocusId(null); };
    const updateChar = (id, patch) => setEnt("characters", id, patch);
    const deleteChar = (id) => { delEnt("characters", id); if (focusId === id) setFocusId(null); };
    const updateOrg = (id, patch) => setEnt("organizations", id, patch);
    const deleteOrg = (id) => { delEnt("organizations", id); if (focusId === id) setFocusId(null); };
    const updateCountry = (id, patch) => setEnt("countries", id, patch);
    const deleteCountry = (id) => { delEnt("countries", id); if (focusId === id) setFocusId(null); };

    function snapMutator(key) {
      return {
        add: (id, snap) => {
          if (readOnly) return;
          const ent = (world[key] || []).find((entity) => entity.id === id);
          if (ent) setEnt(key, id, { snapshots: [...(ent.snapshots || []), snap] });
        },
        update: (id) => (oldSnap, patch) => {
          if (readOnly) return;
          const ent = (world[key] || []).find((entity) => entity.id === id);
          if (ent) setEnt(key, id, { snapshots: (ent.snapshots || []).map((snap) => snap === oldSnap ? { ...snap, ...patch } : snap) });
        },
        del: (id) => (snap) => {
          if (readOnly) return;
          const ent = (world[key] || []).find((entity) => entity.id === id);
          if (ent) setEnt(key, id, { snapshots: (ent.snapshots || []).filter((item) => item !== snap) });
        }
      };
    }

    function sourceRefsForNewRecord() {
      const ref = sourceScope.enabled ? AVN.minimalSourceRef(sourceScope.end) : null;
      return ref ? [ref] : [];
    }

    function withCurrentSourceRef(record) {
      const sourceRefs = sourceRefsForNewRecord();
      return sourceRefs.length ? { ...record, sourceRefs } : record;
    }

    function addRel(entityId) {
      if (readOnly) return;
      const candidates = [...world.characters, ...world.organizations, ...world.countries].filter((entity) => entity.id !== entityId);
      const other = candidates[0];
      if (!other) return;
      const id = uid("rl");
      const sourceRefs = sourceRefsForNewRecord();
      setWorld((value) => ({
        ...value,
        relationships: [
          ...(value.relationships || []),
          { id, a: entityId, b: other.id, kind: "ally", since: currentYear, until: null, note: "", ...(sourceRefs.length ? { sourceRefs } : {}) }
        ]
      }));
    }

    const updateRel = (id, patch) => {
      if (readOnly) return;
      setWorld((value) => ({ ...value, relationships: (value.relationships || []).map((rel) => rel.id === id ? { ...rel, ...patch } : rel) }));
    };
    const deleteRel = (id) => {
      if (readOnly) return;
      setWorld((value) => ({ ...value, relationships: (value.relationships || []).filter((rel) => rel.id !== id) }));
    };

    function finishCreated(kind, id) {
      setFocusId(id);
      if (typeof afterEntityCreated === "function") afterEntityCreated(kind, id);
    }

    function addBlankEvent() {
      if (readOnly) return;
      const id = uid("ev");
      const sourceRefs = sourceRefsForNewRecord();
      setWorld((value) => ({
        ...value,
        events: [...value.events, { id, year: currentYear, title: "An unnamed happening", body: "", placeId: null, participants: [], ...(sourceRefs.length ? { sourceRefs } : {}) }]
      }));
      finishCreated("event", id);
    }

    function addBlankChar(originRegionId = null) {
      if (readOnly) return;
      const id = uid("ch");
      const sourceRefs = sourceRefsForNewRecord();
      setWorld((value) => ({
        ...value,
        characters: [
          ...value.characters,
          {
            id,
            name: "Someone unnamed",
            role: "of the Reach",
            born: currentYear - 25,
            died: null,
            originRegionId,
            snapshots: [{ year: currentYear, location: { x: 500, y: 340, name: "" }, status: "alive", body: "" }],
            ...(sourceRefs.length ? { sourceRefs } : {})
          }
        ]
      }));
      finishCreated("character", id);
    }

    function addBlankOrg() {
      if (readOnly) return;
      const id = uid("or");
      const sourceRefs = sourceRefsForNewRecord();
      setWorld((value) => ({
        ...value,
        organizations: [
          ...value.organizations,
          {
            id,
            name: "An unnamed order",
            accent: "#c89859",
            founded: currentYear,
            dissolved: null,
            snapshots: [{ year: currentYear, hq: { x: 500, y: 340, name: "" }, leader: "", members: 1, body: "" }],
            ...(sourceRefs.length ? { sourceRefs } : {})
          }
        ]
      }));
      finishCreated("organization", id);
    }

    function addBlankCountry() {
      if (readOnly) return;
      const id = uid("co");
      const sourceRefs = sourceRefsForNewRecord();
      setWorld((value) => ({
        ...value,
        countries: [
          ...value.countries,
          {
            id,
            name: "An unnamed realm",
            accent: "#5a7a3a",
            founded: currentYear,
            dissolved: null,
            snapshots: [{ year: currentYear, capital: { x: 500, y: 340, name: "" }, leader: "", body: "", territory: "" }],
            ...(sourceRefs.length ? { sourceRefs } : {})
          }
        ]
      }));
      finishCreated("country", id);
    }

    function expandPlace(name) {
      const p = world.places.find((place) => place.name?.toLowerCase() === (name || "").toLowerCase());
      if (p) return { x: p.x, y: p.y, name: p.name };
      return { x: 500, y: 340, name: name || "" };
    }

    function workspaceSnapshot() {
      return { world, currentYear, focusId, sourceIndex, sourceScope, scopedWorld };
    }

    async function onAI(kind) {
      if (!aiAvailable || typeof window.claude?.complete !== "function") {
        setErr(readOnly ? "AI writing is available in the local workspace." : "AI runtime is not available in this browser.");
        return;
      }
      setBusy(kind);
      setErr(null);
      try {
        if (kind === "char") {
          const out = await window.aiGenerateCharacter(world, hint, currentYear);
          const id = uid("ch");
          const snaps = (out.snapshots || []).map((snap) => ({ year: snap.year, status: snap.status, body: snap.body, location: expandPlace(snap.place) }));
          const sourceRefs = sourceRefsForNewRecord();
          setWorld((value) => ({
            ...value,
            characters: [{ id, name: out.name, role: out.role, born: out.born ?? currentYear - 25, died: null, snapshots: snaps, body: out.body, ...(sourceRefs.length ? { sourceRefs } : {}) }, ...value.characters]
          }));
          finishCreated("character", id);
        } else if (kind === "event") {
          const placeId = typeof getEventPlaceId === "function" ? getEventPlaceId(workspaceSnapshot()) : null;
          const out = await window.aiGenerateEvent(world, hint, currentYear, placeId);
          const id = uid("ev");
          const sourceRefs = sourceRefsForNewRecord();
          setWorld((value) => ({
            ...value,
            events: [...value.events, { id, year: out.year || currentYear, title: out.title, body: out.body, placeId: out.placeId || placeId, participants: out.participants || [], ...(sourceRefs.length ? { sourceRefs } : {}) }]
          }));
          finishCreated("event", id);
        } else if (kind === "org") {
          const out = await window.aiGenerateOrg(world, hint, currentYear);
          const id = uid("or");
          const snaps = (out.snapshots || []).map((snap) => ({ year: snap.year, leader: snap.leader, members: snap.members, body: snap.body, hq: expandPlace(snap.hq), territory: "" }));
          const sourceRefs = sourceRefsForNewRecord();
          setWorld((value) => ({
            ...value,
            organizations: [{ id, name: out.name, accent: out.accent || "#c89859", founded: out.founded ?? currentYear, dissolved: out.dissolved ?? null, snapshots: snaps, ...(sourceRefs.length ? { sourceRefs } : {}) }, ...value.organizations]
          }));
          finishCreated("organization", id);
        } else if (kind === "country") {
          const out = await window.aiGenerateCountry(world, hint, currentYear);
          const id = uid("co");
          const snaps = (out.snapshots || []).map((snap) => ({ year: snap.year, leader: snap.leader, body: snap.body, capital: expandPlace(snap.capital), territory: "" }));
          const sourceRefs = sourceRefsForNewRecord();
          setWorld((value) => ({
            ...value,
            countries: [{ id, name: out.name, accent: out.accent || "#5a7a3a", founded: out.founded ?? currentYear, dissolved: out.dissolved ?? null, snapshots: snaps, ...(sourceRefs.length ? { sourceRefs } : {}) }, ...value.countries]
          }));
          finishCreated("country", id);
        } else if (kind === "story") {
          const out = await window.aiContinueStory(world, currentYear, focusId, hint);
          setStory(out);
        }
        if (kind !== "story") setHint("");
      } catch (error) {
        setErr(String(error.message || error));
      }
      setBusy(null);
    }

    async function onAIFill(kind, id) {
      if (!aiAvailable || typeof window.claude?.complete !== "function") {
        setErr(readOnly ? "AI writing is available in the local workspace." : "AI runtime is not available in this browser.");
        return;
      }
      setBusy("fill");
      setErr(null);
      try {
        const key = kind === "character" ? "characters" : kind === "organization" ? "organizations" : "countries";
        const ent = world[key].find((entity) => entity.id === id);
        const out = await window.aiFillEntity(world, kind, ent, currentYear);
        if (out.snapshot) {
          const snap = out.snapshot;
          const sourceRefs = sourceRefsForNewRecord();
          const expanded = {
            year: snap.year || currentYear,
            leader: snap.leader,
            members: snap.members,
            status: snap.status,
            body: snap.body,
            territory: snap.territory || "",
            ...(sourceRefs.length ? { sourceRefs } : {})
          };
          if (kind === "character") expanded.location = expandPlace(snap.place || snap.location?.name);
          if (kind === "organization") expanded.hq = expandPlace(snap.hq || snap.location?.name);
          if (kind === "country") expanded.capital = expandPlace(snap.capital || snap.location?.name);
          setEnt(key, id, { snapshots: [...(ent.snapshots || []), expanded] });
        }
        if (out.relationship && out.relationship.targetId) {
          const rel = out.relationship;
          const relId = uid("rl");
          const sourceRefs = sourceRefsForNewRecord();
          setWorld((value) => ({
            ...value,
            relationships: [
              ...(value.relationships || []),
              { id: relId, a: id, b: rel.targetId, kind: rel.kind || "ally", since: rel.since || currentYear, until: null, note: rel.note || "", ...(sourceRefs.length ? { sourceRefs } : {}) }
            ]
          }));
        }
      } catch (error) {
        setErr(String(error.message || error));
      }
      setBusy(null);
    }

    function onReset() {
      if (readOnly) return;
      if (!confirm(window.AEVEN_I18N?.t("Re-cast the world to its original seed? Edits will be lost.") || "Re-cast the world to its original seed? Edits will be lost.")) return;
      const fresh = window.StoryStore.normalizeWorld({ ...window.WORLD_SEED, storyId: activeStory?.id || "aevenmere" });
      setWorld(fresh);
      setCurrentYear(fresh.defaultYear);
      setFocusId(window.StoryStore.firstFocus(fresh));
      setSourceRange({ enabled: false, startKey: "", endKey: "" });
      setStory("");
      setHint("");
      setErr(null);
    }

    return {
      state: {
        world, setWorld: writableSetWorld,
        stories, activeStory, storyReady, storeMode, storyStatus, storyError,
        currentYear, setCurrentYear,
        folio, setFolio,
        focusId, setFocusId,
        currentEra, canUseStoryApi, readOnly, publicDemo, aiAvailable
      },
      sourceState: {
        sourceRange, setSourceRange,
        sourceIndex, sourceScope, scopedWorld,
        counts, totalCounts
      },
      storyActions: {
        onSelectStory, onCreateStory, onDuplicateStory, onRenameStory, onArchiveStory,
        onImportStoryFile, onExportStoryTemplate
      },
      entityActions: {
        setEnt, delEnt,
        updateEvent, deleteEvent, updateChar, deleteChar, updateOrg, deleteOrg, updateCountry, deleteCountry,
        snapMutator, addRel, updateRel, deleteRel, sourceRefsForNewRecord, withCurrentSourceRef,
        addBlankEvent, addBlankChar, addBlankOrg, addBlankCountry, onReset
      },
      aiActions: {
        story, setStory,
        hint, setHint,
        busy, err, setErr,
        onAI, onAIFill
      }
    };
  }

  window.useAevenmereWorkspace = useAevenmereWorkspace;
})();
