import { UserProfile } from '../types';

const DELETED_IDS_KEY = 't2s_deleted_doc_ids_v1';
const USERS_REGISTRY_KEY = 't2s_users_registry_v1';
const SYNC_CHANNEL_NAME = 't2s_content_sync_channel';
const TAB_SESSION_ID = `tab_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const TIMESTAMP_FIELD_NAMES = new Set([
  'createdAt',
  'updatedAt',
  'lastLoginAt',
  'lastCompletedAt',
  'assignedAt',
  'premiumRequestDate',
  'premiumRequestedAt',
  'journeyResetAt',
]);

export function sanitizeForFirestore<T>(input: T): T {
  if (input === null || input === undefined || typeof input !== 'object') {
    return input;
  }
  if (input instanceof Date) {
    return input;
  }
  // Preserve Firestore FieldValue sentinels (serverTimestamp, arrayUnion, increment) and Timestamp instances
  if (
    typeof (input as any)._methodName === 'string' ||
    typeof (input as any).isEqual === 'function' ||
    typeof (input as any).toDate === 'function'
  ) {
    return input;
  }
  if (Array.isArray(input)) {
    return input
      .filter((v) => v !== undefined)
      .map((v) => sanitizeForFirestore(v)) as unknown as T;
  }
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(input as Record<string, any>)) {
    if (val !== undefined) {
      result[key] = sanitizeForFirestore(val);
    }
  }
  return result as T;
}

/**
 * Prepares an object for writing to Firestore so that it is 100% compatible
 * with both versions of the Talk2Society app sharing the same Firestore database.
 * Converts JSON-serialized Timestamp maps ({ seconds, nanoseconds }) and ISO strings
 * on timestamp fields into native JS Date objects (which Firestore stores as native Timestamps
 * supporting .toDate(), .toMillis(), and orderBy('createdAt', 'desc')).
 */
export function prepareForFirestoreWrite<T>(input: T, parentKey?: string): T {
  if (input === null || input === undefined) {
    return input;
  }
  if (typeof input !== 'object') {
    if (
      parentKey &&
      TIMESTAMP_FIELD_NAMES.has(parentKey) &&
      typeof input === 'string'
    ) {
      const parsed = Date.parse(input);
      if (!isNaN(parsed) && parsed > 0) {
        return new Date(parsed) as unknown as T;
      }
    }
    return input;
  }
  if (input instanceof Date) {
    return input;
  }
  // Preserve Firestore FieldValue sentinels and live Timestamp instances
  if (
    typeof (input as any)._methodName === 'string' ||
    typeof (input as any).isEqual === 'function' ||
    typeof (input as any).toDate === 'function'
  ) {
    return input;
  }
  // Convert JSON-serialized Firestore Timestamp { seconds, nanoseconds } back to Date
  const maybeSec =
    typeof (input as any).seconds === 'number'
      ? (input as any).seconds
      : typeof (input as any)._seconds === 'number'
        ? (input as any)._seconds
        : null;
  if (
    maybeSec !== null &&
    Object.keys(input as object).length <= 2 &&
    ('seconds' in (input as object) || '_seconds' in (input as object))
  ) {
    return new Date(maybeSec * 1000) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input
      .filter((v) => v !== undefined)
      .map((v) => prepareForFirestoreWrite(v)) as unknown as T;
  }

  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(input as Record<string, any>)) {
    if (val !== undefined) {
      result[key] = prepareForFirestoreWrite(val, key);
    }
  }
  return result as T;
}

function parseAnyTimestampMs(u: any): number {
  if (!u) return 0;
  if (typeof u === 'number' && !isNaN(u)) return u;
  if (typeof u === 'string') {
    const parsed = Date.parse(u);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof u?.toMillis === 'function') {
    return u.toMillis();
  }
  if (typeof u?.seconds === 'number') {
    return u.seconds * 1000;
  }
  if (typeof u?._seconds === 'number') {
    return u._seconds * 1000;
  }
  if (u instanceof Date) {
    return u.getTime();
  }
  return 0;
}

export function getItemTimestampMs(item: any): number {
  if (!item) return 0;
  const fromMsField =
    typeof item.updatedAtMs === 'number' && !isNaN(item.updatedAtMs)
      ? item.updatedAtMs
      : 0;
  const fromUpdatedAt = parseAnyTimestampMs(item.updatedAt);
  const fromCreatedAt = parseAnyTimestampMs(item.createdAt);
  return Math.max(fromMsField, fromUpdatedAt, fromCreatedAt);
}

export function getDeletedDocIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {}
  return new Set();
}

export function markDocDeleted(id: string): void {
  if (!id) return;
  try {
    const set = getDeletedDocIds();
    set.add(id);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function unmarkDocDeleted(id: string): void {
  if (!id) return;
  try {
    const set = getDeletedDocIds();
    if (set.has(id)) {
      set.delete(id);
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
    }
  } catch {}
}

export function mergeContentById<T extends { id: string }>(
  primaryList: T[],
  secondaryList: T[],
  filterFn?: (item: T) => boolean
): T[] {
  const deletedIds = getDeletedDocIds();
  const map = new Map<string, T>();

  const putItem = (item: T, isPrimary: boolean) => {
    if (!item || !item.id || deletedIds.has(item.id)) return;
    if (filterFn && !filterFn(item)) return;

    // Normalize isPremium / isVip so changes from either app version stay in sync
    const raw = item as any;
    const normalizedItem = { ...item } as any;
    if (typeof raw.isPremium === 'boolean') {
      normalizedItem.isPremium = raw.isPremium;
      normalizedItem.isVip = raw.isPremium;
    } else if (typeof raw.isVip === 'boolean') {
      normalizedItem.isPremium = raw.isVip;
      normalizedItem.isVip = raw.isVip;
    }

    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, normalizedItem as T);
      return;
    }

    const existingTs = getItemTimestampMs(existing);
    const incomingTs = getItemTimestampMs(normalizedItem);

    if (incomingTs > existingTs) {
      map.set(item.id, { ...existing, ...normalizedItem } as T);
    } else if (existingTs > incomingTs) {
      map.set(item.id, { ...normalizedItem, ...existing } as T);
    } else if (isPrimary) {
      map.set(item.id, { ...existing, ...normalizedItem } as T);
    }
  };

  for (const item of secondaryList) {
    putItem(item, false);
  }
  for (const item of primaryList) {
    putItem(item, true);
  }

  return Array.from(map.values());
}

export function normalizeCompletedDays(days: unknown): number[] {
  if (!Array.isArray(days)) return [];
  return Array.from(
    new Set(
      days
        .map((n) => Number(n))
        .filter((n) => !isNaN(n) && n >= 1 && n <= 100)
    )
  ).sort((a, b) => a - b);
}

function extractDailyReflections(obj: Record<string, any>): Record<string, string> {
  const out: Record<string, string> = {};
  if (obj?.dailyReflections && typeof obj.dailyReflections === 'object') {
    for (const [k, v] of Object.entries(obj.dailyReflections)) {
      if (typeof v === 'string' && v.trim()) {
        out[k] = v;
      }
    }
  }
  // Also recover top-level "dailyReflections.YYYY-MM-DD" fields written by the other app version's setDoc
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('dailyReflections.') && typeof v === 'string' && v.trim()) {
        const dateKey = k.slice('dailyReflections.'.length);
        if (dateKey) out[dateKey] = v;
      }
    }
  }
  return out;
}

export function mergeSingleUserProfile(
  older: Partial<UserProfile> | null | undefined,
  newer: Partial<UserProfile> | null | undefined,
  forceReplaceDays = false
): UserProfile {
  const a = (older || {}) as Record<string, any>;
  const b = (newer || {}) as Record<string, any>;

  const aTs = getItemTimestampMs(a);
  const bTs = getItemTimestampMs(b);
  const aResetTs = typeof a.journeyResetAtMs === 'number' ? a.journeyResetAtMs : 0;
  const bResetTs = typeof b.journeyResetAtMs === 'number' ? b.journeyResetAtMs : 0;
  const latestResetTs = Math.max(aResetTs, bResetTs);

  const aDays = normalizeCompletedDays(a.completedDays);
  const bDays = normalizeCompletedDays(b.completedDays);

  // Detect if the other app version performed an explicit Admin Reset in Firestore
  const isNewerExplicitReset =
    bTs > aTs &&
    Array.isArray(b.completedDays) &&
    b.completedDays.length === 0 &&
    b.xp === 0 &&
    b.lastCompletedAt === null;

  const effectiveForceReplace = forceReplaceDays || isNewerExplicitReset;

  let mergedDays: number[];
  if (effectiveForceReplace) {
    mergedDays = bDays;
  } else if (latestResetTs > 0) {
    if (bResetTs >= aResetTs && bTs >= aResetTs) {
      mergedDays = bDays;
    } else if (aResetTs > bResetTs && aTs >= bTs) {
      mergedDays = aDays;
    } else {
      mergedDays = Array.from(new Set([...aDays, ...bDays])).sort((x, y) => x - y);
    }
  } else {
    mergedDays = Array.from(new Set([...aDays, ...bDays])).sort((x, y) => x - y);
  }

  const base =
    aTs > bTs && !effectiveForceReplace ? { ...b, ...a } : { ...a, ...b };

  const aXp = typeof a.xp === 'number' ? a.xp : 0;
  const bXp = typeof b.xp === 'number' ? b.xp : 0;
  const resolvedXp =
    effectiveForceReplace || (bTs > aTs && b.xp !== undefined)
      ? bXp
      : Math.max(aXp, bXp, mergedDays.length * 100);
  const resolvedLevel = Math.floor(resolvedXp / 1000) + 1;

  const mergedPresence = Array.from(
    new Set([
      ...(Array.isArray(a.presenceDays) ? a.presenceDays : []),
      ...(Array.isArray(b.presenceDays) ? b.presenceDays : []),
    ])
  );

  const mergedReflections = effectiveForceReplace
    ? extractDailyReflections(b)
    : {
        ...extractDailyReflections(a),
        ...extractDailyReflections(b),
      };

  const resolvedTxnId =
    b.premiumRequestTransactionId ||
    b.premiumPaymentId ||
    b.utrNumber ||
    a.premiumRequestTransactionId ||
    a.premiumPaymentId ||
    a.utrNumber ||
    '';

  return {
    ...base,
    uid: b.uid || a.uid || b.id || a.id || '',
    email: (b.email || a.email || '').trim().toLowerCase(),
    displayName:
      b.displayName || a.displayName || 'Sovereign Practitioner',
    photoURL: b.photoURL || a.photoURL || '',
    completedDays: mergedDays,
    presenceDays: mergedPresence,
    dailyReflections: mergedReflections,
    xp: resolvedXp,
    level: resolvedLevel,
    streak:
      effectiveForceReplace && b.streak !== undefined
        ? b.streak
        : Math.max(Number(a.streak) || 0, Number(b.streak) || 0, 1),
    isStrategist:
      bTs >= aTs && b.isStrategist !== undefined
        ? Boolean(b.isStrategist)
        : Boolean(a.isStrategist || b.isStrategist),
    premiumRequestStatus:
      bTs >= aTs && b.premiumRequestStatus !== undefined
        ? b.premiumRequestStatus
        : a.premiumRequestStatus || b.premiumRequestStatus || 'none',
    premiumRequestTransactionId: resolvedTxnId,
    premiumPaymentId: resolvedTxnId,
    utrNumber: resolvedTxnId,
    lastCompletedAt: effectiveForceReplace
      ? b.lastCompletedAt ?? null
      : b.lastCompletedAt || a.lastCompletedAt || null,
    lastCompletedDate: effectiveForceReplace
      ? b.lastCompletedDate || undefined
      : b.lastCompletedDate || a.lastCompletedDate || undefined,
    updatedAtMs: Math.max(aTs, bTs),
  } as UserProfile;
}

export function getCachedUsersRegistry(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_REGISTRY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveUsersRegistry(users: UserProfile[]): void {
  try {
    localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
  } catch {}
}

export function mergeUsersLists(
  primaryUsers: UserProfile[],
  secondaryUsers: UserProfile[]
): UserProfile[] {
  const deletedIds = getDeletedDocIds();
  const byUid = new Map<string, UserProfile>();
  const emailToUid = new Map<string, string>();

  const processUser = (u: UserProfile, isPrimary: boolean) => {
    if (!u) return;
    const uid = u.uid || (u as any).id;
    if (!uid || deletedIds.has(uid)) return;
    const email = (u.email || '').trim().toLowerCase();
    const existingUid = byUid.has(uid)
      ? uid
      : email && emailToUid.has(email)
        ? emailToUid.get(email)!
        : null;

    if (!existingUid) {
      const normalized = mergeSingleUserProfile(null, { ...u, uid });
      byUid.set(uid, normalized);
      if (email) emailToUid.set(email, uid);
    } else {
      const current = byUid.get(existingUid)!;
      const merged = isPrimary
        ? mergeSingleUserProfile(current, { ...u, uid: existingUid })
        : mergeSingleUserProfile({ ...u, uid: existingUid }, current);
      byUid.set(existingUid, merged);
      if (email) emailToUid.set(email, existingUid);
    }
  };

  for (const u of secondaryUsers) {
    processUser(u, false);
  }
  for (const u of primaryUsers) {
    processUser(u, true);
  }

  return Array.from(byUid.values()).sort((a, b) => (b.xp || 0) - (a.xp || 0));
}

export function broadcastContentUpdate(
  collectionName: string,
  payload?: unknown
): void {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
      bc.postMessage({
        collectionName,
        payload,
        senderId: TAB_SESSION_ID,
        ts: Date.now(),
      });
      bc.close();
    }
  } catch {}
  try {
    window.dispatchEvent(
      new CustomEvent('t2s-local-content-updated', {
        detail: { collectionName, payload, senderId: TAB_SESSION_ID },
      })
    );
  } catch {}
}

export function subscribeContentBroadcast(
  callback: (collectionName: string) => void
): () => void {
  let bc: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
      bc.onmessage = (ev) => {
        if (
          ev?.data?.collectionName &&
          ev?.data?.senderId !== TAB_SESSION_ID
        ) {
          callback(ev.data.collectionName);
        }
      };
    }
  } catch {}

  const handleCustom = (ev: Event) => {
    const detail = (ev as CustomEvent)?.detail;
    if (detail?.collectionName && detail?.senderId !== TAB_SESSION_ID) {
      callback(detail.collectionName);
    }
  };

  const handleStorage = () => {
    callback('all');
  };

  window.addEventListener('t2s-local-content-updated', handleCustom);
  window.addEventListener('storage', handleStorage);

  return () => {
    if (bc) {
      try {
        bc.close();
      } catch {}
    }
    window.removeEventListener('t2s-local-content-updated', handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
}

export async function pushServerSync(
  collection: string,
  action: 'set' | 'delete',
  docId: string,
  data?: any
): Promise<void> {
  try {
    const cleanData = data ? sanitizeForFirestore(data) : undefined;
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection, action, docId, data: cleanData }),
    });
  } catch {}
}

export async function fetchServerSync(): Promise<{
  users?: any[];
  archives?: any[];
  library?: any[];
  journey?: any[];
  shop?: any[];
  announcements?: any[];
  vip_gates?: any;
  deletedIds?: string[];
} | null> {
  try {
    const res = await fetch('/api/sync', {
      method: 'GET',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
