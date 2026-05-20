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
    return y < 0 ? `${-y} BR` : `${y} AR`;
  }
  function placeOf(world, locOrPlaceId) {
    if (!locOrPlaceId) return null;
    if (typeof locOrPlaceId === "string") return world.places.find((p) => p.id === locOrPlaceId) || null;
    return locOrPlaceId; // {x,y,name}
  }
  return { entityAlive, snapAt, entityLifespan, findEntity, entityKind, entityName, relsFor, eventsForEntity, yearLabel, placeOf };
})();
