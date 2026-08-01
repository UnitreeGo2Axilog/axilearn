"use client";

/**
 * Auth state for the whole app.
 *
 * Wraps Firebase Auth and mirrors a small profile document in Firestore
 * (`users/{uid}`) holding the display name, chosen language and ROLE
 * (student | admin). The role lives in Firestore, not in the client, because
 * the security rules read it -- a user cannot promote themselves by editing
 * anything in the browser.
 *
 * If Firebase env vars are missing the provider still renders, with `user`
 * null and `configured` false, so the site can be browsed without a backend
 * (useful during Phase 1 and for anyone cloning the repo).
 */
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getDb, getFirebaseAuth, isFirebaseConfigured } from "./firebase";
import type { Locale } from "@/content/types";

export type Role = "student" | "admin";

export interface Profile {
  uid: string;
  displayName: string;
  email: string | null;
  role: Role;
  locale: Locale;
  /** Set by an admin to stop this account posting in the discussion area.
   *  Enforced by the rules; this copy only decides what the UI shows. */
  blocked?: boolean;
}

interface AuthValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  configured: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  /**
   * Change the learner's own display name.
   *
   * Written in BOTH places, because both are read. The Firestore document is
   * what the admin roster and the certificate use; the Firebase Auth record
   * is what ensureProfile falls back to and what Google sign-in populates.
   * Letting them drift means a learner renames themselves and their teacher's
   * roster keeps showing the old name.
   */
  updateDisplayName: (name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

/** Create the user's profile document the first time we see them. */
async function ensureProfile(user: User, locale: Locale): Promise<Profile> {
  const ref = doc(getDb(), "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data() as Partial<Profile>;
    return {
      uid: user.uid,
      displayName: data.displayName || user.displayName || "Learner",
      email: user.email,
      role: data.role === "admin" ? "admin" : "student",
      locale: (data.locale as Locale) || locale,
      ...(data.blocked === true ? { blocked: true } : {}),
    };
  }
  const profile: Profile = {
    uid: user.uid,
    displayName: user.displayName || user.email?.split("@")[0] || "Learner",
    email: user.email,
    role: "student", // never assign admin from the client
    locale,
  };
  await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
  return profile;
}

export function AuthProvider({
  children,
  locale = "en",
}: {
  children: React.ReactNode;
  locale?: Locale;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (u) => {
      setUser(u);
      if (u) {
        try {
          setProfile(await ensureProfile(u, locale));
        } catch {
          // Firestore unreachable (rules/offline): keep the session usable.
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [locale]);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      profile,
      loading,
      configured: isFirebaseConfigured,
      async signUp(name, email, password) {
        const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
        if (name) await updateProfile(cred.user, { displayName: name });
      },
      async signIn(email, password) {
        await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      },
      async signInWithGoogle() {
        await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      },
      async resetPassword(email) {
        // Firebase sends the email and hosts the reset page itself, so there
        // is no token handling or reset route for us to get wrong.
        await sendPasswordResetEmail(getFirebaseAuth(), email);
      },
      async updateDisplayName(name) {
        const current = getFirebaseAuth().currentUser;
        if (!current) throw new Error("Not signed in");
        const clean = name.trim();
        if (!clean) throw new Error("Name cannot be empty");

        await updateProfile(current, { displayName: clean });
        // merge, not set: the user document also holds role, bookmarks and
        // read notifications, and none of those belong to this form.
        await setDoc(
          doc(getDb(), "users", current.uid),
          { displayName: clean },
          { merge: true },
        );
        // Update local state rather than waiting for a reload -- the header,
        // the avatar's initials and the certificate all read this, and none
        // of them re-fetch on their own.
        setProfile((prev) => (prev ? { ...prev, displayName: clean } : prev));
      },
      async logout() {
        await signOut(getFirebaseAuth());
      },
    }),
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
