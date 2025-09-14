// This script uploads the content of uploadTimeChurch.json to Firebase
// It replaces everything under the "TimeChurchSelect" node

// Import Firebase write functions and our database reference
import { ref, set } from "firebase/database";
//import { db } from "../firebaseConfig.js";
import { db, loginPromise } from "../firebaseConfig.js"; // ✅ make sure this is correct path

// Import Node.js file system module to read the file
import fs from "fs";

// Import path module to handle file paths
import path from "path";

// Get the node name from the command line
const nodeName = process.argv[2];
if (!nodeName) {
  console.error("❌ Please provide a node name (e.g., AgeSelect)");
  process.exit(1);
}

// STEP 1 — Read the local upload file that contains the final data
const uploadPath = path.join("NodesVersions", nodeName, `Upload${nodeName}Versions`, `upload_${nodeName}.json`);
const uploadData = JSON.parse(fs.readFileSync(uploadPath, "utf8"));

// STEP 2 — Define the path inside the Firebase Realtime Database
const nodePath = nodeName;
const nodeRef = ref(db, nodePath); // Create a reference to the node

// STEP 3 — Send (overwrite) the data to Firebase
const upload = async () => {
  await loginPromise;             // Wait for login/auth
  await set(nodeRef, uploadData); // Replace the node content
  console.log(`✅ ${nodeName} node updated in Firebase.`);
};


// STEP 4 — Run and catch any errors
upload().catch((err) => {
  console.error("🔥 Upload failed:", err);
});

// for next steps -
  // - Implement versioning for timeChurch.json to keep track of changes

//COMANDLINES + NODES to execute this script
// node updateNode.js AgeSelect
// node updateNode.js TimeChurchSelect
// node updateNode.js ExperienceOpSelect
// node updateNode.js FavColorSelect
// node updateNode.js IdWordSelect
// node updateNode.js IntentionSelect
// node updateNode.js userSessions