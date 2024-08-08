// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {getFirestore} from 'firebase/firestore'
const firebaseConfig = {
  apiKey: "AIzaSyCmSEgyaYato1bzHVHnxjkuyc7-USWBZnQ",
  authDomain: "peer-port.firebaseapp.com",
  projectId: "peer-port",
  storageBucket: "peer-port.appspot.com",
  messagingSenderId: "84932371825",
  appId: "1:84932371825:web:b86de38dce7cf7477f02d0",
  measurementId: "G-NP26W6ZQMY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
