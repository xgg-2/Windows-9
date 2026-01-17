import React, { useState } from 'react';
import { OSProvider } from './context/OSContext';
import Desktop from './components/Desktop';
import BootScreen from './components/BootScreen';

const App: React.FC = () => {
  const [isBooted, setIsBooted] = useState(false);

  return (
    <OSProvider>
      <div className="w-full h-full text-sm antialiased text-gray-900">
        {!isBooted && <BootScreen onComplete={() => setIsBooted(true)} />}
        {/* Render Desktop behind boot screen to pre-load images essentially, or just conditionally render */}
        <Desktop />
      </div>
      
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-popIn {
            animation: popIn 0.1s ease-out;
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-up {
            animation: slide-up 0.2s cubic-bezier(0.1, 0.9, 0.2, 1);
        }
        .text-shadow-sm {
            text-shadow: 0 1px 2px rgba(0,0,0,0.8);
        }
        /* Custom scrollbar for menu */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.2);
            border-radius: 4px;
            border: 2px solid transparent;
            background-clip: padding-box;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(0,0,0,0.3);
            background-clip: padding-box;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        .dark ::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.2);
            background-clip: padding-box;
        }
        .dark ::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.3);
            background-clip: padding-box;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </OSProvider>
  );
};

export default App;
