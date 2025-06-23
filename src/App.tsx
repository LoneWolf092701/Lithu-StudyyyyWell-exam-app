import React, { useState, useEffect } from 'react';
import { Timer, ThumbsUp, ThumbsDown, Lightbulb, BookOpen, Play, Zap, Home, ArrowLeft } from 'lucide-react';

// Import separate JSON files for each lecture
import isStrategyData from './data/is-strategy.json';
import competitiveAdvantageData from './data/competitive-advantage.json';
import outsourcingSaasData from './data/outsourcing-saas.json';
import remoteWorkingData from './data/remote-working.json';
import informationResourcesData from './data/information-resources.json';

// Lecture data structure - loaded from separate JSON files
const lectureData = {
  "is-strategy": isStrategyData,
  "competitive-advantage": competitiveAdvantageData,
  "outsourcing-saas": outsourcingSaasData,
  "remote-working": remoteWorkingData,
  "information-resources": informationResourcesData
};

type LectureKey = keyof typeof lectureData;

interface Question {
  id: number;
  question: string;
  marks: number;
  correctAnswer: string;
  keywords: string[];
}

interface LectureData {
  title: string;
  description: string;
  lectureCode: string;
  questions: Question[];
}

interface UserAnswer {
  questionId: number;
  answer: string;
  timeSpent: number;
  score?: number;
}

interface LectureProgress {
  lectureKey: LectureKey;
  hintsUsed: number;
  answersSubmitted: UserAnswer[];
  currentQuestionIndex: number;
  isCompleted: boolean;
}

