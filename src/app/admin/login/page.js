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
    <div className="min-h-screen flex items-center justify-center bg-[#E5E5E5] p-4 font-jost">
      <div className="w-full max-w-[1200px] bg-white rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-2xl h-[800px] max-h-[90vh]">
        
        {/* Left Side - Graphic & Text */}
        <div className="hidden md:flex w-full md:w-[45%] relative bg-navy group overflow-hidden">
          <Image 
            src="/login-image.jpg" 
            alt="Student" 
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          
          {/* Glassmorphic Overlay at bottom */}
          <div className="absolute bottom-0 left-0 w-full p-10 bg-black/30 backdrop-blur-md border-t border-white/20 text-white transform transition-transform duration-500 ease-in-out">
            <h2 className="text-[28px] font-bold leading-tight mb-3 drop-shadow-md">
              Nurturing Character, <br /> Raising Change-Makers
            </h2>
            <p className="text-[14px] text-white/90 leading-relaxed font-medium drop-shadow-sm max-w-[90%]">
              Streamlining the school's administrative workflow with intuitive digital tools, so educators can focus on what matters most.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-[55%] bg-white relative z-20 flex flex-col justify-between p-10 sm:p-16">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/igws.png" alt="iGenius Kids World" width={40} height={40} className="rounded-md" />
              <span className="font-bold text-navy text-xl">iGenius Kids World</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="max-w-[420px] w-full mx-auto my-auto">
            <h2 className="text-[40px] font-medium text-navy mb-10 tracking-tight">Sign In</h2>
            
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="relative">
                <input 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full p-4 pl-5 rounded-full border border-custom-border text-[15px] focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all placeholder:text-muted"
                  required
                />
              </div>
              
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full p-4 pl-5 pr-12 rounded-full border border-custom-border text-[15px] focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all placeholder:text-muted"
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

              <div className="flex items-center justify-between pl-2">
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
                className="w-full p-4 mt-4 bg-navy text-white rounded-full text-[15px] font-bold hover:bg-navy/90 transition-colors disabled:opacity-70"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center text-[12px] text-muted">
            <p>© {new Date().getFullYear()} iGenius Kids World.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
