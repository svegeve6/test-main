import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Check, Fish, Waves } from 'lucide-react';
import AnimatedFish from '../components/AnimatedFish';
import startupSound from './startup.mp3';

const LoginPage = () => {
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(new Audio(startupSound));

  useEffect(() => {
    audioRef.current.preload = 'auto';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin();
  };

  const handleLogin = async () => {
    if (!accessKey.trim() || isLoading || isSuccess) return;
    
    setError('');
    setIsLoading(true);

    try {
      await login(accessKey);
      setIsSuccess(true);
      audioRef.current.play().catch(err => console.error('Audio play error:', err));
      if (window.navigator.vibrate) {
        window.navigator.vibrate([10, 30, 10]);
      }
    } catch (err) {
      setError(err.message);
      setIsShaking(true);
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4 overflow-hidden">
      {/* Animated fish background */}
      <AnimatedFish />
      
      {/* Water gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-cyan-500/10 to-transparent" />
      
      {/* Animated waves */}
      <div className="absolute bottom-0 left-0 right-0 h-32">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent animate-pulse" />
      </div>
      
      <div className={`
        w-full max-w-md transform transition-all duration-500
        ${isShaking ? 'animate-shake' : ''}
        ${isSuccess ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}
      `}>
        <div className="relative group">
          <div className="absolute inset-0 bg-cyan-400/10 rounded-2xl blur-xl transition-all duration-300 group-hover:bg-cyan-400/20" />
          <div className={`
            relative backdrop-blur-xl rounded-2xl border border-cyan-400/30 p-8
            transition-all duration-500 shadow-2xl
            bg-gradient-to-br from-white/10 to-white/5
            ${isSuccess ? 'translate-y-10' : 'translate-y-0'}
          `}>
            {/* Success overlay */}
            <div className={`
              absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center
              transition-all duration-300 pointer-events-none
              ${isSuccess ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
            `}>
              <Check className="w-16 h-16 text-white drop-shadow-lg" />
            </div>

            {/* Form content */}
            <div className={`transition-opacity duration-300 ${isSuccess ? 'opacity-0' : 'opacity-100'}`}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 mb-4 border-2 border-cyan-400/30 backdrop-blur-xl">
                  <Fish className="w-10 h-10 text-cyan-400 animate-pulse" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-wider drop-shadow-lg">
                  FishTank
                </h2>
                <div className="flex items-center justify-center gap-2 text-cyan-300/80 text-sm">
                  <Waves className="w-4 h-4" />
                  <p className="font-medium">Dive into your admin panel</p>
                  <Waves className="w-4 h-4" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className={`
                    relative rounded-xl border-2 backdrop-blur-xl
                    transition-all duration-300 
                    ${error ? 'border-red-400/50 bg-red-400/10' : 'border-cyan-400/30 bg-white/5'}
                    ${isLoading ? 'opacity-50' : ''}
                  `}>
                    <input
                      type="password"
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleLogin();
                        }
                      }}
                      className="
                        block w-full px-4 py-3 rounded-xl
                        bg-transparent text-white font-medium
                        placeholder-cyan-300/40
                        focus:outline-none
                      "
                      placeholder="Enter Access Key"
                      disabled={isLoading || isSuccess}
                    />
                  </div>
                  {error && (
                    <div className="mt-2 flex items-center text-red-500 text-sm font-mono">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {error}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogin}
                  type="button"
                  className={`
                    w-full py-3 px-4 rounded-xl
                    bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold
                    transition-all duration-300 shadow-lg
                    hover:from-cyan-400 hover:to-blue-500 hover:shadow-xl cursor-pointer
                    focus:outline-none focus:ring-4 focus:ring-cyan-400/30
                    disabled:opacity-50 disabled:cursor-not-allowed
                    active:scale-[0.98] tracking-wide
                  `}
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? 'Verifying...' : 'Dive In'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;