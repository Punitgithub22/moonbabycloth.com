import { auth } from './firebase-config.js';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const googleProvider = new GoogleAuthProvider();

document.getElementById('google-login').addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    window.location.href = "/products.html"; // Redirect after login
  } catch (error) {
    console.error("Google Sign-In failed:", error);
  }
});