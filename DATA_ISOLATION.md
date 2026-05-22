# Data Isolation

This project keeps public demo material and private writing data in separate roots.

- `stories/` is public demo/sample content. It is safe to keep in GitHub for showcasing the wiki shape.
- `.local/stories/` is the default private working root for `npm run dev` and `npm run dev:local`.
- `.local/`, `private-stories/`, and `stories-private/` are ignored by Git.
- The dev server refuses direct static requests for dot-paths and private story roots.
- `npm run dev:demo` opens the tracked demo story root. Changes made there can modify public sample files.

## Daily Use

Use the private root for normal writing:

```powershell
npm run dev
```

Use the demo root only when intentionally editing the public sample:

```powershell
npm run dev:demo
```

To keep private stories outside the repository entirely, pass an explicit root:

```powershell
node dev-server.mjs --host 127.0.0.1 --port 8789 --stories-root C:\Users\user\Documents\novel_elf_private_stories
```

## Backup

Back up the private story root, not only this Git repository. Recommended options:

- A versioned local or NAS backup of `.local/stories/` or the external `--stories-root`.
- An encrypted cloud backup using a tool such as restic, Kopia, or Cryptomator.
- A private Git repository only if you are comfortable with that host storing the content; encrypt first for sensitive work.

Before pushing public code, check that private files are not staged:

```powershell
git status --short --untracked-files=all
```

## Public GitHub Pages Demo

GitHub Pages is built through `.github/workflows/pages.yml` using:

```powershell
npm run test
npm run build:pages
```

The build writes `dist/runtime-config.js` with public-demo settings:

- `readOnly: true`
- `apiEnabled: false`
- `aiEnabled: false`
- `storageEnabled: false`

That means the deployed site showcases the tracked demo world only. Local Markdown APIs, private story roots, browser storage writes, and concrete AI writing/sync actions remain local-workspace concerns.
