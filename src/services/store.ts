import { useState, useEffect } from 'react';
import {
  User,
  Applicant,
  CounselingSession,
  Introduction,
  Task,
  AuditLog,
  UserRole,
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
import { firebaseDataService, IS_PRODUCTION } from './firebaseDataService';
import { authService } from './authService';

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'alzahra_current_user_id',
  APPLICANTS: 'alzahra_applicants_v2',
  INTRODUCTIONS: 'alzahra_introductions_v2',
  SESSIONS: 'alzahra_sessions_v2',
  TASKS: 'alzahra_tasks_v2',
  AUDIT_LOGS: 'alzahra_audit_logs_v2',
  PRIVACY_GLOBAL_UNMASK: 'alzahra_privacy_unmasked',
};

export class CRMStore {
  private users: User[] = INITIAL_USERS;
  private currentUserId: string = 'user_admin';
  private applicants: Applicant[] = IS_PRODUCTION ? [] : INITIAL_APPLICANTS;
  private introductions: Introduction[] = IS_PRODUCTION ? [] : INITIAL_INTRODUCTIONS;
  private sessions: CounselingSession[] = IS_PRODUCTION ? [] : INITIAL_COUNSELING_SESSIONS;
  private tasks: Task[] = IS_PRODUCTION ? [] : INITIAL_TASKS;
  private auditLogs: AuditLog[] = IS_PRODUCTION ? [] : INITIAL_AUDIT_LOGS;
  private isGlobalUnmasked: boolean = false;
  private isFirestoreSynced: boolean = false;
  private listeners: Set<() => void> = new Set();
  private unsubscribers: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
    this.initFirebaseSync();
    this.initAuthListener();
  }

  /**
   * Listen to real Firebase Authentication states
   */
  private initAuthListener() {
    authService.onAuthChange((fbUser, appUser) => {
      if (appUser) {
        // Sync appUser into users list if not present
        if (!this.users.some((u) => u.id === appUser.id)) {
          this.users = [appUser, ...this.users];
        }
        this.currentUserId = appUser.id;
        this.logAudit('احراز هویت کارشناس', 'Auth', appUser.id, `ورود با هویت ${appUser.name} (${appUser.roleTitle})`);
        this.saveToStorage();
      }
    });
  }

  /**
   * Initialize real-time synchronization with Firestore
   */
  private async initFirebaseSync() {
    try {
      // 1. In development mode, auto seed benchmark data
      if (!IS_PRODUCTION) {
        firebaseDataService.seedInitialDataIfEmpty().then((seeded) => {
          if (seeded) {
            console.log('Firebase Firestore initialized and benchmark records loaded.');
          }
        });
      }

      // 2. Real-time Applicants Listener
      const unsubApplicants = firebaseDataService.subscribeApplicants((cloudApplicants) => {
        if (cloudApplicants) {
          this.applicants = cloudApplicants;
          this.isFirestoreSynced = true;
          this.saveToStorage(false);
        }
      });
      this.unsubscribers.push(unsubApplicants);

      // 3. Real-time Introductions Listener
      const unsubIntros = firebaseDataService.subscribeIntroductions((cloudIntros) => {
        if (cloudIntros) {
          this.introductions = cloudIntros;
          this.saveToStorage(false);
        }
      });
      this.unsubscribers.push(unsubIntros);

      // 4. Real-time Sessions Listener
      const unsubSessions = firebaseDataService.subscribeSessions((cloudSessions) => {
        if (cloudSessions) {
          this.sessions = cloudSessions;
          this.saveToStorage(false);
        }
      });
      this.unsubscribers.push(unsubSessions);

      // 5. Real-time Tasks Listener
      const unsubTasks = firebaseDataService.subscribeTasks((cloudTasks) => {
        if (cloudTasks) {
          this.tasks = cloudTasks;
          this.saveToStorage(false);
        }
      });
      this.unsubscribers.push(unsubTasks);

      // 6. Real-time Audit Logs Listener
      const unsubLogs = firebaseDataService.subscribeAuditLogs((cloudLogs) => {
        if (cloudLogs) {
          this.auditLogs = cloudLogs;
          this.saveToStorage(false);
        }
      });
      this.unsubscribers.push(unsubLogs);

      // 7. Real-time Users Listener
      const unsubUsers = firebaseDataService.subscribeUsers((cloudUsers) => {
        if (cloudUsers && cloudUsers.length > 0) {
          this.users = cloudUsers;
          this.saveToStorage(false);
        }
      });
      this.unsubscribers.push(unsubUsers);
    } catch (err) {
      console.warn('Firebase sync initialization warning:', err);
    }
  }

  private loadFromStorage() {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      if (savedUser && this.users.some((u) => u.id === savedUser)) {
        this.currentUserId = savedUser;
      }

      const savedApplicants = localStorage.getItem(STORAGE_KEYS.APPLICANTS);
      if (savedApplicants) {
        const parsed = JSON.parse(savedApplicants);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.applicants = parsed.map(buildApplicant);
        }
      }

      const savedIntros = localStorage.getItem(STORAGE_KEYS.INTRODUCTIONS);
      if (savedIntros) {
        this.introductions = JSON.parse(savedIntros);
      }

      const savedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (savedSessions) {
        this.sessions = JSON.parse(savedSessions);
      }

      const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (savedTasks) {
        this.tasks = JSON.parse(savedTasks);
      }

      const savedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (savedLogs) {
        this.auditLogs = JSON.parse(savedLogs);
      }

      const savedPrivacy = localStorage.getItem(STORAGE_KEYS.PRIVACY_GLOBAL_UNMASK);
      if (savedPrivacy !== null) {
        this.isGlobalUnmasked = savedPrivacy === 'true';
      }
    } catch (e) {
      console.warn('Could not load from localStorage, using fresh state.', e);
    }
  }

  private saveToStorage(notifyListeners: boolean = true) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
      localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(this.applicants));
      localStorage.setItem(STORAGE_KEYS.INTRODUCTIONS, JSON.stringify(this.introductions));
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(this.sessions));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(this.tasks));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
      localStorage.setItem(STORAGE_KEYS.PRIVACY_GLOBAL_UNMASK, String(this.isGlobalUnmasked));
    } catch (e) {
      console.error('Error saving state to localStorage', e);
    }
    if (notifyListeners) {
      this.notify();
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // Getters
  public getUsers(): User[] {
    return this.users;
  }

  public getCurrentUser(): User {
    return this.users.find((u) => u.id === this.currentUserId) || this.users[0];
  }

  public setCurrentUser(userId: string) {
    const target = this.users.find((u) => u.id === userId);
    if (target) {
      this.currentUserId = userId;
      this.logAudit('تغییر کاربر جاری سیستم', 'User', userId, `ورود با نقش ${target.roleTitle}`);
      this.saveToStorage();
    }
  }

  public getGlobalUnmasked(): boolean {
    return this.isGlobalUnmasked;
  }

  public toggleGlobalUnmask() {
    this.isGlobalUnmasked = !this.isGlobalUnmasked;
    this.logAudit(
      this.isGlobalUnmasked ? 'غیرفعال‌سازی ماسک محرمانگی سراسری' : 'فعال‌سازی ماسک محرمانگی سراسری',
      'Privacy',
      'Global',
      'تغییر وضعیت نمایش اطلاعات هویتی و تماس'
    );
    this.saveToStorage();
  }

  public getApplicants(): Applicant[] {
    return this.applicants;
  }

  public getApplicantById(id: string): Applicant | undefined {
    return this.applicants.find((a) => a.id === id);
  }

  public async addApplicant(applicant: Applicant) {
    const built = buildApplicant(applicant);
    this.applicants = [built, ...this.applicants];
    this.logAudit(
      'ثبت پرونده مراجع جدید',
      'Applicant',
      built.fileCode || built.caseCode,
      `ایجاد پرونده برای ${built.firstName} ${built.lastName}`
    );
    this.saveToStorage();

    try {
      await firebaseDataService.saveApplicant(built);
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  }

  public async updateApplicant(id: string, updates: Partial<Applicant>) {
    const updated = buildApplicant({ ...this.getApplicantById(id), ...updates, lastUpdate: 'امروز، چند لحظه پیش' });
    this.applicants = this.applicants.map((a) => (a.id === id ? updated : a));
    this.logAudit('ویرایش پرونده مراجع', 'Applicant', id, 'بروزرسانی مشخصات پرونده مراجع');
    this.saveToStorage();

    try {
      await firebaseDataService.updateApplicant(id, updates);
    } catch (e) {
      console.warn('Firestore update warning:', e);
    }
  }

  public async deleteApplicant(id: string) {
    const item = this.applicants.find((a) => a.id === id);
    this.applicants = this.applicants.filter((a) => a.id !== id);
    if (item) {
      this.logAudit('حذف/بایگانی پرونده مراجع', 'Applicant', item.fileCode, `حذف پرونده ${item.firstName} ${item.lastName}`);
    }
    this.saveToStorage();

    try {
      await firebaseDataService.deleteApplicant(id);
    } catch (e) {
      console.warn('Firestore delete warning:', e);
    }
  }

  // Introductions
  public getIntroductions(): Introduction[] {
    return this.introductions;
  }

  public getIntroductionById(id: string): Introduction | undefined {
    return this.introductions.find((i) => i.id === id);
  }

  public async addIntroduction(intro: Introduction) {
    this.introductions = [intro, ...this.introductions];
    this.logAudit(
      'ایجاد معرفی جدید',
      'Introduction',
      intro.introCode,
      `معرفی پرونده ${intro.maleFileCode} و ${intro.femaleFileCode} با امتیاز ${intro.compatibilityScore}٪`
    );
    this.saveToStorage();

    try {
      await firebaseDataService.saveIntroduction(intro);
    } catch (e) {
      console.warn('Firestore save intro warning:', e);
    }
  }

  public async updateIntroductionStatus(id: string, newStatus: IntroductionStatus, reason?: string) {
    const statusMap: Record<IntroductionStatus, string> = {
      pending: 'در انتظار بررسی',
      contacted: 'تماس اولیه و بررسی خانواده‌ها',
      meeting: 'جلسه معارفه حضوری',
      successful: 'موفق (عقد رسمی / پیوند)',
      rejected: 'عدم توافق (بایگانی مورد)',
    };

    let targetUpdated: Introduction | null = null;

    this.introductions = this.introductions.map((item) => {
      if (item.id === id) {
        const updatedTimeline = [
          ...item.timeline,
          {
            date: 'امروز',
            title: `تغییر وضعیت به: ${statusMap[newStatus]}`,
            description: reason ? `علت/توضیحات: ${reason}` : 'تغییر مرحله توسط کارشناس',
            actor: this.getCurrentUser().name,
          },
        ];
        const res: Introduction = {
          ...item,
          status: newStatus,
          statusFa: statusMap[newStatus],
          rejectionReason: reason || item.rejectionReason,
          timeline: updatedTimeline,
        };
        targetUpdated = res;
        return res;
      }
      return item;
    });

    this.logAudit('تغییر وضعیت پرونده معرفی', 'Introduction', id, `وضعیت جدید: ${statusMap[newStatus]}`);
    this.saveToStorage();

    if (targetUpdated) {
      try {
        await firebaseDataService.updateIntroduction(id, targetUpdated);
      } catch (e) {
        console.warn('Firestore update intro warning:', e);
      }
    }
  }

  // Counseling Sessions
  public getSessions(): CounselingSession[] {
    return this.sessions;
  }

  public async addSession(session: CounselingSession) {
    this.sessions = [session, ...this.sessions];
    this.logAudit('ثبت نوبت/جلسه مشاوره', 'Counseling', session.applicantFileCode, `ثبت ${session.title}`);
    this.saveToStorage();

    try {
      await firebaseDataService.saveSession(session);
    } catch (e) {
      console.warn('Firestore save session warning:', e);
    }
  }

  public async updateSession(id: string, updates: Partial<CounselingSession>) {
    this.sessions = this.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s));
    this.logAudit('ویرایش جلسه مشاوره', 'Counseling', id, 'بروزرسانی یادداشت‌ها یا وضعیت جلسه');
    this.saveToStorage();

    try {
      await firebaseDataService.updateSession(id, updates);
    } catch (e) {
      console.warn('Firestore update session warning:', e);
    }
  }

  // Tasks
  public getTasks(): Task[] {
    return this.tasks;
  }

  public async toggleTaskDone(taskId: string) {
    let updatedTask: Task | null = null;
    this.tasks = this.tasks.map((t) => {
      if (t.id === taskId) {
        updatedTask = { ...t, isDone: !t.isDone };
        return updatedTask;
      }
      return t;
    });
    this.saveToStorage();

    if (updatedTask) {
      try {
        await firebaseDataService.updateTask(taskId, updatedTask);
      } catch (e) {
        console.warn('Firestore update task warning:', e);
      }
    }
  }

  public async addTask(task: Task) {
    this.tasks = [task, ...this.tasks];
    this.saveToStorage();

    try {
      await firebaseDataService.saveTask(task);
    } catch (e) {
      console.warn('Firestore add task warning:', e);
    }
  }

  public async postponeTask(taskId: string, newDateText: string) {
    let updatedTask: Task | null = null;
    this.tasks = this.tasks.map((t) => {
      if (t.id === taskId) {
        updatedTask = { ...t, dueDate: newDateText };
        return updatedTask;
      }
      return t;
    });
    this.logAudit('تعویق وظیفه/پیگیری', 'Task', taskId, `تعویق به تاریخ ${newDateText}`);
    this.saveToStorage();

    if (updatedTask) {
      try {
        await firebaseDataService.updateTask(taskId, updatedTask);
      } catch (e) {
        console.warn('Firestore postpone task warning:', e);
      }
    }
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public logAudit(action: string, targetEntity: string, targetId: string, details: string) {
    const user = this.getCurrentUser();
    const newLog: AuditLog = {
      id: 'log_' + Date.now() + Math.random().toString(36).substring(2, 5),
      timestamp:
        new Date().toLocaleDateString('fa-IR') +
        ' - ' +
        new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      targetEntity,
      targetId,
      details,
    };
    this.auditLogs = [newLog, ...this.auditLogs.slice(0, 99)];

    // Send to Firestore
    firebaseDataService.addAuditLog(newLog).catch((e) => console.warn(e));
  }

  // Permissions helper for RBAC
  public canAccess(
    permission:
      | 'manage_users'
      | 'view_all_cases'
      | 'edit_profiles'
      | 'access_private_notes'
      | 'export_reports'
      | 'manage_matches'
  ): boolean {
    const role = this.getCurrentUser().role;
    if (role === 'main_admin') return true;
    if (role === 'internal_manager') {
      return permission !== 'manage_users';
    }
    if (role === 'counselor') {
      return (
        permission === 'access_private_notes' ||
        permission === 'view_all_cases' ||
        permission === 'manage_matches'
      );
    }
    if (role === 'employee') {
      return (
        permission === 'view_all_cases' ||
        permission === 'edit_profiles' ||
        permission === 'manage_matches'
      );
    }
    return false;
  }

  // Storage file upload helper
  public async uploadDocument(file: File | Blob | string, folder: string = 'documents'): Promise<string> {
    return await firebaseDataService.uploadFile(file, folder);
  }

  public async uploadApplicantDocument(applicantId: string, file: File | Blob | string, title: string): Promise<string> {
    return await firebaseDataService.uploadApplicantDocument(applicantId, file, title);
  }

  public async uploadApplicantPhoto(applicantId: string, file: File | Blob | string): Promise<string> {
    return await firebaseDataService.uploadApplicantPhoto(applicantId, file);
  }

  // Manual reset/seed tool for admin testing
  public async resetToSeedData() {
    this.applicants = INITIAL_APPLICANTS;
    this.introductions = INITIAL_INTRODUCTIONS;
    this.sessions = INITIAL_COUNSELING_SESSIONS;
    this.tasks = INITIAL_TASKS;
    this.auditLogs = INITIAL_AUDIT_LOGS;
    this.saveToStorage();

    // Reseed Firestore
    await firebaseDataService.seedAllData();
  }
}

