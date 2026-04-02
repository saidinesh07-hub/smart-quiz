import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

// Components
import { ThreeBackground } from './components/ThreeBackground';
import { CursorGlow } from './components/CursorGlow';
import { WelcomeScreen } from './components/WelcomeScreen';
import { TopicSelection } from './components/TopicSelection';
import { QuizModeSelection } from './components/QuizModeSelection';
import { DifficultySelection } from './components/DifficultySelection';
import { QuizInterface } from './components/QuizInterface';
import { AIQuizInterface } from './components/AIQuizInterface';
import { ResultsScreen } from './components/ResultsScreen';
import { Leaderboard, saveToLeaderboard } from './components/Leaderboard';
import { DarkModeToggle } from './components/DarkModeToggle';

// Data
import { quizTopics, getQuestionsByDifficulty } from './data/quizData';

type Screen =
  | 'welcome'
  | 'topics'
  | 'mode-selection'
  | 'difficulty'
  | 'quiz'
  | 'ai-quiz'
  | 'results'
  | 'leaderboard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [username, setUsername] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<'regular' | 'ai'>('regular');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [quizScore, setQuizScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Mock sound effects (in production, you would load actual audio files)
  useEffect(() => {
    // Initialize sound effects
    console.log('🔊 Sound effects initialized (add actual audio files in production)');
    
    // You can add actual audio like:
    // const clickSound = new Audio('/sounds/click.mp3');
    // const successSound = new Audio('/sounds/success.mp3');
    // const errorSound = new Audio('/sounds/error.mp3');
  }, []);

  const handleStart = (name: string) => {
    setUsername(name);
    setCurrentScreen('topics');
  };

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopic(topicId);
    setCurrentScreen('mode-selection');
  };

  const handleSelectMode = (mode: 'regular' | 'ai') => {
    setSelectedMode(mode);
    if (mode === 'ai') {
      setCurrentScreen('difficulty');
    } else {
      setCurrentScreen('difficulty');
    }
  };

  const handleSelectDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
    setSelectedDifficulty(difficulty);
    if (selectedMode === 'ai') {
      setCurrentScreen('ai-quiz');
    } else {
      setCurrentScreen('quiz');
    }
  };

  const handleBackToModeSelection = () => {
    setCurrentScreen('mode-selection');
  };

  const handleQuizComplete = (score: number, total: number) => {
    setQuizScore(score);
    setTotalQuestions(total);
    
    // Save to leaderboard
    if (selectedTopic) {
      const topic = quizTopics.find(t => t.id === selectedTopic);
      if (topic) {
        saveToLeaderboard(username, score, total, topic.name, selectedDifficulty);
      }
    }
    
    setCurrentScreen('results');
  };

  const handlePlayAgain = () => {
    setCurrentScreen('topics');
  };

  const handleBackToHome = () => {
    setCurrentScreen('topics');
  };

  const handleShowLeaderboard = () => {
    setCurrentScreen('leaderboard');
  };

  const handleBackFromLeaderboard = () => {
    setCurrentScreen('topics');
  };

  const handleBackToTopics = () => {
    setCurrentScreen('topics');
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
  };

  // Get current topic data
  const currentTopic = selectedTopic ? quizTopics.find(t => t.id === selectedTopic) : null;
  const quizQuestions = selectedTopic 
    ? getQuestionsByDifficulty(selectedTopic, selectedDifficulty)
    : [];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 3D Background with Three.js */}
      <ThreeBackground />

      {/* Custom cursor glow */}
      <CursorGlow />

      {/* Dark mode toggle */}
      <DarkModeToggle />

      {/* Screen transitions */}
      <AnimatePresence mode="wait">
        {currentScreen === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WelcomeScreen onStart={handleStart} />
          </motion.div>
        )}

        {currentScreen === 'topics' && (
          <motion.div
            key="topics"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <TopicSelection
              username={username}
              onSelectTopic={handleSelectTopic}
              onShowLeaderboard={handleShowLeaderboard}
              onBack={handleBackToWelcome}
            />
          </motion.div>
        )}

        {currentScreen === 'mode-selection' && currentTopic && (
          <motion.div
            key="mode-selection"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <QuizModeSelection
              topicName={currentTopic.name}
              onSelectMode={handleSelectMode}
              onBack={handleBackToTopics}
            />
          </motion.div>
        )}

        {currentScreen === 'difficulty' && currentTopic && (
          <motion.div
            key="difficulty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <DifficultySelection
              topicName={currentTopic.name}
              onSelectDifficulty={handleSelectDifficulty}
              onBack={handleBackToModeSelection}
            />
          </motion.div>
        )}

        {currentScreen === 'quiz' && currentTopic && quizQuestions.length > 0 && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
          >
            <QuizInterface
              questions={quizQuestions}
              topicName={currentTopic.name}
              difficulty={selectedDifficulty}
              onComplete={handleQuizComplete}
            />
          </motion.div>
        )}

        {currentScreen === 'ai-quiz' && currentTopic && (
          <motion.div
            key="ai-quiz"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
          >
            <AIQuizInterface
              topic={currentTopic.name}
              difficulty={selectedDifficulty}
              onBack={handleBackToModeSelection}
              onComplete={handleQuizComplete}
            />
          </motion.div>
        )}

        {currentScreen === 'results' && currentTopic && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <ResultsScreen
              username={username}
              score={quizScore}
              totalQuestions={totalQuestions}
              topicName={currentTopic.name}
              difficulty={selectedDifficulty}
              onPlayAgain={handlePlayAgain}
              onBackToHome={handleBackToHome}
            />
          </motion.div>
        )}

        {currentScreen === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.5 }}
          >
            <Leaderboard onBack={handleBackFromLeaderboard} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay for transitions */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5" />
      </motion.div>
       <div className="absolute bottom-4 w-full text-center text-sm text-white/70 backdrop-blur-sm">
  🚀 Team ARJUN • MANUSHA • KEERTHANA • MANUSHA MARDHAL SHRAVYA
</div>
    </div>
  );
}
