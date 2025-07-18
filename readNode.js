// This script reads the current TimeChurchSelect node from Firebase Realtime Database
// It saves the result locally in a file called timeChurch.json

// Import functions to read from Firebase and our database connection
// ref() → creates a reference to part of your database
// get() → reads data once
// child() → navigates to a specific child node
// db → our database connection from firebaseConfig.js
import { ref, get, child } from "firebase/database";
import { db } from "../firebaseConfig.js";

// Imports Node.js' built-in File System module so you can:
// Create/Write/Read files from your computer.
import fs from "fs";

// Import path module to handle file paths
import path from "path";

// This path is passed as a command line argument when running the script
// For example, you can run this script with: node 1-readTimeChurch.js "
const nodeName = process.argv[2];
// Check if the nodeName is provided
if (!nodeName) {
  console.error("❌ Please provide a node name.");
  process.exit(1);
}

// Create a reference to the root of the database
const dbRef = ref(db);

// Start reading from the database
get(child(dbRef, nodeName))
  .then((snapshot) => {
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
    const filePath = path.join(targetDir, `${nodeName}.json`);

    // Validate that targetDir exists
    if (!fs.existsSync(targetDir)) {
      console.error(`❌ Target folder not found: ${targetDir}`);
      console.error("🛠️ Please create the correct folder structure before running this script.");
      process.exit(1);
    }
    
    // Save the data to a local file named timeChurch.json
    fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2));
    console.log(`✅ ${nodeName}.json saved to ${filePath}`);
  })
  .catch((error) => {
    console.error("🔥 Error reading from Firebase:", error);
  });

  // for next steps -
  // - Implement versioning for timeChurch.json to keep track of changes

//COMANDLINES + NODES to execute this script
// node readNode.js AgeSelect
// node readNode.js TimeChurchSelect
// node readNode.js ExperienceOpSelect
// node readNode.js FavColorSelect
// node readNode.js IdWordSelect
// node readNode.js IntentionSelect
// node readNode.js userSessions
