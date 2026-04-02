import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { useRef, useEffect } from 'react';
import { Zap, Target, Flame, ArrowLeft } from 'lucide-react';

interface DifficultySelectionProps {
  topicName: string;
  onSelectDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onBack: () => void;
}

const difficulties = [
  {
    level: 'easy' as const,
    title: 'Easy',
    description: 'Perfect for beginners',
    icon: Target,
    color: 'from-green-500 to-emerald-500',
    borderColor: 'border-green-400/30',
    hoverBorder: 'hover:border-green-400',
    textColor: 'text-green-400',
  },
  {
    level: 'medium' as const,
    title: 'Medium',
    description: 'For the confident ones',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    borderColor: 'border-yellow-400/30',
    hoverBorder: 'hover:border-yellow-400',
    textColor: 'text-yellow-400',
  },
  {
    level: 'hard' as const,
    title: 'Hard',
    description: 'Only for the brave',
    icon: Flame,
    color: 'from-red-500 to-pink-500',
    borderColor: 'border-red-400/30',
    hoverBorder: 'hover:border-red-400',
    textColor: 'text-red-400',
  },
];

export const DifficultySelection = ({ 
  topicName, 
  onSelectDifficulty, 
  onBack 
}: DifficultySelectionProps) => {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    cardRefs.current.forEach((card, index) => {
      if (card) {
        gsap.from(card, {
          opacity: 0,
          y: 50,
          scale: 0.8,
          duration: 0.6,
          delay: index * 0.2,
          ease: 'back.out(1.7)',
        });
      }
    });
  }, []);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    gsap.to(card, {
      rotateX,
      rotateY,
      duration: 0.3,
      ease: 'power2.out',
      transformPerspective: 1000,
    });
  };

  const handleCardMouseLeave = (index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;
    
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative">
      {/* Back button */}
      <motion.button
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-cyan-400/30 transition-all duration-300 z-20"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05, x: -5 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </motion.button>

      <div className="max-w-6xl mx-auto w-full">
        {/* Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-black text-white mb-4">
            Select Difficulty
          </h1>
          <p className="text-xl text-white/60">
            Topic: <span className="text-cyan-400 font-semibold">{topicName}</span>
          </p>
        </motion.div>

        {/* Difficulty cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {difficulties.map((difficulty, index) => {
            const Icon = difficulty.icon;
            return (
              <motion.div
                key={difficulty.level}
                ref={(el) => (cardRefs.current[index] = el)}
                className="relative group cursor-pointer"
                style={{ perspective: 1000 }}
                onMouseMove={(e) => handleCardMouseMove(e, index)}
                onMouseLeave={() => handleCardMouseLeave(index)}
                onClick={() => onSelectDifficulty(difficulty.level)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Card glow */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${difficulty.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500`} />
                
                {/* Card content */}
                <div className={`relative bg-white/5 backdrop-blur-xl border ${difficulty.borderColor} ${difficulty.hoverBorder} rounded-3xl p-8 h-80 flex flex-col items-center justify-center transition-all duration-300 group-hover:bg-white/10`}>
                  {/* Icon with animation */}
                  <motion.div
                    className={`mb-6 ${difficulty.textColor}`}
                    whileHover={{ 
                      rotate: [0, -10, 10, -10, 0],
                      scale: [1, 1.2, 1.2, 1.2, 1]
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="w-24 h-24" strokeWidth={1.5} />
                  </motion.div>

                  {/* Title */}
                  <h3 className={`text-3xl font-black ${difficulty.textColor} mb-3`}>
                    {difficulty.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/60 text-center text-sm mb-6">
                    {difficulty.description}
                  </p>

                  {/* Difficulty indicator bars */}
                  <div className="flex gap-2">
                    {[1, 2, 3].map((bar) => (
                      <div
                        key={bar}
                        className={`h-2 w-12 rounded-full ${
                          bar <= (index + 1) 
                            ? `bg-gradient-to-r ${difficulty.color}` 
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Hover text */}
                  <motion.div
                    className="absolute bottom-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ y: 10 }}
                    whileHover={{ y: 0 }}
                  >
                    <div className={`px-6 py-2 bg-gradient-to-r ${difficulty.color} rounded-full text-white font-semibold shadow-lg`}>
                      Choose {difficulty.title}
                    </div>
                  </motion.div>

                  {/* Pulsing dot */}
                  <div className="absolute top-4 right-4">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${difficulty.color} animate-pulse`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Info text */}
        <motion.div
          className="text-center mt-12 text-white/40 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <p>Each difficulty level affects your final score multiplier</p>
        </motion.div>
      </div>
    </div>
  );
};
