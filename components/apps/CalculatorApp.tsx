import React, { useState, useEffect } from 'react';

const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState<string[]>([]);
  const [shouldReset, setShouldReset] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleInput = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
      setShouldReset(false);
    } else if (val === 'CE') {
      setDisplay('0');
    } else if (val === '=') {
      try {
        // eslint-disable-next-line no-new-func
        const result = new Function('return ' + display)();
        const entry = `${display} = ${result}`;
        setHistory(prev => [entry, ...prev].slice(0, 20)); // Keep last 20
        setDisplay(String(result));
        setShouldReset(true);
      } catch {
        setDisplay('Error');
        setShouldReset(true);
      }
    } else {
      if (display === '0' || shouldReset) {
        if (['+', '-', '*', '/', '%'].includes(val)) {
            // If starting with operator, keep the previous number
            setDisplay(display + val);
            setShouldReset(false);
            return;
        }
        setDisplay(val);
        setShouldReset(false);
      } else {
        setDisplay(display + val);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const key = e.key;
        if (/[0-9]/.test(key)) handleInput(key);
        if (['+', '-', '*', '/', '.', '%'].includes(key)) handleInput(key);
        if (key === 'Enter') { e.preventDefault(); handleInput('='); }
        if (key === 'Escape') handleInput('C');
        if (key === 'Backspace') handleInput('CE');
    };
    
    // Only listen if this component is mounted (window active check could be added if passed props)
    // For simplicity, we assume if the user is typing, they probably mean this if it's visible. 
    // In a real OS, focus management handles this.
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display, shouldReset]); // Re-bind when state changes to capture correct closure values

  const buttons = [
    { label: 'C', type: 'op' }, { label: 'CE', type: 'op' }, { label: '%', type: 'op' }, { label: '/', type: 'op', val: '/' },
    { label: '7', type: 'num' }, { label: '8', type: 'num' }, { label: '9', type: 'num' }, { label: '×', type: 'op', val: '*' },
    { label: '4', type: 'num' }, { label: '5', type: 'num' }, { label: '6', type: 'num' }, { label: '-', type: 'op', val: '-' },
    { label: '1', type: 'num' }, { label: '2', type: 'num' }, { label: '3', type: 'num' }, { label: '+', type: 'op', val: '+' },
    { label: '0', type: 'num', wide: true }, { label: '.', type: 'num' }, { label: '=', type: 'eq', val: '=' },
  ];

  return (
    <div className="flex h-full bg-[#f3f3f3] select-none" tabIndex={0}>
        {/* Main Calc */}
        <div className="flex flex-col flex-1">
            <div className="flex justify-between p-2">
                 <span className="font-bold text-gray-700 text-sm">Standard</span>
                 <i 
                    className={`fas fa-history cursor-pointer p-1 rounded hover:bg-gray-300 ${showHistory ? 'text-blue-500' : 'text-gray-500'}`}
                    onClick={() => setShowHistory(!showHistory)}
                 ></i>
            </div>
            <div className="p-4 text-right text-4xl font-semibold mb-1 truncate text-gray-800 h-24 flex items-end justify-end break-all">
                {display}
            </div>
            <div className="grid grid-cols-4 gap-[2px] p-[2px] flex-1 bg-[#f3f3f3]">
                {buttons.map((btn, idx) => (
                <button
                    key={idx}
                    className={`
                    ${btn.wide ? 'col-span-2' : ''}
                    ${btn.type === 'op' ? 'bg-[#f9f9f9] text-gray-600 hover:bg-gray-200' : ''}
                    ${btn.type === 'num' ? 'bg-white font-bold hover:bg-gray-100' : ''}
                    ${btn.type === 'eq' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                    text-lg transition active:bg-opacity-80 rounded-sm
                    `}
                    onClick={() => handleInput(btn.val || btn.label)}
                >
                    {btn.label}
                </button>
                ))}
            </div>
        </div>

        {/* History Tape */}
        {showHistory && (
            <div className="w-48 border-l bg-[#f3f3f3] flex flex-col p-4 animate-slide-up">
                <div className="font-bold text-gray-700 mb-2">History</div>
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                    {history.length === 0 && <span className="text-gray-400 text-sm">No history yet</span>}
                    {history.map((h, i) => (
                        <div key={i} className="flex flex-col text-right hover:bg-gray-200 p-1 rounded cursor-pointer">
                            <span className="text-gray-500 text-xs">{h.split('=')[0]} =</span>
                            <span className="text-gray-800 font-bold text-lg">{h.split('=')[1]}</span>
                        </div>
                    ))}
                </div>
                {history.length > 0 && (
                    <button onClick={() => setHistory([])} className="mt-2 text-right text-red-500 text-xs hover:underline"><i className="fas fa-trash"></i> Clear</button>
                )}
            </div>
        )}
    </div>
  );
};

export default CalculatorApp;