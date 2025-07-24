// src/moodDetector.js
import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export async function loadModels() {
  if (!modelsLoaded) {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    modelsLoaded = true;
    console.log('Models loaded');
  }
}

export const video = document.createElement('video');
video.setAttribute('playsinline', true);
video.setAttribute('muted', true);
video.style.display = 'none';
document.body.appendChild(video);

export async function startWebcam() {
  if (!modelsLoaded) {
    await loadModels();
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
    console.log('Webcam started 🎥');
  } catch (err) {
    console.error('Error accessing webcam:', err);
  }
}

export function capturePicture() {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 320;
  canvas.height = video.videoHeight || 240;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  return canvas;
}

export async function detectMood(canvas) {
  if (!modelsLoaded) {
    console.error('Models not loaded!');
    return null;
  }
  const detections = await faceapi
    .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
    .withFaceExpressions();

  if (detections) {
    console.log('Detected expressions:', detections.expressions);
    return detections.expressions;
  } else {
    console.log('No face detected');
    return null;
  }
}

//  analyzeMood with 3 attempts, averaging, fallback
export async function analyzeMood() {
  try {
    if (!modelsLoaded) {
      await loadModels();
    }

    const moodResults = [];
    const maxAttempts = 3;

    for (let i = 0; i < maxAttempts; i++) {
      const canvas = capturePicture();
      const expressions = await detectMood(canvas);

      if (expressions) {
        moodResults.push(expressions);
      } else {
        console.warn(`No face detected on attempt ${i + 1}`);
      }

      // Wait 1 second before next capture
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (moodResults.length === 0) {
      console.warn('No face detected in any of the 3 attempts. Defaulting to happy.');
      return { mood: 'happy', confidence: 1.0 };
    }

    // Combine and average mood values
    const summed = {};
    moodResults.forEach((expressions) => {
      for (const [key, value] of Object.entries(expressions)) {
        summed[key] = (summed[key] || 0) + value;
      }
    });

    const averages = {};
    for (const [key, total] of Object.entries(summed)) {
      averages[key] = total / moodResults.length;
    }

    const topMood = Object.entries(averages).reduce((a, b) =>
      a[1] > b[1] ? a : b
    );

    return { mood: topMood[0], confidence: topMood[1] };

  } catch (error) {
    console.error('Error during mood analysis:', error);
    return { mood: 'happy', confidence: 1.0 };
  }
}
