import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

export interface AudioRecording {
  id: string;
  name: string;
  date: string;
  size: string;
  duration: string;
  format: string;
  createdAt: Timestamp;
}

export function useAudioHistory(userId: string | undefined) {
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setRecordings([]);
      setLoading(false);
      return;
    }

    const editsRef = collection(db, 'users', userId, 'edits');
    const q = query(editsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AudioRecording[];
      setRecordings(records);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching history:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const saveRecording = async (recording: Omit<AudioRecording, 'id' | 'createdAt'>) => {
    if (!userId) return;
    try {
      const editsRef = collection(db, 'users', userId, 'edits');
      await addDoc(editsRef, {
        ...recording,
        userId: userId, // for security rules consistency
        effects: {}, // placeholder for future
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error saving recording:', err);
    }
  };

  const deleteRecording = async (recordingId: string) => {
    if (!userId) return;
    try {
      const docRef = doc(db, 'users', userId, 'edits', recordingId);
      await deleteDoc(docRef);
    } catch (err: any) {
      console.error('Error deleting recording:', err);
      alert(`Gagal hapus: ${err.message || 'Masalah koneksi/izin'}`);
    }
  };

  const clearAllRecordings = async () => {
    if (!userId || recordings.length === 0) return;
    if (!window.confirm(`Hapus SEMUA (${recordings.length}) rekaman di Vault? Tindakan ini tidak bisa dibatalkan.`)) return;
    
    try {
      // Small deletion loop
      for (const rec of recordings) {
        await deleteDoc(doc(db, 'users', userId, 'edits', rec.id));
      }
    } catch (err: any) {
      console.error('Error clearing vault:', err);
      alert(`Gagal membersihkan vault: ${err.message}`);
    }
  };

  return { recordings, loading, saveRecording, deleteRecording, clearAllRecordings };
}
