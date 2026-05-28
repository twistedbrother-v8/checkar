import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";

const firebaseConfig = {
  apiKey:            "AIzaSyBnALwWwPaTyizMiywmKRLhXUGwXXK7x_k",
  authDomain:        "checkar-4a9ad.firebaseapp.com",
  projectId:         "checkar-4a9ad",
  storageBucket:     "checkar-4a9ad.firebasestorage.app",
  messagingSenderId: "489510743392",
  appId:             "1:489510743392:web:7c7c0c6265911d5fd0c205",
  measurementId:     "G-RVLBGDQ35J"
};

const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);

export const loginUser         = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
export const registerUser      = (email, pw) => createUserWithEmailAndPassword(auth, email, pw);
export const logoutUser        = ()          => signOut(auth);
export const onAuthChange      = (cb)        => onAuthStateChanged(auth, cb);
export const resetPassword     = (email)     => sendPasswordResetEmail(auth, email);