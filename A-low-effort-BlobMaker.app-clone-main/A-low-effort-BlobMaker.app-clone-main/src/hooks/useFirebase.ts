import { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { auth, db, handleFirestoreError } from '../lib/firebase';

export function useFirebase() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [presets, setPresets] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Carrega presets públicos
    const q = query(
      collection(db, 'presets'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const p = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPresets(p);
      },
      (error) => {
        console.error("Erro ao escutar presets:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const logout = () => signOut(auth);

  const savePreset = async (data: {
    name: string;
    color: string;
    complexity: number;
    contrast: number;
    stiffness: number;
    gravityEnabled: boolean;
  }) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'presets'), {
        ...data,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
      });
    } catch (error: any) {
      handleFirestoreError(error, 'create', 'presets');
    }
  };

  const deletePreset = async (presetId: string) => {
    try {
      await deleteDoc(doc(db, 'presets', presetId));
    } catch (error) {
      handleFirestoreError(error, 'delete', `presets/${presetId}`);
    }
  };

  return {
    user,
    loading,
    presets,
    login,
    logout,
    savePreset,
    deletePreset
  };
}
