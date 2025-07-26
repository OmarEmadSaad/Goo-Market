import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAOTmVJF54WQZO902_wJqE6spYI7fqRDbQ",
  authDomain: "goo-market-db.firebaseapp.com",
  databaseURL: "https://goo-market-db-default-rtdb.firebaseio.com",
  projectId: "goo-market-db",
  storageBucket: "goo-market-db.appspot.com",
  messagingSenderId: "649509699308",
  appId: "1:649509699308:web:605dd1ccbea5e01f35afc9",
  measurementId: "G-R65144694W",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getDatabase(app);
