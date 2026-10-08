import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAed41YnjAOHvL3PjJwYl3pBlYQoJ1vLeE",
  authDomain: "kcs-kits-c8439.firebaseapp.com",
  projectId: "kcs-kits-c8439",
  storageBucket: "kcs-kits-c8439.firebasestorage.app",
  messagingSenderId: "374503283232",
  appId: "1:374503283232:web:45837f1b9c8cfa57547a45"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;