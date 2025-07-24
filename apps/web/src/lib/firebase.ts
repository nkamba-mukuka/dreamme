// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { Analytics, getAnalytics } from "firebase/analytics";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Debug logging for environment variables
console.log('Environment Variables Check:', {
    VITE_FIREBASE_API_KEY: !!import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_STORAGE_BUCKET: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    VITE_FIREBASE_MESSAGING_SENDER_ID: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_APP_ID: !!import.meta.env.VITE_FIREBASE_APP_ID,
    VITE_FIREBASE_MEASUREMENT_ID: !!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
});

console.log('Firebase Config:', {
    apiKey: firebaseConfig.apiKey ? 'present' : 'missing',
    authDomain: firebaseConfig.authDomain ? 'present' : 'missing',
    projectId: firebaseConfig.projectId ? 'present' : 'missing',
    storageBucket: firebaseConfig.storageBucket ? 'present' : 'missing',
    messagingSenderId: firebaseConfig.messagingSenderId ? 'present' : 'missing',
    appId: firebaseConfig.appId ? 'present' : 'missing',
    measurementId: firebaseConfig.measurementId ? 'present' : 'missing',
});

let app: FirebaseApp;
let analytics: Analytics;
let auth: Auth;
let db: Firestore;

// Initialize Firebase
try {
    console.log('Initializing Firebase app...');
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');

    console.log('Initializing Firebase analytics...');
    analytics = getAnalytics(app);
    console.log('Firebase analytics initialized successfully');

    console.log('Initializing Firebase auth...');
    auth = getAuth(app);
    console.log('Firebase auth initialized successfully');

    console.log('Initializing Firebase firestore...');
    db = getFirestore(app);
    console.log('Firebase firestore initialized successfully');

    console.log('All Firebase services initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
}

// Export the Firebase instances
export {
    app,
    analytics,
    auth,    // For authentication
    db,      // For Firestore database
}; 