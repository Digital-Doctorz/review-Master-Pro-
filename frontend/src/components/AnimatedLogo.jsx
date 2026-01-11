import { motion } from "framer-motion";
import { Star } from "lucide-react";

// Animated logo component for Review Master
export const AnimatedLogo = ({ size = "default", showText = true, className = "" }) => {
  const sizeClasses = {
    small: "w-8 h-8",
    default: "w-10 h-10",
    large: "w-14 h-14",
    hero: "w-20 h-20",
  };

  const textSizes = {
    small: "text-lg",
    default: "text-xl",
    large: "text-2xl",
    hero: "text-4xl",
  };

  const iconSizes = {
    small: "w-4 h-4",
    default: "w-5 h-5",
    large: "w-7 h-7",
    hero: "w-10 h-10",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 flex items-center justify-center relative overflow-hidden shadow-lg shadow-purple-500/30`}
        initial={{ scale: 0.8, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.05, rotate: 5 }}
      >
        {/* Animated shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "linear",
            repeatDelay: 3,
          }}
        />
        
        {/* Animated stars */}
        <div className="relative">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            <Star className={`${iconSizes[size]} text-white fill-white`} />
          </motion.div>
          
          {/* Sparkle dots */}
          <motion.div
            className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />
          <motion.div
            className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-cyan-300 rounded-full"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2,
              delay: 0.5,
            }}
          />
        </div>
      </motion.div>
      
      {showText && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col"
        >
          <span className={`${textSizes[size]} font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight`}>
            Review Master
          </span>
          {size === "hero" && (
            <motion.span
              className="text-sm text-slate-500 font-medium -mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Pro Review Management
            </motion.span>
          )}
        </motion.div>
      )}
    </div>
  );
};

// Simple static logo for loading screens
export const StaticLogo = ({ size = "default", className = "" }) => {
  const sizeClasses = {
    small: "w-8 h-8",
    default: "w-10 h-10",
    large: "w-14 h-14",
  };

  const iconSizes = {
    small: "w-4 h-4",
    default: "w-5 h-5",
    large: "w-7 h-7",
  };

  return (
    <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 flex items-center justify-center ${className}`}>
      <Star className={`${iconSizes[size]} text-white fill-white`} />
    </div>
  );
};

export default AnimatedLogo;
