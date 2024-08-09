// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Importeer Firebase Storage

const firebaseConfig = {
    apiKey: "AIzaSyC_12hQsxn9p1Ev-Cmwi0mYS_qXDoThBeI",
    authDomain: "userkeep2-2450f.firebaseapp.com",
    projectId: "userkeep2-2450f",
    storageBucket: "userkeep2-2450f.appspot.com",
    messagingSenderId: "728242641327",
    appId: "1:728242641327:web:27c40b522f88f5d96b775a"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app); // Initialiseer Firebase Storage

export { db, storage  };
