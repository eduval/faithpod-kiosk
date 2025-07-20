// src/moodDetector.js
import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export async function loadModels() {
  if (!modelsLoaded) {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    modelsLoaded = true;
    console.log('Models loaded ✅');
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

// Updated to return the detected mood instead of alert
export async function analyzeMood() {
  if (!modelsLoaded) {
    await loadModels();
  }
  const canvas = capturePicture();
  const expressions = await detectMood(canvas);

  if (expressions) {
    const topMood = Object.entries(expressions).reduce((a, b) =>
      a[1] > b[1] ? a : b
    );
    return { mood: topMood[0], confidence: topMood[1] };
  } else {
    return null;
  }
}
