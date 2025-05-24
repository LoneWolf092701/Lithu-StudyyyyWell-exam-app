import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle2, XCircle, Sun, Moon, Info, ChevronDown, ChevronUp } from 'lucide-react';
import VaaAnnamalai from './assets/VaaAnnamalai.jpg';

// Import all the different question data sets
import questions1_4 from './data/questions1_4.json';
import questions5_7 from './data/questions5_7.json';
import questions8_10 from './data/questions7_9.json';
import questions11_12 from './data/questions10_12.json';
import questionsDataAll from './data/questionsAll.json';

// Motivational messages arrays
const correctMessages = [
  "Yippee! 🧠",
  "Lucky huh?! 🌚",
  "You're on fire! Nerupu daaa 🔥",
  "Studied huh?! 🫦",
  "Apudi than! 💪"
];

const incorrectMessages = [
  "Don't be sad, sad backwards is das and das not good! 💪",
  "Charter! Try again! 🍌",
  "NOOOOOOOOOOOOOOOB! 🐒",
  "Podangu! 🍆💦",
  "Poda poi maadu mei! 🐄"
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

// Define week option type
type WeekOption = {
  id: number;
  title: string;
  description: string;
  data: any;
};

function App() {
  // Define all week options
  const weekOptions: WeekOption[] = [
    {
      id: 1,
      title: "Week 1 - 4",
      description: "Foundations of Cybersecurity",
      data: questions1_4
    },
    {
      id: 2,
      title: "Week 5 - 7",
      description: "Network Security",
      data: questions5_7
    },
    {
      id: 3,
      title: "Week 7 - 9",
      description: "Application Security",
      data: questions8_10
    },
    {
      id: 4,
      title: "Week 10 - 12",
      description: "Advanced Topics",
      data: questions11_12
    },
    {
      id: 5,
      title: "Give me God of War",
      description: "All weeks combined",
      data: questionsDataAll
    }
  ];

  // States for managing the application
  const [selectedWeek, setSelectedWeek] = useState<WeekOption | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [scoreText, setScoreText] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [showWhyOthersWrong, setShowWhyOthersWrong] = useState(false); // New state for toggling additional explanation
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [usedQuestionIndices, setUsedQuestionIndices] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);
  const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);

  // App state management
  const [appState, setAppState] = useState<'welcome' | 'weekSelect' | 'quiz' | 'results'>('welcome');
  const [darkMode, setDarkMode] = useState(true);

  // Initialize questions when a week is selected
  useEffect(() => {
    if (selectedWeek && selectedWeek.data && Array.isArray(selectedWeek.data.questions)) {
      const allQuestions = selectedWeek.data.questions;
      setQuestions(shuffleArray(allQuestions));
      setUsedQuestionIndices([]);
      setQuizCompleted(false);
      setCorrectAnswers([]);
      setWrongAnswers([]);
      setTimeLeft(selectedWeek.title === "Give me God of War" ? 30 : 60);
    } else {
      console.error("Questions data is missing or not an array!");
      setQuestions([]);
    }
  }, [selectedWeek]);

  // Set up shuffled options when current question changes
  useEffect(() => {
    if (appState === 'quiz' && questions.length > 0 && currentQuestion < questions.length) {
      setShuffledOptions(shuffleArray(questions[currentQuestion].options));
    }
  }, [currentQuestion, questions, appState]);

  // Timer effect
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
      setWrongAnswers(prev => [...prev, currentQuestion]);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeLeft, isActive, currentQuestion]);

  const handleAnswer = (option: string) => {
    setSelectedOption(option);
    const isCorrect = option === questions[currentQuestion].options[questions[currentQuestion].correctAnswer];

    let newScore;
    if (isCorrect) {
      newScore = score + 1;
      setScore(newScore);
      setMessage(correctMessages[Math.floor(Math.random() * correctMessages.length)]);
      setCorrectAnswers(prev => [...prev, currentQuestion]);
    } else {
      newScore = score - 1;
      setScore(newScore);
      setMessage(incorrectMessages[Math.floor(Math.random() * incorrectMessages.length)]);
      setWrongAnswers(prev => [...prev, currentQuestion]);
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
      setShowWhyOthersWrong(false); // Reset the "why others wrong" state
      setTimeLeft(selectedWeek?.title === "Give me God of War" ? 30 : 60);
      setIsActive(true);
      setMessage('');
      setSelectedOption(null);
    } else {
      setQuizCompleted(true);
      setAppState('results');
    }
  };

  const goToWeekSelect = () => {
    setAppState('weekSelect');
  };

  const selectWeek = (week: WeekOption) => {
    setSelectedWeek(week);
    setCurrentQuestion(0);
    setScore(0);
    setScoreText('');
    setShowExplanation(false);
    setShowWhyOthersWrong(false); // Reset additional explanation state
    setTimeLeft(week.title === "Give me God of War" ? 30 : 60);
    setIsActive(true);
    setMessage('');
    setSelectedOption(null);
    setUsedQuestionIndices([]);
    setQuizCompleted(false);
    setCorrectAnswers([]);
    setWrongAnswers([]);
    setAppState('quiz');
  };

  const resetQuiz = () => {
    if (selectedWeek) {
      setQuestions(shuffleArray(selectedWeek.data.questions));
    }
    setCurrentQuestion(0);
    setScore(0);
    setScoreText('');
    setShowExplanation(false);
    setShowWhyOthersWrong(false); // Reset additional explanation state
    setTimeLeft(selectedWeek?.title === "Give me God of War" ? 30 : 60);
    setIsActive(true);
    setMessage('');
    setSelectedOption(null);
    setUsedQuestionIndices([]);
    setQuizCompleted(false);
    setCorrectAnswers([]);
    setWrongAnswers([]);
    setAppState('quiz');
  };

  const backToWeekSelect = () => {
    setAppState('weekSelect');
    setIsActive(false);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Toggle function for "why others wrong" section
  const toggleWhyOthersWrong = () => {
    setShowWhyOthersWrong(!showWhyOthersWrong);
  };

  // Define styles based on theme
  const bgColor = darkMode ? 'bg-black' : 'bg-gray-100';
  const textColor = darkMode ? 'text-white' : 'text-gray-900';
  const cardBg = darkMode ? 'bg-gray-900' : 'bg-white';
  const cardBorder = darkMode ? 'border-gray-700' : 'border-gray-200';
  const btnPrimary = darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600';
  const btnSecondary = darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600';
  const btnSuccess = darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600';
  const btnDanger = darkMode ? 'bg-red-400 hover:bg-red-500' : 'bg-red-200 hover:bg-red-400';
  const btnWarning = darkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600';
  const optionBg = darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100';
  const correctBg = darkMode ? 'bg-green-900 border-green-700' : 'bg-green-100 border-green-500';
  const incorrectBg = darkMode ? 'bg-red-900 border-red-700' : 'bg-red-100 border-red-500';
  const explanationBg = darkMode ? 'bg-gray-900' : 'bg-blue-50';
  const whyWrongBg = darkMode ? 'bg-gray-800' : 'bg-orange-50'; // Different background for "why others wrong" section
  
  // Define score color based on score value
  const scoreColor = score < 0 ? 'text-red-500' : darkMode ? 'text-white' : 'text-gray-900';

  // Theme toggle button component
  const ThemeToggleButton = ({ className = "" }) => (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} ${className}`}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? <Sun className="w-6 h-6 text-yellow-300" /> : <Moon className="w-6 h-6 text-gray-700" />}
    </button>
  );

  // Results Page
  const renderResults = () => {
    const totalQuestions = questions.length;
    const finalScore = score;
    const correctPercentage = (totalQuestions > 0) ? ((correctAnswers.length / totalQuestions) * 100).toFixed(2) : 0;

    return (
      <div className={`min-h-screen ${bgColor} ${textColor} flex flex-col`}>
        <div className="absolute top-4 right-4">
          <ThemeToggleButton />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className={`max-w-4xl w-full ${cardBg} rounded-lg shadow-2xl border ${cardBorder} p-8 text-center`}>
            <h1 className="text-4xl font-bold mb-4">Quiz Completed!</h1>
            <p className="text-xl mb-8">Here are your results:</p>

            <div className="mb-8">
              <p className="text-2xl font-semibold">Final Score: <span className={scoreColor}>{finalScore}</span></p>
              <p className="text-lg">Correct Answers: {correctAnswers.length} / {totalQuestions} ({correctPercentage}%)</p>
              <p className="text-lg">Wrong Answers: {wrongAnswers.length} / {totalQuestions}</p>
            </div>

            <button
              onClick={resetQuiz}
              className={`px-8 py-3 ${btnSuccess} text-white rounded-lg text-xl font-semibold transition-colors mb-4`}
            >
              Retake Quiz
            </button>

            <button
              onClick={backToWeekSelect}
              className={`px-6 py-2 ${btnSecondary} text-white rounded-lg text-xl transition-colors`}
            >
              Back to Week Selection
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render welcome page
  if (appState === 'welcome') {
    return (
      <div className={`min-h-screen ${bgColor} ${textColor} flex flex-col`}>
        <div className="absolute top-4 right-4">
          <ThemeToggleButton />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className={`max-w-4xl w-full ${cardBg} rounded-lg shadow-2xl border ${cardBorder} p-8 text-center`}>
            <h1 className="text-4xl font-bold mb-4">Cybersecurity Quizzz</h1>
            <p className="text-xl mb-8">Parama Padi da!</p>

            <div className="mb-12 flex justify-center">
              <div className="relative rounded-lg overflow-hidden" style={{ maxWidth: "100%", height: "300px" }}>
                <img
                  src={VaaAnnamalai}
                  alt="Cybersecurity Quiz"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            <div className="text-lg mb-8">
              <p className="mb-2">• Timed responses & negative scores for wrong answers</p>
              <p className="mb-2">• Ellarum Nanmai Adaika! 🙌🏽</p>
            </div>

            <button
              onClick={goToWeekSelect}
              className={`px-8 py-3 ${btnPrimary} text-white rounded-lg text-xl font-semibold transition-colors`}
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render week selection page
  if (appState === 'weekSelect') {
    return (
      <div className={`min-h-screen ${bgColor} ${textColor} flex flex-col`}>
        <div className="absolute top-4 right-4">
          <ThemeToggleButton />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className={`max-w-4xl w-full ${cardBg} rounded-lg shadow-2xl border ${cardBorder} p-8`}>
            <h1 className="text-3xl font-bold mb-6 text-center">Select Week Range</h1>

            <div className="space-y-4 mb-8">
              {weekOptions.map((week) => (
                <button
                  key={week.id}
                  onClick={() => selectWeek(week)}
                  className={`w-full p-4 rounded-lg transition-colors border ${
                    week.id === 5
                      ? `${btnDanger} text-white`
                      : `${cardBg} ${textColor} hover:bg-opacity-80 border-${darkMode ? 'gray-700' : 'gray-300'}`
                  } flex flex-col items-start`}
                >
                  <span className="text-xl font-bold mb-1">{week.title}</span>
                  <span className="text-sm opacity-80">{week.description}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setAppState('welcome')}
                className={`px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors`}
              >
                Back to Welcome
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render quiz content
  if (appState === 'quiz') {
    return (
      <div className={`min-h-screen ${bgColor} py-8`}>
        <div className="max-w-3xl mx-auto px-4">
          <div className={`${cardBg} rounded-lg shadow-lg p-6 ${textColor} border ${cardBorder}`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className={`text-xl font-semibold ${scoreColor}`}>Score: {score} {scoreText}</div>
                <div className="text-sm opacity-70 mt-1">{selectedWeek?.title}</div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={backToWeekSelect}
                  className={`px-3 py-1 ${btnSecondary} text-white rounded-lg text-sm transition-colors`}
                >
                  Change Week
                </button>
                <ThemeToggleButton className="w-10 h-10" />
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
              <p className="text-lg mb-6">{questions[currentQuestion]?.question}</p>

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
                  const isCorrectAnswer = option === questions[currentQuestion]?.options[questions[currentQuestion]?.correctAnswer];
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

            {/* Enhanced explanation section with "why others wrong" feature */}
            {showExplanation && questions[currentQuestion]?.explanation && (
              <div className={`mb-6 p-4 ${explanationBg} rounded-lg border ${darkMode ? 'border-indigo-700' : 'border-indigo-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-semibold ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>Explanation:</h3>
                  {/* Info button to toggle "why others wrong" section */}
                  {questions[currentQuestion]?.why_others_wrong && (
                    <button
                      onClick={toggleWhyOthersWrong}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                      }`}
                      title="Click to see why other options are wrong"
                    >
                      <Info className="w-4 h-4" />
                      <span>Why others wrong?</span>
                      {showWhyOthersWrong ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                <p className="mb-3">{questions[currentQuestion]?.explanation}</p>
                
                {/* Expandable "why others wrong" section */}
                {showWhyOthersWrong && questions[currentQuestion]?.why_others_wrong && (
                  <div className={`mt-4 p-3 ${whyWrongBg} rounded-lg border ${
                    darkMode ? 'border-orange-700' : 'border-orange-200'
                  } transition-all duration-300 ease-in-out`}>
                    <h4 className={`font-medium mb-2 ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                      Why the other options are incorrect:
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {questions[currentQuestion]?.why_others_wrong}
                    </p>
                  </div>
                )}
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
                  onClick={nextQuestion}
                  className={`px-6 py-2 ${btnSuccess} text-white rounded-lg transition-colors`}
                >
                  See Results
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  //Results
  if (appState === 'results') {
    return renderResults();
  }

  return <div>Error: Unknown app state</div>;
}

export default App;