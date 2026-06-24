# Closet — your digital wardrobe 👗

A digital closet app: register your clothes from a photo, build outfits, plan by calendar/trip,
and learn your wearing patterns. Built with **Expo (React Native) + TypeScript + Expo Router** so the
**same code** runs in a browser (for testing on Windows) and compiles to a real **iPhone** app on a Mac.

## Run it now (Windows / this PC)

```powershell
npm install
npx expo start --web
```

Then open **http://localhost:8081** in your browser. (The window may open automatically.)

- **Test on your iPhone without a Mac:** install **Expo Go** from the App Store, run `npx expo start`,
  and scan the QR code shown in the terminal.

## Build for iPhone (later, on your Mac)

```bash
npm install
npx expo run:ios          # builds & runs in the iOS Simulator / a connected device (needs Xcode)
# or, for an installable / App Store build without a local Xcode setup:
npx eas build -p ios
```

## What works today

- **5-tab shell** — Home · Closet · ＋ · Outfit · Explore, with the center ＋ opening the Add sheet.
- **Closet** — All Clothes + create your own closets (name + pick items); items grid with category tabs;
  full item detail (colours, seasons, price, wear count, "log a wear").
- **Add item** — take/upload a photo, then tag category, brand, colours, season, price. Saved on-device.
- **Outfit builder** — drag items onto a canvas (smooth, mouse + touch), scale/layer/remove, name and save
  looks; edit or delete later.
- **Calendar** — open from any header; a month grid where you tap a day to plan a saved outfit, with
  OOTD / most-worn / closet-value stats.
- **Trips & packing** — create a trip, see the live weather forecast per day (Open-Meteo, no key), assign
  outfits to each day, and keep an editable packing checklist.
- **Style stats** — category breakdown, most-worn, "gathering dust" (never-worn), cost-per-wear, closet value.
- **Find my colour** — a quick quiz that returns your seasonal palette (e.g. Deep Autumn) with best colours.
- **Home** — greeting, AI-stylist hub, a daily-look preview, recently-added items, and a first-run onboarding state.
- A **sample wardrobe** is seeded on first launch. Everything you add persists locally.

### Deliberately not built yet (gated on your on-device AI / a backend; clearly marked in-app)

- **AI photo → clean flat image** (you're choosing the on-device model first) — photos are stored as-is.
- **AI stylist** features (outfit suggestion, style chat, find-my-fit, virtual try-on) — show a "coming soon" screen.
- **Beautify**, and the **social Explore feed / sharing** — later, once a backend/model is chosen.

## Project layout

```
src/
  app/                 # Expo Router routes (file-based)
    (tabs)/            # Home, Closet, Outfit, Explore + the custom tab bar
    add.tsx            # Add-item flow (modal)
    collection/[id]    # items in a collection / All Clothes
    item/[id]          # item detail
    outfit/builder, outfit/[id]   # outfit canvas builder + saved-outfit detail
    trip/new, trip/[id]           # create a trip + trip detail (weather + packing)
  components/          # UI building blocks (ui/ = primitives)
  constants/theme.ts   # design tokens (colors, spacing, radius, shadows)
  store/closet.ts      # local-first data store (zustand + AsyncStorage)
  lib/                 # types, categories, sample seed data
Mockup/                # the designer mockups this UI is built from
```

## Notes

- Light-mode only, to match the mockups.
- Images are stored as compressed data-URLs for simple cross-platform persistence (fine for testing;
  we'll move to file storage on device in a later pass).
