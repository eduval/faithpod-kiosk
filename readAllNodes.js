// readAllNodesDynamic.js
// This script reads all top-level nodes from Firebase and creates latest + historical JSON

import db from "../firebaseAdmin.js"; 
import fs from "fs";
import path from "path";

// Helper function to read a single node
async function readNode(nodeName) {
  console.log(`\n📖 Processing node: ${nodeName}`);
  try {
    const snapshot = await db.ref(nodeName).once("value");
    let data = snapshot.val();

    // If node is empty, just save an empty object
    if (!data) {
      console.log(`⚠️ Node "${nodeName}" is empty. Saving empty JSON.`);
      data = {};
    }

    let cleanedData = {};
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (item) cleanedData[String(index)] = item;
      });
    } else {
      cleanedData = data;
    }

    const targetDir = path.join("NodesVersions", nodeName, `${nodeName}Versions`);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`📁 Created folder: ${targetDir}`);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const historicalPath = path.join(targetDir, `${nodeName}_${timestamp}.json`);
    fs.writeFileSync(historicalPath, JSON.stringify(cleanedData, null, 2));
    console.log(`✅ Historical version saved: ${historicalPath}`);

    const latestPath = path.join(targetDir, `${nodeName}.json`);
    fs.writeFileSync(latestPath, JSON.stringify(cleanedData, null, 2));
    console.log(`✅ Latest snapshot saved: ${latestPath}`);

  } catch (error) {
    console.error(`🔥 Error reading node ${nodeName}:`, error);
  }
}

// Main function
async function readAllNodes() {
  try {
    const rootSnapshot = await db.ref("/").once("value");
    const data = rootSnapshot.val();

    // If database is empty, stop
    if (!data) {
      console.log("❌ Database is empty.");
      return;
    }

    // Get all top-level node names
    const nodeKeys = Object.keys(data);
    console.log("📋 Top-level nodes found:", nodeKeys.join(", "));

    // Use for-loop with await to process nodes **sequentially**
    for (const node of nodeKeys) {
      await readNode(node);
    }

    console.log("\n🎉 All nodes processed.");
  } catch (error) {
    console.error("🔥 Error reading from database:", error);
  }
}

