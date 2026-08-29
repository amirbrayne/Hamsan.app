import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export interface AuditLogEntry {
  id?: string;
  userId: string;
  userName?: string;
  userRole?: string;
  action: string;
  resource: string;
  details: string;
  timestamp: any;
  isoTimestamp: string;
  shamsiTimestamp: string;
  userAgent?: string;
}

/**
 * Automatically adds an unalterable audit log entry into the 'audit_logs' collection in Firestore.
 */
export async function logActivity(
  userId: string,
  action: string,
  resource: string,
  details: string | Record<string, any> = '',
  userName?: string,
  userRole?: string
): Promise<string | null> {
  try {
    const formattedDetails = typeof details === 'object' ? JSON.stringify(details) : String(details);
    const now = new Date();
    const shamsiDate = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(now);

    const logData: Omit<AuditLogEntry, 'id'> = {
      userId: userId || 'anonymous',
      userName: userName || 'کاربر سیستم',
      userRole: userRole || 'GUEST',
      action,
      resource,
      details: formattedDetails,
      timestamp: serverTimestamp(),
      isoTimestamp: now.toISOString(),
      shamsiTimestamp: shamsiDate,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    const docRef = await addDoc(collection(db, 'audit_logs'), logData);
    return docRef.id;
  } catch (error) {
    console.warn('Audit log write error:', error);
    return null;
  }
}
