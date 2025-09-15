
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
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
}

export function captureFrame(video) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
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

// 🔹 Analyze mood with 3 attempts
export async function analyzeMood() {
    try {
        if (!modelsLoaded) {
            await loadModels();
        }

        const results = [];

        for (let i = 0; i < 3; i++) {
            const canvas = captureFrame(video); // <- use video element here
            const expressions = await detectMood(canvas); // canvas is valid HTMLElement

            if (!expressions) {
                console.warn(`No face detected on attempt ${i + 1}. Defaulting to happy.`);
                results.push({
                    mood: 'happy',
                    confidence: 0.0,
                    snapshot: canvas.toDataURL('image/png'), // send this snapshot to PHP
                });
            } else {
                const topMood = Object.entries(expressions).reduce((a, b) =>
                    a[1] > b[1] ? a : b
                );
                results.push({
                    mood: topMood[0],
                    confidence: topMood[1],
                    snapshot: canvas.toDataURL('image/png'),
                });
            }

            if (i < 2) await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        return results;
    } catch (error) {
        console.error('Error during mood analysis:', error);
        return [
            { mood: 'happy', confidence: 0.0, snapshot: null },
            { mood: 'happy', confidence: 0.0, snapshot: null },
            { mood: 'happy', confidence: 0.0, snapshot: null },
        ];
    }
}
