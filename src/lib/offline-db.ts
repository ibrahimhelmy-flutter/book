/**
 * Offline packs, one per catalog part (grade/book/term).
 *
 * The files of a pack live in CacheStorage (cache `packCacheName(partKey)`, filled by public/sw.js
 * from the build-time list `/offline/<grade>__<book>__<part>.json`). IndexedDB only keeps one small
 * record per downloaded pack, so the UI knows what is on the device and whether it is up to date.
 * No student / user tracking data is stored here.
 */
import type { PartKey, PartManifest } from "@/types/catalog";
import { getAssetPath } from "@/lib/utils";

const DB_NAME = "EgyptianAICurriculumDB";
const DB_VERSION = 2;
const PACKS_STORE = "packs";
/** v1 stores (whole-curriculum copy); dropped on upgrade. */
const LEGACY_STORES = ["curriculum", "questions", "contentMetadata"];

/** Must equal APP_VERSION in public/sw.js (cache names derive from it). */
export const APP_VERSION = "2.0.0";
/** Must equal CONTENT_VERSION in public/sw.js. Bump both together, or neither. */
export const CURRENT_CONTENT_VERSION = "2026.10.15";
/** Prefix of every per-part pack cache; sw.js keeps caches with this prefix on activate. */
export const PACK_CACHE_PREFIX = `ai-curriculum-pack-v${APP_VERSION}::`;

export function packCacheName(partKey: PartKey): string {
  return `${PACK_CACHE_PREFIX}${partKey}`;
}

/** Root-relative (no basePath) path of a part's build-time offline list. */
export function offlineListPath(partKey: PartKey): string {
  return `/offline/${partKey.split("/").join("__")}.json`;
}

export interface OfflinePackCounts {
  pages: number;
  data: number;
  images: number;
  assets: number;
}

/** Shape of out/offline/<grade>__<book>__<part>.json (written by scripts/build.mjs). */
export interface OfflinePackList {
  partKey: PartKey;
  contentHash: string;
  /** Hash of every file in the pack (build id left out): changes on any deploy that changes the pack. */
  packVersion?: string;
  /** Root-relative URLs without basePath; pages use the trailing-slash form plus their index.txt. */
  urls: string[];
  counts: OfflinePackCounts;
  /** Total size on disk of all listed files. */
  bytes?: number;
}

export interface OfflinePackRecord {
  partKey: PartKey;
  contentHash: string;
  /** OfflinePackList.packVersion at download time (missing on packs saved before it existed). */
  packVersion?: string;
  downloadedAt: string;
  fileCount: number;
  counts: OfflinePackCounts;
  sizeBytes?: number;
  /** APP_VERSION at download time; a different value means sw.js dropped the cache on activate. */
  appVersion?: string;
}

export type OfflinePackState = "none" | "ready" | "stale";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available"));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of LEGACY_STORES) {
        if (db.objectStoreNames.contains(name)) db.deleteObjectStore(name);
      }
      if (!db.objectStoreNames.contains(PACKS_STORE)) {
        db.createObjectStore(PACKS_STORE, { keyPath: "partKey" });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      // Let a newer tab upgrade the schema instead of being blocked by this connection.
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

async function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(PACKS_STORE, mode);
    const req = fn(tx.objectStore(PACKS_STORE));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function getPack(partKey: PartKey): Promise<OfflinePackRecord | null> {
  return (await run<OfflinePackRecord | undefined>("readonly", (s) => s.get(partKey))) ?? null;
}

export async function savePack(rec: OfflinePackRecord): Promise<void> {
  await run("readwrite", (s) => s.put({ appVersion: APP_VERSION, ...rec }));
}

export async function deletePack(partKey: PartKey): Promise<void> {
  await run("readwrite", (s) => s.delete(partKey));
}

export async function listPacks(): Promise<OfflinePackRecord[]> {
  return (await run<OfflinePackRecord[]>("readonly", (s) => s.getAll())) ?? [];
}

/**
 * "ready" when the record is up to date, "stale" when not. With the live list's `packVersion` (online)
 * any deploy that changed a file of the pack counts; without it, only a different contentHash does.
 */
export function packStateOf(
  record: OfflinePackRecord | null,
  contentHash: string,
  packVersion?: string | null
): OfflinePackState {
  if (!record) return "none";
  if (record.appVersion && record.appVersion !== APP_VERSION) return "stale";
  if (packVersion) return record.packVersion === packVersion ? "ready" : "stale";
  return record.contentHash === contentHash ? "ready" : "stale";
}

/**
 * The part's offline list as currently deployed, bypassing every cache (the page itself may be an
 * older cached copy). null when offline, or under `next dev` (the lists are written after the export).
 */
export async function fetchLiveOfflineList(partKey: PartKey): Promise<OfflinePackList | null> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return null;
  try {
    const res = await fetch(getAssetPath(offlineListPath(partKey)), { cache: "no-store" });
    if (!res.ok) return null;
    const list: OfflinePackList = await res.json();
    return Array.isArray(list.urls) && list.urls.length > 0 ? list : null;
  } catch {
    return null;
  }
}

/**
 * Pack state of a part on this device. Besides the IndexedDB record it checks that the pack cache
 * still exists (the browser may evict it, and an APP_VERSION bump makes sw.js delete it).
 * Online, the record is compared with the deployed offline list (`liveList`, fetched when not given),
 * so an update is detected even when the current page was served from an older cache.
 */
export async function getPackStatus(
  part: Pick<PartManifest, "key" | "contentHash">,
  liveList?: OfflinePackList | null
): Promise<{ state: OfflinePackState; record: OfflinePackRecord | null }> {
  try {
    const record = await getPack(part.key);
    const live = record ? (liveList === undefined ? await fetchLiveOfflineList(part.key) : liveList) : null;
    let state = packStateOf(record, live?.contentHash ?? part.contentHash, live?.packVersion);
    if (state !== "none" && typeof caches !== "undefined") {
      const hasCache = await caches.has(packCacheName(part.key)).catch(() => true);
      if (!hasCache) state = "stale";
    }
    return { state, record };
  } catch {
    return { state: "none", record: null };
  }
}
