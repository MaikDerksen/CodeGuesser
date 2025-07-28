
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "code-guesser-jkzdv",
  appId: "1:886477999939:web:9a85713a9c8a9ad37de9f6",
  storageBucket: "code-guesser-jkzdv.firebasestorage.app",
  apiKey: "AIzaSyDgmWWB0UsdKdI3UG-xh9viQcLZYh20wQI",
  authDomain: "code-guesser-jkzdv.firebaseapp.com",
  messagingSenderId: "886477999939",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
