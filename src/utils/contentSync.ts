import { UserProfile } from '../types';

const DELETED_IDS_KEY = 't2s_deleted_doc_ids_v1';
const USERS_REGISTRY_KEY = 't2s_users_registry_v1';
const SYNC_CHANNEL_NAME = 't2s_content_sync_channel';
const TAB_SESSION_ID = `tab_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export function sanitizeForFirestore<T>(input: T): T {
  if (input === null || input === undefined || typeof input !== 'object') {
    return input;
  }
  if (input instanceof Date) {
    return input;
  }
  // Preserve Firestore FieldValue sentinels (serverTimestamp, arrayUnion, increment)
  if (
    typeof (input as any)._methodName === 'string' ||
    typeof (input as any).isEqual === 'function'
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

export function getItemTimestampMs(item: any): number {
  if (!item) return 0;
  if (typeof item.updatedAtMs === 'number' && !isNaN(item.updatedAtMs)) {
    return item.updatedAtMs;
  }
  const u = item.updatedAt;
  if (!u) return 0;
  if (typeof u === 'number') return u;
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
  return 0;
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

  for (const item of secondaryList) {
    if (!item || !item.id || deletedIds.has(item.id)) continue;
    if (filterFn && !filterFn(item)) continue;
    map.set(item.id, item);
  }

  for (const item of primaryList) {
    if (!item || !item.id || deletedIds.has(item.id)) continue;
    if (filterFn && !filterFn(item)) continue;
    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, item);
    } else {
      const existingTs = getItemTimestampMs(existing);
      const incomingTs = getItemTimestampMs(item);
      // If existing has a strictly newer timestamp, keep existing's newer fields on top
      if (existingTs > 0 && incomingTs > 0 && existingTs > incomingTs) {
        map.set(item.id, { ...item, ...existing });
      } else if (existingTs > 0 && incomingTs === 0) {
        map.set(item.id, { ...item, ...existing });
      } else {
        map.set(item.id, { ...existing, ...item });
      }
    }
  }

  return Array.from(map.values());
}

export function normalizeCompletedDays(days: any): number[] {
  if (!Array.isArray(days)) return [];
  return Array.from(
    new Set(
      days
        .map(Number)
        .filter((n: number) => !isNaN(n) && n >= 1 && n <= 100)
    )
  ).sort((a, b) => a - b);
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

  let mergedDays: number[];
  if (forceReplaceDays) {
    mergedDays = bDays;
  } else if (latestResetTs > 0) {
    // If an admin explicitly reset the journey recently, prefer the record with the newer reset timestamp
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

  const base = aTs > bTs && !forceReplaceDays ? { ...b, ...a } : { ...a, ...b };

  const aXp = typeof a.xp === 'number' ? a.xp : 0;
  const bXp = typeof b.xp === 'number' ? b.xp : 0;
  const resolvedXp =
    forceReplaceDays || (bTs > aTs && b.xp !== undefined)
      ? bXp
      : Math.max(aXp, bXp, mergedDays.length * 100);
  const resolvedLevel = Math.floor(resolvedXp / 1000) + 1;

  const mergedPresence = Array.from(
    new Set([
      ...(Array.isArray(a.presenceDays) ? a.presenceDays : []),
      ...(Array.isArray(b.presenceDays) ? b.presenceDays : []),
    ])
  );

  const mergedReflections = {
    ...(a.dailyReflections || {}),
    ...(b.dailyReflections || {}),
  };

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
      forceReplaceDays && b.streak !== undefined
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
    premiumPaymentId:
      b.premiumPaymentId || a.premiumPaymentId || b.utrNumber || a.utrNumber || '',
    utrNumber:
      b.utrNumber || a.utrNumber || b.premiumPaymentId || a.premiumPaymentId || '',
    lastCompletedAt: b.lastCompletedAt || a.lastCompletedAt || null,
    lastCompletedDate: b.lastCompletedDate || a.lastCompletedDate || undefined,
    updatedAtMs: Math.max(aTs, bTs, Date.now()),
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
