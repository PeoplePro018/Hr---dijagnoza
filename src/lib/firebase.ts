import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ClientSubmission, ClientStatus } from '../types';

// Initialize Firebase (100% Free Spark Plan)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Target provisioned database ID
const customDbId = (firebaseConfig as any).firestoreDatabaseId;
export const db =
  customDbId && customDbId !== '(default)'
    ? getFirestore(app, customDbId)
    : getFirestore(app);

// Validate connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
  }
}
testConnection();

const SUBMISSIONS_COLLECTION = 'client_submissions';

/**
 * Save new client submission to Firestore
 */
export async function saveClientSubmissionToFirestore(submission: ClientSubmission): Promise<void> {
  try {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, submission.id);
    await setDoc(docRef, submission);
  } catch (err) {
    console.error('Error saving submission to Firestore:', err);
    throw err;
  }
}

/**
 * Subscribe to real-time client submissions updates for Admin
 */
export function subscribeToSubmissions(
  onData: (submissions: ClientSubmission[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION),
      orderBy('submittedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: ClientSubmission[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as ClientSubmission);
        });
        onData(items);
      },
      (error) => {
        console.warn('Firestore subscription error, fallback will be used:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error('Failed to create snapshot listener:', err);
    return () => {};
  }
}

/**
 * Update client status in Firestore
 */
export async function updateSubmissionStatusInFirestore(
  submissionId: string,
  status: ClientStatus
): Promise<void> {
  try {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
    await updateDoc(docRef, { status });
  } catch (err) {
    console.error('Error updating status in Firestore:', err);
    throw err;
  }
}

/**
 * Update consultant notes in Firestore
 */
export async function updateSubmissionNotesInFirestore(
  submissionId: string,
  notes: string
): Promise<void> {
  try {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
    await updateDoc(docRef, { notes });
  } catch (err) {
    console.error('Error updating notes in Firestore:', err);
    throw err;
  }
}

/**
 * Save / Update consultation booking details in Firestore
 */
export async function updateSubmissionBookingInFirestore(
  submissionId: string,
  booking: any
): Promise<void> {
  try {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
    await updateDoc(docRef, {
      booking,
      status: 'ugovoren_sastanak'
    });
  } catch (err) {
    console.error('Error saving consultation booking to Firestore:', err);
    throw err;
  }
}

