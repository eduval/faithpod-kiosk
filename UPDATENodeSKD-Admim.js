// This script updates the Firebase Realtime Database node: /TimeChurchSelect
// It loads the latest upload file and overwrites the entire node in Firebase

import fs from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

// STEP 1 — Load service account credentials
// 🔴 Replace this path with your real Firebase Admin SDK file
const serviceAccount = JSON.parse(fs.readFileSync("./firebase-adminsdk.json"));

// STEP 2 — Initialize Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://faithpod-kiosk-testing-default-rtdb.firebaseio.com/"
});

// STEP 3 — Read the latest upload version of the data
const uploadData = JSON.parse(
  fs.readFileSync("./2.2_UploadTimeChurchVersions/uploadTimeChurch_latest.json")
);

// STEP 4 — Push to Firebase under node "TimeChurchSelect"
const db = getDatabase();
const ref = db.ref("TimeChurchSelect");

ref.set(uploadData)
  .then(() => {
    console.log("✅ Firebase node 'TimeChurchSelect' updated successfully.");
  })
  .catch((error) => {
    console.error("❌ Failed to update Firebase:", error);
  });


