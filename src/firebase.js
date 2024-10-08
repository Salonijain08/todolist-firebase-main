import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBf_wz0FPXgl1l1p17oz-CgX-q0M9Z5KuE",
  authDomain: "to-do-list-850d7.firebaseapp.com",
  projectId: "to-do-list-850d7",
  storageBucket: "to-do-list-850d7.appspot.com",
  messagingSenderId: "969827849058",
  appId: "1:969827849058:web:284b42649ec4231a99d23b",
  measurementId: "G-2LDHCJT6R9",
  databaseURL: "https://to-do-list-850d7-default-rtdb.firebaseio.com/",
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
