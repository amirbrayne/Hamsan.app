import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  writeBatch,
  Unsubscribe,
  DocumentData,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, uploadFileToFirebaseStorage } from './firebase';
import {
  Applicant,
  Introduction,
  CounselingSession,
  Task,
  AuditLog,
  User,
  IntroductionStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_APPLICANTS,
  INITIAL_INTRODUCTIONS,
  INITIAL_COUNSELING_SESSIONS,
  INITIAL_TASKS,
  INITIAL_AUDIT_LOGS,
  buildApplicant,
} from '../mockData';

export const COLLECTIONS = {
  USERS: 'users',
  APPLICANTS: 'applicants',
  INTRODUCTIONS: 'introductions',
  COUNSELING_SESSIONS: 'counseling_sessions',
  TASKS: 'tasks',
  AUDIT_LOGS: 'audit_logs',
  SETTINGS: 'system_settings',
  MATCHES: 'matches',
  PRIVATE_PROFILES: 'private_profiles',
  PERSONALITIES: 'personalities',
  EDUCATION_JOBS: 'education_jobs',
  MARRIAGE_PREFERENCES: 'marriage_preferences',
} as const;

// Production detection flag: Mock seeding only occurs in development mode or explicit admin request
export const IS_PRODUCTION =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.PROD) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE === 'production') ||
  false;

export class FirebaseDataService {
  private isSeeding = false;

