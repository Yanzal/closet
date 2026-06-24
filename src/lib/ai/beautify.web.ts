/**
 * Background removal — web fallback.
 *
 * Tries a configured remote endpoint first (fast, and avoids running a model on the main thread),
 * then falls back to an in-browser model. The @imgly library is loaded from a CDN at runtime rather
 * than bundled: it depends on onnxruntime-web, whose source uses a dynamic `import()` that Metro
 * (Expo's bundler) cannot transform — bundling it breaks the web build. A runtime CDN import keeps it
 * out of Metro's graph. The model + WASM run 100% in the browser. See APPLE_INTELLIGENCE.md.
 */
import { remoteRemoveBackground } from '@/lib/ai/remote';

type ImglyConfig = {
  device?: 'cpu' | 'gpu';
  model?: 'isnet' | 'isnet_fp16' | 'isnet_quint8';
  output?: { format?: string; quality?: number };
};
type ImglyModule = { removeBackground: (src: string, config?: ImglyConfig) => Promise<Blob> };

let modPromise: Promise<ImglyModule> | null = null;

function loadImgly(): Promise<ImglyModule> {
  if (!modPromise) {
    // Assembled at runtime so Metro can't statically resolve (and try to bundle) the package.
    const cdn = ['https://esm.sh/@imgly', 'background-removal@1.7.0'].join('/');
    modPromise = import(/* webpackIgnore: true */ /* @vite-ignore */ cdn) as Promise<ImglyModule>;
  }
  return modPromise;
}

// Speed-tuned config: the quantised model + WebGPU are dramatically faster than the default full
// model on CPU, at a small quality cost that's invisible for closet thumbnails.
const FAST_CONFIG: ImglyConfig = {
  device: 'gpu',
  model: 'isnet_quint8',
  output: { format: 'image/png' },
};

/** Warm up the model in the background so the first real beautify is fast. Safe to call repeatedly. */
export function preloadBeautify(): void {
  void loadImgly().catch(() => {});
}

export async function removeBackgroundFallback(uri: string): Promise<string> {
  // Prefer a configured remote endpoint (fast; no main-thread model).
  const remote = await remoteRemoveBackground(uri);
  if (remote) return remote;

  const { removeBackground } = await loadImgly();

  // Transparent-background PNG of just the subject.
  const cutout = await removeBackground(uri, FAST_CONFIG);

  // Composite the cutout over white so it reads as a product shot.
  const bitmap = await createImageBitmap(cutout);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return uri;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close?.();

  return canvas.toDataURL('image/jpeg', 0.9);
}
