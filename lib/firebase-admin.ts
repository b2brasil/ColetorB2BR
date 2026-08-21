import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigJson from '../firebase-applet-config.json';

const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId || "coletor-v2-503313",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || firebaseConfigJson.appId || "1:257203705603:web:f1c361044651e9a4afbb36",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseConfigJson.apiKey || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain || "coletor-v2-503313.firebaseapp.com",
  firestoreDatabaseId: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId || "ai-studio-coletorb2brv4-8c694b22-6872-4d37-94a0-7c407327a48d"
};

function getFirebaseClient() {
  const activeApps = getApps();
  if (activeApps.length > 0) {
    return getApp();
  }

  return initializeApp({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId,
  });
}

const app = getFirebaseClient();

const dbId = firebaseConfig.firestoreDatabaseId;

export const db = dbId ? getFirestore(app, dbId) : getFirestore(app);

