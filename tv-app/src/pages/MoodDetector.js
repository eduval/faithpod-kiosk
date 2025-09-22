// MoodDetector.js
import * as faceapi from "face-api.js";

let modelsLoaded = false;

// 🔹 Load models from /public/models/
export async function loadModels() {
  if (!modelsLoaded) {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ]);
    modelsLoaded = true;
    console.log("✅ Face-api models loaded");
  }
}

// 🔹 We’ll reuse a single video element across the app
export const video = document.createElement("video");
video.setAttribute("playsinline", true);
video.setAttribute("muted", true);
video.style.display = "none"; // keep hidden if you want
document.body.appendChild(video);

// 🔹 Start webcam and wait until it's ready
export async function startWebcam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
      audio: false,
    });

    video.srcObject = stream;

    // Wait until video metadata is available
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });

    console.log("🎥 Webcam started");
  } catch (err) {
    console.error("❌ Webcam error:", err);
  }
}

// 🔹 Capture current frame into canvas
export function captureFrame(width = 512, height = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, width, height);
  return canvas;
}

// 🔹 Run face-api detection on a canvas
export async function detectMood(canvas) {
  if (!modelsLoaded) {
    console.error("❌ Models not loaded!");
    return null;
  }

  const detections = await faceapi
    .detectSingleFace(
      canvas,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 })
    )
    .withFaceExpressions();

  if (detections) {
    console.log("😀 Detected expressions:", detections.expressions);
    return detections.expressions;
  } else {
    console.warn("⚠ No face detected");
    return null;
  }
}

// 🔹 High-level function: try up to 5 times
export async function analyzeMood() {
  try {
    if (!modelsLoaded) await loadModels();

    let finalResult = null;

    for (let i = 0; i < 5; i++) {
      if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn(`Attempt ${i + 1}: video not ready`);
        await new Promise((res) => setTimeout(res, 1000));
        continue;
      }

      const canvas = captureFrame(512, 512);
      const expressions = await detectMood(canvas);

      if (!expressions) {
        console.warn(`Attempt ${i + 1}: no face detected`);
        await new Promise((res) => setTimeout(res, 1000));
        continue;
      }

      // Pick the top mood
      const topMood = Object.entries(expressions).reduce((a, b) =>
        a[1] > b[1] ? a : b
      );

      finalResult = {
        mood: topMood[0],
        confidence: topMood[1],
        snapshot: canvas.toDataURL("image/png"),
      };
      break;
    }

    if (!finalResult) {
      console.warn("No face detected after all attempts. Defaulting to happy.");
      finalResult = { mood: "happy", confidence: 0.0, snapshot: null };
    }

    return [finalResult];
  } catch (error) {
    console.error("❌ Error during mood analysis:", error);
    return [{ mood: "happy", confidence: 0.0, snapshot: null }];
  }
}
