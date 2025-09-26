import * as faceapi from 'face-api.js';

// Load models once
export async function loadModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
}

// Crop face from video element, return base64
export async function cropFace(video) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    // Detect the face first
    const detection = await faceapi
        .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 }));

    if (!detection) return null;

    const { x, y, width, height } = detection.box;
    ctx.drawImage(video, x, y, width, height, 0, 0, 256, 256);
    return canvas.toDataURL("image/png");
}
