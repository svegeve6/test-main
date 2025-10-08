import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Check, User, Phone, Lock } from 'lucide-react';
import startupSound from './startup.mp3';

const LoginPage = () => {
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('admin'); // 'admin' or 'caller'
  const [isIconAnimating, setIsIconAnimating] = useState(false);
  const { login } = useAuth();
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
      // Add mode prefix to distinguish between admin and caller login
      const loginKey = loginMode === 'caller' ? `caller_${accessKey}` : accessKey;
      await login(loginKey);
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

  const toggleLoginMode = () => {
    setIsIconAnimating(true);
    setTimeout(() => {
      setLoginMode(prev => prev === 'admin' ? 'caller' : 'admin');
      setIsIconAnimating(false);
    }, 150);
    setError('');
    setAccessKey('');
  };

  return (
    <div className="fixed inset-0 bg-[#0F1117] flex items-center justify-center px-4 overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />

      <div className={`
        w-full max-w-md transform transition-all duration-500
        ${isShaking ? 'animate-shake' : ''}
        ${isSuccess ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}
      `}>
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-blue-500/10 rounded-xl blur-2xl transition-all duration-300 group-hover:bg-blue-500/20" />

          <div className={`
            relative rounded-xl border border-gray-800/50 p-8
            transition-all duration-500 shadow-2xl
            bg-[#161A22]
            ${isSuccess ? 'translate-y-10' : 'translate-y-0'}
          `}>
            {/* Success overlay */}
            <div className={`
              absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center
              transition-all duration-300 pointer-events-none
              ${isSuccess ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
            `}>
              <Check className="w-16 h-16 text-white drop-shadow-lg" />
            </div>

            {/* Form content */}
            <div className={`transition-opacity duration-300 ${isSuccess ? 'opacity-0' : 'opacity-100'}`}>
              <div className="text-center mb-8">
                {/* Interactive Icon */}
                <button
                  onClick={toggleLoginMode}
                  className="group inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mb-4 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30"
                  type="button"
                >
                  <div className={`transition-all duration-300 ${isIconAnimating ? 'rotate-180 scale-0' : 'rotate-0 scale-100'}`}>
                    {loginMode === 'admin' ? (
                      <User className="w-10 h-10 text-white" />
                    ) : (
                      <Phone className="w-10 h-10 text-white" />
                    )}
                  </div>
                </button>

                <h2 className="text-3xl font-bold text-white mb-2">
                  FishTank
                </h2>

                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
                  <span className="text-xs font-medium text-blue-400">
                    {loginMode === 'admin' ? 'ADMIN' : 'CALLER'} LOGIN
                  </span>
                </div>

                <p className="mt-3 text-sm text-gray-500">
                  {loginMode === 'admin'
                    ? 'Access the admin dashboard'
                    : 'Login as a caller'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className={`
                    relative rounded-lg border
                    transition-all duration-300
                    ${error
                      ? 'border-red-500/50 bg-red-500/5'
                      : 'border-gray-800/50 bg-[#1C2029] hover:border-gray-700'}
                    ${isLoading ? 'opacity-50' : ''}
                  `}>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Lock className="w-5 h-5 text-gray-500" />
                    </div>
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
                        block w-full pl-11 pr-4 py-3 rounded-lg
                        bg-transparent text-white font-medium
                        placeholder-gray-600
                        focus:outline-none focus:ring-2 focus:ring-blue-500/20
                      "
                      placeholder={loginMode === 'admin' ? 'Enter Admin Key' : 'Enter Caller Key'}
                      disabled={isLoading || isSuccess}
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="mt-2 flex items-center text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {error}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogin}
                  type="button"
                  className={`
                    w-full py-3 px-4 rounded-lg
                    ${loginMode === 'admin'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500'
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500'
                    }
                    text-white font-semibold
                    transition-all duration-300 shadow-lg hover:shadow-xl
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20
                    disabled:opacity-50 disabled:cursor-not-allowed
                    active:scale-[0.98]
                  `}
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? 'Verifying...' : `Login as ${loginMode === 'admin' ? 'Admin' : 'Caller'}`}
                </button>
              </form>

              {/* Mode toggle hint */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Click the icon above to switch between Admin and Caller login
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
