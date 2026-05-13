"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import errorAnimationData from "../../ui/error.json";

// Dynamically import Lottie with SSR disabled to prevent hydration errors
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface ErrorToastModalProps {
  message: string;
  onClose: () => void;
}

export function ErrorToastModal({ message, onClose }: ErrorToastModalProps) {
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(1.6);
    }
    const timer = setTimeout(() => {
      onClose();
    }, 1600);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200 font-sans cursor-pointer"
    >
      <div className="relative w-56 h-56 flex items-center justify-center animate-in zoom-in-95 duration-200 pointer-events-none">
        <Lottie 
          lottieRef={lottieRef}
          animationData={errorAnimationData} 
          loop={false} 
          onDOMLoaded={() => lottieRef.current?.setSpeed(1.6)}
          className="w-full h-full"
        />
      </div>
      <div className="mt-4 text-white font-bold text-[18px] tracking-wide text-center max-w-md drop-shadow-md animate-in fade-in duration-300 pointer-events-none">
        {message}
      </div>
    </div>
  );
}
