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
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
      audio: false,
    });
    if (!video) {
      video = document.createElement("video");
    }
    video.srcObject = stream;
    await video.play();
  } catch (err) {
    console.error("Webcam error:", err);
  }
}

export function capturePicture() {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

export function captureFrame(video, width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, width, height);
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


let faceDetected = false; // flag to stop after first valid detection

// 🔹 Analyze mood with up to 5 attempts
export async function analyzeMood() {
  try {
    if (!modelsLoaded) await loadModels();

    let finalResult = null;

    for (let i = 0; i < 5; i++) {
      if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn(`Attempt ${i + 1}: video not ready`);
        await new Promise(res => setTimeout(res, 1000));
        continue;
      }

      const canvas = captureFrame(video, 512, 512);
      const expressions = await detectMood(canvas);

      if (!expressions) {
        console.warn(`Attempt ${i + 1}: no face detected`);
        await new Promise(res => setTimeout(res, 1000));
        continue;
      }

      const topMood = Object.entries(expressions).reduce((a, b) =>
        a[1] > b[1] ? a : b
      );

      finalResult = {
        mood: topMood[0],
        confidence: topMood[1],
        snapshot: canvas.toDataURL('image/png'),
      };
      break;
    }

    if (!finalResult) {
      console.warn("No face detected after all attempts. Defaulting to happy.");
      finalResult = { mood: 'happy', confidence: 0.0, snapshot: null };
    }

    return [finalResult];
  } catch (error) {
    console.error('Error during mood analysis:', error);
    return [{ mood: 'happy', confidence: 0.0, snapshot: null }];
  }
}