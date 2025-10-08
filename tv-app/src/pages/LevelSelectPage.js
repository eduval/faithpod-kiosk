// src/pages/LevelSelectPage.js
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LevelSelectPage.css";

const LevelSelectPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const sessionId = location.state?.sessionId;

    const handleLevelSelect = (level) => {
        // Navigate to quiz with selected difficulty
        navigate("/quiz", { state: { sessionId, level } });
    };

    return (
        <div className="level-container">
            <h1 className="level-title">Choose Your Challenge Level</h1>
            <p className="level-subtitle">Select how deep you want to dive into the Word</p>

            <div className="level-buttons">
                <button
                    className="level-button beginner"
                    onClick={() => handleLevelSelect("beginner")}
                >
                    🌱 Beginner
                </button>

                <button
                    className="level-button medium"
                    onClick={() => handleLevelSelect("medium")}
                >
                    🌿 Medium
                </button>

                <button
                    className="level-button advanced"
                    onClick={() => handleLevelSelect("advanced")}
                >
                    🌳 Advanced
                </button>
            </div>
        </div>
    );
};

export default LevelSelectPage;

