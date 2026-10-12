import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

const DB_FILE = path.resolve(__dirname, '.t2s-server-db.json');

function readServerDb(): Record<string, any> {
  try {
    if (fs.existsSync(DB_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      return {
        users: [],
        archives: [],
        library: [],
        journey: [],
        shop: [],
        announcements: [],
        vip_gates: null,
        deletedIds: [],
        ...parsed,
      };
    }
  } catch {}
  return {
    users: [],
    archives: [],
    library: [],
    journey: [],
    shop: [],
    announcements: [],
    vip_gates: null,
    deletedIds: [],
  };
}

function writeServerDb(data: Record<string, any>) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    {
      name: 't2s-sync-api',
      configureServer(server) {
        server.middlewares.use('/api/sync', (req, res) => {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store, max-age=0');

          if (req.method === 'GET') {
            const db = readServerDb();
            res.statusCode = 200;
            res.end(JSON.stringify(db));
            return;
          }
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const payload = JSON.parse(body || '{}');
                const db = readServerDb();
                const { collection, action, docId, data } = payload;
                const deletedSet = new Set<string>(db.deletedIds || []);

                if (collection === 'vip_gates') {
                  db.vip_gates = data;
                } else if (collection === 'users') {
                  const list: any[] = Array.isArray(db.users) ? db.users : [];
                  if (action === 'delete') {
                    db.users = list.filter(
                      (u) => u?.uid !== docId && u?.id !== docId
                    );
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
                        ? prev.completedDays.map(Number).filter((n: number) => n > 0)
                        : [];
                      const incomingDays = Array.isArray(data.completedDays)
                        ? data.completedDays.map(Number).filter((n: number) => n > 0)
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
                  const list: any[] = Array.isArray(db[collection])
                    ? db[collection]
                    : [];
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
                writeServerDb(db);
                res.statusCode = 200;
                res.end(JSON.stringify({ ok: true, db }));
              } catch (err: any) {
                res.statusCode = 400;
                res.end(JSON.stringify({ ok: false, error: err?.message }));
              }
            });
            return;
          }
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase-vendor': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/analytics',
          ],
          'react-vendor': ['react', 'react-dom', 'motion/react', 'lucide-react'],
        },
      },
    },
  },
});
