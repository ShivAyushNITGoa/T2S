import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { doc, getFirestore, getDocFromServer, initializeFirestore, terminate } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings to improve stability in sandboxed environments
// We use a try-catch to handle cases where it might already be initialized or fails in specific environments
let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, (firebaseConfig as any).firestoreDatabaseId);
} catch (e) {
  console.warn("initializeFirestore failed, falling back to getFirestore:", e);
  dbInstance = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
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

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function isOfflineError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  const code = (error as any)?.code || '';
  return (
    msg.includes('offline') || 
    msg.includes('unavailable') || 
    msg.includes('failed-precondition') || 
    msg.includes('failed to get document') ||
    msg.includes('network') ||
    code === 'unavailable' ||
    code === 'failed-precondition'
  );
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));

  const errorLower = errInfo.error.toLowerCase();
  const isQuotaError = errorLower.includes('quota') || 
                       errorLower.includes('limit exceeded') || 
                       errorLower.includes('resource-exhausted') || 
                       errorLower.includes('quota_exceeded');

  if (isQuotaError) {
    if (typeof window !== 'undefined') {
      try {
        (window as any).dispatchEvent(new (window as any).CustomEvent('firestore-quota', { detail: errInfo }));
      } catch (e) {
        console.error("Failed to dispatch custom firestore-quota event:", e);
      }
    }
    console.warn("Firestore Quota Exceeded detected. Handling gracefully via UI warning and cache fallback, preventing crash.");
    return;
  }

  if (isOfflineError(error)) {
    if (typeof window !== 'undefined') {
      try {
        (window as any).dispatchEvent(new (window as any).CustomEvent('firestore-offline', { detail: errInfo }));
      } catch (e) {
        console.error("Failed to dispatch custom firestore-offline event:", e);
      }
    }
    console.warn("Firestore Offline status detected. Handling gracefully, continuing offline mode...");
    return;
  }

  throw new Error(JSON.stringify(errInfo));
}

// Connectivity check as per integration guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection verified");
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Firestore connection is offline, operating with persistent local cache fallback.");
    } else if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or internet connection. The Firestore client reports being offline.");
    } else {
      console.warn("Firestore initialization status:", error);
    }
  }
}
testConnection();
