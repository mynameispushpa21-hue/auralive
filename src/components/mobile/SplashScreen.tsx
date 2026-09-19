import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number; // duration in seconds (default 3)
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 3,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [onFinish, duration]);

  const handleSkip = () => {
    onFinish();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03, transition: { duration: 0.45, ease: 'easeInOut' } }}
      className="absolute inset-0 z-50 flex flex-col justify-between overflow-hidden select-none font-sans"
      style={{
        // Atmospheric gradient matching the uploaded artwork
        background: 'linear-gradient(168deg, #A4DAEA 0%, #87CEE3 22%, #68BED8 48%, #50A9C6 75%, #3C93B2 100%)',
      }}
    >
      {/* BACKGROUND ACCENTS: Gentle Coral-Peach Mist at Top-Left */}
      <div
        className="absolute -top-16 -left-16 w-88 h-96 pointer-events-none rounded-full blur-3xl opacity-80"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #FFD6C4 0%, #FFB098 40%, #FE967C 65%, rgba(254, 150, 124, 0) 85%)',
        }}
      />

      <div
        className="absolute top-0 left-0 w-72 h-80 pointer-events-none opacity-45"
        style={{
          background: 'radial-gradient(ellipse at 15% 15%, #FFE2D4 0%, #FFAF9A 45%, transparent 75%)',
        }}
      />

      {/* Radiant Warm Halo directly behind central 3D ribbon */}
      <div
        className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-84 h-84 pointer-events-none rounded-full blur-2xl opacity-85"
        style={{
          background: 'radial-gradient(circle at center, rgba(255, 246, 236, 0.95) 0%, rgba(255, 222, 195, 0.65) 28%, rgba(255, 185, 160, 0.25) 50%, rgba(100, 190, 220, 0) 70%)',
        }}
      />

      {/* Subtle Cyan Glow at Lower Section */}
      <div
        className="absolute top-[54%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none rounded-full blur-2xl opacity-60"
        style={{
          background: 'radial-gradient(circle at center, rgba(80, 220, 255, 0.45) 0%, rgba(0, 180, 240, 0.15) 50%, transparent 75%)',
        }}
      />

      {/* Bottom Fluid Waves matching the artwork */}
      <svg
        className="absolute bottom-0 left-0 w-full h-72 pointer-events-none opacity-45 mix-blend-soft-light"
        viewBox="0 0 400 320"
        preserveAspectRatio="none"
      >
        <path
          d="M0,170 C110,230 220,150 400,210 L400,320 L0,320 Z"
          fill="url(#waveGradA)"
        />
        <path
          d="M0,210 C130,160 250,250 400,195 L400,320 L0,320 Z"
          fill="url(#waveGradB)"
          opacity="0.7"
        />
        <defs>
          <linearGradient id="waveGradA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A7B97" />
            <stop offset="100%" stopColor="#185971" />
          </linearGradient>
          <linearGradient id="waveGradB" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5AC1E0" />
            <stop offset="100%" stopColor="#297E9C" />
          </linearGradient>
        </defs>
      </svg>

      {/* TOP HEADER: Clean Skip Option on the Right Side */}
      <div className="relative z-30 pt-11 px-5 flex items-center justify-end w-full">
        <motion.button
          onClick={handleSkip}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          className="group flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/25 hover:bg-black/40 active:bg-black/50 backdrop-blur-md border border-white/30 hover:border-white/50 text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all cursor-pointer"
          title="Skip"
          aria-label="Skip"
        >
          <span className="text-xs font-semibold tracking-wide text-white">
            Skip
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
        </motion.button>
      </div>

      {/* CENTER STAGE: 3D Sculpted Ribbon Flame Emblem & "Aura Live" Branding */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center -mt-8 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          {/* Continuous gentle ambient floating effect */}
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
            className="relative w-64 h-76 sm:w-72 sm:h-84 flex items-center justify-center"
          >
            {/* Luminous Warm Backlight Halation */}
            <div
              className="absolute inset-2 rounded-full blur-2xl pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(255, 235, 210, 0.9) 0%, rgba(255, 120, 110, 0.4) 35%, rgba(0, 190, 245, 0.3) 65%, transparent 80%)',
              }}
            />

            {/* High-Fidelity 3D Sculpted Flame Ribbon SVG */}
            <svg
              viewBox="0 0 260 320"
              className="w-full h-full relative z-10 overflow-visible"
              style={{
                filter: 'drop-shadow(0 20px 40px rgba(15, 60, 95, 0.32)) drop-shadow(0 0 25px rgba(255, 225, 200, 0.5))',
              }}
            >
              <defs>
                {/* 1. Top Bevel Rim Highlight (Cream-White to Peach) */}
                <linearGradient id="crestBevel" x1="25%" y1="0%" x2="75%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="35%" stopColor="#FFE0D0" />
                  <stop offset="70%" stopColor="#FF9F85" />
                  <stop offset="100%" stopColor="#FF5C78" />
                </linearGradient>

                {/* 2. Top Volumetric Ribbon Fold (Soft Peach -> Coral -> Deep Crimson) */}
                <linearGradient id="topRibbonFold" x1="15%" y1="5%" x2="85%" y2="95%">
                  <stop offset="0%" stopColor="#FFD2C0" />
                  <stop offset="22%" stopColor="#FFA68A" />
                  <stop offset="50%" stopColor="#FF4D6D" />
                  <stop offset="80%" stopColor="#E61A54" />
                  <stop offset="100%" stopColor="#AD0E3B" />
                </linearGradient>

                {/* 3. Deep Crease & Ambient Occlusion (Rich Crimson to Violet) */}
                <linearGradient id="deepCrease" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9C0A35" />
                  <stop offset="45%" stopColor="#6E124B" />
                  <stop offset="100%" stopColor="#281A66" />
                </linearGradient>

                {/* 4. Mid-Section S-Twist (Crimson -> Indigo -> Cobalt Sapphire) */}
                <linearGradient id="midTwist" x1="10%" y1="10%" x2="90%" y2="90%">
                  <stop offset="0%" stopColor="#EA1B58" />
                  <stop offset="30%" stopColor="#8E1F8C" />
                  <stop offset="60%" stopColor="#2B36B4" />
                  <stop offset="100%" stopColor="#1460DE" />
                </linearGradient>

                {/* 5. Bottom Wave Swell (Neon Turquoise -> Cerulean -> Electric Azure) */}
                <linearGradient id="bottomSwell" x1="0%" y1="20%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#68EBFF" />
                  <stop offset="25%" stopColor="#00C4FF" />
                  <stop offset="65%" stopColor="#0E77ED" />
                  <stop offset="100%" stopColor="#0A43A8" />
                </linearGradient>

                {/* 6. Bottom Tail Hook (Bright Sky Cerulean to Deep Navy) */}
                <linearGradient id="tailHook" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#45E5FF" />
                  <stop offset="55%" stopColor="#009BF0" />
                  <stop offset="100%" stopColor="#0D3F8A" />
                </linearGradient>

                {/* 7. Bottom Shadow Core */}
                <linearGradient id="bottomShadow" x1="40%" y1="0%" x2="60%" y2="100%">
                  <stop offset="0%" stopColor="#0B376E" />
                  <stop offset="60%" stopColor="#082A54" />
                  <stop offset="100%" stopColor="#03162E" />
                </linearGradient>

                {/* Specular Blur Filter */}
                <filter id="glowSheen" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* LAYER 1: Core Occlusion Shadow (Creates Depth Behind the Ribbon) */}
              <path
                d="M130 80 C108 80, 96 102, 100 126 C107 152, 137 165, 139 190 C141 212, 114 230, 104 248 C124 235, 151 214, 153 184 C155 150, 124 134, 123 112 C122 96, 132 85, 141 87 Z"
                fill="url(#deepCrease)"
                opacity="0.9"
              />

              {/* LAYER 2: Bottom Deep Cavity Shadow */}
              <path
                d="M135 180 C118 193, 86 210, 80 240 C74 274, 110 304, 138 296 C148 292, 157 277, 153 264 C149 251, 132 255, 123 264 C112 275, 95 263, 99 247 C103 230, 125 215, 144 200 Z"
                fill="url(#bottomShadow)"
              />

              {/* LAYER 3: Bottom Wave Outer Sweep (Turquoise / Azure Blue) */}
              <path
                d="M147 184 C117 199, 77 218, 78 250 C79 284, 118 306, 144 286 C155 278, 161 261, 148 255 C133 246, 113 257, 103 242 C94 229, 111 212, 135 195 C144 188, 150 184, 155 180 Z"
                fill="url(#bottomSwell)"
              />

              {/* LAYER 4: Bottom Luminous Cerulean Hook */}
              <path
                d="M149 188 C124 205, 82 225, 84 255 C86 280, 120 302, 142 284 C148 279, 153 268, 144 262 C131 255, 114 261, 105 248 C99 238, 116 220, 135 204 Z"
                fill="url(#tailHook)"
                opacity="0.95"
              />

              {/* LAYER 5: Mid-Section Elegant S-Twist (Ruby -> Violet -> Cobalt) */}
              <path
                d="M121 105 C110 126, 108 148, 127 167 C140 180, 149 193, 144 210 C155 193, 153 173, 138 158 C125 145, 123 130, 134 111 Z"
                fill="url(#midTwist)"
              />

              {/* LAYER 6: Top Outer Fold (Sculpted Peach, Coral & Crimson Petal) */}
              <path
                d="M134 68 C104 70, 89 98, 100 128 C110 158, 145 169, 142 197 C157 178, 157 152, 144 133 C133 118, 129 102, 142 88 C157 73, 185 88, 191 120 C198 150, 180 184, 156 203 C174 182, 189 148, 182 118 C176 86, 153 66, 134 68 Z"
                fill="url(#topRibbonFold)"
              />

              {/* LAYER 7: Top Sculpted Bevel Highlight (Cream/Gold Specular Rim) */}
              <path
                d="M135 68 C153 66, 179 83, 185 116 C191 146, 174 180, 156 201 C170 180, 183 148, 176 120 C170 92, 149 77, 135 68 Z"
                fill="url(#crestBevel)"
              />

              {/* LAYER 8: Inner Volumetric Curving Core */}
              <path
                d="M136 71 C123 72, 114 82, 116 97 C119 114, 133 127, 146 142 C157 155, 161 170, 156 187 C166 168, 167 148, 154 131 C142 116, 136 103, 142 88 C147 77, 159 75, 170 81 C159 73, 147 69, 136 71 Z"
                fill="url(#topRibbonFold)"
                opacity="0.95"
              />

              {/* LAYER 9: Realistic 3D Specular Sheens & Highlights */}
              <ellipse
                cx="145"
                cy="81"
                rx="15"
                ry="7"
                transform="rotate(-26 145 81)"
                fill="#FFFFFF"
                opacity="0.55"
                filter="url(#glowSheen)"
              />

              <ellipse
                cx="95"
                cy="251"
                rx="9"
                ry="19"
                transform="rotate(22 95 251)"
                fill="#8BF0FF"
                opacity="0.6"
                filter="url(#glowSheen)"
              />
            </svg>
          </motion.div>

          {/* "Aura Live" Wordmark Typography (Exact match) */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="flex items-baseline justify-center gap-2.5 mt-4 select-none"
          >
            {/* "Aura" - Bold Pure White with subtle dimensional drop shadow */}
            <span
              className="text-[48px] sm:text-[56px] font-black tracking-tight text-white font-['Outfit',sans-serif] leading-none"
              style={{
                filter: 'drop-shadow(0 4px 14px rgba(12, 48, 74, 0.42)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.18))',
              }}
            >
              Aura
            </span>

            {/* "Live" - Vibrant Radiant Coral-Pink Gradient with soft backlight */}
            <span
              className="text-[48px] sm:text-[56px] font-black tracking-tight font-['Outfit',sans-serif] leading-none bg-gradient-to-r from-[#FF7A70] via-[#FF4D6D] to-[#FF2A6D] bg-clip-text text-transparent"
              style={{
                filter: 'drop-shadow(0 4px 18px rgba(255, 60, 110, 0.6))',
              }}
            >
              Live
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* BOTTOM SAFE AREA */}
      <div className="relative z-20 pb-8 px-6" />
    </motion.div>
  );
};
