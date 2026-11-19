import React from 'react';

export default function HeartGraphic({ className = "w-full h-auto max-w-sm" }) {
  return (
    <div className={`relative flex items-center justify-center p-6 ${className}`}>
      {/* Soft Glow Effect */}
      <div className="absolute w-72 h-72 bg-rose-500/20 rounded-full blur-3xl -z-10 animate-pulse" />
      
      {/* Realistic Stylized Anatomical Heart SVG */}
      <svg
        viewBox="0 0 400 450"
        className="w-full h-auto drop-shadow-2xl transition-transform duration-700 hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="aortaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="70%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>
          <linearGradient id="pulmonaryArtery" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="venaCava" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
          <linearGradient id="heartMuscle" x1="10%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="40%" stopColor="#dc2626" />
            <stop offset="75%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#450a0a" />
          </linearGradient>
          <radialGradient id="highlight" cx="30%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#fecaca" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Superior Vena Cava */}
        <path d="M150 70 C150 40, 180 35, 180 80 L180 140 C170 145, 155 140, 150 130 Z" fill="url(#venaCava)" stroke="#075985" strokeWidth="3"/>

        {/* Aorta Arch & Branches */}
        <path d="M185 110 C185 40, 260 30, 275 100 C280 130, 275 160, 260 180 L230 160 C245 130, 245 80, 215 75 C195 72, 195 105, 195 125 Z" fill="url(#aortaGrad)" stroke="#7f1d1d" strokeWidth="3"/>
        {/* Branch 1 */}
        <path d="M205 60 L205 25 C205 18, 215 18, 215 25 L215 62 Z" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="2"/>
        {/* Branch 2 */}
        <path d="M225 55 L228 20 C228 15, 238 15, 238 20 L235 58 Z" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="2"/>
        {/* Branch 3 */}
        <path d="M246 63 L255 25 C255 18, 265 20, 265 27 L256 70 Z" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="2"/>

        {/* Pulmonary Artery (Left & Right Branches) */}
        <path d="M190 140 C210 130, 280 135, 290 165 C275 185, 220 180, 205 195 L175 165 Z" fill="url(#pulmonaryArtery)" stroke="#0369a1" strokeWidth="3"/>
        <path d="M275 155 C305 150, 315 165, 310 178 C295 185, 285 175, 275 170 Z" fill="url(#pulmonaryArtery)"/>

        {/* Left Atrium & Auricle */}
        <path d="M260 160 C295 165, 310 200, 295 240 C280 230, 270 200, 255 190 Z" fill="#991b1b" stroke="#450a0a" strokeWidth="2"/>

        {/* Main Ventricle Muscle (Heart Base) */}
        <path
          d="M140 160 
             C120 190, 115 240, 135 290 
             C155 340, 190 395, 245 425 
             C270 410, 305 345, 310 280 
             C315 220, 285 190, 260 180 
             C240 175, 210 185, 190 190 
             C165 175, 150 165, 140 160 Z"
          fill="url(#heartMuscle)"
          stroke="#450a0a"
          strokeWidth="4"
        />

        {/* 3D Curved Muscle Shading / Highlight */}
        <path
          d="M150 180 C135 220, 135 270, 155 310 C180 360, 215 395, 245 415 C230 380, 200 320, 190 270 C180 220, 175 190, 150 180 Z"
          fill="url(#highlight)"
        />

        {/* Coronary Blood Vessels (Arteries & Veins across heart) */}
        <path d="M205 195 Q215 250 205 290 T240 370 T245 420" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <path d="M210 240 Q235 260 250 285" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M205 285 Q180 310 170 330" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M200 195 Q205 260 195 300 T230 385" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M198 255 Q175 275 160 290" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M200 305 Q220 330 235 345" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none"/>

        {/* Fatty Tissue Textures (Yellowish accents on sulcus) */}
        <path d="M192 185 C205 190, 210 200, 202 210 C195 205, 190 195, 192 185 Z" fill="#fde047" opacity="0.6"/>
        <path d="M200 220 C208 225, 212 235, 206 242 C200 238, 196 228, 200 220 Z" fill="#fde047" opacity="0.5"/>
        <path d="M212 275 C218 280, 222 290, 215 296 C210 290, 208 280, 212 275 Z" fill="#fde047" opacity="0.5"/>
      </svg>
    </div>
  );
}