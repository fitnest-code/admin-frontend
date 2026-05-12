"use client";

import React, { useEffect } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function SuccessAnimationModal({ isOpen, onClose }: SuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/30 backdrop-blur-md animate-in fade-in duration-300 font-sans">
      <div className="relative w-36 h-36 flex items-center justify-center animate-in zoom-in-95 duration-300">
        {/* Animated SVG: Drawing circle with green tick inside */}
        <svg className="w-36 h-36" viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background expanding circle / drawing outline */}
          <circle 
            cx="56" 
            cy="56" 
            r="48" 
            stroke="#12B76A" 
            strokeWidth="8"
            fill="white"
            strokeDasharray="302"
            strokeDashoffset="302"
            className="drop-shadow-lg"
          >
            <animate 
              attributeName="stroke-dashoffset" 
              values="302;0" 
              dur="0.6s" 
              calcMode="spline" 
              keySplines="0.2 0 0.4 1" 
              fill="freeze" 
            />
            <animate 
              attributeName="fill" 
              values="transparent;#ffffff" 
              begin="0.4s" 
              dur="0.3s" 
              fill="freeze" 
            />
          </circle>
          {/* Green checkmark drawn inside */}
          <path 
            d="M38 56L49 67L74 42" 
            stroke="#12B76A" 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeDasharray="60" 
            strokeDashoffset="60"
          >
            <animate 
              attributeName="stroke-dashoffset" 
              values="60;0" 
              begin="0.4s" 
              dur="0.4s" 
              calcMode="spline"
              keySplines="0.2 0 0.4 1"
              fill="freeze" 
            />
          </path>
        </svg>
      </div>
    </div>
  );
}
