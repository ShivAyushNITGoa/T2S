import fs from 'fs';
import path from 'path';

const TMP_DB_FILE = path.join('/tmp', 't2s-server-db.json');

let memoryStore = {
  users: [],
  archives: [],
  library: [],
  journey: [],
  shop: [],
  announcements: [],
  vip_gates: null,
  deletedIds: [],
};

function readDb() {
  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(TMP_DB_FILE, 'utf-8'));
      memoryStore = { ...memoryStore, ...parsed };
    }
  } catch {}
  return memoryStore;
}

function writeDb(data) {
  memoryStore = data;
  try {
    fs.writeFileSync(TMP_DB_FILE, JSON.stringify(data), 'utf-8');
  } catch {}
}

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'GET') {
    return res.status(200).json(readDb());
  }

  if (req.method === 'POST') {
    try {
      const payload =
        typeof req.body === 'string'
          ? JSON.parse(req.body || '{}')
          : req.body || {};
      const db = readDb();
      const { collection, action, docId, data } = payload;
      const deletedSet = new Set(db.deletedIds || []);

      if (collection === 'vip_gates') {
        db.vip_gates = data;
      } else if (collection === 'users') {
        const list = Array.isArray(db.users) ? db.users : [];
        if (action === 'delete') {
          db.users = list.filter((u) => u?.uid !== docId && u?.id !== docId);
          if (docId) deletedSet.add(docId);
        } else if (action === 'set' && data) {
          const targetUid = docId || data.uid || data.id;
          if (targetUid) deletedSet.delete(targetUid);
          const targetEmail = (data.email || '').trim().toLowerCase();
          const idx = list.findIndex(
            (u) =>
              (targetUid && (u?.uid === targetUid || u?.id === targetUid)) ||
              (targetEmail &&
                (u?.email || '').trim().toLowerCase() === targetEmail)
          );
          if (idx >= 0) {
            const prev = list[idx];
            const prevDays = Array.isArray(prev?.completedDays)
              ? prev.completedDays.map(Number).filter((n) => n > 0)
              : [];
            const incomingDays = Array.isArray(data.completedDays)
              ? data.completedDays.map(Number).filter((n) => n > 0)
              : [];
            const mergedDays = data._forceReplaceDays
              ? incomingDays
              : Array.from(new Set([...prevDays, ...incomingDays])).sort(
                  (a, b) => a - b
                );
            const cleanData = { ...data };
            delete cleanData._forceReplaceDays;
            list[idx] = {
              ...prev,
              ...cleanData,
              uid: targetUid || prev.uid,
              id: targetUid || prev.uid,
              completedDays: mergedDays,
            };
          } else {
            const cleanData = { ...data };
            delete cleanData._forceReplaceDays;
            list.unshift({
              ...cleanData,
              uid: targetUid,
              id: targetUid,
            });
          }
          db.users = list;
        }
      } else if (
        ['archives', 'library', 'journey', 'shop', 'announcements'].includes(
          collection
        )
      ) {
        const list = Array.isArray(db[collection]) ? db[collection] : [];
        if (action === 'delete') {
          db[collection] = list.filter((item) => item?.id !== docId);
          if (docId) deletedSet.add(docId);
        } else if (action === 'set' && data) {
          if (docId) deletedSet.delete(docId);
          const itemWithId = { ...data, id: docId || data.id };
          const idx = list.findIndex((i) => i?.id === itemWithId.id);
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...itemWithId };
          } else {
            list.unshift(itemWithId);
          }
          db[collection] = list;
        }
      }
      db.deletedIds = Array.from(deletedSet);
      writeDb(db);
      return res.status(200).json({ ok: true, db });
    } catch (err) {
      return res.status(400).json({ ok: false, error: err?.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
