import React, { useState, useEffect, useCallback } from 'react';
import { getDatabase, ref, get, child } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import './QuizPage.css';

function QuizPage() {
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswerInfo, setShowAnswerInfo] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [score, setScore] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [hasSubmittedResults, setHasSubmittedResults] = useState(false);

  const navigate = useNavigate();

  // Helper to pick 10 random questions
  const pickRandomQuestions = (questionsArray, num) => {
    const shuffled = [...questionsArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
  };

  const fetchQuestions = useCallback(async () => {
    // Try to get questions from sessionStorage first
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
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowAnswerInfo(false);
        setIsCorrect(false);
        setTimeLeft(10);
        setScore(0);
        setIsTimeUp(false);
        setHasSubmittedResults(false);
      } else {
        console.log('No questions found');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer || isTimeUp) return;

    setSelectedAnswer(answer);

    const correctObj = quizQuestions[currentQuestionIndex].correct_answers;
    const correctAnswer = Array.isArray(correctObj)
      ? correctObj[0]
      : typeof correctObj === 'object'
      ? Object.values(correctObj)[0]
      : correctObj;

    const isCorrectAnswer = answer === correctAnswer;
    setIsCorrect(isCorrectAnswer);
    setShowAnswerInfo(true);

    if (isCorrectAnswer) {
      setScore((prev) => prev + 1);
    }
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

      // Clear sessionStorage so next session can get new questions
      sessionStorage.removeItem('quizQuestions');

      const total = quizQuestions.length;
      navigate('/quiz-result', { state: { score, total } });

      setTimeout(() => {
        navigate('/thankyou');
      }, 3000); // 3 seconds delay
    }
  }, [currentQuestionIndex, quizQuestions.length, navigate, score, hasSubmittedResults]);

  useEffect(() => {
    if (selectedAnswer || showAnswerInfo) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
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

  if (quizQuestions.length === 0) {
    return <div className="loading">Loading questions...</div>;
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const correctAnswer = Array.isArray(currentQuestion.correct_answers)
    ? currentQuestion.correct_answers[0]
    : currentQuestion.correct_answers;

  return (
    <div className="quiz-container">
      <div className="countdown-circle">{timeLeft}</div>
      <div className="question-text">
        Question {currentQuestionIndex + 1} / {quizQuestions.length}
      </div>
      <div className="question-title">{currentQuestion.question}</div>
      <div className="options-boxes">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrectAnswer = option === correctAnswer;

          let className = 'option-box';
          if (!showAnswerInfo && isSelected) className += ' selected';
          if (showAnswerInfo) {
            if (isCorrectAnswer) className += ' correct';
            else if (isSelected) className += ' wrong';
          }

          return (
            <button
              key={index}
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
            {isTimeUp
              ? "Time's up! The correct answer is:"
              : isCorrect
              ? 'Correct!'
              : 'Wrong!'}
            <br />
            <strong>Answer:</strong> {currentQuestion.correct_answers}
          </p>
          <p className="reference">
            <strong>Reference:</strong> {currentQuestion.reference} <br />
            <strong>Testament:</strong> {currentQuestion.testament}
          </p>
          <button className="next-button" onClick={handleNextQuestion}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizPage;
