import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import { Trophy, Star, Target, RotateCcw, Home, Award } from 'lucide-react';

interface ResultsScreenProps {
  username: string;
  score: number;
  totalQuestions: number;
  topicName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export const ResultsScreen = ({
  username,
  score,
  totalQuestions,
  topicName,
  difficulty,
  onPlayAgain,
  onBackToHome,
}: ResultsScreenProps) => {
  const scoreRef = useRef<HTMLDivElement>(null);
  const percentage = Math.round((score / totalQuestions) * 100);

  // Difficulty multipliers
  const multipliers = { easy: 1, medium: 1.5, hard: 2 };
  const finalScore = Math.round(score * multipliers[difficulty] * 100);

  useEffect(() => {
    // Fire confetti based on performance
    if (percentage >= 80) {
      // Excellent performance - big celebration
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#00d4ff', '#0084ff', '#6a00ff'],
        });
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#00d4ff', '#0084ff', '#6a00ff'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    } else if (percentage >= 50) {
      // Good performance - moderate celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00d4ff', '#0084ff', '#6a00ff'],
      });
    }

    // Animate score counter
    if (scoreRef.current) {
      gsap.from(scoreRef.current, {
        textContent: 0,
        duration: 2,
        ease: 'power2.out',
        snap: { textContent: 1 },
      });
    }
  }, [percentage]);

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { text: 'Outstanding! 🏆', color: 'text-yellow-400' };
    if (percentage >= 80) return { text: 'Excellent! ⭐', color: 'text-cyan-400' };
    if (percentage >= 70) return { text: 'Great Job! 🎯', color: 'text-green-400' };
    if (percentage >= 50) return { text: 'Good Effort! 💪', color: 'text-blue-400' };
    return { text: 'Keep Practicing! 📚', color: 'text-purple-400' };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative">
      <div className="max-w-4xl w-full">
        {/* Main result card */}
        <motion.div
          className="relative group"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'back.out(1.7)' }}
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />

          {/* Card content */}
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
            {/* Trophy animation */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ y: -100, rotate: -180, opacity: 0 }}
              animate={{ y: 0, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <div className="relative">
                <Trophy className="w-24 h-24 text-yellow-400" />
                <motion.div
                  className="absolute -inset-4 bg-yellow-400/20 rounded-full blur-xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              className={`text-5xl font-black text-center mb-4 ${performance.color}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {performance.text}
            </motion.h1>

            <motion.p
              className="text-xl text-white/60 text-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {username}, you've completed the quiz!
            </motion.p>

            {/* Score display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Score */}
              <motion.div
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Star className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <div className="text-4xl font-black text-cyan-400 mb-2">
                  {score}/{totalQuestions}
                </div>
                <div className="text-white/60 text-sm">Questions Correct</div>
              </motion.div>

              {/* Percentage */}
              <motion.div
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <Target className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-4xl font-black text-yellow-400 mb-2">
                  {percentage}%
                </div>
                <div className="text-white/60 text-sm">Accuracy</div>
              </motion.div>

              {/* Final score */}
              <motion.div
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
              >
                <Award className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div ref={scoreRef} className="text-4xl font-black text-purple-400 mb-2">
                  {finalScore}
                </div>
                <div className="text-white/60 text-sm">Final Score</div>
              </motion.div>
            </div>

            {/* Quiz details */}
            <motion.div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-white/60 text-sm mb-1">Topic</div>
                  <div className="text-white font-semibold">{topicName}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm mb-1">Difficulty</div>
                  <div className={`font-semibold capitalize ${
                    difficulty === 'easy' ? 'text-green-400' :
                    difficulty === 'medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {difficulty} (×{multipliers[difficulty]})
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
            >
              <motion.button
                onClick={onPlayAgain}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw className="w-6 h-6" />
                Play Again
              </motion.button>

              <motion.button
                onClick={onBackToHome}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 hover:border-cyan-400/30 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Home className="w-6 h-6" />
                Back to Topics
              </motion.button>
            </motion.div>

            {/* Decorative stars */}
            {percentage >= 80 && (
              <>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${10 + (i % 2) * 80}%`,
                    }}
                    initial={{ opacity: 0, scale: 0, rotate: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      scale: [0, 1.5, 0],
                      rotate: 360
                    }}
                    transition={{
                      duration: 2,
                      delay: 2 + i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </motion.div>

        {/* Motivational message */}
        <motion.div
          className="text-center mt-8 text-white/40 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          {percentage >= 80 ? (
            <p>🎉 Amazing work! You're a true quiz master!</p>
          ) : percentage >= 50 ? (
            <p>💪 Good job! Keep practicing to reach excellence!</p>
          ) : (
            <p>📚 Don't give up! Every expert was once a beginner!</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};
