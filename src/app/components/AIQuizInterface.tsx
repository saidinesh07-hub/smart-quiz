import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Loader2, Check, X, ArrowLeft, Brain } from 'lucide-react';
import { generateQuizQuestion, evaluateAnswer } from '../services/ollamaService';
import type { QuizQuestion } from '../services/ollamaService';

interface AIQuizInterfaceProps {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  onBack: () => void;
  onComplete?: (score: number, total: number) => void;
}

export function AIQuizInterface({
  topic,
  difficulty,
  onBack,
  onComplete
}: AIQuizInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<{
    isCorrect: boolean;
    feedback: string;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Generate first question on mount and clear cache
  useEffect(() => {
    // Clear the server cache when starting a new quiz
    const clearCache = async () => {
      try {
        await fetch('/api/clear-cache', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: topic })
        }).catch(() => {}); // Silently fail if endpoint doesn't exist
      } catch (err) {
        console.warn('Could not clear cache');
      }
    };
    
    clearCache();
    handleGenerateQuestion();
  }, [topic, difficulty]);

  const handleGenerateQuestion = async () => {
    setIsGenerating(true);
    setError(null);
    setSelectedAnswer(null);
    setEvaluation(null);

    try {
      const response = await generateQuizQuestion(topic, difficulty);

      if (response.success && response.question) {
        setCurrentQuestion(response.question);
      } else {
        setError(response.error || 'Failed to generate question. Please check your Gemini API key.');
      }
    } catch (err: any) {
      setError('Error connecting to AI server. Please make sure the server is running on http://localhost:3001');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (answer: string) => {
    if (!evaluation) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentQuestion || isEvaluating) return;

    setIsEvaluating(true);

    try {
      const response = await evaluateAnswer(
        currentQuestion.question,
        currentQuestion.correctAnswer,
        selectedAnswer,
        currentQuestion.explanation
      );

      if (response.success && response.evaluation) {
        setEvaluation(response.evaluation);
        setQuestionCount(prev => prev + 1);

        if (response.evaluation.isCorrect) {
          setScore(prev => prev + 1);
        }
      } else {
        // Fallback evaluation if Ollama fails
        const isCorrect = selectedAnswer.toUpperCase() === currentQuestion.correctAnswer.toUpperCase();
        setEvaluation({
          isCorrect,
          feedback: isCorrect
            ? `Correct! ${currentQuestion.explanation}`
            : `Incorrect. The correct answer is ${currentQuestion.correctAnswer}. ${currentQuestion.explanation}`
        });

        setQuestionCount(prev => prev + 1);
        if (isCorrect) {
          setScore(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error('Error evaluating answer:', err);
      setError('Failed to evaluate answer');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    handleGenerateQuestion();
  };

  const handleFinishQuiz = () => {
    if (onComplete) {
      onComplete(score, questionCount);
    }
  };

  const renderOption = (key: string, value: string) => {
    const isSelected = selectedAnswer === key;
    const isCorrect = evaluation && currentQuestion?.correctAnswer === key;
    const isWrong = evaluation && selectedAnswer === key && !evaluation.isCorrect;

    let bgClass = 'bg-white/5 hover:bg-white/10';
    let borderClass = 'border-cyan-500/30';
    let iconClass = '';

    if (evaluation) {
      if (isCorrect) {
        bgClass = 'bg-green-500/20';
        borderClass = 'border-green-500';
        iconClass = 'text-green-500';
      } else if (isWrong) {
        bgClass = 'bg-red-500/20';
        borderClass = 'border-red-500';
        iconClass = 'text-red-500';
      }
    } else if (isSelected) {
      bgClass = 'bg-cyan-500/20';
      borderClass = 'border-cyan-500';
    }

    return (
      <motion.button
        key={key}
        whileHover={{ scale: evaluation ? 1 : 1.02, x: 5 }}
        whileTap={{ scale: evaluation ? 1 : 0.98 }}
        onClick={() => handleSelectAnswer(key)}
        disabled={evaluation !== null}
        className={`w-full p-4 rounded-lg border-2 ${borderClass} ${bgClass}
                    backdrop-blur-md transition-all duration-300 text-left
                    disabled:cursor-not-allowed flex items-start gap-3`}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center
                        border-2 ${borderClass} ${isSelected ? 'bg-cyan-500/30' : 'bg-white/5'}
                        flex-shrink-0`}>
          {evaluation && isCorrect && <Check className="w-5 h-5 text-green-500" />}
          {evaluation && isWrong && <X className="w-5 h-5 text-red-500" />}
          {!evaluation && <span className="text-cyan-400 font-bold">{key}</span>}
        </div>
        <div className="flex-1">
          <p className="text-white">{value}</p>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5
                     backdrop-blur-md border border-cyan-500/30 text-white hover:bg-white/10
                     transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2 justify-center">
              <Brain className="w-8 h-8 text-cyan-400" />
              AI Quiz Mode
            </h1>
            <p className="text-cyan-400">
              {topic} • {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-white font-bold text-2xl">
              {score}/{questionCount}
            </p>
            <p className="text-cyan-400 text-sm">Score</p>
          </div>
        </div>

        {/* Main Card */}
        <motion.div
          className="p-8 rounded-2xl bg-gradient-to-br from-blue-900/20 to-purple-900/20
                     backdrop-blur-xl border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20"
        >
          {/* Loading State */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-16 h-16 text-cyan-400 mb-4" />
              </motion.div>
              <p className="text-white text-xl">Generating AI question...</p>
              <p className="text-cyan-400 text-sm mt-2">This may take a few seconds</p>
            </div>
          )}

          {/* Error State */}
          {error && !isGenerating && (
            <div className="py-10 text-center">
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 mb-4">
                <p className="text-red-400 mb-2">⚠️ Error</p>
                <p className="text-white">{error}</p>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-4">
                <p className="text-yellow-400 text-sm mb-2">🔑 Setup required:</p>
                <code className="text-white text-xs block mb-2">1. Create .env file with GEMINI_API_KEY</code>
                <code className="text-white text-xs block mb-2">2. Start server: npm run server:dev</code>
                <p className="text-yellow-400 text-sm">Get free API key at: https://ai.google.dev/</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerateQuestion}
                className="px-6 py-3 rounded-lg bg-cyan-500 text-white font-bold
                         hover:bg-cyan-600 transition-colors duration-300"
              >
                Try Again
              </motion.button>
            </div>
          )}

          {/* Question Display */}
          {currentQuestion && !isGenerating && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Question */}
              <div className="mb-8">
                <p className="text-cyan-400 text-sm mb-2">Question {questionCount + 1}</p>
                <h2 className="text-2xl text-white font-bold">{currentQuestion.question}</h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {Object.entries(currentQuestion.options).map(([key, value]) =>
                  renderOption(key, value)
                )}
              </div>

              {/* Evaluation Feedback */}
              {evaluation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-lg ${
                    evaluation.isCorrect
                      ? 'bg-green-500/20 border-2 border-green-500'
                      : 'bg-red-500/20 border-2 border-red-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {evaluation.isCorrect ? (
                      <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    ) : (
                      <X className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                    )}
                    <div>
                      <p className={`font-bold mb-2 ${
                        evaluation.isCorrect ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {evaluation.isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
                      </p>
                      <p className="text-white">{evaluation.feedback}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                {!evaluation ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer || isEvaluating}
                    className="flex-1 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500
                             text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed
                             hover:from-cyan-600 hover:to-blue-600 transition-all duration-300
                             flex items-center justify-center gap-2"
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      'Submit Answer'
                    )}
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNextQuestion}
                      className="flex-1 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500
                               text-white font-bold text-lg hover:from-cyan-600 hover:to-blue-600
                               transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Next AI Question
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleFinishQuiz}
                      className="px-6 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500
                               text-white font-bold text-lg hover:from-purple-600 hover:to-pink-600
                               transition-all duration-300"
                    >
                      Finish Quiz
                    </motion.button>
                  </>
                )}
              </div>

              {/* Gemini Indicator */}
              <div className="text-center pt-4">
                <p className="text-cyan-400/60 text-xs flex items-center justify-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Powered by Google Gemini AI
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
