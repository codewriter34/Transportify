// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "your-api-key-here",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "transportify-d94c3.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "transportify-d94c3",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "transportify-d94c3.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "58749604139",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:58749604139:web:a5641399406f9a9d45756e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);