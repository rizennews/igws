'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Mail, Globe, X } from 'lucide-react';

export default function CreatorBadge({ position = 'bottom-left' }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLeft = position === 'bottom-left';

  return (
    <div ref={wrapperRef} className={`z-50 ${isLeft ? 'fixed bottom-4 left-4 sm:bottom-6 sm:left-6' : 'relative inline-block'}`}>
      
      {/* Popover Card */}
      <div 
        className={`absolute bottom-full mb-3 ${isLeft ? 'left-0 origin-bottom-left' : 'left-1/2 -translate-x-1/2 origin-bottom'} w-[280px] bg-white/95 backdrop-blur-xl transition-all duration-300 ease-out flex flex-col gap-3 text-left
        ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}`}
        style={{
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid rgba(107, 47, 160, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <button onClick={() => setIsOpen(false)} className="absolute top-3 right-3 text-muted hover:text-navy transition-colors p-1 bg-light-gray/50 rounded-full">
          <X size={14} />
        </button>
        
        <div>
          <h4 className="text-[16px] font-bold text-navy leading-tight">Padmore Aning Dean</h4>
          <p className="text-[12px] font-semibold text-muted mt-0.5">Full Stack Developer & Product Designer</p>
        </div>
        
        <p className="text-[12.5px] text-custom-text leading-relaxed mt-1">
          Need a custom web application, beautiful SaaS platform, or high-performance website? Let's build something amazing together.
        </p>
        
        <div className="flex flex-col mt-2 pt-3 border-t border-[#F1F2F6]" style={{ gap: '6px' }}>
          <a href="mailto:hello@padmoreaning.com" className="flex items-center gap-2.5 text-[13px] font-semibold text-navy hover:text-purple transition-colors bg-transparent hover:bg-purple/5 px-2 py-2 rounded-lg -mx-2">
            <Mail size={15} className="text-purple shrink-0" />
            <span className="truncate">hello@padmoreaning.com</span>
          </a>
          <a href="https://padmoreaning.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-[13px] font-semibold text-navy hover:text-purple transition-colors bg-transparent hover:bg-purple/5 px-2 py-2 rounded-lg -mx-2">
            <Globe size={15} className="text-purple shrink-0" />
            <span className="truncate">padmoreaning.com</span>
          </a>
        </div>
      </div>

      {/* Button */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`font-medium transition-all flex items-center justify-center gap-1.5 backdrop-blur-sm
          ${isLeft 
            ? 'bg-white hover:bg-off-white text-navy/80 hover:text-navy' 
            : 'bg-[#F4F5F7] hover:bg-[#EAECEF] text-navy/70 hover:text-navy'
          }`}
        style={{
          padding: isLeft ? '8px 14px' : '8px 16px',
          borderRadius: isLeft ? '9999px' : '12px',
          border: isLeft ? '1px solid #E4E8F6' : '1px solid transparent',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          fontSize: '11px'
        }}
      >
        <svg className={`w-3 h-3 ${isOpen ? 'text-purple' : 'text-purple/70'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        Built by <span className="font-bold text-navy/90">Padmore Aning Dean</span>
      </button>
    </div>
  );
}
