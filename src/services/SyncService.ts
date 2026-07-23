import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export interface SyncData {
  stats: any;
  disciplines: any[];
  inbox: any[];
  settings: any;
  lastSynced?: any;
  version?: string;
}

class SyncService {
  private static instance: SyncService;
  private unsubscribe: (() => void) | null = null;
  private isInitialLoad = true;

  private constructor() {}

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  public merge(local: SyncData, remote: SyncData): SyncData {
    const merged: SyncData = { ...local };

    // Stats Merge: Take highest dust/minutes
    if (remote.stats) {
      const remoteDust = remote.stats.focusDust || 0;
      const localDust = local.stats.focusDust || 0;
      if (remoteDust > localDust) {
        merged.stats = { ...remote.stats };
      }
    }

    // Disciplines Merge: Merge by ID
    if (remote.disciplines) {
      const mergedDisciplines = [...(local.disciplines || [])];
      remote.disciplines.forEach((rDisc) => {
        const index = mergedDisciplines.findIndex(lDisc => lDisc.id === rDisc.id);
        if (index === -1) {
          mergedDisciplines.push(rDisc);
        } else {
          // If remote version/timestamp is newer? (Not implemented yet, but we'll assume remote is better if cloud exists)
          // For now, just keep local for existing ones to avoid confusion
        }
      });
      merged.disciplines = mergedDisciplines;
    }

    // Inbox Merge
    if (remote.inbox) {
      const mergedInbox = Array.isArray(local.inbox) ? [...local.inbox] : [];
      if (Array.isArray(remote.inbox)) {
        remote.inbox.forEach(rItem => {
          if (!mergedInbox.find(i => i.id === rItem.id)) {
            mergedInbox.push(rItem);
          }
        });
        merged.inbox = mergedInbox;
      } else if (typeof remote.inbox === 'string' && mergedInbox.length === 0) {
        merged.inbox = remote.inbox as any;
      }
    }

    // Settings Merge: Remote wins if exists
    if (remote.settings) {
      merged.settings = { ...local.settings, ...remote.settings };
    }

    return merged;
  }

  public async saveToCloud(data: Partial<SyncData>) {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        ...data,
        lastSynced: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving to cloud:', error);
      throw error;
    }
  }

  public async loadFromCloud(): Promise<SyncData | null> {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        return docSnap.data() as SyncData;
      }
      return null;
    } catch (error) {
      console.error('Error loading from cloud:', error);
      throw error;
    }
  }

  public subscribeToChanges(callback: (data: SyncData) => void) {
    const user = auth.currentUser;
    if (!user) return () => {};

    const userRef = doc(db, 'users', user.uid);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as SyncData);
      }
    });
  }

  public onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}

export const syncService = SyncService.getInstance();
