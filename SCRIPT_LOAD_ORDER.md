# Script Load Order

Novel Elf currently runs as static HTML with React UMD bundles and in-browser Babel. There is no production precompile step yet, so entry file order is part of the runtime contract. When adding shared code, update this document and `ui-surface.test.mjs` together.

## Entry Points

- `index.html` is the deployment landing page. It loads `viewport-router.js` first so width-based redirects and `?view=` overrides happen before the user interacts with the page.
- `Aevenmere Atelier.html` is the desktop app entry. It declares `data-current="desktop"` on `viewport-router.js`.
- `Aevenmere Atelier - Mobile.html` is the mobile showcase entry. It declares `data-current="mobile"` on `viewport-router.js`.

## Runtime Libraries

Desktop and mobile app entries load these CDN scripts before any local `text/babel` files:

1. React UMD.
2. ReactDOM UMD.
3. Babel standalone.

All local `.jsx` files depend on Babel standalone being present. The production console may show Babel's standalone warning while this architecture remains in place; that warning is expected for the current static prototype, not a signal that app boot failed.

## Shared Data And Core

Load the non-Babel local scripts in this order before any UI component:

1. `i18n.js`
2. `data.js`
3. `core.js`
4. `story-import.js`
5. `story-store.js`
6. `draw.js`
7. `ai.js`

These scripts establish localization, seed data, world helpers, import helpers, persistence, canvas drawing helpers, and AI helper globals. `workspace-state.jsx` assumes this foundation exists.

## Shared Workspace Hook

Load `workspace-state.jsx` immediately after the shared data/core scripts and before all app UI. It exposes the single public workspace state global:

```js
window.useAevenmereWorkspace
```

Desktop and mobile app boots should consume this global instead of duplicating story, entity, AI, or source-loading state.

## Desktop UI Order

The desktop entry loads shared state first, then UI globals, then the app boot:

1. `workspace-state.jsx`
2. `map.jsx`
3. `timeline.jsx`
4. `inspector.jsx`
5. `details.jsx`
6. `codex.jsx`
7. `library.jsx`
8. `chapter.jsx`
9. `about.jsx`
10. `app.jsx`

`app.jsx` must stay last because it mounts the desktop React tree and expects the preceding component globals to exist.

## Mobile UI Order

The mobile entry loads shared state, the mobile-visible shared components, device/tweak utilities, then the mobile app:

1. `workspace-state.jsx`
2. `map.jsx`
3. `codex.jsx`
4. `ios-frame.jsx`
5. `tweaks-panel.jsx`
6. `about.jsx`
7. `mobile.jsx`
8. inline `Showcase` boot script

The inline boot script must stay after `mobile.jsx` because it renders `window.MobileApp`.

## Adding A Module

- If the module is plain JavaScript and provides data/core helpers, place it in the shared data/core block before the first dependent script.
- If the module is JSX and exposes a reusable UI global, place it before the app file that mounts it.
- If both desktop and mobile need it, add it to both entry files in the same relative dependency position.
- Update `ui-surface.test.mjs` when the entry order changes. Run `npm run test:ui` for the focused check and `npm run test` before final staging.

## Future Build Step

A small build step can eventually precompile the JSX files into browser-ready JavaScript and remove the Babel standalone runtime. Until that happens, this document and the UI boot-order test are the source of truth for safe static loading.
