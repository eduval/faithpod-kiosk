import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { calculateLightColors } from '../utils/colorCalculator';
import { sendColorsToHueLights } from '../utils/hueController';
import {
  getDatabase,
  ref,
  get,
  onValue,
  update,
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

const welcomeMessages = [
  "WELCOME",
  "STARTING SOON",
  "SIT DOWN",
  "GET READY",
  "SMILE :)"
];

const WelcomePage = () => {
  const [letters, setLetters] = useState([]);
  const [verse, setVerse] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth(firebaseApp);

    // Sign in with fixed admin credentials
    signInWithEmailAndPassword(auth, "eperezr@uni.pe", "12@23#34$")
      .then((userCredential) => {
        console.log("Signed in as:", userCredential.user.email);
      })
      .catch((error) => {
        console.error("Email/password sign-in error:", error.code, error.message);
      });

    const verseToShow = verses[Math.floor(Math.random() * verses.length)];
    setVerse(verseToShow);

    // Set up rotation of messages
    const rotationInterval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % welcomeMessages.length);
    }, 8000); // Change message every 5 seconds

    let hasClaimed = false;
    let unsubscribe = () => { };

    const sessionCheckTimeout = setTimeout(() => {
      const db = getDatabase(firebaseApp);
      const sessionRef = ref(db, "userSessions");

      unsubscribe = onValue(sessionRef, (snapshot) => {
        const sessions = snapshot.val();
        if (!sessions || hasClaimed) return;

        const candidates = [];

        Object.entries(sessions).forEach(([userId, sessionGroup]) => {
          Object.entries(sessionGroup).forEach(([sessionKey, sessionData]) => {
            const confirmation = sessionData?.confirmation;

            if (confirmation?.ready && !confirmation?.claimed) {
              candidates.push({
                userId,
                sessionId: sessionKey,
                confirmationTimestamp: confirmation.timestamp,
                experience: sessionData?.frame4?.experience,
              });
            }
          });
        });

        if (candidates.length === 0) return;

        candidates.sort((a, b) => a.confirmationTimestamp - b.confirmationTimestamp);
        const session = candidates[0];
        const fullPath = `userSessions/${session.userId}/${session.sessionId}/confirmation`;

        // Step 1: temporarily mark as claimed = false (reservation)
        update(ref(db, fullPath), { claimed: false })
          .then(() => {
            console.log("⏳ Reserved session (claimed: false):", session);
            hasClaimed = true;

            // Step 2: wait 15 seconds before final claim
            setTimeout(async () => {
              try {
                // Get the user inputs from Firebase
                const userInputs = await getSessionInputs(session.userId, session.sessionId);
                console.log(userInputs);
                // Calculate light colors based on user inputs
                const lightColors = calculateLightColors(userInputs);
                console.log(lightColors);

                // Send colors to Philips Hue lights
                const lightsSuccess = await sendColorsToHueLights(lightColors);

                if (!lightsSuccess) {
                  console.warn("⚠️ Hue lights update failed, but proceeding with claim");
                }

                // Finalize the claim
                await update(ref(db, fullPath), { claimed: true });
                console.log("✅ Finalized session claim (claimed: true):", session);

                // Navigate based on experience
                const experience = session.experience?.toLowerCase();
                const navState = { sessionId: session.sessionId };

                switch (experience) {
                  case "quiz":
                    navigate("/countdown", { state: { sessionId: session.sessionId } });
                    break;
                  case "video":
                    navigate("/video", { state: navState });
                    break;
                  case "mood detection":
                    navigate("/mood", { state: navState });
                    break;
                  default:
                    console.warn("⚠️ Unknown experience:", experience);
                    break;
                }
              } catch (err) {
                console.error("❌ Failed to finalize claim:", err);
              }
            }, 5000); // wait 15 seconds before claiming
          })
          .catch((error) => {
            console.error("❌ Failed to reserve session:", error);
          });

        async function getSessionInputs(userId, sessionId) {
          console.log(sessionId)
          try {
            // Get only the specific fields we need
            const [favoriteColor, feelingToday, focusToday, mood] = await Promise.all([
              get(ref(db, `userSessions/${userId}/${sessionId}/frame2/FavouriteColor`)),
              get(ref(db, `userSessions/${userId}/${sessionId}/frame3/FeelingToday`)),
              get(ref(db, `userSessions/${userId}/${sessionId}/frame3/FocusToday`)),
              get(ref(db, `userSessions/${userId}/${sessionId}/mood/mood`))
            ]);

            return {
              favoriteColor: favoriteColor.exists() ? favoriteColor.val() : null,
              feelingToday: feelingToday.exists() ? feelingToday.val() : null,
              focusToday: focusToday.exists() ? focusToday.val() : null,
              mood: mood.exists() ? mood.val() : null
            };
          } catch (error) {
            console.error("Error fetching session inputs:", error);
            throw error;
          }
        }
      });
    }, 10000); // 10-second delay before checking

    return () => {
      clearInterval(rotationInterval);
      clearTimeout(sessionCheckTimeout);
      if (unsubscribe) unsubscribe();
    };
  }, [navigate]);

  // Effect to handle word animation
  useEffect(() => {
    const word = welcomeMessages[currentWordIndex];
    setLetters([]);
    let i = -1;

    const animationInterval = setInterval(() => {
      i++;
      if (i < word.length) {
        setLetters((prev) => [...prev, word[i]]);
      }
      if (i === word.length - 1) {
        clearInterval(animationInterval);
      }
    }, 400);

    return () => clearInterval(animationInterval);
  }, [currentWordIndex]);

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
              {letter === ' ' ? '\u00A0' : letter}
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