import React, { useState, useEffect } from "react";
import { startWebcam, analyzeMood, video, capturePicture } from "./MoodDetector"; // <-- use capturePicture
import { useNavigate, useLocation } from 'react-router-dom';
import "./MoodPage.css";

export default function MoodPage({ onFinish }) {
    const [step, setStep] = useState("ready");
    const [count, setCount] = useState(3);
    const [moodOptions, setMoodOptions] = useState([]);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const sessionId = location.state?.sessionId;

    const PLACEHOLDER_URL = "https://dummyimage.com/512x512/cccccc/000000.png&text=Avatar";

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
                const results = await analyzeMood(video); // pass video element
                console.log("All attempts:", results);

                if (!results || results.length === 0) {
                    setMoodOptions([{ mood: "happy", confidence: 0, snapshot: null }]);
                } else {
                    setMoodOptions(results.slice(0, 2));
                }
                setStep("choose");
            })();
        }
    }, [count, step]);

    const handleChoice = async (choice) => {
        try {
            setError(null);
            setStep("preloader");

            const res = await fetch("https://ited.org.ec/faith/generate_avatar.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mood: choice.mood,
                    image: choice.snapshot // base64 snapshot
                })
            });

            const data = await res.json();
            const url = data?.data?.[0]?.url || PLACEHOLDER_URL;

            setAvatarUrl(url);
            setStep("avatar");

            //setTimeout(() => {
            //  console.log(sessionId);
            //  navigate('/thankyou', { state: { sessionId: sessionId } });
            //}, 20000); // 3 seconds delay

            if (data.error) {
                console.warn(data.error);
                setError("Avatar generation unavailable. Using placeholder.");
            }
        } catch (err) {
            console.error("Avatar generation failed:", err);
            setError("Avatar creation failed. Using placeholder.");
            setAvatarUrl(PLACEHOLDER_URL);
            setStep("avatar");
        }
    };



    return (
        <div className="mood-page">
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

            {step === "preloader" && (
                <div className="preloader">
                    <p>Creating your avatar... Please wait</p>
                    <div className="spinner"></div>
                </div>
            )}

            {step === "avatar" && (
                <div className="avatar-screen">
                    <h2>Welcome to Circle of Nations!!</h2>
                    <img
                        src={avatarUrl || PLACEHOLDER_URL}
                        alt="Avatar"
                        style={{ width: "300px", height: "300px", borderRadius: "12px" }}
                    />
                </div>
            )}
        </div>
    );
}

