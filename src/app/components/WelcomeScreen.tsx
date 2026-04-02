import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { Sparkles, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: (username: string) => void;
}

export const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const [username, setUsername] = useState('');
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate title on mount
    if (titleRef.current) {
      gsap.from(titleRef.current, {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
    }

    // Floating animation for card
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onStart(username.trim());
    }
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    gsap.to(cardRef.current, {
      rotateX,
      rotateY,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleCardMouseLeave = () => {
    if (!cardRef.current) return;
    
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Title */}
        <motion.h1
          ref={titleRef}
          className="text-7xl font-black text-center mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          NEURO QUIZ
        </motion.h1>

        <motion.p
          className="text-center text-cyan-300 text-xl mb-12 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <Zap className="w-6 h-6 animate-pulse" />
          Next-Gen Interactive Quiz Platform
          <Sparkles className="w-6 h-6 animate-pulse" />
        </motion.p>

        {/* Glass card */}
        <motion.div
          ref={cardRef}
          className="relative group"
          style={{ perspective: 1000 }}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
          
          {/* Card content */}
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label 
                  htmlFor="username" 
                  className="block text-white text-lg mb-4 font-semibold tracking-wide"
                >
                  Enter Your Name
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Type your name..."
                  className="w-full px-6 py-4 bg-white/5 border-2 border-cyan-500/30 rounded-2xl text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/20 transition-all duration-300 text-lg backdrop-blur-sm"
                  required
                  autoFocus
                />
              </div>

              <motion.button
                type="submit"
                className="w-full py-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 relative overflow-hidden group"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Start Your Journey
                  <Zap className="w-6 h-6" />
                </span>
                
                {/* Button glow animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </motion.button>
            </form>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-8 h-8 text-cyan-400/30" />
              </motion.div>
            </div>

            <div className="absolute bottom-4 left-4">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              >
                <Zap className="w-8 h-8 text-purple-400/30" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats preview */}
        <motion.div
          className="grid grid-cols-3 gap-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {[
            { label: 'Topics', value: '10+' },
            { label: 'Questions', value: '50+' },
            { label: 'Difficulty Levels', value: '3' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center"
              whileHover={{ scale: 1.05, borderColor: 'rgba(34, 211, 238, 0.3)' }}
            >
              <div className="text-3xl font-bold text-cyan-400">{stat.value}</div>
              <div className="text-white/60 text-sm mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
