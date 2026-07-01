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
    <div ref={wrapperRef} className={`relative z-50 ${isLeft ? 'fixed bottom-4 left-4 sm:bottom-6 sm:left-6' : 'inline-block'}`}>
      
      {/* Popover Card */}
      <div 
        className={`absolute bottom-full mb-3 ${isLeft ? 'left-0 origin-bottom-left' : 'left-1/2 -translate-x-1/2 origin-bottom'} w-[280px] bg-white/95 backdrop-blur-xl border border-purple/20 shadow-2xl rounded-2xl p-5 transition-all duration-300 ease-out flex flex-col gap-3 text-left
        ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}`}
      >
        <button onClick={() => setIsOpen(false)} className="absolute top-3 right-3 text-muted hover:text-navy transition-colors p-1 bg-light-gray/50 rounded-full">
          <X size={14} />
        </button>
        
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple tracking-widest uppercase mb-1">
            <Sparkles size={10} className="text-gold" /> Available for hire
          </div>
          <h4 className="text-[16px] font-bold text-navy leading-tight">Padmore Aning Dean</h4>
          <p className="text-[12px] font-semibold text-muted">Full Stack Developer & Product Designer</p>
        </div>
        
        <p className="text-[12.5px] text-custom-text leading-relaxed mt-1">
          Need a custom web application, beautiful SaaS platform, or high-performance website? Let's build something amazing together.
        </p>
        
        <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-[#F1F2F6]">
          <a href="mailto:hello@padmoreaning.com" className="flex items-center gap-2 text-[12px] font-semibold text-navy hover:text-purple transition-colors bg-[#F4F5F7] hover:bg-purple/10 px-3 py-2 rounded-lg">
            <Mail size={14} className="text-purple shrink-0" />
            <span className="truncate">hello@padmoreaning.com</span>
          </a>
          <a href="https://padmoreaning.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[12px] font-semibold text-navy hover:text-purple transition-colors bg-[#F4F5F7] hover:bg-purple/10 px-3 py-2 rounded-lg">
            <Globe size={14} className="text-purple shrink-0" />
            <span className="truncate">padmoreaning.com</span>
          </a>
        </div>
      </div>

      {/* Button */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`text-[10px] sm:text-[11px] font-medium transition-all flex items-center gap-1.5 shadow-sm border backdrop-blur-sm
          ${isLeft 
            ? 'bg-white/70 hover:bg-white text-navy/60 hover:text-navy px-3 py-1.5 rounded-full border-navy/10' 
            : 'bg-[#F4F5F7] hover:bg-[#EAECEF] text-navy/70 hover:text-navy px-4 py-2 rounded-xl border-transparent'
          }`}
      >
        <svg className={`w-3 h-3 ${isOpen ? 'text-purple' : 'text-purple/70'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        Built by <span className="font-bold text-navy/90">Padmore Aning Dean</span>
      </button>
    </div>
  );
}
