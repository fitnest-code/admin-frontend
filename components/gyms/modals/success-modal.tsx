"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";

interface SuccessModalProps {
  onClose: () => void;
  title: string;
  message: string;
}

export function SuccessModal({ onClose, title, message }: SuccessModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-sm transform rounded-3xl bg-white p-8 shadow-2xl transition-all duration-500 ease-out ${show ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}>
        
        <div className="flex flex-col items-center text-center">
          {/* Animated Success Icon */}
          <div className="relative mb-6">
            <div className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
                <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
                  <Check className="h-7 w-7 text-white stroke-[3] animate-bounce" />
                </div>
              </div>
            </div>
            
            {/* Celebration particles (pure CSS) */}
            <div className="absolute -top-2 -right-2 h-3 w-3 rounded-full bg-yellow-400 animate-ping" />
            <div className="absolute top-10 -left-4 h-2 w-2 rounded-full bg-blue-400 animate-ping [animation-delay:0.2s]" />
            <div className="absolute -bottom-2 right-10 h-2.5 w-2.5 rounded-full bg-pink-400 animate-ping [animation-delay:0.4s]" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {message}
          </p>

          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-[#00B4D8] text-white font-bold text-sm 
              hover:bg-[#0096B4] transition shadow-lg shadow-cyan-100 active:scale-95"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}

