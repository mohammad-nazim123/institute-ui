/**
 * crypto.js — Hardened AES-GCM encryption using the native Web Crypto API.
 *
 * Security properties:
 *  • AES-256-GCM with a random 96-bit IV per write — authenticated encryption,
 *    meaning tampered ciphertext is detected and rejected on read.
 *  • Key derived via PBKDF2-SHA-256 with 300,000 iterations from:
 *      passphrase  +  device fingerprint  +  fixed salt
 *    This makes the encrypted blob device-specific: data exported from the
 *    browser's DevTools and pasted into another browser/machine will fail
 *    to decrypt.
 *  • A version prefix ("v2:") is prepended to every stored value.
 *    Any entry without the prefix is treated as invalid/stale and discarded.
 *
 * What this does NOT protect against:
 *  • An attacker who already has full control of the browser process.
 *  • XSS — if JS is injected, it can read values at runtime in memory.
 *    (httpOnly cookies are still the gold standard for that threat.)
 */

const VERSION = 'v2:';
const PASSPHRASE = 'edu-connect-secure-storage-2025';
const FIXED_SALT = 'edu-salt-pepper-v2';
const PBKDF2_ITERATIONS = 300_000;

// ─── Device fingerprint ──────────────────────────────────────────────────────
// Combines stable browser attributes. Not 100% unique but makes the key
// machine/browser-specific at near-zero cost.
function deviceFingerprint() {
  try {
    const parts = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      screen.pixelDepth,
      String(Intl.DateTimeFormat().resolvedOptions().timeZone),
    ];
    return parts.join('|');
  } catch {
    return 'fallback';
  }
}

// ─── Derived key (cached per page load) ─────────────────────────────────────
let _cachedKey = null;

async function getDerivedKey() {
  if (_cachedKey) return _cachedKey;

  const enc = new TextEncoder();
  const combinedPassphrase = PASSPHRASE + '::' + deviceFingerprint();

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(combinedPassphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  _cachedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(FIXED_SALT),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return _cachedKey;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function uint8ToB64(buf) {
  return btoa(String.fromCharCode(...buf));
}
function b64ToUint8(b64) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Encrypt a plain-text string.
 * Returns a versioned, base64-encoded string: "v2:<iv_b64>:<ciphertext_b64>"
 */
export async function encryptValue(plainText) {
  const key = await getDerivedKey();
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const cipherBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plainText)
  );
  return `${VERSION}${uint8ToB64(iv)}:${uint8ToB64(new Uint8Array(cipherBuf))}`;
}

/**
 * Decrypt a string produced by encryptValue().
 * Returns the original plain-text, or null on failure (wrong device,
 * tampered data, missing version prefix, etc.).
 */
export async function decryptValue(encrypted) {
  try {
    if (!encrypted || !encrypted.startsWith(VERSION)) return null;
    const body = encrypted.slice(VERSION.length);
    const [ivB64, ctB64] = body.split(':');
    if (!ivB64 || !ctB64) return null;

    const key = await getDerivedKey();
    const iv = b64ToUint8(ivB64);
    const ct = b64ToUint8(ctB64);

    const plainBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ct
    );
    return new TextDecoder().decode(plainBuf);
  } catch {
    // Decryption failure = tampered, wrong device, or stale entry
    return null;
  }
}