const ExamApp: React.FC = () => {
  // State management for the entire application
  const [currentState, setCurrentState] = useState<'home' | 'lectureSelect' | 'modeSelect' | 'exam' | 'results'>('home');
  const [selectedLecture, setSelectedLecture] = useState<LectureKey | null>(null);
  const [examMode, setExamMode] = useState<'normal' | 'rapid'>('normal');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [lectureProgress, setLectureProgress] = useState<LectureProgress | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'thumbsUp' | 'thumbsDown' | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Available lecture options based on imported JSON data
  const weekOptions = [
    {
      id: 1,
      title: "IS Strategy & Strategic Management",
      description: "Information Systems Strategy and Strategic Planning",
      data: lectureData["is-strategy"]
    },
    {
      id: 2,
      title: "Competitive Advantage & Generic Strategies", 
      description: "Porter's Generic Strategies and Competitive Positioning",
      data: lectureData["competitive-advantage"]
    },
    {
      id: 3,
      title: "Outsourcing & Software as a Service",
      description: "IT Outsourcing Models and Cloud Computing", 
      data: lectureData["outsourcing-saas"]
    },
    {
      id: 4,
      title: "Remote Working & IT Implications",
      description: "Digital Transformation and Remote Work Technologies",
      data: lectureData["remote-working"] 
    },
    {
      id: 5,
      title: "Information Resources & Management",
      description: "Data Management and Information Asset Valuation",
      data: lectureData["information-resources"]
    }
  ];

  // Initialize timer based on selected exam mode
  useEffect(() => {
    if (examMode === 'normal') {
      setTimeLeft(1200); // 20 minutes
    } else {
      setTimeLeft(600); // 10 minutes
    }
  }, [examMode]);

  // Timer countdown effect using React's setTimeout
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (isActive && timeLeft > 0) {
      timeoutId = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleTimeUp();
    }
    
    // Cleanup timeout on component unmount or dependency change
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isActive, timeLeft]);

  // Helper function to format time display (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize exam session with selected lecture and mode
  const startExam = () => {
    if (selectedLecture) {
      setLectureProgress({
        lectureKey: selectedLecture,
        hintsUsed: 0,
        answersSubmitted: [],
        currentQuestionIndex: 0,
        isCompleted: false
      });
      setCurrentQuestionIndex(0);
      setIsActive(true);
      setCurrentState('exam');
      setUserAnswer('');
    }
  };

  // Process and score user's submitted answer
  const submitAnswer = () => {
    if (!selectedLecture || !lectureProgress) return;

    const currentQuestion = lectureData[selectedLecture].questions[currentQuestionIndex];
    const timeSpent = (examMode === 'normal' ? 1200 : 600) - timeLeft;
    
    // Calculate score using enhanced scoring algorithm
    const score = calculateScore(userAnswer, currentQuestion.correctAnswer, currentQuestion.keywords);
    
    const userAnswerObj: UserAnswer = {
      questionId: currentQuestion.id,
      answer: userAnswer,
      timeSpent,
      score
    };

    // Update lecture progress with new answer
    const updatedProgress = {
      ...lectureProgress,
      answersSubmitted: [...lectureProgress.answersSubmitted, userAnswerObj]
    };

    setLectureProgress(updatedProgress);
    setShowFeedback(true);
    setFeedbackType(score >= 70 ? 'thumbsUp' : 'thumbsDown');
    setIsActive(false);
  };

  // Enhanced scoring algorithm for written answers
  const calculateScore = (userAnswer: string, correctAnswer: string, keywords: string[]): number => {
    if (!userAnswer.trim()) return 0;
    
    const userWords = userAnswer.toLowerCase().split(/\s+/);
    const userText = userAnswer.toLowerCase();
    
    // Keyword matching component (40% of total score)
    const keywordMatches = keywords.filter(keyword => 
      userText.includes(keyword.toLowerCase()) || 
      userWords.some(word => word.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(word))
    );
    const keywordScore = (keywordMatches.length / keywords.length) * 40;
    
    // Length and comprehensiveness component (30% of total score)
    const lengthScore = Math.min((userAnswer.length / 800) * 30, 30);
    
    // Structure and organization component (20% of total score)
    const sentences = userAnswer.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const hasStructure = sentences.length >= 3 && userAnswer.includes('.');
    const hasExamples = /example|such as|for instance|including|like/i.test(userAnswer);
    const structureScore = (hasStructure ? 10 : 0) + (hasExamples ? 10 : 0);
    
    // Critical thinking indicators component (10% of total score)
    const criticalThinking = /however|although|therefore|consequently|furthermore|moreover|in contrast|on the other hand/i.test(userAnswer);
    const thinkingScore = criticalThinking ? 10 : 5;
    
    const totalScore = Math.min(keywordScore + lengthScore + structureScore + thinkingScore, 100);
    return Math.round(totalScore);
  };

  // Navigate to next question or complete exam
  const nextQuestion = () => {
    if (!selectedLecture || !lectureProgress) return;
    
    const nextIndex = currentQuestionIndex + 1;
    const totalQuestions = lectureData[selectedLecture].questions.length;
    
    if (nextIndex < totalQuestions) {
      // Move to next question
      setCurrentQuestionIndex(nextIndex);
      setUserAnswer('');
      setShowFeedback(false);
      setFeedbackType(null);
      setShowHint(false);
      setIsActive(true);
      
      // Reset timer for new question
      setTimeLeft(examMode === 'normal' ? 1200 : 600);
    } else {
      // Complete the exam and show results
      const updatedProgress = {
        ...lectureProgress,
        isCompleted: true,
        currentQuestionIndex: nextIndex
      };
      setLectureProgress(updatedProgress);
      setCurrentState('results');
    }
  };

  // Use one of the available hints (maximum 4 per lecture)
  const useHint = () => {
    if (!lectureProgress || !selectedLecture) return;
    
    if (lectureProgress.hintsUsed < 4) {
      setShowHint(true);
      setLectureProgress({
        ...lectureProgress,
        hintsUsed: lectureProgress.hintsUsed + 1
      });
    }
  };

  // Handle timer expiration
  const handleTimeUp = () => {
    setIsActive(false);
    if (userAnswer.trim()) {
      // Auto-submit if user has written something
      submitAnswer();
    } else {
      // Show negative feedback for no answer
      setShowFeedback(true);
      setFeedbackType('thumbsDown');
    }
  };

  // Reset entire application to home state
  const resetApp = () => {
    setCurrentState('home');
    setSelectedLecture(null);
    setLectureProgress(null);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setShowFeedback(false);
    setFeedbackType(null);
    setShowHint(false);
    setIsActive(false);
  };

  // Get current question object
  const getCurrentQuestion = (): Question | null => {
    if (!selectedLecture) return null;
    return lectureData[selectedLecture].questions[currentQuestionIndex] || null;
  };

  const currentQuestion = getCurrentQuestion();

  // Render Home Screen
  if (currentState === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-lg shadow-2xl p-8 text-center">
          <div className="mb-8">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Strategic Management of Information Systems
            </h1>
            <p className="text-xl text-gray-600">6BUIS019 - Exam Practice System</p>
            <p className="text-lg text-gray-500 mt-2">University of Westminster</p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">Exam Features</h2>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <Timer className="w-5 h-5 text-blue-600" />
                <span>20min Normal / 10min Rapid Mode</span>
              </div>
              <div className="flex items-center space-x-3">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span>4 Hints per lecture available</span>
              </div>
              <div className="flex items-center space-x-3">
                <ThumbsUp className="w-5 h-5 text-green-600" />
                <span>Real-time feedback system</span>
              </div>
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span>Written answer questions</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentState('lectureSelect')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-xl transition-colors duration-200 shadow-lg"
          >
            Start Practice Exam
          </button>
        </div>
      </div>
    );
  }

  // Render Lecture Selection Screen
  if (currentState === 'lectureSelect') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Select Lecture Topic</h1>
              <button
                onClick={resetApp}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>
            </div>

            <div className="grid gap-6">
              {weekOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setSelectedLecture(Object.keys(lectureData)[option.id - 1] as LectureKey);
                    setCurrentState('modeSelect');
                  }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg p-6 text-left transition-all duration-200 border border-gray-200 hover:border-blue-300 hover:shadow-lg"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{option.title}</h3>
                  <p className="text-gray-600 mb-3">{option.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-600 font-medium">
                      {option.data.questions.length} Questions Available
                    </span>
                    <Play className="w-5 h-5 text-blue-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Mode Selection Screen
  if (currentState === 'modeSelect') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Select Exam Mode</h1>
              <button
                onClick={() => setCurrentState('lectureSelect')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            </div>

            <div className="space-y-6">
              <button
                onClick={() => {
                  setExamMode('normal');
                  startExam();
                }}
                className="w-full bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 rounded-lg p-6 text-left transition-all duration-200 border border-gray-200 hover:border-green-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Normal Mode</h3>
                    <p className="text-gray-600">20 minutes per session</p>
                    <p className="text-sm text-green-600 mt-1">Recommended for thorough practice</p>
                  </div>
                  <Timer className="w-8 h-8 text-green-600" />
                </div>
              </button>

              <button
                onClick={() => {
                  setExamMode('rapid');
                  startExam();
                }}
                className="w-full bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-lg p-6 text-left transition-all duration-200 border border-gray-200 hover:border-orange-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Rapid Mode</h3>
                    <p className="text-gray-600">10 minutes per session</p>
                    <p className="text-sm text-orange-600 mt-1">Quick practice under time pressure</p>
                  </div>
                  <Zap className="w-8 h-8 text-orange-600" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Exam Screen
  if (currentState === 'exam' && currentQuestion && lectureProgress) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedLecture && lectureData[selectedLecture].title}
                </h2>
                <p className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {selectedLecture && lectureData[selectedLecture].questions.length}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Timer className="w-5 h-5 text-blue-600" />
                  <span className={`font-mono text-lg ${timeLeft < 300 ? 'text-red-600' : 'text-gray-800'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                
                <button
                  onClick={useHint}
                  disabled={lectureProgress.hintsUsed >= 4 || showHint}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    lectureProgress.hintsUsed >= 4 || showHint
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  }`}
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Hint ({4 - lectureProgress.hintsUsed} left)</span>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                [{currentQuestion.marks} marks]
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>

            {showHint && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-3">
                  <Lightbulb className="w-6 h-6 text-yellow-600 mr-2" />
                  <h4 className="font-semibold text-yellow-800 text-lg">💡 Hint - Model Answer</h4>
                </div>
                <div className="bg-white rounded p-4 border border-yellow-200">
                  <p className="text-gray-800 leading-relaxed">{currentQuestion.correctAnswer}</p>
                  <div className="mt-3 pt-3 border-t border-yellow-200">
                    <p className="text-sm font-medium text-yellow-700 mb-2">Key concepts to include:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentQuestion.keywords.map((keyword, index) => (
                        <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer:
              </label>
              <textarea
                id="answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Write your comprehensive answer here..."
                className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={showFeedback}
              />
            </div>

            {showFeedback && (
              <div className={`rounded-lg p-6 mb-6 ${
                feedbackType === 'thumbsUp' ? 'bg-green-50 border-l-4 border-green-400' : 'bg-red-50 border-l-4 border-red-400'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {feedbackType === 'thumbsUp' ? (
                      <ThumbsUp className="w-8 h-8 text-green-600" />
                    ) : (
                      <ThumbsDown className="w-8 h-8 text-red-600" />
                    )}
                    <div>
                      <span className={`text-lg font-medium ${
                        feedbackType === 'thumbsUp' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {feedbackType === 'thumbsUp' ? 'Good Answer!' : 'Needs Improvement'}
                      </span>
                      <p className={`text-sm ${
                        feedbackType === 'thumbsUp' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        Score: {lectureProgress?.answersSubmitted[lectureProgress.answersSubmitted.length - 1]?.score || 0}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className={`text-sm ${
                  feedbackType === 'thumbsUp' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {feedbackType === 'thumbsUp' ? (
                    <p>Well done! Your answer demonstrates good understanding of the key concepts.</p>
                  ) : (
                    <div>
                      <p className="mb-2">To improve your answer, consider including:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>More specific examples and case studies</li>
                        <li>Clear structure with introduction, body, and conclusion</li>
                        <li>Critical analysis showing different perspectives</li>
                        <li>Key terminology and concepts from the course</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentState('lectureSelect')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Exit Exam
              </button>
              
              {!showFeedback ? (
                <button
                  onClick={submitAnswer}
                  disabled={!userAnswer.trim() || !isActive}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    userAnswer.trim() && isActive
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {currentQuestionIndex < (selectedLecture ? lectureData[selectedLecture].questions.length - 1 : 0)
                    ? 'Next Question'
                    : 'Finish Exam'
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Results Screen
  if (currentState === 'results' && lectureProgress) {
    const totalQuestions = selectedLecture ? lectureData[selectedLecture].questions.length : 0;
    const averageScore = lectureProgress.answersSubmitted.length > 0
      ? lectureProgress.answersSubmitted.reduce((sum, answer) => sum + (answer.score || 0), 0) / lectureProgress.answersSubmitted.length
      : 0;

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Exam Results</h1>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Questions Completed</h3>
                <p className="text-3xl font-bold text-blue-600">{lectureProgress.answersSubmitted.length}/{totalQuestions}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Average Score</h3>
                <p className="text-3xl font-bold text-green-600">{averageScore.toFixed(1)}%</p>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Hints Used</h3>
                <p className="text-3xl font-bold text-yellow-600">{lectureProgress.hintsUsed}/4</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h2 className="text-xl font-semibold text-gray-800">Answer Summary</h2>
              {lectureProgress.answersSubmitted.map((answer, index) => (
                <div key={answer.questionId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">Question {index + 1}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      (answer.score || 0) >= 70
                        ? 'bg-green-100 text-green-800'
                        : (answer.score || 0) >= 50
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      Score: {answer.score?.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">Time spent: {Math.floor(answer.timeSpent / 60)}:{(answer.timeSpent % 60).toString().padStart(2, '0')}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setCurrentState('lectureSelect')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Try Another Lecture
              </button>
              
              <button
                onClick={resetApp}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ExamApp;