import { useState, useEffect } from 'react';

export interface AudioRecording {
  id: string;
  name: string;
  date: string;
  size: string;
  duration: string;
  format: string;
  createdAt: string;
}

export function useAudioHistory(_userId: string | undefined) {
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('alan_media_vault');
    if (saved) {
      try {
        setRecordings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recordings from localStorage');
      }
    }
    setLoading(false);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('alan_media_vault', JSON.stringify(recordings));
    }
  }, [recordings, loading]);

  const saveRecording = async (recording: Omit<AudioRecording, 'id' | 'createdAt'>) => {
    const newRecording: AudioRecording = {
      ...recording,
      id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString()
    };
    setRecordings(prev => [newRecording, ...prev]);
  };

  const deleteRecording = async (recordingId: string) => {
    setRecordings(prev => prev.filter(r => r.id !== recordingId));
  };

  const clearAllRecordings = async () => {
    if (recordings.length === 0) return;
    if (!window.confirm(`Hapus SEMUA (${recordings.length}) rekaman di Vault? Tindakan ini tidak bisa dibatalkan.`)) return;
    setRecordings([]);
  };

  return { recordings, loading, saveRecording, deleteRecording, clearAllRecordings };
}
