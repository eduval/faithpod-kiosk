// This script prepares the upload version of the TimeChurch data
// It reads the local timeChurch.json file and lets you modify it
// It saves the updated result to uploadTimeChurch.json for upload

// Imports Node.js' built-in File System module so you can:
// Create/Write/Read files from your computer.
import fs from "fs";

// Import path module to handle file paths
import path from "path";

// STEP 1 — Get Node name from comand line and Read timeChurch.json snapshot as a plain text file
// Get the node name from the command line
const nodeName = process.argv[2];
if (!nodeName) {
  console.error("❌ Please provide a node name (e.g., AgeSelect)");
  process.exit(1);
}

const sourcePath = path.join("NodesVersions", nodeName, `${nodeName}Versions`, `${nodeName}.json`);
if (!fs.existsSync(sourcePath)) {
  console.error(`❌ File not found: ${sourcePath}`);
  console.error("🛠️ Make sure you ran the read script first.");
  process.exit(1);
}

const rawJson = fs.readFileSync(sourcePath, "utf8");
const sourceData = JSON.parse(rawJson);

// STEP 2 — BEGIN EDITABLE SECTION
// Import Firebase database reference to generate new keys
import { ref, push } from "firebase/database";
import { db } from "../firebaseConfig.js";

// Helper function to check if a key looks like a Firebase push ID
const isFirebasePushId = (key) => /^[A-Za-z0-9_-]{20}$/.test(key);

// Create an object to store the updated data
const updatedData = {};

// Loop through each item in the source data
Object.entries(sourceData).forEach(([key, item]) => {
  // Check if the key is already a Firebase push ID
  const newKey = isFirebasePushId(key) ? key : push(ref(db)).key;

  const updatedItem = {
    ...item,
    id: newKey
  };

  updatedData[newKey] = updatedItem;
});

// STEP 2 — END EDITABLE SECTION



// STEP 3 — Save the modified data to uploadTimeChurch.json
const uploadPath = path.join("NodesVersions", nodeName, `Upload${nodeName}Versions`, `upload_${nodeName}.json`);
fs.writeFileSync(uploadPath, JSON.stringify(updatedData, null, 2));

// Confirm the result
console.log(`✅ upload_${nodeName}.json saved.`);


//COMANDLINES + NODES to execute this script
// node seedNode.js AgeSelect
// node seedNode.js TimeChurchSelect
// node seedNode.js ExperienceOpSelect
// node seedNode.js FavColorSelect
// node seedNode.js IdWordSelect
// node seedNode.js IntentionSelect
// node seedNode.js userSessions

