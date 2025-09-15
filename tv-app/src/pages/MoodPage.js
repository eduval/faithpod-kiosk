import React, { useState, useEffect } from "react";
import { startWebcam, analyzeMood, video } from "./MoodDetector";
import { useNavigate, useLocation } from 'react-router-dom';
import "./MoodPage.css";

export default function MoodPage({ onFinish }) {
  const [step, setStep] = useState("ready");
  const [count, setCount] = useState(7);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = location.state?.sessionId;

  const PLACEHOLDER_URL =
    "https://dummyimage.com/512x512/cccccc/000000.png&text=Avatar";

  // Start webcam → go straight to countdown
  useEffect(() => {
    (async () => {
      await startWebcam();
      setStep("countdown");
    })();
  }, []);

  // Countdown + capture + avatar generation
  useEffect(() => {
    if (step === "countdown" && count > 0) {
      const timer = setTimeout(() => setCount((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (step === "countdown" && count === 0) {
      setStep("flash");

      setTimeout(async () => {
        setStep("preloader");
        try {
          const results = await analyzeMood(video);
          const mood = results?.[0]?.mood || "happy";
          const snapshot = results?.[0]?.snapshot || null;

          // 🔍 Debug: ver qué se manda
          console.log("Sending to PHP:", { mood, snapshot: snapshot?.substring(0, 50) });
          console.log("Snapshot length:", snapshot?.length);

          let url = PLACEHOLDER_URL;

          if (snapshot) {
            const res = await fetch("https://ited.org.ec/faith/generate_avatar1.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ mood, image: snapshot }),
            });

            console.log("PHP response status:", res.status);

            let data = null;
            try {
              data = await res.json();
            } catch (parseError) {
              console.error("❌ Error parsing JSON from PHP:", parseError);
            }

            console.log("PHP response data:", data);

            url = data?.data?.[0]?.url || PLACEHOLDER_URL;

            if (data?.error) {
              console.warn("PHP error:", data.error);
              setError("Avatar generation unavailable. Using placeholder.");
            }
          } else {
            console.warn("⚠ No snapshot available, sending placeholder");
            setError("No face detected. Using placeholder avatar.");
          }

          setAvatarUrl(url);
          setStep("avatar");

          setTimeout(() => {
            console.log(sessionId);
            navigate('/thankyou', { state: { sessionId: sessionId } });
          }, 10000); // 3 seconds delay

        } catch (err) {
          console.error("Avatar generation failed:", err);
          setError("Avatar creation failed. Using placeholder.");
          setAvatarUrl(PLACEHOLDER_URL);
          setStep("avatar");

          setTimeout(() => {
            console.log(sessionId);
            navigate('/thankyou', { state: { sessionId: sessionId } });
          }, 10000); // 3 seconds delay
        }
      }, 1000); // flash lasts 1s
    }
  }, [count, step]);

  return (
    <div className="mood-container">
      {/* Countdown Frame */}
      {(step === "countdown" || step === "ready") && (
        <div className="preloader">
          {/* Text on top */}
          <div className="preloader-text">
            <h2 className="preloader-title">
              Welcome to Circle of Nations
            </h2>

          </div>

          {/* Video */}
          <video
            ref={(el) => el && (el.srcObject = video.srcObject)}
            autoPlay
            muted
            playsInline
            className="video-full"
          />

          {/* Countdown number */}
          <div className="count-overlay">{count > 0 ? count : ""}</div>
        </div>
      )}

      {/* Flash Effect */}
      {step === "flash" && <div className="flash-overlay"></div>}

      {/* Preloader */}
      {step === "preloader" && (
        <div className="preloader">
          <h2 className="preloader-title">
            Creating your avatar... Please wait
          </h2>
          <h3 className="preloader-subtitle">
            Thank you for coming to{" "}
            <span className="highlight">Circle of Nations</span>, God bless you 🙏
          </h3>
          <div className="spinner"></div>
        </div>
      )}

      {/* Avatar */}
      {step === "avatar" && (
        <div className="avatar-screen">
          <h2 className="avatar-title">
            Welcome to <span className="highlight">Circle of Nations</span>!!
          </h2>
          <img
            src={avatarUrl || PLACEHOLDER_URL}
            alt="Avatar"
            className="avatar-image"
          />
          {error && <p className="error">{error}</p>}
        </div>
      )}
    </div>
  );
}
