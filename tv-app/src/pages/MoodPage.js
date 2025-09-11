import React, { useState, useEffect } from "react";
import { startWebcam, analyzeMood, video } from "./MoodDetector";
import "./MoodPage.css";

export default function MoodPage({ onFinish }) {
  const [step, setStep] = useState("ready"); // ready → countdown → choose → preloader → avatar → done
  const [count, setCount] = useState(3);
  const [moodOptions, setMoodOptions] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    startWebcam();
  }, []);

  // Countdown + analyze mood
  useEffect(() => {
    if (step === "countdown" && count > 0) {
      const timer = setTimeout(() => setCount((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (step === "countdown" && count === 0) {
      (async () => {
        const results = await analyzeMood(); // returns 3 moods
        console.log("All attempts:", results);

        if (!results || results.length === 0) {
          setMoodOptions([{ mood: "happy", confidence: 0, snapshot: null }]);
        } else {
          setMoodOptions(results.slice(0, 2)); // show first 2
        }
        setStep("choose");
      })();
    }
  }, [count, step]);

  const handleChoice = async (choice) => {
    try {
      setError(null);
      setStep("preloader");

      // ⚠ Put your API key here (temporary, insecure!)
      const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
      // --- Call OpenAI Images API (DALL·E) ---
      const dalleRes = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt:`A cartoon-style avatar of a person who is feeling ${choice.mood}`,
          size: "512x512",
          n: 1
        }),
      });

      if (!dalleRes.ok) throw new Error("DALL·E request failed");
      const data = await dalleRes.json();
      const url = data.data[0].url;

      setAvatarUrl(url);
      setStep("avatar");

      setTimeout(() => {
        setStep("done");
        onFinish();
      }, 20000);
    } catch (err) {
      console.error("Avatar generation failed:", err);
      setError("Avatar creation failed. Please try again.");
      setStep("choose");
    }
  };

  return (
    <div className="mood-page">
      {/* Ready state */}
      {step === "ready" && (
        <div className="countdown">
          <h2>Get ready, position yourself in the frame</h2>
          <video
            ref={(el) => el && (el.srcObject = video.srcObject)}
            autoPlay
            muted
            playsInline
            style={{ width: "400px", borderRadius: "12px" }}
          />
          <button onClick={() => setStep("countdown")}>Start</button>
        </div>
      )}

      {/* Countdown state */}
      {step === "countdown" && (
        <div className="countdown">
          <h2>Scanning your mood...</h2>
          <video
            ref={(el) => el && (el.srcObject = video.srcObject)}
            autoPlay
            muted
            playsInline
            style={{ width: "400px", borderRadius: "12px" }}
          />
          <div className="count-overlay">{count}</div>
        </div>
      )}

      {/* Choose mood */}
      {step === "choose" && (
        <div className="choose-mood">
          <h2>Select your mood for the avatar</h2>
          {error && <p className="error">{error}</p>}
          <div className="mood-options">
            {moodOptions.map((m, i) => {
              const mood = m.mood || "happy";
              const confidence =
                m.confidence && !isNaN(m.confidence)
                  ? Math.round(m.confidence * 100)
                  : 0;
              return (
                <div
                  key={i}
                  className="mood-card"
                  onClick={() => handleChoice(m)}
                >
                  {m.snapshot && <img src={m.snapshot} alt={`Mood ${i + 1}`} />}
                  <p>
                    {mood} ({confidence}%)
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Preloader */}
      {step === "preloader" && (
        <div className="preloader">
          <p>Creating your avatar... Please wait</p>
          <div className="spinner"></div>
        </div>
      )}

      {/* Avatar display */}
      {step === "avatar" && (
        <div className="avatar-screen">
          <h2>Welcome to Circle of Nations!!</h2>
          <img src={avatarUrl} alt="Avatar" />
        </div>
      )}
    </div>
  );
}