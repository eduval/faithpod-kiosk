// src/pages/VideoPage.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ref, onValue, set } from "firebase/database";
import { database } from "../firebase";
import "./VideoPage.css";

const VideoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionId = location.state?.sessionId;

  const [videoList, setVideoList] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Load videos from Firebase
  useEffect(() => {
    const videoRef = ref(database, "VideoSelect");

    onValue(videoRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const enabledVideos = Object.values(data).filter((video) => video.Enable);
        setVideoList(enabledVideos);
      }
    });
  }, []);

  // Handle video selection
  const handleSelectVideo = (video) => {
    setSelectedVideo(video.VideoURL);

    if (sessionId) {
      const sessionRef = ref(database, `UserSessions/${sessionId}`);
      set(sessionRef, {
        selectedVideo: {
          name: video.VideoName,
          url: video.VideoURL,
          id: video.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  }, []);

  // Create YouTube player and listen for video end event
  useEffect(() => {
    if (!selectedVideo) return;

    // Extract video ID from YouTube URL
    function getYouTubeVideoId(url) {
      try {
        const urlObj = new URL(url);
        if (urlObj.hostname === "youtu.be") {
          return urlObj.pathname.slice(1);
        } else if (
          urlObj.hostname === "www.youtube.com" ||
          urlObj.hostname === "youtube.com"
        ) {
          return urlObj.searchParams.get("v");
        }
      } catch {
        return null;
      }
      return null;
    }

    const videoId = getYouTubeVideoId(selectedVideo);
    if (!videoId) return;

    // YouTube API callback to create player
    function onYouTubeIframeAPIReady() {
      new window.YT.Player("youtube-player", {
        videoId,
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              navigate("/thankyou");
            }
          },
        },
      });
    }

    if (window.YT && window.YT.Player) {
      onYouTubeIframeAPIReady();
    } else {
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }
  }, [selectedVideo, navigate]);

  return (
    <div className="video-container">
      <h1 className="video-title">Pick a Video to Watch</h1>

      {!selectedVideo ? (
        <div className="video-options">
          {videoList.map((video) => (
            <button
              key={video.id}
              className="video-button"
              onClick={() => handleSelectVideo(video)}
            >
              {video.VideoName}
            </button>
          ))}
        </div>
      ) : (
        <div className="video-player">
          <div
            id="youtube-player"
            style={{ width: "90%", height: "500px", margin: "0 auto" }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default VideoPage;
