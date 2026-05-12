"use client";

import { AlertCircle } from "lucide-react";

interface ErrorToastModalProps {
  message: string;
  onClose: () => void;
}

export function ErrorToastModal({ message, onClose }: ErrorToastModalProps) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[420px] rounded-[20px] bg-white p-8 shadow-2xl flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-200 border border-red-100 font-sans">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center animate-pulse">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
        </div>
        
        <h3 className="text-[20px] font-bold text-gray-900 leading-[28px]">Xəta baş verdi</h3>
        <p className="text-[15px] text-gray-600 font-medium leading-[22px]">
          {message}
        </p>

        <button
          onClick={onClose}
          className="mt-2 w-full h-12 rounded-[12px] bg-[#00b4cc] text-white font-bold text-[15px] hover:opacity-90 transition-opacity shadow-md shadow-cyan-100"
        >
          Bağla
        </button>
      </div>
    </div>
  );
}
