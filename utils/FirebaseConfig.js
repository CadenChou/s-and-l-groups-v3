// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore/lite";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWzsjFCaAreld-rRlLXZCwD1kGvnzD_zg",
  authDomain: "fir-and-l-groups.firebaseapp.com",
  projectId: "fir-and-l-groups",
  storageBucket: "fir-and-l-groups.appspot.com",
  messagingSenderId: "704137894253",
  appId: "1:704137894253:web:939303edc1f3025666a264",
  measurementId: "G-KL2ZM3TL7Z",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
// const analytics = getAnalytics(app);
