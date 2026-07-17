"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  type?: "success" | "error";
}

export function SuccessAnimationModal({ isOpen, onClose, message, type = "success" }: SuccessModalProps) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShow(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const isSuccess = type === "success";
  const title = isSuccess ? "Uğurlu!" : "Xəta!";

  return createPortal(
    <div 
      className={`fixed inset-0 z-[999999] flex items-center justify-center p-4 transition-opacity duration-300 font-sans ${show ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={`relative w-full max-w-sm transform rounded-3xl bg-white p-8 shadow-2xl transition-all duration-500 ease-out ${show ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}
      >
        <div className="flex flex-col items-center text-center">
          {/* Animated Icon */}
          <div className="relative mb-6">
            {isSuccess ? (
              <>
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
              </>
            ) : (
              <>
                <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                    <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-200">
                      <X className="h-7 w-7 text-white stroke-[3] animate-bounce" />
                    </div>
                  </div>
                </div>
                {/* Error particles */}
                <div className="absolute -top-2 -right-2 h-3 w-3 rounded-full bg-orange-400 animate-ping" />
                <div className="absolute top-10 -left-4 h-2 w-2 rounded-full bg-red-400 animate-ping [animation-delay:0.2s]" />
                <div className="absolute -bottom-2 right-10 h-2.5 w-2.5 rounded-full bg-pink-400 animate-ping [animation-delay:0.4s]" />
              </>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {message}
          </p>

          <button
            onClick={onClose}
            className={`w-full py-4 rounded-2xl text-white font-bold text-sm transition shadow-lg active:scale-95 ${
              isSuccess 
                ? 'bg-[#00B4D8] hover:bg-[#0096B4] shadow-cyan-100' 
                : 'bg-red-500 hover:bg-red-600 shadow-red-100'
            }`}
          >
            Tamam
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
