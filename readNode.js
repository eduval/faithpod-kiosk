// This script reads the current TimeChurchSelect node from Firebase Realtime Database
// It saves the result locally in a file called timeChurch.json
// Now updated to create historical snapshots for versioning

// Import admin SDK database connection
import db from '../firebaseAdmin.js';  // Note the .js extension required for ES modules

// Imports Node.js' built-in File System module so you can:
// Create/Write/Read files from your computer.
import fs from 'fs';

// Import path module to handle file paths
import path from 'path';

// This path is passed as a command line argument when running the script
// For example, you can run this script with: node readNode.js AgeSelect
const nodeName = process.argv[2];

// Check if the nodeName is provided
if (!nodeName) {
  console.error("❌ Please provide a node name.");
  process.exit(1);
}

// Async function to read data from Firebase Admin SDK
async function readNode() {
  try {
    // Create a reference to the node and read data once
    const snapshot = await db.ref(nodeName).once('value');

    // If to check if the data exists at the specified node
    // If it doesn't exist, we will log an error message
    if (!snapshot.exists()) {
      console.log("❌ No data found in " + nodeName);
      return;
    }

    // Function to get the data from the snapshot defined above
    let data = snapshot.val();

    // Firebase may return arrays when keys are numeric, which removes the IDs from the structure
    // So we check if the data is an array and convert it to an object with string keys if needed
    let cleanedData = {};

    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (item) {
          cleanedData[String(index)] = item; // use the index as key: "1", "2", ...
        }
      });
    } else {
      cleanedData = data; // if it's already an object with keys, we keep it as is
    }

    // Define expected folder structure and file path
    const targetDir = path.join("NodesVersions", nodeName, `${nodeName}Versions`);

    // Minimal change: create folder if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`📁 Created folder structure: ${targetDir}`);
    }

    // Save the data to a historical file (timestamped)
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-"); // e.g., 2025-09-14T15-20-30-123Z
    const historicalPath = path.join(targetDir, `${nodeName}_${timestamp}.json`);
    fs.writeFileSync(historicalPath, JSON.stringify(cleanedData, null, 2));
    console.log(`✅ Historical version saved: ${historicalPath}`);

    // Save the data to latest.json (so seed script can use it)
    const latestPath = path.join(targetDir, `${nodeName}.json`);
    fs.writeFileSync(latestPath, JSON.stringify(cleanedData, null, 2));
    console.log(`✅ Latest snapshot saved: ${latestPath}`);

  } catch (error) {
    console.error("🔥 Error reading from Firebase:", error);
  }
}

// Execute the function to read the node data
readNode();

// for next steps -
// - Implement versioning for timeChurch.json to keep track of changes

//COMMAND LINES + NODES to execute this script
// node readNode.js AgeSelect
// node readNode.js TimeChurchSelect
// node readNode.js ExperienceOpSelect
// node readNode.js FavColorSelect
// node readNode.js IdWordSelect
// node readNode.js IntentionSelect
// node readNode.js userSessions
// node readNode.js bible_verses_moods