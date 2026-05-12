"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import successAnimationData from "./success.json";

// Dynamically import Lottie with SSR disabled to prevent hydration errors
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

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
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/30 backdrop-blur-md animate-in fade-in duration-300 font-sans">
      <div className="relative w-56 h-56 flex items-center justify-center animate-in zoom-in-95 duration-300 pointer-events-none">
        <Lottie 
          animationData={successAnimationData} 
          loop={false} 
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
