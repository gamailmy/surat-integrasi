import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  onSnapshot, 
  writeBatch 
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebase';
import { 
  SuratRecord, 
  DataGuru, 
  DataSiswa, 
  DataSekolah, 
  AppSettings, 
  LogAktivitas 
} from '../types';

export type CloudSyncListener = (type: 'surat' | 'guru' | 'siswa' | 'sekolah' | 'settings' | 'logs' | 'all') => void;

const listeners: Set<CloudSyncListener> = new Set();

export function registerCloudSyncListener(listener: CloudSyncListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(type: 'surat' | 'guru' | 'siswa' | 'sekolah' | 'settings' | 'logs' | 'all') {
  listeners.forEach(fn => {
    try {
      fn(type);
    } catch (err) {
      console.warn('Sync listener error:', err);
    }
  });
}

// Local Storage Keys
const KEYS = {
  SETTINGS: 'SURATKU_SETTINGS',
  SEKOLAH: 'SURATKU_DATA_SEKOLAH',
  GURU: 'SURATKU_GURU',
  SISWA: 'SURATKU_SISWA',
  SURAT: 'SURATKU_SURAT',
  LOGS: 'SURATKU_LOG_AKTIVITAS',
};

let isSyncingFromCloud = false;

/**
 * Recursively cleans objects to remove any undefined values so Firestore never throws
 * "Unsupported field value: undefined"
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return '' as unknown as T;
  }
  if (data === null) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      } else {
        cleaned[key] = '';
      }
    }
    return cleaned as T;
  }
  return data;
}

/**
 * Push a single Surat record to Firestore
 */
export async function syncSuratToCloud(surat: SuratRecord): Promise<void> {
  if (isSyncingFromCloud) return;
  const path = `surat/${surat.id}`;
  try {
    const docRef = doc(db, 'surat', surat.id);
    const cleaned = sanitizeForFirestore(surat);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (error) {
    console.error('Failed to sync Surat to Cloud:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a single Surat record from Firestore
 */
export async function deleteSuratFromCloud(id: string): Promise<void> {
  if (isSyncingFromCloud) return;
  const path = `surat/${id}`;
  try {
    const docRef = doc(db, 'surat', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Push Guru to Firestore
 */
export async function syncGuruToCloud(guru: DataGuru): Promise<void> {
  if (isSyncingFromCloud) return;
  const path = `guru/${guru.id}`;
  try {
    const docRef = doc(db, 'guru', guru.id);
    const cleaned = sanitizeForFirestore(guru);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (error) {
    console.error('Failed to sync Guru to Cloud:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete Guru from Firestore
 */
export async function deleteGuruFromCloud(id: string): Promise<void> {
  if (isSyncingFromCloud) return;
  const path = `guru/${id}`;
  try {
    const docRef = doc(db, 'guru', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Push Siswa to Firestore
 */
export async function syncSiswaToCloud(siswa: DataSiswa): Promise<void> {
  if (isSyncingFromCloud) return;
  const path = `siswa/${siswa.id}`;
  try {
    const docRef = doc(db, 'siswa', siswa.id);
    const cleaned = sanitizeForFirestore(siswa);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (error) {
    console.error('Failed to sync Siswa to Cloud:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete Siswa from Firestore
 */
export async function deleteSiswaFromCloud(id: string): Promise<void> {
  if (isSyncingFromCloud) return;
  const path = `siswa/${id}`;
  try {
    const docRef = doc(db, 'siswa', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Push Sekolah to Firestore
 */
export async function syncSekolahToCloud(sekolah: DataSekolah): Promise<void> {
  if (isSyncingFromCloud) return;
  const path = 'settings/sekolah';
  try {
    const docRef = doc(db, 'settings', 'sekolah');
    const cleaned = sanitizeForFirestore(sekolah);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (error) {
    console.error('Failed to sync Sekolah to Cloud:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Push AppSettings to Firestore
 */
export async function syncSettingsToCloud(settings: AppSettings): Promise<void> {
  if (isSyncingFromCloud) return;
  const path = 'settings/config';
  try {
    const docRef = doc(db, 'settings', 'config');
    const cleaned = sanitizeForFirestore(settings);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (error) {
    console.error('Failed to sync Settings to Cloud:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Push Log to Firestore
 */
export async function syncLogToCloud(log: LogAktivitas): Promise<void> {
  if (isSyncingFromCloud) return;
  const path = `logs/${log.id}`;
  try {
    const docRef = doc(db, 'logs', log.id);
    const cleaned = sanitizeForFirestore(log);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Batch import/replace items in Firestore
 */
export async function batchSyncGurusToCloud(gurus: DataGuru[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    gurus.forEach(guru => {
      const ref = doc(db, 'guru', guru.id);
      const cleaned = sanitizeForFirestore(guru);
      batch.set(ref, cleaned, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'guru');
  }
}

export async function batchSyncSiswasToCloud(siswas: DataSiswa[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    siswas.forEach(siswa => {
      const ref = doc(db, 'siswa', siswa.id);
      const cleaned = sanitizeForFirestore(siswa);
      batch.set(ref, cleaned, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'siswa');
  }
}

/**
 * Start real-time background synchronization across all devices
 */
export function startRealtimeCloudSync(): () => void {
  const unsubscribers: (() => void)[] = [];

  // 1. Listen to Surat Collection
  try {
    const unsubSurat = onSnapshot(collection(db, 'surat'), (snapshot) => {
      const cloudSurats: SuratRecord[] = [];
      snapshot.forEach(docSnap => {
        cloudSurats.push(docSnap.data() as SuratRecord);
      });

      // Sort descending by date/number
      cloudSurats.sort((a, b) => {
        const tA = new Date(a.waktuDibuat || a.tanggalSurat).getTime();
        const tB = new Date(b.waktuDibuat || b.tanggalSurat).getTime();
        return tB - tA;
      });

      if (cloudSurats.length > 0 || !snapshot.metadata.hasPendingWrites) {
        isSyncingFromCloud = true;
        localStorage.setItem(KEYS.SURAT, JSON.stringify(cloudSurats));
        isSyncingFromCloud = false;
        notifyListeners('surat');
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'surat');
    });
    unsubscribers.push(unsubSurat);
  } catch (e) {
    console.warn('Surat subscription error:', e);
  }

  // 2. Listen to Guru Collection
  try {
    const unsubGuru = onSnapshot(collection(db, 'guru'), (snapshot) => {
      const cloudGurus: DataGuru[] = [];
      snapshot.forEach(docSnap => {
        cloudGurus.push(docSnap.data() as DataGuru);
      });

      if (cloudGurus.length > 0 || !snapshot.metadata.hasPendingWrites) {
        isSyncingFromCloud = true;
        localStorage.setItem(KEYS.GURU, JSON.stringify(cloudGurus));
        isSyncingFromCloud = false;
        notifyListeners('guru');
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'guru');
    });
    unsubscribers.push(unsubGuru);
  } catch (e) {
    console.warn('Guru subscription error:', e);
  }

  // 3. Listen to Siswa Collection
  try {
    const unsubSiswa = onSnapshot(collection(db, 'siswa'), (snapshot) => {
      const cloudSiswas: DataSiswa[] = [];
      snapshot.forEach(docSnap => {
        cloudSiswas.push(docSnap.data() as DataSiswa);
      });

      if (cloudSiswas.length > 0 || !snapshot.metadata.hasPendingWrites) {
        isSyncingFromCloud = true;
        localStorage.setItem(KEYS.SISWA, JSON.stringify(cloudSiswas));
        isSyncingFromCloud = false;
        notifyListeners('siswa');
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'siswa');
    });
    unsubscribers.push(unsubSiswa);
  } catch (e) {
    console.warn('Siswa subscription error:', e);
  }

  // 4. Listen to Data Sekolah Document
  try {
    const unsubSekolah = onSnapshot(doc(db, 'settings', 'sekolah'), (docSnap) => {
      if (docSnap.exists()) {
        const cloudSekolah = docSnap.data() as DataSekolah;
        isSyncingFromCloud = true;
        localStorage.setItem(KEYS.SEKOLAH, JSON.stringify(cloudSekolah));
        isSyncingFromCloud = false;
        notifyListeners('sekolah');
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/sekolah');
    });
    unsubscribers.push(unsubSekolah);
  } catch (e) {
    console.warn('Sekolah subscription error:', e);
  }

  // 5. Listen to Settings Document
  try {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        const cloudSettings = docSnap.data() as AppSettings;
        isSyncingFromCloud = true;
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(cloudSettings));
        isSyncingFromCloud = false;
        notifyListeners('settings');
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/config');
    });
    unsubscribers.push(unsubSettings);
  } catch (e) {
    console.warn('Settings subscription error:', e);
  }

  // 6. Listen to Logs Collection
  try {
    const unsubLogs = onSnapshot(collection(db, 'logs'), (snapshot) => {
      const cloudLogs: LogAktivitas[] = [];
      snapshot.forEach(docSnap => {
        cloudLogs.push(docSnap.data() as LogAktivitas);
      });
      cloudLogs.sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime());

      if (cloudLogs.length > 0 || !snapshot.metadata.hasPendingWrites) {
        isSyncingFromCloud = true;
        localStorage.setItem(KEYS.LOGS, JSON.stringify(cloudLogs.slice(0, 100)));
        isSyncingFromCloud = false;
        notifyListeners('logs');
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'logs');
    });
    unsubscribers.push(unsubLogs);
  } catch (e) {
    console.warn('Logs subscription error:', e);
  }

  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
}

/**
 * Initial Bootstrap:
 * Reconciles data bidirectionally between Cloud Firestore and local storage.
 * 1. Merges local and cloud records seamlessly.
 * 2. Uploads any local records that don't exist in the cloud yet.
 * 3. Updates local storage with all latest cloud records and notifies UI.
 */
export async function initializeAndBootstrapCloudSync(): Promise<void> {
  try {
    // 1. RECONCILE SURAT
    const suratSnap = await getDocs(collection(db, 'surat'));
    const cloudSuratsMap = new Map<string, SuratRecord>();
    suratSnap.forEach(d => {
      const data = d.data() as SuratRecord;
      if (data && data.id) {
        cloudSuratsMap.set(data.id, data);
      }
    });

    const localSuratRaw = localStorage.getItem(KEYS.SURAT);
    const localSurats: SuratRecord[] = localSuratRaw ? JSON.parse(localSuratRaw) : [];
    const missingInCloudSurats: SuratRecord[] = [];

    localSurats.forEach(localItem => {
      if (!cloudSuratsMap.has(localItem.id)) {
        missingInCloudSurats.push(localItem);
        cloudSuratsMap.set(localItem.id, localItem);
      }
    });

    // If there are local surats missing in the cloud, push them to Firestore immediately
    if (missingInCloudSurats.length > 0) {
      const batch = writeBatch(db);
      missingInCloudSurats.forEach(s => {
        const ref = doc(db, 'surat', s.id);
        batch.set(ref, sanitizeForFirestore(s), { merge: true });
      });
      await batch.commit();
    }

    const mergedSurats = Array.from(cloudSuratsMap.values());
    mergedSurats.sort((a, b) => new Date(b.waktuDibuat || b.tanggalSurat).getTime() - new Date(a.waktuDibuat || a.tanggalSurat).getTime());
    if (mergedSurats.length > 0) {
      isSyncingFromCloud = true;
      localStorage.setItem(KEYS.SURAT, JSON.stringify(mergedSurats));
      isSyncingFromCloud = false;
    }

    // 2. RECONCILE GURU
    const guruSnap = await getDocs(collection(db, 'guru'));
    const cloudGuruMap = new Map<string, DataGuru>();
    guruSnap.forEach(d => {
      const data = d.data() as DataGuru;
      if (data && data.id) cloudGuruMap.set(data.id, data);
    });

    const localGuruRaw = localStorage.getItem(KEYS.GURU);
    const localGurus: DataGuru[] = localGuruRaw ? JSON.parse(localGuruRaw) : [];
    const missingInCloudGurus: DataGuru[] = [];

    localGurus.forEach(g => {
      if (!cloudGuruMap.has(g.id)) {
        missingInCloudGurus.push(g);
        cloudGuruMap.set(g.id, g);
      }
    });

    if (missingInCloudGurus.length > 0) {
      const batch = writeBatch(db);
      missingInCloudGurus.forEach(g => {
        const ref = doc(db, 'guru', g.id);
        batch.set(ref, sanitizeForFirestore(g), { merge: true });
      });
      await batch.commit();
    }

    const mergedGurus = Array.from(cloudGuruMap.values());
    if (mergedGurus.length > 0) {
      isSyncingFromCloud = true;
      localStorage.setItem(KEYS.GURU, JSON.stringify(mergedGurus));
      isSyncingFromCloud = false;
    }

    // 3. RECONCILE SISWA
    const siswaSnap = await getDocs(collection(db, 'siswa'));
    const cloudSiswaMap = new Map<string, DataSiswa>();
    siswaSnap.forEach(d => {
      const data = d.data() as DataSiswa;
      if (data && data.id) cloudSiswaMap.set(data.id, data);
    });

    const localSiswaRaw = localStorage.getItem(KEYS.SISWA);
    const localSiswas: DataSiswa[] = localSiswaRaw ? JSON.parse(localSiswaRaw) : [];
    const missingInCloudSiswas: DataSiswa[] = [];

    localSiswas.forEach(s => {
      if (!cloudSiswaMap.has(s.id)) {
        missingInCloudSiswas.push(s);
        cloudSiswaMap.set(s.id, s);
      }
    });

    if (missingInCloudSiswas.length > 0) {
      const batch = writeBatch(db);
      missingInCloudSiswas.forEach(s => {
        const ref = doc(db, 'siswa', s.id);
        batch.set(ref, sanitizeForFirestore(s), { merge: true });
      });
      await batch.commit();
    }

    const mergedSiswas = Array.from(cloudSiswaMap.values());
    if (mergedSiswas.length > 0) {
      isSyncingFromCloud = true;
      localStorage.setItem(KEYS.SISWA, JSON.stringify(mergedSiswas));
      isSyncingFromCloud = false;
    }

    // 4. RECONCILE SEKOLAH
    const sekolahSnap = await getDoc(doc(db, 'settings', 'sekolah'));
    if (sekolahSnap.exists()) {
      isSyncingFromCloud = true;
      localStorage.setItem(KEYS.SEKOLAH, JSON.stringify(sekolahSnap.data()));
      isSyncingFromCloud = false;
    } else {
      const localSekolahRaw = localStorage.getItem(KEYS.SEKOLAH);
      if (localSekolahRaw) {
        const localSekolah = JSON.parse(localSekolahRaw);
        await setDoc(doc(db, 'settings', 'sekolah'), sanitizeForFirestore(localSekolah));
      }
    }

    // 5. RECONCILE SETTINGS
    const settingsSnap = await getDoc(doc(db, 'settings', 'config'));
    if (settingsSnap.exists()) {
      isSyncingFromCloud = true;
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settingsSnap.data()));
      isSyncingFromCloud = false;
    } else {
      const localSettingsRaw = localStorage.getItem(KEYS.SETTINGS);
      if (localSettingsRaw) {
        const localSettings = JSON.parse(localSettingsRaw);
        await setDoc(doc(db, 'settings', 'config'), sanitizeForFirestore(localSettings));
      }
    }

    notifyListeners('all');
  } catch (error) {
    console.warn('Initial cloud sync bootstrap note:', error);
  }
}
