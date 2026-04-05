'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PopconfirmProps {
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  children: React.ReactElement;
  okText?: string;
  cancelText?: string;
  disabled?: boolean;
}

export const Popconfirm: React.FC<PopconfirmProps> = ({
  title,
  description,
  onConfirm,
  onCancel,
  children,
  okText = 'Confirm',
  cancelText = 'Cancel',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [placement, setPlacement] = useState<'top' | 'bottom'>('top');
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const PADDING = 12;
      const POPOVER_HEIGHT = 160; // Estimated max height
      
      const spaceAbove = rect.top;
      const showBelow = spaceAbove < POPOVER_HEIGHT;
      
      setPlacement(showBelow ? 'bottom' : 'top');
      setCoords({
        top: showBelow ? rect.bottom + PADDING : rect.top - PADDING,
        left: rect.right, // Align right by default
        width: rect.width
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      
      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
          popoverRef.current && !popoverRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, updatePosition]);

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    onConfirm();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    if (onCancel) onCancel();
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  // Popover Content Portal JSX
  const popoverContent = isOpen && typeof document !== 'undefined' ? createPortal(
    <div 
      ref={popoverRef}
      className={cn(
        "fixed z-[9999] w-72 animate-in fade-in duration-200 shadow-2xl transition-all",
        placement === 'top' ? "zoom-in-95 origin-bottom" : "zoom-in-95 origin-top"
      )}
      style={{
        top: coords.top,
        left: coords.left,
        transform: placement === 'top' ? 'translate(-100%, -100%)' : 'translate(-100%, 0)'
      }}
    >
      <div className="bg-card border border-border rounded-2xl p-4 shadow-2xl relative">
        <div className="flex gap-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-4 w-4 text-red-600 animate-pulse" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-foreground leading-tight">{title}</span>
            {description && <p className="text-[11px] text-muted-foreground leading-snug">{description}</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-2 justify-end pt-3 border-t border-border/50">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted rounded-lg transition-colors"
            type="button"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-md shadow-red-100 dark:shadow-none active:scale-95"
            type="button"
          >
            {okText}
          </button>
        </div>
        
        {/* Arrow Component */}
        <div 
          className={cn(
            "absolute w-3 h-3 bg-card border rotate-45",
            placement === 'top' 
              ? "bottom-[-6px] right-6 border-r border-b border-border" 
              : "top-[-6px] right-6 border-l border-t border-border"
          )}
        />
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative inline-block" ref={triggerRef}>
      {React.cloneElement(children as React.ReactElement<any>, {
        onClick: (e: React.MouseEvent) => {
          const childProps = (children as React.ReactElement<any>).props;
          if (childProps && childProps.onClick) childProps.onClick(e);
          toggleOpen(e);
        }
      })}
      {popoverContent}
    </div>
  );
};
