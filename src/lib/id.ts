/** Tiny unique-id helper (no native crypto dependency, works on web + native). */
export function uid(prefix = ''): string {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
