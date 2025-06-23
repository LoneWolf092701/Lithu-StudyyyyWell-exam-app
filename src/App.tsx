import React, { useState, useEffect } from 'react';
import { Timer, ThumbsUp, ThumbsDown, Lightbulb, BookOpen, Play, Zap, Home, ArrowLeft, Eye, Trophy, Star } from 'lucide-react';

// Mock data for demonstration - replace with your actual JSON imports
const mockLectureData = {
  "is-strategy": {
    title: "IS Strategy & Strategic Management",
    questions: [
      {
        id: 1,
        question: "Explain the key components of an Information Systems strategy and how it aligns with business strategy.",
        marks: 20,
        correctAnswer: "An Information Systems strategy consists of several key components: strategic alignment with business objectives, technology infrastructure planning, resource allocation, risk management, and performance measurement. The strategy must align with business strategy through understanding organizational goals, identifying technology enablers, ensuring cost-effectiveness, and maintaining competitive advantage. Key elements include: 1) Strategic planning process that involves stakeholder engagement, 2) Technology architecture that supports business processes, 3) Investment prioritization based on business value, 4) Change management to ensure successful implementation.",
        keywords: ["strategic alignment", "business objectives", "technology infrastructure", "resource allocation", "competitive advantage", "stakeholder engagement"]
      },
      {
        id: 2,
        question: "Discuss the challenges and benefits of digital transformation in modern organizations.",
        marks: 15,
        correctAnswer: "Digital transformation presents both significant challenges and benefits. Challenges include: resistance to change, legacy system integration, cybersecurity risks, skill gaps, and high implementation costs. Benefits include: improved efficiency, better customer experience, data-driven decision making, increased agility, and new revenue streams. Organizations must develop a comprehensive change management strategy, invest in employee training, ensure robust security measures, and maintain focus on customer value throughout the transformation process.",
        keywords: ["digital transformation", "change management", "legacy systems", "cybersecurity", "customer experience", "data-driven decisions"]
      }
    ]
  },
  "competitive-advantage": {
    title: "Competitive Advantage & Generic Strategies",
    questions: [
      {
        id: 3,
        question: "Analyze Porter's Generic Strategies and their application in the digital age.",
        marks: 18,
        correctAnswer: "Porter's Generic Strategies include Cost Leadership, Differentiation, and Focus strategies. In the digital age, these strategies are enhanced by technology: Cost Leadership through automation and efficiency gains, Differentiation through innovative digital products and services, and Focus through targeted digital marketing and niche market identification. Digital platforms enable companies to achieve cost advantages through economies of scale, create unique value propositions through data analytics, and target specific customer segments more effectively.",
        keywords: ["Porter's Generic Strategies", "Cost Leadership", "Differentiation", "Focus strategy", "digital platforms", "economies of scale", "data analytics"]
      }
    ]
  }
};

type LectureKey = keyof typeof mockLectureData;

interface Question {
  id: number;
  question: string;
  marks: number;
  correctAnswer: string;
  keywords: string[];
}

interface LectureData {
  title: string;
  questions: Question[];
}

interface UserAnswer {
  questionId: number;
  answer: string;
  timeSpent: number;
  score?: number;
  usedShowAnswer?: boolean; // Track if show answer was used
}

interface LectureProgress {
  lectureKey: LectureKey;
  hintsUsed: number;
  answersSubmitted: UserAnswer[];
  currentQuestionIndex: number;
  isCompleted: boolean;
}

// Global scoring system interface
interface GlobalScore {
  totalPointsEarned: number;
  totalPointsPossible: number;
  lecturesCompleted: number;
  totalQuestions: number;
  averageScore: number;
  lectureScores: Record<string, {
    pointsEarned: number;
    pointsPossible: number;
    completed: boolean;
  }>;
}

