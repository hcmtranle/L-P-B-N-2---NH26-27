import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, updateDoc, deleteDoc, query, where, onSnapshot } from "firebase/firestore";
import firebaseConfigJson from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfigJson) : getApps()[0];
const db = getFirestore(app, firebaseConfigJson.firestoreDatabaseId || undefined);

export { app, db, collection, doc, setDoc, getDocs, getDoc, updateDoc, deleteDoc, query, where, onSnapshot };
