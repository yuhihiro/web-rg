import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC9z5_Y9UxyXO_VjJ7y3L8Ft5vkSLUZd68",
  authDomain: "web-rg-a1608.firebaseapp.com",
  projectId: "web-rg-a1608",
  storageBucket: "web-rg-a1608.firebasestorage.app",
  messagingSenderId: "1061035602343",
  appId: "1:1061035602343:web:ad463a02716a1644d94682",
  measurementId: "G-FN6W56JXFP"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
