// Only the heavier CG videos have alternate encodes. Keep every original URL
// intact for credits, high-quality viewing and existing project lookups.
export function getMediaSources(originalSrc) {
  const src = String(originalSrc || '');
  let name = null;
  try {
    const path = new URL(src, import.meta.url).pathname;
    name = path.match(/\/assets\/cg-studies-20261020\/((?:acer|character|rolex)-(?:film|demo|comparison)\.mp4)$/)?.[1];
  } catch { /* Preserve unknown sources without rewriting them. */ }
  const liteSrc = name ? new URL(`./assets/playback-lite/${name}`, import.meta.url).href : null;
  const preferLite = typeof window !== 'undefined' && (
    window.matchMedia('(pointer: coarse), (max-width: 900px)').matches ||
    navigator.connection?.saveData === true
  );
  const isLite = Boolean(liteSrc && preferLite);
  return { src: isLite ? liteSrc : src, originalSrc: src, liteSrc, isLite };
}
