// src/pages/VideoPage.js
import React, { useEffect, useState, useRef } from "react";
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
  const autoPlayed = useRef(false); // prevent multiple auto-selects

  // Load videos from Firebase
  useEffect(() => {
    const videoRef = ref(database, "VideoSelect");

    onValue(videoRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const enabledVideos = Object.values(data).filter((video) => video.Enable);
        setVideoList(enabledVideos);

        // Automatically select first video ONCE
        if (enabledVideos.length > 0 && !autoPlayed.current) {
          autoPlayed.current = true;
          handleSelectVideo(enabledVideos[0]);
        }
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

    function onYouTubeIframeAPIReady() {
      const player = new window.YT.Player("youtube-player", {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,          // <- required for autoplay
          controls: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            event.target.playVideo();

            // Request fullscreen on the iframe
            setTimeout(() => {
              const iframe = document
                .getElementById("youtube-player")
                ?.querySelector("iframe");
              if (iframe?.requestFullscreen) {
                iframe.requestFullscreen();
              }
            }, 500);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              navigate("/thankyou", { state: { sessionId } });
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
  }, [selectedVideo, navigate, sessionId]);

  return (
    <div className="video-container">
      {!selectedVideo ? (
        <>
          <h1 className="video-title">Pick a Video to Watch</h1>
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
        </>
      ) : (
        <div className="video-player">
          <div
            id="youtube-player"
            style={{ width: "100%", height: "100%" }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default VideoPage;
