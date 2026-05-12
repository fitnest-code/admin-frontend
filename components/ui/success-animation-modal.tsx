"use client";

import React, { useEffect, useRef } from "react";
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
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      if (lottieRef.current) {
        lottieRef.current.setSpeed(1.6);
      }
      const timer = setTimeout(() => {
        onClose();
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/30 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-56 h-56 flex items-center justify-center animate-in zoom-in-95 duration-200 pointer-events-none">
        <Lottie 
          lottieRef={lottieRef}
          animationData={successAnimationData} 
          loop={false} 
          onDOMLoaded={() => lottieRef.current?.setSpeed(1.6)}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
