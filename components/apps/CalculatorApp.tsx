import React, { useState, useEffect, useCallback, useRef } from 'react';

const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [shouldReset, setShouldReset] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const displayRef = useRef<HTMLDivElement>(null);

  const getFontSize = (text: string) => {
    const len = text.length;
    if (len <= 10) return 'text-5xl';
    if (len <= 14) return 'text-4xl';
    if (len <= 18) return 'text-2xl';
    if (len <= 22) return 'text-xl';
    return 'text-lg';
  };

  const safeEval = (str: string): number => {
    try {
      const sanitized = str.replace(/×/g, '*').replace(/÷/g, '/');
      const fn = new Function(`return ${sanitized}`);
      return fn();
    } catch {
      return NaN;
    }
  };

  const handleInput = useCallback((val: string) => {
    if (val === 'C') {
      setDisplay('0');
      setExpression('');
      setShouldReset(false);
    } else if (val === 'CE') {
      setDisplay('0');
    } else if (val === 'DEL') {
      if (shouldReset) {
        setExpression('');
      } else {
        setDisplay(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      }
    } else if (val === '=') {
      const result = safeEval(display);
      if (isNaN(result) || !isFinite(result)) {
        setDisplay('Error');
      } else {
        const entry = `${display} = ${result}`;
        setHistory(prev => [entry, ...prev].slice(0, 20));
        setExpression(display + ' =');
        setDisplay(String(result));
      }
      setShouldReset(true);
    } else if (['+', '-', '×', '÷', '%'].includes(val)) {
      setShouldReset(false);
      const lastChar = display.slice(-1);
      if (['+', '-', '×', '÷', '%'].includes(lastChar)) {
        setDisplay(display.slice(0, -1) + val);
      } else {
        setDisplay(display + val);
      }
    } else {
      if (shouldReset) {
        setDisplay(val === '.' ? '0.' : val);
        setExpression('');
        setShouldReset(false);
      } else {
        if (val === '.' && display.split(/[+\-×÷%]/).pop()?.includes('.')) return;
        if (display.length > 40) return;
        setDisplay(display === '0' && val !== '.' ? val : display + val);
      }
    }
  }, [display, shouldReset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (/[0-9]/.test(key)) handleInput(key);
      const map: Record<string, string> = {
        '+': '+', '-': '-', '*': '×', '/': '÷', '%': '%', '.': '.',
        'Enter': '=', 'Backspace': 'DEL', 'Escape': 'C'
      };
      if (map[key]) {
        if (key === 'Enter') e.preventDefault();
        handleInput(map[key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput]);

  const buttons = [
    { label: 'C', type: 'op' }, { label: 'CE', type: 'op' }, { label: '%', type: 'op' }, { label: '÷', type: 'op', val: '÷' },
    { label: '7', type: 'num' }, { label: '8', type: 'num' }, { label: '9', type: 'num' }, { label: '×', type: 'op', val: '×' },
    { label: '4', type: 'num' }, { label: '5', type: 'num' }, { label: '6', type: 'num' }, { label: '-', type: 'op', val: '-' },
    { label: '1', type: 'num' }, { label: '2', type: 'num' }, { label: '3', type: 'num' }, { label: '+', type: 'op', val: '+' },
    { label: '0', type: 'num', wide: true }, { label: '.', type: 'num' }, { label: '=', type: 'eq' },
  ];

  return (
    <div className="flex h-full bg-[#f3f3f3] select-none overflow-hidden font-sans" tabIndex={0}>
      <div className="flex flex-col flex-1 min-w-0 bg-white">
        <div className="flex justify-between p-3 items-center bg-[#f3f3f3]">
          <span className="font-bold text-gray-600 text-xs tracking-widest uppercase">Standard</span>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`text-sm p-1 px-2 rounded transition-colors ${showHistory ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-200'}`}
          >
            History
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-end p-6 text-right overflow-hidden">
          <div className="text-sm text-gray-400 font-mono h-6 mb-2 truncate">
            {expression}
          </div>
          <div 
            className={`font-bold text-gray-800 transition-all duration-200 whitespace-nowrap overflow-x-auto no-scrollbar leading-none ${getFontSize(display)}`}
            style={{ direction: 'ltr' }}
          >
            {display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-[1px] bg-gray-200 h-[65%] shadow-inner">
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              className={`
                ${btn.wide ? 'col-span-2' : ''}
                ${btn.type === 'op' ? 'bg-[#fbfbfb] text-gray-600 hover:bg-[#f0f0f0]' : ''}
                ${btn.type === 'num' ? 'bg-white hover:bg-[#f9f9f9] text-gray-900 font-extrabold' : ''}
                ${btn.type === 'eq' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                text-xl transition-all active:scale-[0.95] flex items-center justify-center
              `}
              onClick={() => handleInput(btn.val || btn.label)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {showHistory && (
        <div className="w-72 border-l bg-[#f3f3f3] flex flex-col p-4 shadow-2xl animate-in slide-in-from-right duration-300">
          <div className="font-bold text-gray-500 mb-6 text-xs uppercase tracking-widest border-b pb-2">History Log</div>
          <div className="flex-1 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
            {history.length === 0 ? (
              <span className="text-gray-400 text-xs italic text-center mt-10">No recent calculations</span>
            ) : (
              history.map((h, i) => (
                <div 
                  key={i} 
                  className="flex flex-col text-right hover:bg-gray-200 p-2 rounded cursor-pointer transition-colors group"
                  onClick={() => {
                    setDisplay(h.split('=')[1].trim());
                    setExpression(h.split('=')[0]);
                  }}
                >
                  <span className="text-gray-400 text-[10px] mb-1 group-hover:text-blue-500">{h.split('=')[0]} =</span>
                  <span className="text-gray-800 font-black text-xl">{h.split('=')[1]}</span>
                </div>
              ))
            )}
          </div>
          {history.length > 0 && (
            <button 
              onClick={() => setHistory([])} 
              className="mt-6 text-[10px] text-red-500 font-bold hover:text-red-700 uppercase tracking-tighter self-end"
            >
              Clear Data
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CalculatorApp;
