import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // ❗ นำเข้า Firestore ให้ถูกต้อง
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    RecaptchaVerifier, 
    signInWithPhoneNumber 
} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBdd__5jzfF2Ph4uT0YuueWfo-iWoLuhSg",
    authDomain: "finalprojectsc362202.firebaseapp.com",
    projectId: "finalprojectsc362202",
    storageBucket: "finalprojectsc362202.appspot.com",
    messagingSenderId: "154193356905",
    appId: "1:154193356905:web:f9fc0d8ef8b66accc55af8",
    measurementId: "G-PLQLZ395E6"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firestore
const db = getFirestore(app);

// ✅ Initialize Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ✅ Export ให้ถูกต้อง
export { auth, googleProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, db };
