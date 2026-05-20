// Drawing helpers — simplify, smooth (Chaikin), polygon util.

window.DRAW = (function () {
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }

  function simplify(pts, minDist) {
    minDist = minDist || 6;
    const out = [];
    for (const p of pts) {
      if (out.length === 0 || dist(p, out[out.length - 1]) >= minDist) out.push(p);
    }
    return out;
  }

  // Closed-curve Chaikin corner cutting
  function chaikin(pts, iters) {
    iters = iters == null ? 2 : iters;
    let cur = pts;
    for (let k = 0; k < iters; k++) {
      const n = cur.length;
      if (n < 3) break;
      const next = [];
      for (let i = 0; i < n; i++) {
        const p = cur[i];
        const q = cur[(i + 1) % n];
        next.push([0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]]);
        next.push([0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1]]);
      }
      cur = next;
    }
    return cur;
  }

  // Ensure CCW + close
  function cleanup(pts) {
    if (pts.length < 3) return pts;
    // Optionally drop trailing point too close to first
    if (dist(pts[0], pts[pts.length - 1]) < 4) pts = pts.slice(0, -1);
    return pts;
  }

  function pointsToStr(pts) {
    return pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  }
  function strToPoints(str) {
    if (!str) return [];
    return str.split(/\s+/).filter(Boolean).map((s) => s.split(",").map(Number));
  }

  // Smooth a freehand polyline into a closed, near-smooth polygon
  function smoothFreehand(rawPts) {
    let p = simplify(rawPts, 8);
    p = cleanup(p);
    if (p.length < 3) return [];
    p = chaikin(p, 3);
    return p;
  }

  // SVG polygon point-in-polygon (ray casting)
  function pointInPoly(pt, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1];
      const xj = poly[j][0], yj = poly[j][1];
      const intersect = (yi > pt[1]) !== (yj > pt[1]) &&
        pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi + 1e-9) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  // Cheap overlap check: any vertex of A in B, or vice versa, or bbox intersect with line crossings.
  function polysOverlap(aStr, bStr) {
    const A = strToPoints(aStr); const B = strToPoints(bStr);
    if (A.length < 3 || B.length < 3) return false;
    // bbox cull
    const bb = (P) => {
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const p of P) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
      return [x0, y0, x1, y1];
    };
    const [ax0, ay0, ax1, ay1] = bb(A);
    const [bx0, by0, bx1, by1] = bb(B);
    if (ax1 < bx0 || bx1 < ax0 || ay1 < by0 || by1 < ay0) return false;
    for (const p of A) if (pointInPoly(p, B)) return true;
    for (const p of B) if (pointInPoly(p, A)) return true;
    // segment-segment: O(nm) — acceptable for small polys
    function segCross(p1, p2, p3, p4) {
      const d = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
      const d1 = d(p3, p4, p1), d2 = d(p3, p4, p2), d3 = d(p1, p2, p3), d4 = d(p1, p2, p4);
      return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
    }
    for (let i = 0; i < A.length; i++) {
      const a1 = A[i], a2 = A[(i + 1) % A.length];
      for (let j = 0; j < B.length; j++) {
        const b1 = B[j], b2 = B[(j + 1) % B.length];
        if (segCross(a1, a2, b1, b2)) return true;
      }
    }
    return false;
  }

  return { simplify, chaikin, cleanup, pointsToStr, strToPoints, smoothFreehand, polysOverlap };
})();
