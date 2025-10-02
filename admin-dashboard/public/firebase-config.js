// Firebase Configuration for Admin Dashboard
const firebaseConfig = {
    apiKey: "AIzaSyBdUqukFPi_bT5u2N8nEG4wEJyQbcCimrU",
    authDomain: "transportify-d94c3.firebaseapp.com",
    projectId: "transportify-d94c3",
    storageBucket: "transportify-d94c3.firebasestorage.app",
    messagingSenderId: "58749604139",
    appId: "1:58749604139:web:a5641399406f9a9d45756e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Global variables for Firebase services
window.db = db;
window.firebase = firebase;
