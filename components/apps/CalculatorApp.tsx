import React, { useState, useEffect, useCallback } from 'react';

const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [shouldReset, setShouldReset] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

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
    <div className="flex h-full bg-[#f3f3f3] select-none overflow-hidden" tabIndex={0}>
      <div className="flex flex-col flex-1">
        <div className="flex justify-between p-2 items-center">
          <span className="font-bold text-gray-700 text-sm">Standard</span>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`p-1 px-2 rounded hover:bg-gray-300 transition ${showHistory ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}
          >
            <i className="fas fa-history text-xs"></i> History
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-end p-4 text-right">
          <div className="text-sm text-gray-500 font-mono h-6 mb-1 truncate">
            {expression}
          </div>
          <div className="text-5xl font-semibold truncate text-gray-800 break-all tracking-tighter">
            {display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-[2px] p-[2px] h-3/5 bg-gray-200">
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              className={`
                ${btn.wide ? 'col-span-2' : ''}
                ${btn.type === 'op' ? 'bg-[#f9f9f9] text-gray-600 hover:bg-gray-200' : ''}
                ${btn.type === 'num' ? 'bg-white font-bold hover:bg-gray-100 text-gray-800' : ''}
                ${btn.type === 'eq' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                text-xl transition active:opacity-70 flex items-center justify-center
              `}
              onClick={() => handleInput(btn.val || btn.label)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {showHistory && (
        <div className="w-64 border-l bg-[#f3f3f3] flex flex-col p-4 animate-in slide-in-from-right duration-200">
          <div className="font-bold text-gray-700 mb-4 text-sm border-b pb-2">History</div>
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
            {history.length === 0 ? (
              <span className="text-gray-400 text-xs italic">No history yet</span>
            ) : (
              history.map((h, i) => (
                <div 
                  key={i} 
                  className="flex flex-col text-right hover:bg-gray-200 p-2 rounded cursor-pointer transition"
                  onClick={() => {
                    setDisplay(h.split('=')[1].trim());
                    setExpression(h.split('=')[0]);
                  }}
                >
                  <span className="text-gray-500 text-[10px]">{h.split('=')[0]} =</span>
                  <span className="text-gray-800 font-bold text-lg">{h.split('=')[1]}</span>
                </div>
              ))
            )}
          </div>
          {history.length > 0 && (
            <button 
              onClick={() => setHistory([])} 
              className="mt-4 text-right text-red-500 text-xs hover:underline flex items-center justify-end gap-1"
            >
              <i className="fas fa-trash-alt"></i> Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CalculatorApp;
