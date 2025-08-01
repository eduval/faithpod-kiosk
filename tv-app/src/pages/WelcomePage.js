import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDatabase,
  ref,
  onValue,
} from "firebase/database";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import firebaseApp from "../firebase";
import "./WelcomePage.css";

const verses = [
  {
    text: "Your word is a lamp to my feet and a light to my path.",
    reference: "Psalm 119:105",
  },
  {
    text: "Be still, and know that I am God.",
    reference: "Psalm 46:10",
  },
  {
    text: "I can do all things through Christ who strengthens me.",
    reference: "Philippians 4:13",
  },
  {
    text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you.",
    reference: "Jeremiah 29:11",
  },
  {
    text: "The Lord is my shepherd; I shall not want.",
    reference: "Psalm 23:1",
  },
];

const WelcomePage = () => {
  const [letters, setLetters] = useState([]);
  const [verse, setVerse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth(firebaseApp);

    // Sign in with email and password
    signInWithEmailAndPassword(auth, "eperezr@uni.pe", "12@23#34$")
      .then((userCredential) => {
        console.log("Signed in as:", userCredential.user.email);
      })
      .catch((error) => {
        console.error("Email/password sign-in error:", error.code, error.message);
      });

    const word = "WELCOME";
    setLetters([]);
    let i = -1;
    const verseToShow = verses[Math.floor(Math.random() * verses.length)];
    setVerse(verseToShow);

    const animationInterval = setInterval(() => {
      i++;
      if (i < word.length) {
        setLetters((prev) => [...prev, word[i]]);
      }
      if (i === word.length - 1) {
        clearInterval(animationInterval);
      }
    }, 400);

    // Delay session listener setup by 15 seconds
    let lastSeenKey = null;
    let unsubscribe = () => {};

    const sessionCheckTimeout = setTimeout(() => {
      const db = getDatabase(firebaseApp);
      const sessionRef = ref(db, "userSessions");

      unsubscribe = onValue(sessionRef, (snapshot) => {
        const sessions = snapshot.val();
        if (!sessions) return;

        const sortedKeys = Object.keys(sessions).sort().reverse();
        const latestKey = sortedKeys[0];
        const latestSession = sessions[latestKey];
        const experience = latestSession?.frame4?.experienceChoice;

        console.log("Latest session key:", latestKey);
        console.log("Latest experience choice:", experience);

        if (latestKey !== lastSeenKey && experience) {
          lastSeenKey = latestKey;

          switch (experience.toLowerCase()) {
            case "bible quiz":
              navigate("/countdown");
              break;
            case "video":
              navigate("/video");
              break;
            case "mood detection":
              navigate("/mood");
              break;
            default:
              console.warn("Unknown experience:", experience);
              break;
          }
        }
      });
    }, 15000); // 15-second delay

    return () => {
      clearInterval(animationInterval);
      clearTimeout(sessionCheckTimeout);
      if (unsubscribe) unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="welcome-background">
      <div className="welcome-overlay">
        <div>
          {letters.map((letter, index) => (
            <span
              key={index}
              className="welcome-letter"
              style={{ "--i": index }}
            >
              {letter}
            </span>
          ))}
        </div>

        {verse && (
          <div className="verse-container">
            <div className="verse-text">"{verse.text}"</div>
            <div className="verse-reference">— {verse.reference}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomePage;
