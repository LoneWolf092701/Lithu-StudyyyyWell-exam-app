import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle2, XCircle, Sun, Moon } from 'lucide-react';
import questionsData from './data/questions.json';
import VaaAnnamalai from './assets/VaaAnnamalai.jpg';

// Motivational messages arrays
const correctMessages = [
  "Yippee!🎉",
  "Lucky huh?! 🌟",
  "You're on fire! Nerupu daaa 🔥",
  "Studied huh?! ⭐",
  "Apudi than! 💪"
];

const incorrectMessages = [
  "Don't be sad, sad backwards is das and das not good! 💪",
  "Charter! Try again! 🌟",
  "NOOOOOOOOOOOOOOOB! 📚",
  "Podangu! 🎯",
  "Poda poi maadu mei! ✨"
];

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function App() {
  const [questions, setQuestions] = useState(() => 
    shuffleArray(questionsData.questions)
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [scoreText, setScoreText] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false); // Changed to false so quiz doesn't start automatically
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // New states for welcome page and theme
  const [quizStarted, setQuizStarted] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  useEffect(() => {
    if (quizStarted) {
      setShuffledOptions(shuffleArray(questions[currentQuestion].options));
    }
  }, [currentQuestion, questions, quizStarted]);

  useEffect(() => {
    let interval: number | undefined;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setShowExplanation(true);
      setMessage(incorrectMessages[Math.floor(Math.random() * incorrectMessages.length)]);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeLeft, isActive]);

  const handleAnswer = (option: string) => {
    setSelectedOption(option);
    const correct = option === questions[currentQuestion].options[questions[currentQuestion].correctAnswer];
    
    let newScore;
    if (correct) {
      newScore = score + 1;
      setScore(newScore);
      setMessage(correctMessages[Math.floor(Math.random() * correctMessages.length)]);
    } else {
      newScore = score - 1;
      setScore(newScore);
      setMessage(incorrectMessages[Math.floor(Math.random() * incorrectMessages.length)]);
    }
    
    // Set score text based on the new score value
    setScoreText(newScore === 0 ? "" : newScore >= 1 ? "Come on Velu!" : "IIT bathroom cleaner vacancy available!");
    
    setShowExplanation(true);
    setIsActive(false);
  };
  
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setShowExplanation(false);
      setTimeLeft(30);
      setIsActive(true);
      setMessage('');
      setSelectedOption(null);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setIsActive(true);
  };

  const resetQuiz = () => {
    setQuestions(shuffleArray(questionsData.questions));
    setCurrentQuestion(0);
    setScore(0);
    setShowExplanation(false);
    setTimeLeft(30);
    setIsActive(true);
    setMessage('');
    setSelectedOption(null);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Define background and text colors based on theme
  const bgColor = darkMode ? 'bg-black' : 'bg-gray-100';
  const textColor = darkMode ? 'text-white' : 'text-gray-900';
  const cardBg = darkMode ? 'bg-gray-900' : 'bg-white';
  const cardBorder = darkMode ? 'border-gray-700' : 'border-gray-200';
  const btnPrimary = darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600';
  const btnSuccess = darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600';
  const optionBg = darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100';
  const correctBg = darkMode ? 'bg-green-900 border-green-700' : 'bg-green-100 border-green-500';
  const incorrectBg = darkMode ? 'bg-red-900 border-red-700' : 'bg-red-100 border-red-500';
  const explanationBg = darkMode ? 'bg-gray-900' : 'bg-blue-50';
  // Define score color based on score value
  const scoreColor = score < 0 ? 'text-red-500' : darkMode ? 'text-white' : 'text-gray-900';

  // Welcome page content
  if (!quizStarted) {
    return (
      <div className={`min-h-screen ${bgColor} ${textColor} flex flex-col`}>
        <div className="absolute top-4 right-4">
          <button 
            onClick={toggleTheme} 
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="w-6 h-6 text-yellow-300" /> : <Moon className="w-6 h-6 text-gray-700" />}
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className={`max-w-4xl w-full ${cardBg} rounded-lg shadow-2xl border ${cardBorder} p-8 text-center`}>
            <h1 className="text-4xl font-bold mb-4">Cybersecurity Quizzz</h1>
            <p className="text-xl mb-8">Parama Padi da!</p>
            
            <div className="mb-12 flex justify-center">
              <div className="relative w-128 h-64 rounded-lg overflow-hidden">
                <img 
                  src={VaaAnnamalai} 
                  alt="Cybersecurity Quiz" 
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            
            <div className="text-lg mb-8">
              <p className="mb-2">• 80+ mcq questions</p>
              <p className="mb-2">• Timed responses & negative scores for wrong answers</p>
              <p className="mb-2">• Ellarum Nanmai Adaika!</p>
              <p>• Konichuwa</p>
            </div>
            
            <button
              onClick={startQuiz}
              className={`px-8 py-3 ${btnPrimary} text-white rounded-lg text-xl font-semibold transition-colors`}
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz content
  return (
    <div className={`min-h-screen ${bgColor} py-8`}>
      <div className="max-w-3xl mx-auto px-4">
        <div className={`${cardBg} rounded-lg shadow-lg p-6 ${textColor} border ${cardBorder}`}>
          <div className="flex justify-between items-center mb-6">
            <div className={`text-xl font-semibold ${scoreColor}`}>Score: {score} {scoreText}</div>
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme} 
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-gray-700" />}
              </button>
              <div className="flex items-center text-lg">
                <Timer className="w-5 h-5 mr-2" />
                {timeLeft}s
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Question {currentQuestion + 1} of {questions.length}
            </h2>
            <p className="text-lg mb-6">{questions[currentQuestion].question}</p>

            {message && (
              <div className={`mb-4 p-3 rounded-lg text-center font-medium ${
                message.includes("🎉") || message.includes("🌟") || message.includes("🔥") || message.includes("⭐") || message.includes("💪")
                  ? darkMode ? "bg-green-900 text-green-300" : "bg-green-100 text-green-700"
                  : darkMode ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-700"
              }`}>
                {message}
              </div>
            )}

            <div className="space-y-3">
              {shuffledOptions.map((option, index) => {
                const isCorrectAnswer = option === questions[currentQuestion].options[questions[currentQuestion].correctAnswer];
                const isSelected = option === selectedOption;
                const showWrongAnswer = showExplanation && isSelected && !isCorrectAnswer;

                return (
                  <button
                    key={index}
                    onClick={() => !showExplanation && handleAnswer(option)}
                    className={`w-full text-left p-4 rounded-lg transition-colors ${
                      showExplanation
                        ? isCorrectAnswer
                          ? correctBg
                          : showWrongAnswer
                            ? incorrectBg
                            : optionBg
                        : optionBg
                    } border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}
                    disabled={showExplanation}
                  >
                    <div className="flex items-center">
                      {showExplanation && (
                        <>
                          {isCorrectAnswer && <CheckCircle2 className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-500'} mr-2`} />}
                          {showWrongAnswer && <XCircle className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-500'} mr-2`} />}
                        </>
                      )}
                      {option}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {showExplanation && (
            <div className={`mb-6 p-4 ${explanationBg} rounded-lg border ${darkMode ? 'border-indigo-700' : 'border-indigo-200'}`}>
              <h3 className={`font-semibold mb-2 ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>Explanation:</h3>
              <p>{questions[currentQuestion].explanation}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            {showExplanation && currentQuestion < questions.length - 1 && (
              <button
                onClick={nextQuestion}
                className={`px-6 py-2 ${btnPrimary} text-white rounded-lg transition-colors`}
              >
                Next Question
              </button>
            )}
            {(showExplanation && currentQuestion === questions.length - 1) && (
              <button
                onClick={resetQuiz}
                className={`px-6 py-2 ${btnSuccess} text-white rounded-lg transition-colors`}
              >
                Restart Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;