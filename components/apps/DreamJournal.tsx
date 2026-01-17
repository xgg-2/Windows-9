import React, { useState } from 'react';

const DreamJournal: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [dreams, setDreams] = useState<{id: number, text: string, color: string, date: string}[]>([]);

    const addDream = () => {
        if (!prompt) return;
        const colors = ['bg-purple-100', 'bg-blue-100', 'bg-pink-100', 'bg-indigo-100'];
        const newDream = {
            id: Date.now(),
            text: prompt,
            color: colors[Math.floor(Math.random() * colors.length)],
            date: new Date().toLocaleDateString()
        };
        setDreams([newDream, ...dreams]);
        setPrompt('');
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md">
                <h2 className="text-xl font-serif italic">Dream Weaver v1.0</h2>
                <p className="text-xs opacity-80">Capture your subconscious thoughts</p>
            </div>
            
            <div className="flex-1 overflow-auto p-4 space-y-4">
                {dreams.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
                        <i className="fas fa-moon text-4xl mb-2 opacity-20"></i>
                        <p>No dreams recorded yet.<br/>The night is young.</p>
                    </div>
                ) : (
                    dreams.map(dream => (
                        <div key={dream.id} className={`${dream.color} p-4 rounded-xl border border-white shadow-sm animate-popIn`}>
                            <div className="text-xs text-slate-500 mb-1">{dream.date}</div>
                            <p className="text-slate-800 italic leading-relaxed">"{dream.text}"</p>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t bg-white flex gap-2 items-center">
                <input 
                    className="flex-1 p-2 bg-slate-100 rounded-full border-none outline-none focus:ring-2 focus:ring-purple-400 transition-all px-4 text-sm"
                    placeholder="Describe your dream..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addDream()}
                />
                <button 
                    onClick={addDream}
                    className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center hover:bg-indigo-600 transition shadow-lg active:scale-90"
                >
                    <i className="fas fa-sparkles"></i>
                </button>
            </div>
        </div>
    );
};

export default DreamJournal;
