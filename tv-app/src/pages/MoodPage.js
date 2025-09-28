import React, { useState, useEffect } from "react";
import { startWebcam, analyzeMood, video } from "./MoodDetector";
import { loadModels } from "./faceCrop";
import { useNavigate, useLocation } from "react-router-dom";
import "./MoodPage.css";

export default function MoodPage({ onFinish }) {
  const [step, setStep] = useState("ready");
  const [count, setCount] = useState(10); // 👈 start from 10
  const [showFlash, setShowFlash] = useState(false); // 👈 new
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [snapshotUrl, setSnapshotUrl] = useState(null); // 👈 keep original photo
  const [error, setError] = useState(null);
  const [country, setCountry] = useState(null);
  const [avatarId, setAvatarId] = useState(null); // 👈 new state

  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = location.state?.sessionId;

  const PLACEHOLDER_URL =
    "https://dummyimage.com/512x512/cccccc/000000.png&text=Avatar";

  // Load face-api models
  useEffect(() => {
    loadModels();
  }, []);

  // Start webcam → countdown
  useEffect(() => {
    (async () => {
      await startWebcam();
      setStep("countdown");
    })();
  }, []);

  // Countdown logic
  useEffect(() => {
    if (step === "countdown" && count > 0) {
      const timer = setTimeout(() => setCount((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }

    // At 0 → trigger flash ONCE + capture
    if (step === "countdown" && count === 0) {
      setShowFlash(true);
      setTimeout(() => {
        setShowFlash(false);
        handleCapture(); // 👈 now capture AFTER flash
      }, 800); // wait until flash finishes
    }
  }, [count, step]);

  async function handleCapture() {
    try {
      const moodResults = await Promise.race([
        analyzeMood(video), // normal flow
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 5000)
        ), // 👈 fallback after 5s
      ]);

      const moodData = moodResults?.[0];
      const mood = moodData?.mood || "happy";
      const snapshot = moodData?.snapshot;

      if (!snapshot) {
        console.warn("No face detected, using placeholder");
        setError("No face detected. Using placeholder avatar.");
        setAvatarUrl(PLACEHOLDER_URL);
        setStep("avatar");
        return;
      }

      setSnapshotUrl(snapshot);
      setStep("preloader");

      const response = await fetch(
        "https://ited.org.ec/faith/generate_avatar_sd.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mood, image: snapshot }),
        }
      );

      const data = await response.json();

      if (data.error) {
        setError("Avatar generation unavailable. Using placeholder.");
        setAvatarUrl(PLACEHOLDER_URL);
      } else if (data.success && data.url) {
        setAvatarUrl(data.url);
        setCountry(data.country);
        setAvatarId(data.avatarId || null); // 👈 store sequential ID
      } else {
        setError("Avatar generation unavailable. Using placeholder.");
        setAvatarUrl(PLACEHOLDER_URL);
      }

      setStep("avatar");
    } catch (err) {
      console.error("Avatar generation failed:", err);
      setError("Avatar creation failed. Using placeholder.");
      setAvatarUrl(PLACEHOLDER_URL);
      setStep("avatar");
    }
  }

  return (
    <div className="mood-container">
      {(step === "countdown" || step === "ready") && (
        <div className="preloader">
          <div className="preloader-text">
            <h2 className="preloader-title">
              Happy Thanksgiving from <br />
              <span className="highlight">Faith Fellowship Baptist Church</span>
            </h2>
          </div>
          <video
            ref={(el) => el && (el.srcObject = video.srcObject)}
            autoPlay
            muted
            playsInline
            className="video-full"
          />
          <div className="count-overlay animated-count">
            {count > 0 ? count : ""}
          </div>

          {/* Flash overlay only when showFlash = true */}
          {showFlash && <div className="flash-overlay big-flash"></div>}
        </div>
      )}

      {step === "preloader" && (
        <div className="preloader">
          <h2 className="preloader-title">Creating your avatar... Please wait</h2>
          <h3 className="preloader-subtitle">
            Thank you for visiting{" "}
            <span className="highlight">Faith Fellowship Baptist Church</span>,
            God bless you 🙏
          </h3>
          <div className="spinner"></div>
        </div>
      )}

      {step === "avatar" && (
        <div className="avatar-screen">
          {/* Avatar ID Badge */}
          {avatarId && (
            <div className="avatar-id">#{avatarId}</div>
          )}

          <h2 className="avatar-title">Faith Fellowship Baptist Church</h2>

          <div className="avatar-card">
            <img
              src={avatarUrl || PLACEHOLDER_URL}
              alt="Avatar"
              className="avatar-image"
            />

            <div className="avatar-info">
              <h3 className="country-text">
                You were reimagined as:{" "}
                <span>{country || "Global Citizen"}</span>
              </h3>
              <p className="thanksgiving-text">
                Happy Thanksgiving from <br />
                <strong>Faith Fellowship Baptist Church</strong>
              </p>
              <p className="blessing">
                May this season bring you joy, peace, and community.
              </p>
            </div>
          </div>

          {snapshotUrl && (
            <img
              src={snapshotUrl}
              alt="Original Snapshot"
              className="snapshot-preview"
            />
          )}

          {error && <p className="error">{error}</p>}
        </div>
      )}
    </div>
  );
}
