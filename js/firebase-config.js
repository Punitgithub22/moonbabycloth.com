import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5jIU5rMAOn2F27eRtURn9-ifu-z-9B0",
  authDomain: "moonbabycloth.firebaseapp.com",
  projectId: "moonbabycloth",
  storageBucket: "moonbabycloth.firebasestorage.app",
  messagingSenderId: "523483719951",
  appId: "1:523483719951:web:daa9815e4a44b8e6f6f67a",
  measurementId: "G-FH1TWP1F56"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);