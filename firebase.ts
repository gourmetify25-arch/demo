import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyAThZMlBjaGlDMl6PSzhVmPkWTof97UMCo",
    authDomain: "gourmetify-689e0.firebaseapp.com",
    projectId: "gourmetify-689e0",
    storageBucket: "gourmetify-689e0.firebasestorage.app",
    messagingSenderId: "56750990246",
    appId: "1:56750990246:web:a2f1a1fa210750db9c2567",
    measurementId: "G-01KJT7ECNW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
