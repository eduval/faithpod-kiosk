// src/firebase.js
import { initializeApp } from "firebase/app";

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

const app = initializeApp(firebaseConfig);

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

export default app;