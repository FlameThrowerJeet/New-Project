import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Game.css';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

// Sample questions database
const questions: Question[] = [
  {
    id: 1,
    question: "Which mountain range forms India's northern border?",
    options: ["Western Ghats", "Eastern Ghats", "Himalayas", "Vindhya Range"],
    correctAnswer: 2,
    explanation: "The Himalayas form India's northern border, separating it from China, Nepal, and Bhutan.",
    category: "geography"
  },
  {
    id: 2,
    question: "Which river is known as the 'Ganga' in India?",
    options: ["Brahmaputra", "Yamuna", "Ganges", "Godavari"],
    correctAnswer: 2,
    explanation: "The Ganges is known as the Ganga in India and is considered sacred in Hinduism.",
    category: "geography"
  },
  {
    id: 3,
    question: "What treaty established the current borders between India and Pakistan?",
    options: ["Treaty of Versailles", "Shimla Agreement", "Durand Line Agreement", "Radcliffe Line"],
    correctAnswer: 3,
    explanation: "The Radcliffe Line, drawn in 1947, established the borders between India and Pakistan after partition.",
    category: "history"
  },
  {
    id: 4,
    question: "Which desert forms part of India's western border region?",
    options: ["Gobi Desert", "Thar Desert", "Kalahari Desert", "Atacama Desert"],
    correctAnswer: 1,
    explanation: "The Thar Desert, also known as the Great Indian Desert, spans the India-Pakistan border in the west.",
    category: "geography"
  },
  {
    id: 5,
    question: "Which Indian state shares borders with China, Nepal, and Bhutan?",
    options: ["Arunachal Pradesh", "Sikkim", "Uttarakhand", "Himachal Pradesh"],
    correctAnswer: 1,
    explanation: "Sikkim is the only Indian state that shares borders with three countries: China, Nepal, and Bhutan.",
    category: "geography"
  }
];

const Game: React.FC = () => {
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState<'menu' | 'quiz' | 'result'>('menu');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const filteredQuestions = selectedCategory === 'all' 
    ? questions 
    : questions.filter(q => q.category === selectedCategory);
  
  const currentQuestion = filteredQuestions[currentQuestionIndex];
  
  // Start game with selected category
  const startGame = () => {
    setGameMode('quiz');
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswers([]);
    setTimeLeft(20);
    setGameCompleted(false);
  };
  
  // Handle answer selection
  const selectAnswer = (answerIndex: number) => {
    if (selectedAnswers.includes(currentQuestionIndex)) return;
    
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setSelectedAnswers([...selectedAnswers, currentQuestionIndex]);
    
    // Wait 2 seconds before moving to next question
    setTimeout(() => {
      if (currentQuestionIndex < filteredQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTimeLeft(20);
      } else {
        setGameMode('result');
        setGameCompleted(true);
      }
    }, 2000);
  };
  
  // Timer effect
  useEffect(() => {
    if (gameMode !== 'quiz' || selectedAnswers.includes(currentQuestionIndex)) return;
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setSelectedAnswers([...selectedAnswers, currentQuestionIndex]);
          
          // Move to next question after timeout
          setTimeout(() => {
            if (currentQuestionIndex < filteredQuestions.length - 1) {
              setCurrentQuestionIndex(currentQuestionIndex + 1);
              return 20;
            } else {
              setGameMode('result');
              setGameCompleted(true);
              return 0;
            }
          }, 2000);
          
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameMode, currentQuestionIndex, selectedAnswers, filteredQuestions.length]);
  
  // Return to home
  const goToHomePage = () => {
    navigate('/');
  };
  
  return (
    <div className="game-container">
      <header className="game-header">
        <div className="game-title">Border Knowledge Challenge</div>
        <button className="home-button" onClick={goToHomePage}>Home Page</button>
      </header>
      
      <div className="game-content">
        {gameMode === 'menu' && (
          <div className="game-menu">
            <h2>Test Your Knowledge About India's Geography</h2>
            <div className="category-selection">
              <label htmlFor="category-select">Select Category:</label>
              <select 
                id="category-select"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                aria-label="Select Category"
              >
                <option value="all">All Categories</option>
                <option value="geography">Geography</option>
                <option value="history">History</option>
              </select>
            </div>
            <button className="start-game-btn" onClick={startGame}>
              Start Challenge
            </button>
          </div>
        )}
        
        {gameMode === 'quiz' && currentQuestion && (
          <div className="quiz-container">
            <div className="quiz-header">
              <div className="question-counter">
                Question {currentQuestionIndex + 1} of {filteredQuestions.length}
              </div>
              <div className="timer">
                Time Remaining: {timeLeft}s
                <div 
                  className="timer-bar" 
                  style={{ width: `${(timeLeft / 20) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="question">
              {currentQuestion.question}
            </div>
            
            <div className="options">
              {currentQuestion.options.map((option, index) => (
                <button 
                  key={index}
                  className={`option ${
                    selectedAnswers.includes(currentQuestionIndex)
                      ? index === currentQuestion.correctAnswer
                        ? 'correct'
                        : index === selectedAnswers[selectedAnswers.length - 1]
                          ? 'incorrect'
                          : ''
                      : ''
                  }`}
                  onClick={() => selectAnswer(index)}
                  disabled={selectedAnswers.includes(currentQuestionIndex)}
                >
                  {option}
                </button>
              ))}
            </div>
            
            {selectedAnswers.includes(currentQuestionIndex) && (
              <div className="explanation">
                {currentQuestion.explanation}
              </div>
            )}
          </div>
        )}
        
        {gameMode === 'result' && (
          <div className="result-container">
            <h2>Quiz Completed!</h2>
            <div className="score-display">
              <div className="score-value">{score}</div>
              <div className="score-label">out of {filteredQuestions.length}</div>
            </div>
            <p className="score-percent">
              You scored {((score / filteredQuestions.length) * 100).toFixed(1)}%
            </p>
            
            <button className="restart-btn" onClick={() => setGameMode('menu')}>
              Return to Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;