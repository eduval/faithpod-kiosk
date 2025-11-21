// src/pages/MoodPage.js
import React, { useState, useEffect, useCallback } from "react";
import { startWebcam, analyzeMood, video } from "./MoodDetector";
import { loadModels, cropFace } from "./faceCrop";
import { auth, database } from "../firebase";
import { ref, get, child } from "firebase/database";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, useLocation } from 'react-router-dom';
import "./MoodPage.css";

export default function MoodPage({ onFinish }) {
  const [step, setStep] = useState("ready");
  const [count, setCount] = useState(4);
  const [showFlash, setShowFlash] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [, setSnapshotUrl] = useState(null);
  const [, setError] = useState(null);
  const [country, setCountry] = useState(null);
  const [avatarId, setAvatarId] = useState(null);
  const [bibleVerse, setBibleVerse] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = location.state?.sessionId;

  const PLACEHOLDER_URL =
    "https://dummyimage.com/512x512/cccccc/000000.png&text=Avatar";

  // ✅ Load face-api models
  useEffect(() => {
    loadModels();
  }, []);

  // ✅ Start webcam once
  useEffect(() => {
    (async () => {
      await startWebcam();
      setStep("countdown");
    })();
  }, []);

  // ✅ Authenticate user
  useEffect(() => {
    const loginUser = async () => {
      try {
        await signInWithEmailAndPassword(auth, "eperezr@uni.pe", "12@23#34$");
        console.log("Logged in as:", auth.currentUser.email);
      } catch (err) {
        console.error("Login failed:", err);
        setError("Authentication failed.");
      }
    };
    loginUser();
  }, []);

  // ✅ Capture flow
  const handleCapture = useCallback(async () => {
    try {
      const moodResults = await Promise.race([
        analyzeMood(video),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 5000)
        ),
      ]);

      const moodData = moodResults?.[0];
      const detectedMood = moodData?.mood || "Happy";
      const snapshot = moodData?.snapshot;

      if (!snapshot) {
        console.warn("No face detected, using placeholder");
        setError("No face detected. Using placeholder avatar.");
        setAvatarUrl(PLACEHOLDER_URL);
        setStep("avatar");
        return;
      }

      // ✅ Crop face
      const croppedFace = await cropFace(snapshot);
      const finalImage = croppedFace || snapshot; // fallback if crop fails

      setSnapshotUrl(finalImage);
      setStep("preloader");

      // ✅ Send to avatar generator
      const response = await fetch(
        "https://ited.org.ec/faith/generate_avatar_sd.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mood: detectedMood, image: finalImage }),
        }
      );

      const data = await response.json();

      if (data.error) {
        setError("Avatar generation unavailable. Using placeholder.");
        setAvatarUrl(PLACEHOLDER_URL);
      } else if (data.success && data.url) {
        setAvatarUrl(data.url);
        setCountry(data.country);
        setAvatarId(data.avatarId || null);
      } else {
        setError("Avatar generation unavailable. Using placeholder.");
        setAvatarUrl(PLACEHOLDER_URL);
      }

      setStep("avatar");
      //Fetch Bible verse after avatar
      await fetchBibleVerse(detectedMood);

      setTimeout(() => {
        console.log(sessionId);
        navigate('/thankyou', { state: { sessionId: sessionId } });
      }, 20000); // 3 seconds delay

    } catch (err) {
      console.error("Avatar generation failed:", err);
      setError("Avatar creation failed. Using placeholder.");
      setAvatarUrl(PLACEHOLDER_URL);
      setStep("avatar");
    }
  }, []);

  // ✅ Countdown effect
  useEffect(() => {
    if (step === "countdown" && count > 0) {
      const timer = setTimeout(() => setCount((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (step === "countdown" && count === 0) {
      setShowFlash(true);
      setTimeout(() => {
        setShowFlash(false);
        handleCapture();
      }, 800);
    }
  }, [count, step, handleCapture]);

  //Fetch Bible verses from Firebase
  const fetchBibleVerse = async (mood) => {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, "bible_verses_moods"));

      if (snapshot.exists()) {
        const allMoods = snapshot.val();
        const match = Object.values(allMoods).find(
          (entry) => entry.mood?.toLowerCase() === mood?.toLowerCase()
        );

        if (match?.verses) {
          //Filter enabled and map to text
          const versesArray = Object.values(match.verses)
            .filter((v) => v.enabled)
            .map((v) => v.text);

          if (versesArray.length > 0) {
            const randomVerse =
              versesArray[Math.floor(Math.random() * versesArray.length)];
            setBibleVerse(randomVerse);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching bible verse:", err);
    }
  };

  return (
    <div className="mood-container">
      {(step === "countdown" || step === "ready") && (
        <div className="preloader">
          <video
            id="webcam"
            ref={(el) => el && (el.srcObject = video.srcObject)}
            autoPlay
            muted
            playsInline
            className="video-full"
          />
          <div className="count-overlay animated-count">
            {count > 0 ? count : ""}
          </div>
          {showFlash && <div className="flash-overlay big-flash"></div>}
        </div>
      )}

      {step === "preloader" && (
        <div className="preloader">
          <h2 className="preloader-title">Creating your avatar... Please wait</h2>
          <div className="spinner"></div>
        </div>
      )}

      {step === "avatar" && (
        <div className="avatar-screen">
          {avatarId && <div className="avatar-id">#{avatarId}</div>}
          <div className="avatar-card">
            <img
              src={avatarUrl || PLACEHOLDER_URL}
              alt="Avatar"
              className="avatar-image"
            />
            <div className="avatar-info">
              <h3 className="country-text">
                You were reimagined as: <span>{country || "Global Citizen"}</span>
              </h3>
              {bibleVerse && <p className="bible-verse"><em>"{bibleVerse}"</em></p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