  /**
   * Check if Firestore has seed data, and only initialize if in development mode
   */
  public async seedInitialDataIfEmpty(forceSeed: boolean = false): Promise<boolean> {
    // In production, database starts clean without automatic mock injection
    if (IS_PRODUCTION && !forceSeed) {
      return false;
    }

    if (this.isSeeding) return false;
    this.isSeeding = true;
    try {
      const applicantsRef = collection(db, COLLECTIONS.APPLICANTS);
      const snapshot = await getDocs(query(applicantsRef, limit(1)));

      if (snapshot.empty) {
        console.log('Development environment: Seeding benchmark records into Firestore...');
        await this.seedAllData();
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Firestore check/seed warning:', error);
      return false;
    } finally {
      this.isSeeding = false;
    }
  }

  /**
   * Seed initial data sets into Firestore in batches
   */
  public async seedAllData(): Promise<void> {
    try {
      // 1. Seed Users
      const usersBatch = writeBatch(db);
      for (const user of INITIAL_USERS) {
        const docRef = doc(db, COLLECTIONS.USERS, user.id);
        usersBatch.set(docRef, { ...user, updatedAt: new Date().toISOString() });
      }
      await usersBatch.commit();

      // 2. Seed Applicants (in batches of 400)
      const batchSize = 400;
      for (let i = 0; i < INITIAL_APPLICANTS.length; i += batchSize) {
        const slice = INITIAL_APPLICANTS.slice(i, i + batchSize);
        const appBatch = writeBatch(db);
        for (const app of slice) {
          const built = buildApplicant(app);
          const docRef = doc(db, COLLECTIONS.APPLICANTS, built.id);
          appBatch.set(docRef, built);
        }
        await appBatch.commit();
      }

      // 3. Seed Introductions
      const introsBatch = writeBatch(db);
      for (const intro of INITIAL_INTRODUCTIONS) {
        const docRef = doc(db, COLLECTIONS.INTRODUCTIONS, intro.id);
        introsBatch.set(docRef, intro);
      }
      await introsBatch.commit();

      // 4. Seed Counseling Sessions
      const sessionsBatch = writeBatch(db);
      for (const session of INITIAL_COUNSELING_SESSIONS) {
        const docRef = doc(db, COLLECTIONS.COUNSELING_SESSIONS, session.id);
        sessionsBatch.set(docRef, session);
      }
      await sessionsBatch.commit();

      // 5. Seed Tasks
      const tasksBatch = writeBatch(db);
      for (const task of INITIAL_TASKS) {
        const docRef = doc(db, COLLECTIONS.TASKS, task.id);
        tasksBatch.set(docRef, task);
      }
      await tasksBatch.commit();

      // 6. Seed Audit Logs
      const logsBatch = writeBatch(db);
      for (const log of INITIAL_AUDIT_LOGS) {
        const docRef = doc(db, COLLECTIONS.AUDIT_LOGS, log.id);
        logsBatch.set(docRef, log);
      }
      await logsBatch.commit();

      console.log('Successfully completed Firestore data synchronization.');
    } catch (e) {
      console.error('Error seeding initial data to Firestore:', e);
    }
  }

  // ==================== APPLICANTS ====================

  public subscribeApplicants(callback: (applicants: Applicant[]) => void): Unsubscribe {
    const q = collection(db, COLLECTIONS.APPLICANTS);
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Applicant[] = [];
          snapshot.forEach((doc) => {
            list.push(buildApplicant(doc.data()));
          });
          callback(list);
        } else if (!IS_PRODUCTION) {
          this.seedInitialDataIfEmpty();
        } else {
          callback([]);
        }
      },
      (error) => {
        console.warn('Applicants subscription error:', error);
      }
    );
  }

  public async saveApplicant(applicant: Applicant): Promise<void> {
    const built = buildApplicant(applicant);
    const docRef = doc(db, COLLECTIONS.APPLICANTS, built.id);
    await setDoc(docRef, { ...built, lastUpdatedTimestamp: new Date().toISOString() }, { merge: true });
  }

  public async updateApplicant(id: string, updates: Partial<Applicant>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.APPLICANTS, id);
    await setDoc(docRef, { ...updates, lastUpdate: 'امروز، چند لحظه پیش', lastUpdatedTimestamp: new Date().toISOString() }, { merge: true });
  }

  public async deleteApplicant(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.APPLICANTS, id);
    await deleteDoc(docRef);
  }

  // ==================== INTRODUCTIONS ====================

  public subscribeIntroductions(callback: (introductions: Introduction[]) => void): Unsubscribe {
    const q = collection(db, COLLECTIONS.INTRODUCTIONS);
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Introduction[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Introduction);
        });
        callback(list);
      },
      (error) => {
        console.warn('Introductions subscription error:', error);
      }
    );
  }

  public async saveIntroduction(intro: Introduction): Promise<void> {
    const docRef = doc(db, COLLECTIONS.INTRODUCTIONS, intro.id);
    await setDoc(docRef, { ...intro, createdAtTimestamp: new Date().toISOString() });
  }

  public async updateIntroduction(id: string, updates: Partial<Introduction>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.INTRODUCTIONS, id);
    await updateDoc(docRef, updates as DocumentData);
  }

  // ==================== COUNSELING SESSIONS ====================

  public subscribeSessions(callback: (sessions: CounselingSession[]) => void): Unsubscribe {
    const q = collection(db, COLLECTIONS.COUNSELING_SESSIONS);
    return onSnapshot(
      q,
      (snapshot) => {
        const list: CounselingSession[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as CounselingSession);
        });
        callback(list);
      },
      (error) => {
        console.warn('Counseling sessions subscription error:', error);
      }
    );
  }

  public async saveSession(session: CounselingSession): Promise<void> {
    const docRef = doc(db, COLLECTIONS.COUNSELING_SESSIONS, session.id);
    await setDoc(docRef, session);
  }

  public async updateSession(id: string, updates: Partial<CounselingSession>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.COUNSELING_SESSIONS, id);
    await updateDoc(docRef, updates as DocumentData);
  }

  // ==================== TASKS ====================

  public subscribeTasks(callback: (tasks: Task[]) => void): Unsubscribe {
    const q = collection(db, COLLECTIONS.TASKS);
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Task[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Task);
        });
        callback(list);
      },
      (error) => {
        console.warn('Tasks subscription error:', error);
      }
    );
  }

  public async saveTask(task: Task): Promise<void> {
    const docRef = doc(db, COLLECTIONS.TASKS, task.id);
    await setDoc(docRef, task);
  }

  public async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.TASKS, id);
    await updateDoc(docRef, updates as DocumentData);
  }

  // ==================== AUDIT LOGS ====================

  public subscribeAuditLogs(callback: (logs: AuditLog[]) => void): Unsubscribe {
    const q = collection(db, COLLECTIONS.AUDIT_LOGS);
    return onSnapshot(
      q,
      (snapshot) => {
        const list: AuditLog[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as AuditLog);
        });
        callback(list);
      },
      (error) => {
        console.warn('Audit logs subscription error:', error);
      }
    );
  }

  public async addAuditLog(log: AuditLog): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.AUDIT_LOGS, log.id);
      await setDoc(docRef, { ...log, serverTimestamp: new Date().toISOString() });
    } catch (e) {
      console.warn('Could not write audit log to Firestore:', e);
    }
  }

  // ==================== USERS & RBAC ====================

  public subscribeUsers(callback: (users: User[]) => void): Unsubscribe {
    const q = collection(db, COLLECTIONS.USERS);
    return onSnapshot(
      q,
      (snapshot) => {
        const list: User[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as User);
        });
        callback(list);
      },
      (error) => {
        console.warn('Users subscription error:', error);
      }
    );
  }

  public async saveUser(user: User): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USERS, user.id);
    await setDoc(docRef, user, { merge: true });
  }

  // ==================== FIREBASE STORAGE FOR APPLICANT ASSETS ====================

  /**
   * Upload confidential applicant document or scanned certificate
   */
  public async uploadApplicantDocument(applicantId: string, file: File | Blob | string, docTitle: string): Promise<string> {
    const filename = `${docTitle.replace(/\s+/g, '_')}_${Date.now()}`;
    const fullPath = `applicant_documents/${applicantId}/${filename}`;
    return await uploadFileToFirebaseStorage(file, fullPath);
  }

  /**
   * Upload private applicant photo
   */
  public async uploadApplicantPhoto(applicantId: string, file: File | Blob | string): Promise<string> {
    const fullPath = `applicant_photos/${applicantId}/avatar_${Date.now()}`;
    return await uploadFileToFirebaseStorage(file, fullPath, 'image/jpeg');
  }

  /**
   * General file upload helper
   */
  public async uploadFile(file: File | Blob | string, folderPath: string = 'documents'): Promise<string> {
    const filename = `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullPath = `${folderPath}/${filename}`;
    return await uploadFileToFirebaseStorage(file, fullPath);
  }
}

export const firebaseDataService = new FirebaseDataService();
