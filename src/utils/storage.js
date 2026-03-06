/**
 * storage.js — Secure encrypted localStorage utility
 *
 * All sensitive values (tokens, IDs, keys) are AES-GCM encrypted before
 * being written to localStorage, so they are never visible as plain text
 * in DevTools → Application → Local Storage.
 *
 * Values persist across browser restarts (unlike sessionStorage).
 *
 * API:
 *   setSecure(key, value)        → Promise<void>
 *   getSecure(key)               → Promise<string | null>
 *   removeSecure(key)            → void   (sync, just removes the entry)
 *
 * All named helpers (setToken, getToken, ...) are async wrappers around
 * the above primitives.
 *
 * `local` is also exported as a plain (unencrypted) wrapper for non-sensitive
 * UI preferences (e.g. attendance class/branch/semester selections).
 */

import { encryptValue, decryptValue } from './crypto';

// ─────────────────────────────────────────────────────────────────────────────
// Plain localStorage wrapper (for non-sensitive UI prefs)
// ─────────────────────────────────────────────────────────────────────────────
export const local = {
  get:    (key)       => { try { return localStorage.getItem(key); }  catch { return null; } },
  set:    (key, val)  => { try { localStorage.setItem(key, val != null ? String(val) : ''); } catch {} },
  remove: (key)       => { try { localStorage.removeItem(key); }       catch {} },
};

// ─────────────────────────────────────────────────────────────────────────────
// Low-level encrypted localStorage primitives
// ─────────────────────────────────────────────────────────────────────────────

export async function setSecure(key, value) {
  if (value == null) return;
  const encrypted = await encryptValue(String(value));
  localStorage.setItem(key, encrypted);
}

export async function getSecure(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  return decryptValue(raw);
}

export function removeSecure(key) {
  localStorage.removeItem(key);
}

// ─────────────────────────────────────────────────────────────────────────────
// Named helpers for every key used across the app (all async)
// ─────────────────────────────────────────────────────────────────────────────

// Auth tokens
export const getToken        = ()    => getSecure('my_token');
export const setToken        = (val) => setSecure('my_token', val);
export const removeToken     = ()    => removeSecure('my_token');

export const getRefreshToken    = ()    => getSecure('my_refresh_token');
export const setRefreshToken    = (val) => setSecure('my_refresh_token', val);
export const removeRefreshToken = ()    => removeSecure('my_refresh_token');

// Admin credentials
export const getAdminKey    = ()    => getSecure('admin_unique_and_secure_id');
export const setAdminKey    = (val) => setSecure('admin_unique_and_secure_id', val);
export const removeAdminKey = ()    => removeSecure('admin_unique_and_secure_id');

// Institute ID
export const getInstitute    = ()    => getSecure('institute');
export const setInstitute    = (val) => setSecure('institute', val);
export const removeInstitute = ()    => removeSecure('institute');

// Student DB id
export const getStudentId    = ()    => getSecure('student');
export const setStudentId    = (val) => setSecure('student', val);
export const removeStudentId = ()    => removeSecure('student');

// Student personal unique key (sent as X-Personal-Key header)
export const getStudentUniqueId    = ()    => getSecure('student_unique_id');
export const setStudentUniqueId    = (val) => setSecure('student_unique_id', val);
export const removeStudentUniqueId = ()    => removeSecure('student_unique_id');

// Professor IDs / keys
export const getProfessorId    = ()    => getSecure('professor');
export const setProfessorId    = (val) => setSecure('professor', val);
export const removeProfessorId = ()    => removeSecure('professor');

export const getProfessorDbId  = ()    => getSecure('professor_id');
export const setProfessorDbId  = (val) => setSecure('professor_id', val);

export const getProfessorKey   = ()    => getSecure('professor_key');
export const setProfessorKey   = (val) => setSecure('professor_key', val);

// ─────────────────────────────────────────────────────────────────────────────
// Convenience: clear all auth data (logout helper)
// ─────────────────────────────────────────────────────────────────────────────
export const clearSession = () => {
  removeToken();
  removeRefreshToken();
  removeAdminKey();
  removeInstitute();
  removeStudentId();
  removeStudentUniqueId();
  removeProfessorId();
  removeSecure('professor_id');
  removeSecure('professor_key');
};
