# Moving this project to another machine

This zip excludes `node_modules/` and `.expo/` (reinstallable + machine-specific). Everything else —
source, the native `modules/ClosetAI` module, config, and `package-lock.json` — is included.

## Set up on the new PC

```bash
# 1. Unzip, then from the project folder:
npm install

# 2. Run on web (works on Windows/Mac/Linux):
npx expo start --web
#    → open http://localhost:8081

# 3. (Optional) run on your phone via Expo Go — same Wi-Fi, scan the QR:
npx expo start
```

Node 18+ required (this was last run on Node 24 LTS). If `node`/`npm` aren't found, install Node from
nodejs.org (or nvm). On Windows, use PowerShell or Git Bash.

## Optional: remote AI endpoints (.env)

Copy `.env.example` → `.env` and fill in URLs to enable beautify / stylist via a home server or cloud
API. Empty = the app uses on-device AI (iOS build only) / in-browser model (web) / heuristics.
Restart `expo start` after editing `.env`. A free local background-removal server is in
`scripts/beautify-server.py` (see its header for setup).

## What changed in the Mac session (so you know what's new)

- **AI seam + fallback chain** (`src/lib/ai/`): `native.ts`, `stylist.ts`, plus new `config.ts`,
  `remote.ts`, `beautify.ts` / `beautify.web.ts`. Order: Apple Vision/Foundation Models (native iOS) →
  remote endpoint (home/cloud) → web in-browser model → heuristic/original. See `APPLE_INTELLIGENCE.md`.
- **Native module** `modules/ClosetAI/` — Swift for Apple Vision subject-lift (`liftSubject`) and
  Foundation Models text (`generate`). Only compiles via EAS cloud build or Xcode 16+ on macOS 15+.
- **Web background removal** wired into the Add-item flow (loads `@imgly` from CDN at runtime).
- **Outfit suggestion** wired to the AI chain (`suggestOutfitSmart` in `src/app/stylist/suggest.tsx`).
- **Storage → IndexedDB on web** (`src/store/storage.ts` / `storage.web.ts`) so base64 images don't
  hit the localStorage ~5MB cap. Native still uses AsyncStorage. Existing localStorage data migrates
  automatically on first load.
- **EAS config** (`eas.json`) + `ios.bundleIdentifier` in `app.json` for a future cloud build.

## Current direction (decided on Mac)

Pivoting to ship as a **PWA on GitHub Pages** (free, no Apple Developer account, no 7-day reload;
"Add to Home Screen" on iPhone). Tradeoff: no on-device Apple Intelligence on web — beautify uses the
home `rembg` server or in-browser model; stylist uses heuristics or a remote LLM. The native module
stays staged for if an Apple Developer account is ever obtained.

**Next steps not yet done:** static-export config for GitHub Pages (base path, dynamic-route 404
fallback, PWA manifest/icons), then `npx expo export -p web` → push to `gh-pages`.
