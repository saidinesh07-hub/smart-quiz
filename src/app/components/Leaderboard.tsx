import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Award, ArrowLeft, Trash2 } from 'lucide-react';

interface LeaderboardEntry {
  username: string;
  score: number;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  date: string;
}

interface LeaderboardProps {
  onBack: () => void;
}

export const Leaderboard = ({ onBack }: LeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Load leaderboard from localStorage
    const stored = localStorage.getItem('quizLeaderboard');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Sort by score descending
        const sorted = data.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score);
        setEntries(sorted.slice(0, 10)); // Top 10
      } catch (e) {
        console.error('Failed to load leaderboard:', e);
      }
    }
  }, []);

  const clearLeaderboard = () => {
    if (confirm('Are you sure you want to clear the leaderboard?')) {
      localStorage.removeItem('quizLeaderboard');
      setEntries([]);
    }
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-8 h-8 text-yellow-400" />;
    if (index === 1) return <Medal className="w-8 h-8 text-gray-300" />;
    if (index === 2) return <Award className="w-8 h-8 text-orange-400" />;
    return <div className="w-8 h-8 flex items-center justify-center text-white/40 font-bold">#{index + 1}</div>;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="min-h-screen p-8 relative">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-cyan-400/30 transition-all duration-300"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>

          {entries.length > 0 && (
            <motion.button
              onClick={clearLeaderboard}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/10 backdrop-blur-sm border border-red-400/30 rounded-xl text-red-400 hover:bg-red-500/20 hover:border-red-400 transition-all duration-300"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 className="w-5 h-5" />
              Clear
            </motion.button>
          )}
        </div>

        {/* Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
            <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
          </div>
          <p className="text-xl text-white/60">Top performers of all time</p>
        </motion.div>

        {/* Leaderboard entries */}
        {entries.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Trophy className="w-24 h-24 text-white/20 mx-auto mb-6" />
            <p className="text-2xl text-white/40">No entries yet</p>
            <p className="text-white/30 mt-2">Complete a quiz to appear on the leaderboard!</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                {/* Glow for top 3 */}
                {index < 3 && (
                  <div className={`absolute -inset-1 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                    'bg-gradient-to-r from-orange-500 to-red-500'
                  }`} />
                )}

                {/* Entry card */}
                <div className={`relative bg-white/5 backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 ${
                  index < 3 
                    ? 'border-white/20 hover:bg-white/10' 
                    : 'border-white/10 hover:bg-white/5'
                }`}>
                  <div className="flex items-center gap-6">
                    {/* Rank/Medal */}
                    <div className="flex-shrink-0">
                      {getMedalIcon(index)}
                    </div>

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white truncate">
                          {entry.username}
                        </h3>
                        {index === 0 && (
                          <motion.span
                            className="px-3 py-1 bg-yellow-500/20 border border-yellow-400/30 rounded-full text-yellow-400 text-xs font-bold"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            👑 CHAMPION
                          </motion.span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>{entry.topic}</span>
                        <span>•</span>
                        <span className={getDifficultyColor(entry.difficulty)}>
                          {entry.difficulty}
                        </span>
                        <span>•</span>
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex-shrink-0">
                      <div className="text-right">
                        <div className="text-3xl font-black text-cyan-400">
                          {entry.score}
                        </div>
                        <div className="text-xs text-white/40">points</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer info */}
        <motion.div
          className="text-center mt-12 text-white/40 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p>Scores are calculated based on correct answers × difficulty multiplier × 100</p>
        </motion.div>
      </div>
    </div>
  );
};

// Function to save score to leaderboard
export const saveToLeaderboard = (
  username: string,
  score: number,
  totalQuestions: number,
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard'
) => {
  const multipliers = { easy: 1, medium: 1.5, hard: 2 };
  const finalScore = Math.round(score * multipliers[difficulty] * 100);

  const entry: LeaderboardEntry = {
    username,
    score: finalScore,
    topic,
    difficulty,
    date: new Date().toISOString(),
  };

  try {
    const stored = localStorage.getItem('quizLeaderboard');
    const existing: LeaderboardEntry[] = stored ? JSON.parse(stored) : [];
    existing.push(entry);
    
    // Keep only top 100 entries to prevent localStorage overflow
    const sorted = existing.sort((a, b) => b.score - a.score).slice(0, 100);
    localStorage.setItem('quizLeaderboard', JSON.stringify(sorted));
  } catch (e) {
    console.error('Failed to save to leaderboard:', e);
  }
};