const ExamApp: React.FC = () => {
  // Existing state management
  const [currentState, setCurrentState] = useState<'home' | 'lectureSelect' | 'modeSelect' | 'exam' | 'results'>('home');
  const [selectedLecture, setSelectedLecture] = useState<LectureKey | null>(null);
  const [examMode, setExamMode] = useState<'normal' | 'rapid'>('normal');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1200);
  const [isActive, setIsActive] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [lectureProgress, setLectureProgress] = useState<LectureProgress | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'thumbsUp' | 'thumbsDown' | null>(null);
  const [showHint, setShowHint] = useState(false);
  
  // New state for show answer feature
  const [showAnswer, setShowAnswer] = useState(false);
  const [usedShowAnswer, setUsedShowAnswer] = useState(false);
  
  // Global scoring state
  const [globalScore, setGlobalScore] = useState<GlobalScore>({
    totalPointsEarned: 0,
    totalPointsPossible: 0,
    lecturesCompleted: 0,
    totalQuestions: 0,
    averageScore: 0,
    lectureScores: {}
  });

  const weekOptions = [
    {
      id: 1,
      title: "IS Strategy & Strategic Management",
      description: "Information Systems Strategy and Strategic Planning",
      data: mockLectureData["is-strategy"]
    },
    {
      id: 2,
      title: "Competitive Advantage & Generic Strategies", 
      description: "Porter's Generic Strategies and Competitive Positioning",
      data: mockLectureData["competitive-advantage"]
    }
  ];

  // Load global score from localStorage on component mount
  useEffect(() => {
    const savedScore = localStorage.getItem('examAppGlobalScore');
    if (savedScore) {
      setGlobalScore(JSON.parse(savedScore));
    }
  }, []);

  // Save global score to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('examAppGlobalScore', JSON.stringify(globalScore));
  }, [globalScore]);

  useEffect(() => {
    if (examMode === 'normal') {
      setTimeLeft(1200);
    } else {
      setTimeLeft(600);
    }
  }, [examMode]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (isActive && timeLeft > 0) {
      timeoutId = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleTimeUp();
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
      setShowAnswer(false);
      setUsedShowAnswer(false);
    }
  };

  // Enhanced submitAnswer function to handle show answer penalty
  const submitAnswer = () => {
    if (!selectedLecture || !lectureProgress) return;

    const currentQuestion = mockLectureData[selectedLecture].questions[currentQuestionIndex];
    const timeSpent = (examMode === 'normal' ? 1200 : 600) - timeLeft;
    
    // Calculate base score
    let score = calculateScore(userAnswer, currentQuestion.correctAnswer, currentQuestion.keywords);
    
    // Apply penalty if show answer was used (deduct 1 point, minimum 0)
    if (usedShowAnswer) {
      score = Math.max(0, score - 1);
    }
    
    const userAnswerObj: UserAnswer = {
      questionId: currentQuestion.id,
      answer: userAnswer,
      timeSpent,
      score,
      usedShowAnswer
    };

    const updatedProgress = {
      ...lectureProgress,
      answersSubmitted: [...lectureProgress.answersSubmitted, userAnswerObj]
    };

    setLectureProgress(updatedProgress);
    setShowFeedback(true);
    setFeedbackType(score >= 70 ? 'thumbsUp' : 'thumbsDown');
    setIsActive(false);
  };

  const calculateScore = (userAnswer: string, correctAnswer: string, keywords: string[]): number => {
    if (!userAnswer.trim()) return 0;
    
    const userWords = userAnswer.toLowerCase().split(/\s+/);
    const userText = userAnswer.toLowerCase();
    
    const keywordMatches = keywords.filter(keyword => 
      userText.includes(keyword.toLowerCase()) || 
      userWords.some(word => word.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(word))
    );
    const keywordScore = (keywordMatches.length / keywords.length) * 40;
    
    const lengthScore = Math.min((userAnswer.length / 800) * 30, 30);
    
    const sentences = userAnswer.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const hasStructure = sentences.length >= 3 && userAnswer.includes('.');
    const hasExamples = /example|such as|for instance|including|like/i.test(userAnswer);
    const structureScore = (hasStructure ? 10 : 0) + (hasExamples ? 10 : 0);
    
    const criticalThinking = /however|although|therefore|consequently|furthermore|moreover|in contrast|on the other hand/i.test(userAnswer);
    const thinkingScore = criticalThinking ? 10 : 5;
    
    const totalScore = Math.min(keywordScore + lengthScore + structureScore + thinkingScore, 100);
    return Math.round(totalScore);
  };

  // Enhanced nextQuestion function to update global scoring
  const nextQuestion = () => {
    if (!selectedLecture || !lectureProgress) return;
    
    const nextIndex = currentQuestionIndex + 1;
    const totalQuestions = mockLectureData[selectedLecture].questions.length;
    
    if (nextIndex < totalQuestions) {
      setCurrentQuestionIndex(nextIndex);
      setUserAnswer('');
      setShowFeedback(false);
      setFeedbackType(null);
      setShowHint(false);
      setShowAnswer(false);
      setUsedShowAnswer(false);
      setIsActive(true);
      setTimeLeft(examMode === 'normal' ? 1200 : 600);
    } else {
      // Complete the exam and update global scoring
      const updatedProgress = {
        ...lectureProgress,
        isCompleted: true,
        currentQuestionIndex: nextIndex
      };
      setLectureProgress(updatedProgress);
      updateGlobalScore(updatedProgress);
      setCurrentState('results');
    }
  };

  // Function to update global scoring system
  const updateGlobalScore = (completedProgress: LectureProgress) => {
    if (!selectedLecture) return;

    const lectureQuestions = mockLectureData[selectedLecture].questions;
    const lecturePointsPossible = lectureQuestions.reduce((sum, q) => sum + q.marks, 0);
    const lecturePointsEarned = completedProgress.answersSubmitted.reduce((sum, answer) => {
      const questionMarks = lectureQuestions.find(q => q.id === answer.questionId)?.marks || 0;
      return sum + ((answer.score || 0) / 100) * questionMarks;
    }, 0);

    setGlobalScore(prevScore => {
      const newLectureScores = {
        ...prevScore.lectureScores,
        [selectedLecture]: {
          pointsEarned: lecturePointsEarned,
          pointsPossible: lecturePointsPossible,
          completed: true
        }
      };

      // Calculate totals across all lectures
      const totalPointsEarned = Object.values(newLectureScores).reduce((sum, lecture) => sum + lecture.pointsEarned, 0);
      const totalPointsPossible = Object.values(newLectureScores).reduce((sum, lecture) => sum + lecture.pointsPossible, 0);
      const lecturesCompleted = Object.values(newLectureScores).filter(lecture => lecture.completed).length;
      const totalQuestions = Object.values(mockLectureData).reduce((sum, lecture) => sum + lecture.questions.length, 0);
      const averageScore = totalPointsPossible > 0 ? (totalPointsEarned / totalPointsPossible) * 100 : 0;

      return {
        totalPointsEarned,
        totalPointsPossible,
        lecturesCompleted,
        totalQuestions,
        averageScore,
        lectureScores: newLectureScores
      };
    });
  };

  // New function to handle showing the answer
  const handleShowAnswer = () => {
    setShowAnswer(true);
    setUsedShowAnswer(true);
  };

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

  const handleTimeUp = () => {
    setIsActive(false);
    if (userAnswer.trim()) {
      submitAnswer();
    } else {
      setShowFeedback(true);
      setFeedbackType('thumbsDown');
    }
  };

  const resetApp = () => {
    setCurrentState('home');
    setSelectedLecture(null);
    setLectureProgress(null);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setShowFeedback(false);
    setFeedbackType(null);
    setShowHint(false);
    setShowAnswer(false);
    setUsedShowAnswer(false);
    setIsActive(false);
  };

  const getCurrentQuestion = (): Question | null => {
    if (!selectedLecture) return null;
    return mockLectureData[selectedLecture].questions[currentQuestionIndex] || null;
  };

  const currentQuestion = getCurrentQuestion();

  // Top Bar Component for Global Scoring
  const TopBar = () => {
    if (currentState === 'home') return null;
    
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="font-semibold">
                  {globalScore.totalPointsEarned.toFixed(1)} / {globalScore.totalPointsPossible.toFixed(1)} pts
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-300" />
                <span>
                  Average: {globalScore.averageScore.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-green-300" />
                <span>
                  {globalScore.lecturesCompleted} / {weekOptions.length} lectures
                </span>
              </div>
            </div>
            {currentState === 'exam' && selectedLecture && (
              <div className="text-sm">
                <span className="opacity-75">Current Session: </span>
                <span className="font-semibold">{mockLectureData[selectedLecture].title}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Home Screen
  if (currentState === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <TopBar />
        <div className="flex items-center justify-center p-4 min-h-screen">
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
                  <Eye className="w-5 h-5 text-orange-600" />
                  <span>Show Answer (1 point penalty)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Trophy className="w-5 h-5 text-purple-600" />
                  <span>Global scoring across all lectures</span>
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
      </div>
    );
  }

  // Render Lecture Selection Screen
  if (currentState === 'lectureSelect') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <TopBar />
        <div className="p-4">
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
                {weekOptions.map((option) => {
                  const lectureKey = Object.keys(mockLectureData)[option.id - 1] as LectureKey;
                  const isCompleted = globalScore.lectureScores[lectureKey]?.completed || false;
                  const lectureScore = globalScore.lectureScores[lectureKey];
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSelectedLecture(lectureKey);
                        setCurrentState('modeSelect');
                      }}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg p-6 text-left transition-all duration-200 border border-gray-200 hover:border-blue-300 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">{option.title}</h3>
                          <p className="text-gray-600 mb-3">{option.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-600 font-medium">
                              {option.data.questions.length} Questions Available
                            </span>
                            <Play className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        {isCompleted && (
                          <div className="ml-4 text-right">
                            <div className="flex items-center space-x-1 text-green-600 mb-1">
                              <Trophy className="w-4 h-4" />
                              <span className="text-sm font-medium">Completed</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {lectureScore.pointsEarned.toFixed(1)} / {lectureScore.pointsPossible.toFixed(1)} pts
                            </div>
                            <div className="text-xs text-gray-600">
                              {((lectureScore.pointsEarned / lectureScore.pointsPossible) * 100).toFixed(1)}%
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Mode Selection Screen
  if (currentState === 'modeSelect') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <TopBar />
        <div className="p-4">
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
      </div>
    );
  }

  // Render Exam Screen
  if (currentState === 'exam' && currentQuestion && lectureProgress) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {selectedLecture && mockLectureData[selectedLecture].title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of {selectedLecture && mockLectureData[selectedLecture].questions.length}
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

                  {/* New Show Answer Button */}
                  <button
                    onClick={handleShowAnswer}
                    disabled={showAnswer || showFeedback}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      showAnswer || showFeedback
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Show Answer (-1pt)</span>
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

              {/* New Show Answer Section */}
              {showAnswer && (
                <div className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-6 mb-6">
                  <div className="flex items-center mb-3">
                    <Eye className="w-6 h-6 text-orange-600 mr-2" />
                    <h4 className="font-semibold text-orange-800 text-lg">👁️ Model Answer (1 point deducted)</h4>
                  </div>
                  <div className="bg-white rounded p-4 border border-orange-200">
                    <p className="text-gray-800 leading-relaxed">{currentQuestion.correctAnswer}</p>
                    <div className="mt-3 pt-3 border-t border-orange-200">
                      <p className="text-sm font-medium text-orange-700 mb-2">Key concepts to include:</p>
                      <div className="flex flex-wrap gap-2">
                        {currentQuestion.keywords.map((keyword, index) => (
                          <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
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
                          {usedShowAnswer && <span className="ml-2 text-orange-600">(Show Answer penalty applied)</span>}
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
                    {currentQuestionIndex < (selectedLecture ? mockLectureData[selectedLecture].questions.length - 1 : 0)
                      ? 'Next Question'
                      : 'Finish Exam'
                    }
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Results Screen
  if (currentState === 'results' && lectureProgress) {
    const totalQuestions = selectedLecture ? mockLectureData[selectedLecture].questions.length : 0;
    const averageScore = lectureProgress.answersSubmitted.length > 0
      ? lectureProgress.answersSubmitted.reduce((sum, answer) => sum + (answer.score || 0), 0) / lectureProgress.answersSubmitted.length
      : 0;

    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Exam Results</h1>
              
              <div className="grid md:grid-cols-4 gap-6 mb-8">
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

                <div className="bg-orange-50 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">Show Answer Used</h3>
                  <p className="text-3xl font-bold text-orange-600">
                    {lectureProgress.answersSubmitted.filter(a => a.usedShowAnswer).length}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h2 className="text-xl font-semibold text-gray-800">Answer Summary</h2>
                {lectureProgress.answersSubmitted.map((answer, index) => (
                  <div key={answer.questionId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800">Question {index + 1}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          (answer.score || 0) >= 70
                            ? 'bg-green-100 text-green-800'
                            : (answer.score || 0) >= 50
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          Score: {answer.score?.toFixed(1)}%
                        </span>
                        {answer.usedShowAnswer && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                            Show Answer Used (-1pt)
                          </span>
                        )}
                      </div>
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
      </div>
    );
  }

  return null;
};

export default ExamApp;