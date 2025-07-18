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

export default app;
