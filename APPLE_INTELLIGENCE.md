# Apple Intelligence integration (do this on the Mac)

The app's "AI" features are designed to run **100% on-device** via Apple Intelligence — no cloud,
matching the privacy goal. This must be built and tested **on a Mac with Xcode**, because the
frameworks are iOS-only and do not exist on web or in Expo Go.

## What runs where, today

| Feature | Works now (web + iOS) | Upgrade with Apple Intelligence |
| --- | --- | --- |
| Outfit suggestion | Heuristic (`src/lib/ai/stylist.ts`) | Foundation Models for smarter, prompt-driven looks |
| Rate my style | Heuristic scorer | Foundation Models critique |
| Find my colour | Local quiz | (already good — no AI needed) |
| Beautify (photo → flat image) | No-op (stores photo as-is) | Vision subject-lift → white-background product shot |
| Style chat | "Coming soon" screen | Foundation Models chat |
| Find my fit / Try-on | "Coming soon" screen | Vision body analysis / AR |

The JS already has the seam: **`src/lib/ai/native.ts`** loads an optional native module `ClosetAI`
and exposes `beautifyToFlatImage()` + `nativeAI.generate()`. When the native module is absent (web,
Expo Go) it falls back automatically.

## 1. Create the native module (on the Mac)

```bash
npx create-expo-module@latest --local ClosetAI
npx expo prebuild -p ios            # generates the ios/ project
```

Set the iOS deployment target to **17.0+** (Vision subject lift) and **18.1+ / 26** for Foundation Models.

## 2. Beautify — Vision foreground mask (iOS 17+)

In `modules/ClosetAI/ios/ClosetAIModule.swift`, implement `liftSubject(uri)`:

```swift
import Vision
import CoreImage

// 1. Load the image at `uri`.
// 2. let request = VNGenerateForegroundInstanceMaskRequest()
//    try VNImageRequestHandler(ciImage: input).perform([request])
// 3. let mask = try request.generateMaskedImage(ofInstances: request.allInstances,
//                                                from: handler, croppedToInstancesExtent: true)
// 4. Composite the masked subject over a white background, write a JPEG to cache,
//    and resolve with the new file URI.
```

Expose it to JS with the Expo Modules API:

```swift
AsyncFunction("liftSubject") { (uri: String) -> String in
  return try liftSubjectToFlatImage(uri)   // returns a file:// URI
}
```

`beautifyToFlatImage()` in `native.ts` will then return the clean image; it is already called from
the add-item flow (`src/app/add.tsx` → `toStoredImage`).

## 3. Stylist text — Foundation Models (iOS 26 / Apple Intelligence)

```swift
import FoundationModels

AsyncFunction("generate") { (prompt: String) -> String in
  let model = SystemLanguageModel.default
  guard case .available = model.availability else { return "" }   // fall back to heuristics
  let session = LanguageModelSession()
  let response = try await session.respond(to: prompt)
  return response.content
}
```

Then in `src/lib/ai/stylist.ts`, prefer `nativeAI.generate(...)` when
`appleIntelligenceAvailable`, parsing its reply back into item ids; otherwise use the current
heuristics. Build a prompt from the closet (item names + categories + colours + the day's weather).

## 4. Build & run (Mac only)

```bash
npx expo run:ios        # device or simulator with Apple Intelligence enabled
```

Apple Intelligence requires a supported device/simulator and the feature enabled in Settings. Always
keep the heuristic fallback so the app still works on web, older devices, and in Expo Go.
