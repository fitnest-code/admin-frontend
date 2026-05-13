"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import successAnimationData from "./success.json";
import errorAnimationData from "./error.json";

// Dynamically import Lottie with SSR disabled to prevent hydration errors
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  type?: "success" | "error";
}

export function SuccessAnimationModal({ isOpen, onClose, message, type = "success" }: SuccessModalProps) {
  const [mounted, setMounted] = useState(false);
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (lottieRef.current) {
        lottieRef.current.setSpeed(2.2);
      }
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const animationData = type === "success" ? successAnimationData : errorAnimationData;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/30 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative flex flex-col items-center justify-center animate-in zoom-in-95 duration-200 pointer-events-none gap-3 max-w-[320px] mx-4 text-center">
        <div className="w-56 h-56 flex items-center justify-center">
          <Lottie 
            lottieRef={lottieRef}
            animationData={animationData} 
            loop={false} 
            onDOMLoaded={() => lottieRef.current?.setSpeed(2.2)}
            className="w-full h-full"
          />
        </div>
        {message && (
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-black font-medium text-base shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
            {message}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
