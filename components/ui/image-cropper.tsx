"use client";

import { useState, useRef, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { createPortal } from "react-dom";

interface ImageCropperProps {
  imageSrc: string;
  onCrop: (croppedFile: File) => void;
  onCancel: () => void;
  aspectRatio?: number; // width / height
  circular?: boolean;
}

export function ImageCropper({
  imageSrc,
  onCrop,
  onCancel,
  aspectRatio = 1,
  circular = true,
}: ImageCropperProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const C = 280; // Viewport viewport width & height
  const viewportWidth = C;
  const viewportHeight = C / aspectRatio;

  useEffect(() => {
    if (imageRef.current && imageLoaded) {
      const img = imageRef.current;
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      // Calculate base dimensions to cover viewport
      let baseWidth = viewportWidth;
      let baseHeight = viewportHeight;

      const imgAspect = w / h;
      const viewAspect = viewportWidth / viewportHeight;

      if (imgAspect > viewAspect) {
        // Image is wider, match height
        baseHeight = viewportHeight;
        baseWidth = viewportHeight * imgAspect;
      } else {
        // Image is taller, match width
        baseWidth = viewportWidth;
        baseHeight = viewportWidth / imgAspect;
      }

      setDimensions({ width: baseWidth, height: baseHeight });
      setPosition({ x: 0, y: 0 });
      setZoom(1);
    }
  }, [imageLoaded, imageSrc]);

  // Constraints for panning
  const getMaxOffset = () => {
    const w = dimensions.width * zoom;
    const h = dimensions.height * zoom;
    const maxX = Math.max(0, (w - viewportWidth) / 2);
    const maxY = Math.max(0, (h - viewportHeight) / 2);
    return { maxX, maxY };
  };

  const handleMouseDown = (e: ReactMouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;

    const { maxX, maxY } = getMaxOffset();
    setPosition({
      x: Math.min(maxX, Math.max(-maxX, newX)),
      y: Math.min(maxY, Math.max(-maxY, newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, position, dimensions, zoom]);

  // Touch Support
  const handleTouchStart = (e: ReactTouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y,
    };
  };

  const handleTouchMove = (e: ReactTouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const newX = e.touches[0].clientX - dragStart.current.x;
    const newY = e.touches[0].clientY - dragStart.current.y;

    const { maxX, maxY } = getMaxOffset();
    setPosition({
      x: Math.min(maxX, Math.max(-maxX, newX)),
      y: Math.min(maxY, Math.max(-maxY, newY)),
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleCropSave = () => {
    if (!imageRef.current) return;
    const img = imageRef.current;

    // Create high-res canvas (500x500 for crisp results)
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500 / aspectRatio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Scale translation values from viewport scale to canvas scale
    const scaleFactor = canvas.width / viewportWidth;
    const dw = dimensions.width * zoom * scaleFactor;
    const dh = dimensions.height * zoom * scaleFactor;
    const dx = (canvas.width - dw) / 2 + position.x * scaleFactor;
    const dy = (canvas.height - dh) / 2 + position.y * scaleFactor;

    // Clear and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, dx, dy, dw, dh);

    // Convert canvas to blob/file
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "trainer-cropped.png", { type: "image/png" });
          onCrop(file);
        }
      },
      "image/png",
      0.95
    );
  };

  return createPortal(
    <div className="fixed top-0 left-0 w-full h-full z-[10000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-300">
      <div className="w-full max-w-[420px] rounded-2xl bg-white border border-[#ececed] shadow-2xl flex flex-col p-6 gap-5 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ececed] pb-2">
          <span className="text-[16px] font-semibold text-[#101828]">Şəkli kəsin</span>
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
            <X size={18} className="text-[#6a7282]" />
          </button>
        </div>

        {/* Viewport Box */}
        <div className="w-full flex items-center justify-center bg-slate-900 rounded-xl py-6 overflow-hidden relative select-none">
          <div
            style={{ width: `${viewportWidth}px`, height: `${viewportHeight}px` }}
            className={`relative overflow-hidden cursor-grab active:cursor-grabbing ${
              circular ? "rounded-full" : "rounded-lg"
            } border-2 border-white/80 shadow-[0_0_0_9999px_rgba(15,23,42,0.65)]`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="To Crop"
              onLoad={() => setImageLoaded(true)}
              style={{
                width: `${dimensions.width * zoom}px`,
                height: `${dimensions.height * zoom}px`,
                transform: `translate(${position.x}px, ${position.y}px)`,
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: `-${(dimensions.height * zoom) / 2}px`,
                marginLeft: `-${(dimensions.width * zoom) / 2}px`,
                maxWidth: "none",
              }}
              draggable={false}
              className="select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Zoom Slider */}
        <div className="flex items-center gap-3 w-full px-2">
          <ZoomOut size={16} className="text-slate-400" />
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(e) => {
              const newZoom = parseFloat(e.target.value);
              setZoom(newZoom);
              // Adjust position bounds with new zoom
              const w = dimensions.width * newZoom;
              const h = dimensions.height * newZoom;
              const maxX = Math.max(0, (w - viewportWidth) / 2);
              const maxY = Math.max(0, (h - viewportHeight) / 2);
              setPosition((prev) => ({
                x: Math.min(maxX, Math.max(-maxX, prev.x)),
                y: Math.min(maxY, Math.max(-maxY, prev.y)),
              }));
            }}
            className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00B4CC]"
          />
          <ZoomIn size={16} className="text-slate-400" />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 mt-2 border-t border-[#ececed] pt-4">
          <button
            onClick={onCancel}
            className="h-[36px] px-5 rounded-lg border border-[#ececed] text-[#101828] text-[13px] font-medium hover:bg-slate-50 transition-colors"
          >
            İmtina
          </button>
          <button
            onClick={handleCropSave}
            className="h-[36px] px-5 rounded-lg bg-[#00B4CC] text-white text-[13px] font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            Kəs və Yadda Saxla
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
