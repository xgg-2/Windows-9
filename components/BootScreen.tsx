import React, { useEffect, useState } from 'react';

const BootScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer1 = setTimeout(() => {
        setOpacity(0);
    }, 2500);

    const timer2 = setTimeout(() => {
        onComplete();
    }, 3300); // Wait for transition

    return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
    };
  }, [onComplete]);

  if (opacity === 0) return null;

  return (
    <div
        className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center transition-opacity duration-700 ease-out"
        style={{ opacity }}
    >
      <div className="mb-12 relative animate-pulse">
        <i className="fab fa-windows text-[80px] text-[#00a4ef]"></i>
      </div>
      
      <div className="w-10 h-10 border-4 border-transparent border-t-[#00a4ef] border-r-[#00a4ef] rounded-full animate-spin"></div>
      
      <div className="mt-8 font-light text-gray-400 text-sm tracking-wider">
        Starting Windows 9
      </div>
    </div>
  );
};

export default BootScreen;
