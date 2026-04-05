'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity animate-in fade-in duration-200" onClick={handleOutsideClick}>
      <div 
        ref={modalRef}
        className={cn(
          "relative w-full max-w-lg rounded-xl bg-card p-6 shadow-2xl border border-border animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]",
          className
        )}
      >
        <div className="mb-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
