import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Analytics is optional and might not work in all iframe environments perfectly
export const analytics = typeof window !== 'undefined' && firebaseConfig.measurementId ? getAnalytics(app) : null;

/**
 * Interface para erros detalhados do Firestore
 */
export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string | null;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: any[];
  }
}

/**
 * Manipulador de erro padronizado para Firestore
 */
export function handleFirestoreError(error: any, operation: FirestoreErrorInfo['operationType'], path: string | null = null): never {
  const authInfo = auth.currentUser ? {
    userId: auth.currentUser.uid,
    email: auth.currentUser.email,
    emailVerified: auth.currentUser.emailVerified,
    isAnonymous: auth.currentUser.isAnonymous,
    providerInfo: auth.currentUser.providerData.map(p => ({
      providerId: p.providerId,
      displayName: p.displayName,
      email: p.email
    }))
  } : {
    userId: 'unauthenticated',
    email: null,
    emailVerified: false,
    isAnonymous: false,
    providerInfo: []
  };

  const errorDetail: FirestoreErrorInfo = {
    error: error.message || 'Unknown Firestore error',
    operationType: operation,
    path,
    authInfo
  };

  throw new Error(JSON.stringify(errorDetail));
}

// Test Connection on Boot
async function testConnection() {
  try {
    // Tenta ler um documento inexistente apenas para validar conectividade e permissões base
    await getDocFromServer(doc(db, '_system_', 'connectivity'));
    console.log('Firebase connectivity verified.');
  } catch (error: any) {
    if (error.message?.includes('Missing or insufficient permissions')) {
      // Isso é esperado se não houver permissão de leitura global, o que é bom
      console.log('Firebase permissions restricted (Healthy)');
    } else {
      console.error('Firebase connection test failed:', error);
    }
  }
}

if (typeof window !== 'undefined') {
  testConnection();
}
