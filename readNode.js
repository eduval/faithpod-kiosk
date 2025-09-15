// This script reads a node from Firebase Realtime Database
// It saves the data as a historical JSON file and a latest.json for the seed script

// Import Firebase Admin SDK database connection
import db from '../firebaseAdmin.js';

// Import Node.js modules
import fs from 'fs';
import path from 'path';

// STEP 1 — Get node name from command line
const nodeName = process.argv[2];
if (!nodeName) {
  console.error("❌ Please provide a node name (e.g., AgeSelect)");
  process.exit(1);
}

// Async function to read the node
async function readNode() {
  try {
    // STEP 2 — Read data from Firebase
    const snapshot = await db.ref(nodeName).once('value');
    const data = snapshot.val();

    if (!data) {
      console.error(`❌ No data found in "${nodeName}"`);
      return;
    }

    console.log(`✅ Data fetched for node: ${nodeName}`);

    // STEP 3 — Convert array to object if needed
    const cleanedData = Array.isArray(data)
      ? data.reduce((acc, item, index) => {
          if (item) acc[String(index)] = item; // use index as string key
          return acc;
        }, {})
      : data;

    // STEP 4 — Define folders
    const targetDir = path.join("NodesVersions", nodeName, `${nodeName}Versions`);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`📁 Created folder structure: ${targetDir}`);
    }

    // STEP 5 — Save historical file (timestamped)
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const historicalPath = path.join(targetDir, `${nodeName}_${timestamp}.json`);
    fs.writeFileSync(historicalPath, JSON.stringify(cleanedData, null, 2));
    console.log(`✅ Historical version saved: ${historicalPath}`);

    // STEP 6 — Save latest snapshot (for seed script)
    const latestPath = path.join(targetDir, `${nodeName}.json`);
    fs.writeFileSync(latestPath, JSON.stringify(cleanedData, null, 2));
    console.log(`✅ Latest snapshot saved: ${latestPath}`);

  } catch (error) {
    console.error("🔥 Error reading from Firebase:", error);
  }
}

// STEP 7 — Execute
readNode();

// COMMAND LINES + NODES to execute this script
// node readNode.js AgeSelect
// node readNode.js ExperienceOpSelect
// node readNode.js FavColorSelect
// node readNode.js IdWordSelect
// node readNode.js IntentionSelect
// node readNode.js Settings
// node readNode.js TimeChurchSelect
// node readNode.js UserSessions
// node readNode.js VideoSelect
// node readNode.js WelcomePhrases
// node readNode.js bible_questions
// node readNode.js bible_verses_moods
// node readNode.js sessions
// node readNode.js userSessions
