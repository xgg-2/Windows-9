import React, { useState, useEffect } from 'react';
import { useOS } from '../context/OSContext';

interface LockScreenProps {
  onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const { systemSettings } = useOS();
  const [time, setTime] = useState(new Date());
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUnlock = (e?: React.FormEvent) => {
    e?.preventDefault();
    // For now, no password required or just click
    onUnlock();
  };

  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div 
      className="fixed inset-0 z-[10000] bg-cover bg-center flex flex-col items-center justify-between p-12 text-white select-none transition-all duration-700 animate-popIn"
      style={{ backgroundImage: `url(https://images.unsplash.com/photo-1519501025264-658c15403220?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)` }}
      onClick={() => !isLoggingIn && setIsLoggingIn(true)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          if (!isLoggingIn) setIsLoggingIn(true);
        }
      }}
      tabIndex={0}
    >
      <div className={`flex flex-col items-start transition-all duration-500 ${isLoggingIn ? 'opacity-0 -translate-y-10' : 'opacity-100'}`}>
        <div className="text-8xl font-light tracking-tighter mb-2">{timeString}</div>
        <div className="text-2xl font-medium opacity-90">{dateString}</div>
      </div>

      {isLoggingIn ? (
        <div className="flex flex-col items-center animate-slide-up bg-black/20 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
          <div className="w-24 h-24 rounded-full bg-gray-400/50 mb-6 flex items-center justify-center overflow-hidden border-2 border-white/20">
             <i className="fas fa-user text-4xl text-white"></i>
          </div>
          <h2 className="text-2xl font-semibold mb-6">{systemSettings.userName || 'Admin'}</h2>
          
          <form onSubmit={handleUnlock} className="flex flex-col items-center gap-4">
             <div className="relative group">
                <input 
                  autoFocus
                  type="password"
                  placeholder="Password"
                  className="bg-white/10 border border-white/20 rounded-md px-4 py-2 w-64 focus:bg-white/20 outline-none transition-all placeholder:text-white/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded transition">
                  <i className="fas fa-arrow-right"></i>
                </button>
             </div>
             <button 
                type="button" 
                onClick={handleUnlock}
                className="text-sm opacity-60 hover:opacity-100 transition mt-2"
             >
                Sign in
             </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 animate-pulse mb-8">
           <div className="text-sm uppercase tracking-[0.3em]">Click or press space to unlock</div>
        </div>
      )}

      {/* Network/Battery Indicators (Lock Screen Style) */}
      <div className="absolute bottom-12 right-12 flex gap-4 text-xl opacity-80">
         <i className="fas fa-wifi"></i>
         <i className="fas fa-battery-full"></i>
      </div>
    </div>
  );
};

export default LockScreen;
