import React, { useState, useEffect, useCallback } from 'react';
import { getDatabase, ref, get, child } from 'firebase/database';
import { useNavigate, useLocation } from 'react-router-dom';
import './QuizPage.css';

function QuizPage() {
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswerInfo, setShowAnswerInfo] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25);
  const [score, setScore] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [hasSubmittedResults, setHasSubmittedResults] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = location.state?.sessionId;

  // Shuffle array
  const shuffleArray = (array) => [...array].sort(() => 0.5 - Math.random());

  // Pick unique questions and shuffle options
  const pickRandomQuestions = (questionsArray, num) => {
    // 1. Remove duplicates by question ID
    const uniqueQuestionsMap = {};
    questionsArray.forEach(q => {
      uniqueQuestionsMap[q.id] = q;
    });
    const uniqueQuestions = Object.values(uniqueQuestionsMap);

    // 2. Shuffle unique questions
    const shuffled = [...uniqueQuestions].sort(() => 0.5 - Math.random());

    // 3. Pick only the number you need (or all if fewer than num)
    const selected = shuffled.slice(0, Math.min(num, shuffled.length)).map(q => {
      // Shuffle options too
      const allOptions = shuffleArray([...q.options]);
      const correctAnswerText = Array.isArray(q.correct_answers)
        ? q.correct_answers[0]
        : typeof q.correct_answers === 'object'
          ? Object.values(q.correct_answers)[0]
          : q.correct_answers;

      return {
        ...q,
        options: allOptions,
        correctAnswerText
      };
    });

    return selected;
  };


  const fetchQuestions = useCallback(async () => {
    const storedQuestions = sessionStorage.getItem('quizQuestions');
    if (storedQuestions) {
      setQuizQuestions(JSON.parse(storedQuestions));
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowAnswerInfo(false);
      setIsCorrect(false);
      setTimeLeft(10);
      setScore(0);
      setIsTimeUp(false);
      setHasSubmittedResults(false);
      return;
    }

    const db = getDatabase();
    const dbRef = ref(db);

    try {
      const snapshot = await get(child(dbRef, 'bible_questions'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const allQuestions = Object.values(data);
        const selectedQuestions = pickRandomQuestions(allQuestions, 10);
        setQuizQuestions(selectedQuestions);
        sessionStorage.setItem('quizQuestions', JSON.stringify(selectedQuestions));
      } else {
        console.log('No questions found');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  }, []);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer || isTimeUp) return;

    setSelectedAnswer(answer);
    const current = quizQuestions[currentQuestionIndex];
    const isCorrectAnswer = answer === current.correctAnswerText;

    setIsCorrect(isCorrectAnswer);
    setShowAnswerInfo(true);
    if (isCorrectAnswer) setScore(prev => prev + 1);
  };

  const handleNextQuestion = useCallback(() => {
    setShowAnswerInfo(false);
    setSelectedAnswer(null);
    setTimeLeft(10);
    setIsTimeUp(false);

    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < quizQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
    } else if (!hasSubmittedResults) {
      setHasSubmittedResults(true);
      sessionStorage.removeItem('quizQuestions');
      const total = quizQuestions.length;
      navigate('/quiz-result', { state: { score, total } });

      setTimeout(() => {
        navigate('/thankyou', { state: { sessionId: sessionId } });
      }, 5000);
    }
  }, [currentQuestionIndex, quizQuestions.length, navigate, score, hasSubmittedResults, sessionId]);

  // Countdown timer
  useEffect(() => {
    if (selectedAnswer || showAnswerInfo) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 1) {
          setIsTimeUp(true);
          setShowAnswerInfo(true);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedAnswer, showAnswerInfo]);

  // Auto next question after 3s
  useEffect(() => {
    if (showAnswerInfo) {
      const timeout = setTimeout(handleNextQuestion, 5000);
      return () => clearTimeout(timeout);
    }
  }, [showAnswerInfo, handleNextQuestion]);

  if (quizQuestions.length === 0) return <div className="loading">Loading questions...</div>;

  const current = quizQuestions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      <div className="countdown-circle">{timeLeft}</div>
      <div className="question-text">
        Question {currentQuestionIndex + 1} / {quizQuestions.length}
      </div>
      <div className="question-title">{current.question}</div>
      <div className="options-boxes">
        {current.options.map((option, idx) => {
          const isSelected = selectedAnswer === option;
          const isCorrectAnswer = option === current.correctAnswerText;
          let className = 'option-box';
          if (!showAnswerInfo && isSelected) className += ' selected';
          if (showAnswerInfo) {
            if (isCorrectAnswer) className += ' correct';
            else if (isSelected) className += ' wrong';
          }

          return (
            <button
              key={idx}
              className={className}
              onClick={() => handleAnswerSelect(option)}
              disabled={!!selectedAnswer || isTimeUp}
            >
              {option}
              {showAnswerInfo && isSelected && (isCorrect ? ' ✅' : ' ❌')}
              {showAnswerInfo && !selectedAnswer && isTimeUp && isCorrectAnswer && ' ⏰'}
            </button>
          );
        })}
      </div>

      {showAnswerInfo && (
        <div className="answer-info">
          <p>
            {isTimeUp ? "Time's up! The correct answer is:" : isCorrect ? 'Correct!' : 'Wrong!'}
            <br />
            <strong>Answer:</strong> {current.correctAnswerText}
          </p>
          <p className="reference">
            <strong>Reference:</strong> {current.reference} <br />
            <strong>Testament:</strong> {current.testament}
          </p>
        </div>
      )}
    </div>
  );
}

export default QuizPage;
