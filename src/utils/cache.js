export const appCache = new Map();

export function clearCache(keyPrefix) {
  if (keyPrefix) {
    for (const key of appCache.keys()) {
      if (key.startsWith(keyPrefix)) {
        appCache.delete(key);
      }
    }
  } else {
    appCache.clear();
  }
}
