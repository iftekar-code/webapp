import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBZUMscizXo-w0i9_PB2fEu724H86qQaUc',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'studyeasily-7a9a4.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'studyeasily-7a9a4',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'studyeasily-7a9a4.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '930761299785',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:930761299785:web:aec5c4ec6652e86b1f2c98',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-Y95KVND0H9',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
