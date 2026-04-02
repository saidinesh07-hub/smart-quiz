import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { quizTopics } from '../data/quizData';
import { Trophy, ArrowLeft } from 'lucide-react';

interface TopicSelectionProps {
  username: string;
  onSelectTopic: (topicId: string) => void;
  onShowLeaderboard: () => void;
  onBack: () => void;
}

export const TopicSelection = ({ 
  username, 
  onSelectTopic, 
  onShowLeaderboard,
  onBack 
}: TopicSelectionProps) => {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Staggered entrance animation
    cardRefs.current.forEach((card, index) => {
      if (card) {
        gsap.from(card, {
          opacity: 0,
          y: 50,
          scale: 0.8,
          duration: 0.6,
          delay: index * 0.1,
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
    
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;
    
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
    <div className="min-h-screen p-8 relative">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-8">
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-cyan-400/30 transition-all duration-300"
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>

          <motion.button
            onClick={onShowLeaderboard}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl text-yellow-300 hover:border-yellow-400 transition-all duration-300 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trophy className="w-5 h-5 group-hover:animate-bounce" />
            Leaderboard
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-black text-white mb-2">
            Welcome, <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{username}</span>!
          </h1>
          <p className="text-xl text-white/60">Choose your quiz topic to begin</p>
        </motion.div>
      </div>

      {/* Topic grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {quizTopics.map((topic, index) => (
            <motion.div
              key={topic.id}
              ref={(el) => (cardRefs.current[index] = el)}
              className="relative group cursor-pointer"
              style={{ perspective: 1000 }}
              onMouseMove={(e) => handleCardMouseMove(e, index)}
              onMouseLeave={() => handleCardMouseLeave(index)}
              onClick={() => onSelectTopic(topic.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Card glow */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${topic.color} rounded-3xl blur-lg opacity-0 group-hover:opacity-70 transition-opacity duration-500`} />
              
              {/* Card content */}
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 h-48 flex flex-col items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                {/* Icon */}
                <motion.div
                  className="text-6xl mb-4"
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                >
                  {topic.icon}
                </motion.div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white text-center mb-2">
                  {topic.name}
                </h3>

                {/* Question count */}
                <p className="text-sm text-white/50">
                  {topic.questions.length} questions
                </p>

                {/* Hover indicator */}
                <motion.div
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ y: 10 }}
                  whileHover={{ y: 0 }}
                >
                  <div className="px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white text-sm font-semibold shadow-lg">
                    Start Quiz
                  </div>
                </motion.div>

                {/* Corner decoration */}
                <div className="absolute top-2 right-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${topic.color} animate-pulse`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom decorative text */}
      <motion.div
        className="text-center mt-16 text-white/30 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <p>Choose wisely. Each topic has questions of varying difficulty.</p>
      </motion.div>
    </div>
  );
};
