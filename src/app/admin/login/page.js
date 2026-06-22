'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2b3a55] to-[#1e293b] p-4 sm:p-8 font-jost">
      <div className="w-full max-w-[1100px] bg-white rounded-[40px] p-2 sm:p-3 flex flex-col md:flex-row shadow-2xl min-h-[700px]">
        
        {/* Left Side - Form (Now on the left) */}
        <div className="w-full md:w-[55%] flex flex-col p-8 sm:p-12 lg:px-20 relative">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-10">
            <Image src="/igws.png" alt="iGenius Kids World" width={36} height={36} className="rounded-md" />
            <span className="font-bold text-navy text-xl">iGenius Kids World</span>
          </div>

          {/* Form Content */}
          <div className="w-full flex-grow flex flex-col justify-center">
            <h2 className="text-[36px] font-medium text-navy mb-8 tracking-tight">Sign In</h2>
            
            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-navy ml-2">Username</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full p-4 pl-5 rounded-full border border-custom-border text-[15px] focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all placeholder:text-muted/60"
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
                    className="w-full p-4 pl-5 pr-12 rounded-full border border-custom-border text-[15px] focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all placeholder:text-muted/60"
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
                    className="w-4 h-4 rounded border-custom-border text-navy focus:ring-navy transition-colors cursor-pointer"
                  />
                  <span className="text-[13px] font-medium text-muted group-hover:text-navy transition-colors">Remember me</span>
                </label>
              </div>
              
              {error && <p className="text-[13px] text-error px-2">{error}</p>}
              
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full p-4 mt-2 bg-navy text-white rounded-full text-[15px] font-bold hover:bg-navy/90 transition-colors disabled:opacity-70 shadow-md hover:shadow-lg"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-[12px] text-muted">
            <p>© {new Date().getFullYear()} iGenius Kids World. All rights reserved.</p>
          </div>

        </div>

        {/* Right Side - Graphic & Text (Now on the right) */}
        <div className="hidden md:flex w-full md:w-[45%] min-h-[600px] relative bg-navy rounded-[32px] overflow-hidden shrink-0 flex-col justify-end">
          <img 
            src="/child.jpg" 
            alt="Student" 
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          
          {/* Glassmorphic Overlay at bottom */}
          <div className="relative z-10 w-full p-8 bg-black/40 backdrop-blur-md text-white border-t border-white/20">
            <h2 className="text-[26px] font-bold leading-tight mb-3 drop-shadow-md">
              Nurturing Character, <br /> Raising Change-Makers
            </h2>
            <p className="text-[14px] text-white/90 leading-relaxed font-medium drop-shadow-sm">
              Streamlining the school's administrative workflow with intuitive digital tools.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
