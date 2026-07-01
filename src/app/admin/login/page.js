'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from './actions';
import { EyeOff, Eye } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginAction(username, password, rememberMe);
      if (res.success) {
        router.push('/admin');
      } else {
        setError(res.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-off-white p-4 sm:p-8 font-sans">
      <div className="login-card-container w-full bg-white border border-[#E4E8F6] rounded-[32px] p-3 shadow-2xl gap-4">
        
        {/* Left Side - Form */}
        <div className="flex flex-col p-4 sm:p-8 lg:px-12 relative h-full justify-center bg-white rounded-[28px]">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-navy/10 text-navy shadow-inner shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            <span className="font-bold text-navy text-xl tracking-tight">FormFlow</span>
          </div>

          {/* Form Content */}
          <div className="w-full max-w-[440px] mx-auto">
            <h2 className="text-[36px] font-bold text-navy mb-8 tracking-tight font-serif" style={{ fontFamily: 'var(--font-playfair-display), serif', letterSpacing: '-0.02em' }}>Sign In</h2>
            
            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-navy ml-2">Username</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full p-4 pl-5 rounded-full border border-custom-border bg-white text-custom-text text-[15px] focus:border-purple focus:ring-1 focus:ring-purple outline-none transition-all placeholder:text-muted/50"
                    required
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-navy ml-2">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full p-4 pl-5 pr-12 rounded-full border border-custom-border bg-white text-custom-text text-[15px] focus:border-purple focus:ring-1 focus:ring-purple outline-none transition-all placeholder:text-muted/50"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-navy transition-colors"
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pl-2 mt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-custom-border text-navy focus:ring-navy transition-colors cursor-pointer accent-navy"
                  />
                  <span className="text-[13px] font-semibold text-muted group-hover:text-navy transition-colors">Remember me</span>
                </label>
              </div>
              
              {error && <p className="text-[13px] text-red-500 px-2 font-semibold">{error}</p>}
              
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full p-4 mt-2 bg-navy text-white rounded-full text-[15px] font-bold hover:bg-purple transition-all duration-350 disabled:opacity-70 shadow-md hover:shadow-lg"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-[12px] text-muted">
            <p>© {new Date().getFullYear()} FormFlow. All rights reserved.</p>
          </div>

        </div>

        {/* Right Side - Graphic & Text (Hidden on mobile) */}
        <div className="login-graphic-panel w-full h-full min-h-[400px] lg:min-h-[600px] relative rounded-[28px] overflow-hidden flex-col justify-end bg-gradient-to-br from-[#1A1F6B] via-[#6B2FA0] to-[#7C3DB5]">
          <img 
            src="/child.jpg" 
            alt="Student" 
            fetchPriority="high"
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-85 transition-all duration-500 hover:scale-[1.02]"
          />
          {/* Subtle gradient overlay to blend image into the bottom text area */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f6b]/95 via-[#1a1f6b]/40 to-transparent z-10" />
          
          {/* Glassmorphic Overlay at bottom */}
          <div className="relative z-20 w-full p-8 bg-black/30 backdrop-blur-md text-white border-t border-white/10">
            <h2 className="text-[26px] font-bold leading-tight mb-3 drop-shadow-md font-serif text-white" style={{ fontFamily: 'var(--font-playfair-display), serif', letterSpacing: '-0.01em' }}>
              Build Beautiful Forms, <br /> Capture Seamless Data.
            </h2>
            <p className="text-[14px] text-white/90 leading-relaxed font-medium drop-shadow-sm">
              Dynamic, multi-step forms built for modern workflows.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
