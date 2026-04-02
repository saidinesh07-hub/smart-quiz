import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import { Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import type { Question } from '../data/quizData';

interface QuizInterfaceProps {
  questions: Question[];
  topicName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (score: number, totalQuestions: number) => void;
}

export const QuizInterface = ({ 
  questions, 
  topicName, 
  difficulty, 
  onComplete 
}: QuizInterfaceProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const timerRef = useRef<NodeJS.Timeout>();
  const questionRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (showResult) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestionIndex, showResult]);

  // Animate question entrance
  useEffect(() => {
    if (questionRef.current) {
      gsap.from(questionRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.5,
        ease: 'power3.out',
      });
    }
  }, [currentQuestionIndex]);

  // Animate progress bar
  useEffect(() => {
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        width: `${progress}%`,
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  }, [progress]);

  const handleTimeout = () => {
    setShowResult(true);
    setIsCorrect(false);
    setTimeout(() => handleNext(), 2000);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || showResult) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const correct = answerIndex === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
      // Play success sound (mock)
      console.log('🔊 Success sound');
    } else {
      // Play error sound (mock)
      console.log('🔊 Error sound');
    }

    if (timerRef.current) clearInterval(timerRef.current);

    setTimeout(() => handleNext(), 2000);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(null);
      setTimeLeft(30);
    } else {
      onComplete(score + (isCorrect ? 1 : 0), questions.length);
    }
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy': return 'from-green-500 to-emerald-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'hard': return 'from-red-500 to-pink-500';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{topicName}</h2>
              <p className="text-white/60 capitalize">{difficulty} Level</p>
            </div>

            {/* Timer */}
            <motion.div
              className={`flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm border rounded-2xl ${
                timeLeft <= 10 ? 'border-red-500/50 animate-pulse' : 'border-white/10'
              }`}
              animate={timeLeft <= 10 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
            >
              <Clock className={`w-6 h-6 ${timeLeft <= 10 ? 'text-red-400' : 'text-cyan-400'}`} />
              <span className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                {timeLeft}s
              </span>
            </motion.div>
          </div>

          {/* Progress bar */}
          <div className="relative w-full h-3 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              ref={progressRef}
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getDifficultyColor()} rounded-full`}
              initial={{ width: 0 }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold">
              {currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>
        </motion.div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            ref={questionRef}
            className="relative group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {/* Glow effect */}
            <div className={`absolute -inset-1 bg-gradient-to-r ${getDifficultyColor()} rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />

            {/* Card content */}
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              {/* Question */}
              <div className="mb-8">
                <motion.h3
                  className="text-2xl font-bold text-white leading-relaxed"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {currentQuestion.question}
                </motion.h3>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectAnswer = index === currentQuestion.correctAnswer;
                  const showCorrect = showResult && isCorrectAnswer;
                  const showIncorrect = showResult && isSelected && !isCorrectAnswer;

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                      className={`w-full p-5 rounded-2xl border-2 text-left font-semibold text-lg transition-all duration-300 relative overflow-hidden group/btn ${
                        showCorrect
                          ? 'bg-green-500/20 border-green-400 text-green-400'
                          : showIncorrect
                          ? 'bg-red-500/20 border-red-400 text-red-400'
                          : isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400'
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-cyan-400/50'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={!showResult ? { scale: 1.02, x: 5 } : {}}
                      whileTap={!showResult ? { scale: 0.98 } : {}}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <span className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm ${
                            showCorrect || showIncorrect ? 'border-current' : 'border-white/30'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          {option}
                        </span>

                        {showCorrect && <CheckCircle2 className="w-6 h-6 text-green-400" />}
                        {showIncorrect && <XCircle className="w-6 h-6 text-red-400" />}
                      </div>

                      {/* Hover effect */}
                      {!showResult && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.6 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Result indicator */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    className={`mt-6 p-4 rounded-xl border-2 text-center font-semibold ${
                      isCorrect
                        ? 'bg-green-500/20 border-green-400 text-green-400'
                        : 'bg-red-500/20 border-red-400 text-red-400'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {isCorrect ? '✨ Correct! Well done!' : '❌ Wrong! Better luck next time!'}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Score display */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="inline-block px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <span className="text-white/60">Score: </span>
            <span className="text-2xl font-bold text-cyan-400">{score}</span>
            <span className="text-white/60"> / {questions.length}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
