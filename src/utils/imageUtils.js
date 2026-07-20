// ─── Image URL Normalization Utilities ───
// Fixes broken images caused by the backend storing localhost URLs in the database.
// Every product photo, video, and document URL passes through normalizeImageUrl()
// before being rendered, ensuring all media loads from the production backend.

import { safeParseJSON } from './helpers';

/**
 * The backend base URL (without /api suffix).
 * Derived from VITE_API_BASE_URL: "https://backend.dealskb.com/api" → "https://backend.dealskb.com"
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
export const BACKEND_BASE_URL = API_BASE.replace(/\/api\/?$/, '');

/**
 * Placeholder image shown when the real image fails to load.
 * Minimal SVG data-URI with an "image unavailable" icon.
 */
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' fill='none'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='46%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui,sans-serif' font-size='14' font-weight='700' fill='%2394a3b8'%3EImage unavailable%3C/text%3E%3Cpath d='M188 140h24l-6 8h8l-14 16 4-12h-8z' fill='%23cbd5e1'/%3E%3C/svg%3E";

/**
 * Normalizes any image/media URL to an absolute production URL.
 *
 * Handles these cases:
 *  1. null / undefined / empty string  → returns ''
 *  2. data: URIs (base64 previews)     → returned as-is
 *  3. blob: URIs (local file previews) → returned as-is
 *  4. Absolute external URLs (https://images.unsplash.com/...) → returned as-is
 *  5. localhost URLs (http://localhost:XXXX/uploads/file.jpg)   → rewritten to BACKEND_BASE_URL + /uploads/file.jpg
 *  6. 127.0.0.1 URLs                                          → same treatment as localhost
 *  7. Relative paths starting with /uploads/                   → prepended with BACKEND_BASE_URL
 *  8. Bare filenames (abc123.jpg)                              → converted to BACKEND_BASE_URL + /uploads/ + filename
 *
 * @param {string|null|undefined} path — The raw URL from the backend
 * @returns {string} — A fully resolved, absolute URL safe for rendering
 */
export function normalizeImageUrl(path) {
  if (!path || typeof path !== 'string') return '';

  const trimmed = path.trim();
  if (!trimmed) return '';

  // 1. Data URIs and blob URIs — pass through
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // 2. Absolute URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // Check for localhost or 127.0.0.1 — rewrite to production
    const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i;
    if (localhostPattern.test(trimmed)) {
      // Extract the path portion after the host:port
      const urlPath = trimmed.replace(localhostPattern, '');
      if (import.meta.env.DEV) {
        console.warn('[normalizeImageUrl] Rewriting localhost URL:', trimmed, '→', BACKEND_BASE_URL + urlPath);
      }
      return BACKEND_BASE_URL + urlPath;
    }
    // External URL (unsplash, etc.) — pass through
    return trimmed;
  }

  // 3. Relative path starting with /uploads/
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/uploads\\')) {
    return BACKEND_BASE_URL + trimmed;
  }

  // 4. Relative path starting with uploads/ (no leading slash)
  if (trimmed.startsWith('uploads/') || trimmed.startsWith('uploads\\')) {
    return BACKEND_BASE_URL + '/' + trimmed;
  }

  // 5. Any other relative path starting with /
  if (trimmed.startsWith('/')) {
    return BACKEND_BASE_URL + trimmed;
  }

  // 6. Bare filename — assume it's in /uploads/
  return BACKEND_BASE_URL + '/uploads/' + trimmed;
}

/**
 * Parses a photos JSON string (or array) and normalizes every URL in the array.
 *
 * @param {string|Array|null} photosData — Raw `product.photos` from the backend (JSON string or array)
 * @param {Array} fallback — Fallback if parsing fails
 * @returns {string[]} — Array of normalized, absolute image URLs
 */
export function normalizePhotosArray(photosData, fallback = []) {
  const arr = safeParseJSON(photosData, fallback);
  if (!Array.isArray(arr)) return fallback;
  return arr.map(normalizeImageUrl).filter(Boolean);
}


export function getProductCoverImage(product) {
  if (!product) return '';
  const cover = product.cover_image || product.side_view_image;
  if (cover) return normalizeImageUrl(cover);
  const photos = normalizePhotosArray(product.photos, []);
  return photos[0] || '';
}

export function getProductGalleryImages(product) {
  if (!product) return [];
  const photos = normalizePhotosArray(product.photos, []);
  const cover = getProductCoverImage(product);
  const ordered = cover ? [cover, ...photos.filter((photo) => photo !== cover)] : photos;
  return Array.from(new Set(ordered));
}

/**
 * onError handler for <img> elements.
 * Swaps in a placeholder image and logs the failed URL in development.
 *
 * Usage: <img src={url} onError={handleImageError} />
 *
 * @param {React.SyntheticEvent<HTMLImageElement>} event
 */
export function handleImageError(event) {
  const img = event.currentTarget;
  // Prevent infinite loop if placeholder itself fails
  if (img.src === PLACEHOLDER_IMAGE) return;

  if (import.meta.env.DEV) {
    console.warn('[handleImageError] Failed to load image:', img.src);
  }
  img.src = PLACEHOLDER_IMAGE;
}
