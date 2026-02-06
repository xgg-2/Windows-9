import React, { useState, useEffect, useCallback } from 'react';

const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [shouldReset, setShouldReset] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const safeEval = (str: string): number => {
    try {
      const fn = new Function(`return ${str.replace(/×/g, '*').replace(/÷/g, '/')}`);
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
        setExpression(entry);
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
    } else if (val === 'sqrt') {
      const num = parseFloat(display);
      const res = Math.sqrt(num);
      setDisplay(String(res));
      setExpression(`√(${display})`);
      setShouldReset(true);
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
      if (/[0-9]/.test(e.key)) handleInput(e.key);
      const ops: Record<string, string> = { 
        '+': '+', '-': '-', '*': '×', '/': '÷', '%': '%', '.': '.', 'Enter': '=', 'Backspace': 'DEL', 'Escape': 'C' 
      };
      if (ops[e.key]) {
        if (e.key === 'Enter') e.preventDefault();
        handleInput(ops[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput]);

  const btn = (label: string, type: string, val?: string) => (
    <button
      onClick={() => handleInput(val || label)}
      className={`h-14 text-sm font-medium rounded-md transition-all active:scale-95 shadow-sm
        ${type === 'num' ? 'bg-white hover:bg-gray-100 text-gray-900' : ''}
        ${type === 'op' ? 'bg-gray-50 hover:bg-gray-200 text-blue-600' : ''}
        ${type === 'eq' ? 'bg-blue-600 hover:bg-blue-700 text-white font-bold' : ''}
      `}
    >
      {label}
    </button>
  );

  return (
    <div className="flex bg-[#f9f9f9] text-gray-900 h-[560px] w-[380px] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 p-2 gap-2">
      <div className="flex flex-col flex-1">
        <div className="flex justify-between p-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Calculator Pro</span>
          <button onClick={() => setShowHistory(!showHistory)} className="text-gray-400 hover:text-blue-600 transition">
            History
          </button>
        </div>
        
        <div className="flex flex-col justify-end items-end p-4 h-36 bg-white rounded-xl mb-2 shadow-inner">
          <div className="text-xs text-gray-400 font-mono truncate w-full text-right">{expression}</div>
          <div className="text-4xl font-bold truncate w-full text-right tracking-tighter">
            {display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 flex-1">
          {btn('√', 'op', 'sqrt')} {btn('%', 'op')} {btn('CE', 'op')} {btn('C', 'op')}
          {btn('7', 'num')} {btn('8', 'num')} {btn('9', 'num')} {btn('÷', 'op')}
          {btn('4', 'num')} {btn('5', 'num')} {btn('6', 'num')} {btn('×', 'op')}
          {btn('1', 'num')} {btn('2', 'num')} {btn('3', 'num')} {btn('-', 'op')}
          {btn('.', 'num')} {btn('0', 'num')} {btn('⌫', 'op', 'DEL')} {btn('+', 'op')}
          <div className="col-span-4 mt-1">
            <button onClick={() => handleInput('=')} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-lg font-bold transition-all active:scale-[0.98]">
                =
            </button>
          </div>
        </div>
      </div>

      {showHistory && (
        <div className="w-72 bg-white rounded-xl p-4 flex flex-col shadow-xl border border-gray-100 animate-in slide-in-from-right-10 duration-300">
          <h3 className="text-sm font-bold border-b pb-2 mb-2">History Log</h3>
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
            {history.length === 0 ? <p className="text-center text-gray-300 text-xs mt-10">Empty</p> : 
              history.map((h, i) => (
                <div key={i} className="text-right border-b border-gray-50 pb-2 hover:bg-gray-50 cursor-pointer" onClick={() => setDisplay(h.split('=')[1].trim())}>
                  <div className="text-[10px] text-gray-400">{h.split('=')[0]}</div>
                  <div className="font-bold text-blue-600">{h.split('=')[1]}</div>
                </div>
              ))
            }
          </div>
          <button onClick={() => setHistory([])} className="text-[10px] text-red-400 hover:text-red-600 mt-2 self-start uppercase font-bold">Clear All</button>
        </div>
      )}
    </div>
  );
};

export default CalculatorApp;
