/**
 * Firebase client setup (auth + Firestore).
 *
 * Config comes from NEXT_PUBLIC_* env vars, which ship to the browser -- that
 * is how every Firebase web app works. Data is protected by Firestore security
 * rules (see firestore.rules), not by hiding these values.
 *
 * Initialisation is lazy and guarded so it survives Next's hot reload and never
 * runs during static rendering on the server.
 */
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True when the env vars are present -- lets the UI degrade instead of crash. */
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId);

export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(config);
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseApp());
}
