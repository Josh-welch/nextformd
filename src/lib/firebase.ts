import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD1t35LYfXE9EIOlE4v8JvNmjCufHM9lKo",
  authDomain: "nextformd.firebaseapp.com",
  projectId: "nextformd",
  storageBucket: "nextformd.appspot.com",
  messagingSenderId: "584370173487",
  appId: "1:584370173487:web:7eaee4e5131f28f7a4b8da"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);