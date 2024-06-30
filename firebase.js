
import { initializeApp, getApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// import { getDatabase } from "firebase/database";
import Constants from "expo-constants";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDIdJvzWP5fSs_TFnKIuL22p3WY7WhzHfM",
  authDomain: "fir-b3461.firebaseapp.com",
  databaseURL: "https://fir-b3461-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fir-b3461",
  storageBucket: "fir-b3461.appspot.com",
  messagingSenderId: "401259025160",
  appId: "1:401259025160:web:2359c92978d2316a05d2bd"
};
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
// const db = getFirestore(app, { experimentalForceLongPolling: true });
const db = getFirestore(app);
const storage = getStorage(app);

export { db, auth, collection, storage };


