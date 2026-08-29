import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage, uploadString } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
  });
} else {
  app = getApp();
}

// Initialize Firestore with specific database ID and persistence
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Initialize Firebase Storage
export const storage: FirebaseStorage = getStorage(app);

export {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadString,
};

export type { FirebaseUser };

/**
 * Upload a document or image file to Firebase Storage
 */
export async function uploadFileToFirebaseStorage(
  file: File | Blob | string,
  path: string,
  contentType?: string
): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    if (typeof file === 'string') {
      if (file.startsWith('data:')) {
        // Data URL upload
        const snapshot = await uploadString(storageRef, file, 'data_url', {
          contentType: contentType || 'image/jpeg',
        });
        return await getDownloadURL(snapshot.ref);
      }
      return file;
    } else if (file && typeof file === 'object') {
      const isFile = typeof File !== 'undefined' && file instanceof File;
      const fileType = isFile ? (file as File).type : 'application/octet-stream';
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: contentType || fileType,
      });
      return await getDownloadURL(snapshot.ref);
    } else {
      throw new Error('Invalid file format for upload');
    }
  } catch (error) {
    console.warn('Firebase Storage upload failed or not configured, using fallback URL:', error);
    // If upload fails, return a dataURL or mock placeholder to prevent UI breakage
    if (typeof file === 'string') return file;
    return URL.createObjectURL(file as Blob);
  }
}
