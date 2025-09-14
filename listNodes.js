// listNodes.js
// This script connects to Firebase using the Admin SDK
// It reads the root of the Realtime Database and prints out all top-level node keys

// Import the initialized Firebase Admin DB instance from your custom script
import db from "../firebaseAdmin.js";

// Get a reference to the root ("/") of the database
const rootRef = db.ref();

// Read the root data once — this performs a one-time fetch of the entire top-level structure
rootRef.once("value", (snapshot) => {
  // Extract the data from the snapshot
  const data = snapshot.val();

  // Check if there's any data at the root level
  if (data) {
    // Convert the object keys (node names) into an array
    const nodeKeys = Object.keys(data);

    // Output each top-level node name
    console.log("Top-level nodes in the database:");
    nodeKeys.forEach((key) => {
      console.log("- " + key);
    });
  } else {
    // If the database is empty, notify the user
    console.log("Database is empty.");
  }
},
// Catch and display any errors if the read operation fails
(error) => {
  console.error("Error reading from database:", error);
});
