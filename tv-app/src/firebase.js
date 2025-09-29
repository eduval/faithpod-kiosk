
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // ✅ import Auth
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCnbUwqdNXpX4SWnzvVcgdy6772O9cQzR0",
  authDomain: "faithpod-kiosk-testing.firebaseapp.com",
  databaseURL: "https://faithpod-kiosk-testing-default-rtdb.firebaseio.com",
  projectId: "faithpod-kiosk-testing",
  storageBucket: "faithpod-kiosk-testing.appspot.com",
  messagingSenderId: "539150463988",
  appId: "1:539150463988:web:a98e90e213c1bcba41ffa1",
  measurementId: "G-6S0B3GCQJ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Auth instance
const auth = getAuth(app);

// ✅ Database instance
const database = getDatabase(app);

// Get server time
export async function getServerTime() {
  try {
    const response = await fetch('https://ited.org.ec/getServerTime.php');
    const data = await response.json();
    return data.serverTime;
  } catch (error) {
    console.error("Error getting server time:", error);
    return new Date().toISOString(); // fallback
  }
}

export { auth, database };
export default app;
