import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

function cleanEnvValue(val: unknown, fallback: string): string {
  if (typeof val !== 'string') return fallback;
  const trimmed = val.trim().replace(/^["']+|["']+$/g, '').trim();
  if (
    !trimmed ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    trimmed.startsWith('your_')
  ) {
    return fallback;
  }
  return trimmed;
}

const rawApiKey = cleanEnvValue(
  import.meta.env.VITE_FIREBASE_API_KEY,
  firebaseConfig.apiKey
);
// Ensure the API key is a valid Firebase AIza* key; otherwise use fallback
const safeApiKey =
  rawApiKey.startsWith('AIza') && rawApiKey.length >= 30
    ? rawApiKey
    : firebaseConfig.apiKey;

const resolvedConfig = {
  apiKey: safeApiKey,
  authDomain: cleanEnvValue(
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    firebaseConfig.authDomain
  ),
  projectId: cleanEnvValue(
    import.meta.env.VITE_FIREBASE_PROJECT_ID,
    firebaseConfig.projectId
  ),
  storageBucket: cleanEnvValue(
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    firebaseConfig.storageBucket
  ),
  messagingSenderId: cleanEnvValue(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    firebaseConfig.messagingSenderId
  ),
  appId: cleanEnvValue(
    import.meta.env.VITE_FIREBASE_APP_ID,
    firebaseConfig.appId
  ),
  measurementId: cleanEnvValue(
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    firebaseConfig.measurementId || ''
  ),
  firestoreDatabaseId: cleanEnvValue(
    import.meta.env.VITE_FIRESTORE_DATABASE_ID ||
      import.meta.env.VITE_FIREBASE_DATABASE_ID,
    firebaseConfig.firestoreDatabaseId || '(default)'
  ),
};

const app = initializeApp(resolvedConfig);

let analyticsInstance: any = null;
if (typeof window !== 'undefined' && resolvedConfig.measurementId) {
  import('firebase/analytics')
    .then(({ getAnalytics, isSupported }) => {
      isSupported()
        .then((yes) => {
          if (yes) analyticsInstance = getAnalytics(app);
        })
        .catch(() => {});
    })
    .catch(() => {});
}
export const analytics = analyticsInstance;

const dbId =
  resolvedConfig.firestoreDatabaseId &&
  resolvedConfig.firestoreDatabaseId !== '(default)'
    ? resolvedConfig.firestoreDatabaseId
    : undefined;

let dbInstance;
try {
  dbInstance = dbId
    ? initializeFirestore(
        app,
        {
          experimentalAutoDetectLongPolling: true,
          ignoreUndefinedProperties: true,
        },
        dbId
      )
    : initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
        ignoreUndefinedProperties: true,
      });
} catch {
  dbInstance = dbId ? getFirestore(app, dbId) : getFirestore(app);
}

export const db = dbInstance;
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function isOfflineError(error: unknown): boolean {
  if (!error) return false;
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();
  const code = (error as any)?.code || '';
  return (
    message.includes('offline') ||
    message.includes('unavailable') ||
    message.includes('failed-precondition') ||
    message.includes('failed to get document') ||
    message.includes('network') ||
    message.includes('api has not been used') ||
    message.includes('is disabled') ||
    message.includes('firestore.googleapis.com') ||
    message.includes('permission-denied') ||
    code === 'unavailable' ||
    code === 'failed-precondition' ||
    code === 'permission-denied'
  );
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  if (isOfflineError(error)) {
    return;
  }

  const message = error instanceof Error ? error.message : String(error);
  const code = (error as any)?.code;

  if (
    code === 'resource-exhausted' ||
    message.toLowerCase().includes('quota exceeded')
  ) {
    window.dispatchEvent(new CustomEvent('firebase-quota-exceeded'));
    return;
  }

  console.warn(`[Firestore Notice] (${operationType} at ${path}):`, message);
}
