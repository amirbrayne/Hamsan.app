import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User, UserRole } from '../types';

export interface AuthState {
  user: FirebaseUser | null;
  appUser: User | null;
  role: UserRole;
  isLoading: boolean;
  error: string | null;
}

export class AuthService {
  private confirmationResult: ConfirmationResult | null = null;

  /**
   * Listen to Firebase auth state changes and fetch user role from Firestore
   */
  public onAuthChange(callback: (user: FirebaseUser | null, appUser: User | null) => void) {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as User;
            callback(fbUser, data);
            return;
          }
        } catch (e) {
          console.warn('Error fetching Firestore user profile on auth change:', e);
        }
        // Fallback user representation
        const fallbackUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || fbUser.phoneNumber || 'کاربر سیستم',
          email: fbUser.email || '',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          role: 'counselor',
          roleTitle: 'مشاور خانواده و همسان‌گزینی',
          phone: fbUser.phoneNumber || '',
          department: 'دپارتمان مشاوره',
          assignedCount: 0,
        };
        callback(fbUser, fallbackUser);
      } else {
        callback(null, null);
      }
    });
  }

  /**
   * Real Email / Password sign in
   */
  public async loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  }

  /**
   * Register new user with Email/Password and create Firestore user document
   */
  public async registerWithEmail(
    email: string,
    pass: string,
    fullName: string,
    role: UserRole = 'counselor',
    roleTitle: string = 'مشاور خانواده و همسان‌گزینی',
    phone: string = ''
  ): Promise<User> {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: fullName });

    const newUser: User = {
      id: cred.user.uid,
      name: fullName,
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      role,
      roleTitle,
      phone,
      department: role === 'counselor' ? 'دپارتمان مشاوره' : role === 'employee' ? 'دایره پذیرش و پرونده‌ها' : 'مدیریت مرکز',
      assignedCount: 0,
    };

    const userDocRef = doc(db, 'users', cred.user.uid);
    await setDoc(userDocRef, newUser, { merge: true });
    return newUser;
  }

  /**
   * Phone number OTP Request (with invisible reCAPTCHA container)
   */
  public async requestPhoneOtp(
    phoneNumber: string,
    containerId: string = 'recaptcha-container'
  ): Promise<boolean> {
    try {
      // Format number to E.164 if Iranian format (09xxxxxxxxx -> +989xxxxxxxxx)
      let formattedPhone = phoneNumber.trim();
      if (formattedPhone.startsWith('09')) {
        formattedPhone = '+98' + formattedPhone.substring(1);
      }

      // Initialize ReCaptcha
      const appVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
      });

      this.confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      return true;
    } catch (error) {
      console.error('Phone OTP request failed:', error);
      throw error;
    }
  }

  /**
   * Confirm Phone OTP code
   */
  public async verifyPhoneOtp(otpCode: string, fullName?: string): Promise<FirebaseUser> {
    if (!this.confirmationResult) {
      throw new Error('کد تأیید هنوز ارسال نشده یا منقضی شده است. مجدداً تلاش فرمایید.');
    }
    const cred = await this.confirmationResult.confirm(otpCode);
    const user = cred.user;

    // Check if user exists in Firestore, if not create user document
    const userDocRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      const newUser: User = {
        id: user.uid,
        name: fullName || `کاربر (${user.phoneNumber})`,
        email: user.email || '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        phone: user.phoneNumber || '',
        role: 'counselor',
        roleTitle: 'مشاور پرونده‌ها',
        department: 'دپارتمان مشاوره',
        assignedCount: 0,
      };
      await setDoc(userDocRef, newUser);
    }
    return user;
  }

  /**
   * Sign out
   */
  public async logout(): Promise<void> {
    await firebaseSignOut(auth);
  }
}

export const authService = new AuthService();
