import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA08pcVZxfSUW2CUwgzLBzBEvxv2ZsAFA",
  authDomain: "akish-portfolio.firebaseapp.com",
  projectId: "akish-portfolio",
  storageBucket: "akish-portfolio.firebasestorage.app",
  messagingSenderId: "728543833979",
  appId: "1:728543833979:web:7d475364da672317eb17de",
  measurementId: "G-ZHKFE3ERPV"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