export const crmStore = new CRMStore();

export function useCRMStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = crmStore.subscribe(() => {
      setTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  return {
    currentUser: crmStore.getCurrentUser(),
    users: crmStore.getUsers(),
    setCurrentUser: (id: string) => crmStore.setCurrentUser(id),
    isGlobalUnmasked: crmStore.getGlobalUnmasked(),
    toggleGlobalUnmask: () => crmStore.toggleGlobalUnmask(),
    applicants: crmStore.getApplicants(),
    getApplicantById: (id: string) => crmStore.getApplicantById(id),
    addApplicant: (a: Applicant) => crmStore.addApplicant(a),
    updateApplicant: (id: string, u: Partial<Applicant>) => crmStore.updateApplicant(id, u),
    deleteApplicant: (id: string) => crmStore.deleteApplicant(id),
    introductions: crmStore.getIntroductions(),
    getIntroductionById: (id: string) => crmStore.getIntroductionById(id),
    addIntroduction: (i: Introduction) => crmStore.addIntroduction(i),
    updateIntroductionStatus: (id: string, s: IntroductionStatus, r?: string) =>
      crmStore.updateIntroductionStatus(id, s, r),
    sessions: crmStore.getSessions(),
    addSession: (s: CounselingSession) => crmStore.addSession(s),
    updateSession: (id: string, u: Partial<CounselingSession>) => crmStore.updateSession(id, u),
    tasks: crmStore.getTasks(),
    toggleTaskDone: (id: string) => crmStore.toggleTaskDone(id),
    addTask: (t: Task) => crmStore.addTask(t),
    postponeTask: (id: string, d: string) => crmStore.postponeTask(id, d),
    auditLogs: crmStore.getAuditLogs(),
    canAccess: (
      p:
        | 'manage_users'
        | 'view_all_cases'
        | 'edit_profiles'
        | 'access_private_notes'
        | 'export_reports'
        | 'manage_matches'
    ) => crmStore.canAccess(p),
    uploadDocument: (file: File | Blob | string, folder?: string) => crmStore.uploadDocument(file, folder),
    uploadApplicantDocument: (applicantId: string, file: File | Blob | string, title: string) =>
      crmStore.uploadApplicantDocument(applicantId, file, title),
    uploadApplicantPhoto: (applicantId: string, file: File | Blob | string) =>
      crmStore.uploadApplicantPhoto(applicantId, file),
    resetToSeedData: () => crmStore.resetToSeedData(),
  };
}
