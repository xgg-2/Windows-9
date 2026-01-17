import React, { useState } from 'react';

const MindVault: React.FC = () => {
    const [pin, setPin] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [secretNotes, setSecretNotes] = useState<{id: number, content: string}[]>([]);
    const [newNote, setNewNote] = useState('');

    const handleUnlock = () => {
        if (pin === '0000') {
            setIsUnlocked(true);
        } else {
            alert('Access Denied');
        }
    };

    const addNote = () => {
        if (!newNote) return;
        setSecretNotes([{id: Date.now(), content: newNote}, ...secretNotes]);
        setNewNote('');
    };

    return (
        <div className="flex flex-col h-full bg-neutral-900 text-amber-500 font-mono">
            {!isUnlocked ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-black/40 backdrop-blur-lg">
                    <i className="fas fa-user-shield text-6xl mb-6 animate-pulse"></i>
                    <h2 className="text-xl font-bold mb-4 tracking-widest uppercase">System Lock (Win9)</h2>
                    <p className="text-xs opacity-60 mb-6">Enter biometric bypass code (Default: 0000)</p>
                    <input 
                        type="password"
                        maxLength={4}
                        className="bg-neutral-800 border-2 border-amber-900/50 rounded-lg p-3 text-center text-2xl tracking-[1em] w-48 focus:border-amber-500 outline-none transition-all"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                    />
                    <button 
                        onClick={handleUnlock}
                        className="mt-6 px-8 py-2 bg-amber-600 text-black font-bold rounded-sm hover:bg-amber-400 transition shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-95"
                    >
                        Authenticate
                    </button>
                </div>
            ) : (
                <div className="flex flex-col h-full bg-[#1a1a1a]">
                    <div className="p-4 bg-amber-600 text-black flex justify-between items-center shadow-lg">
                        <span className="font-bold text-xs tracking-tighter uppercase">Vault Access Granted</span>
                        <button onClick={() => setIsUnlocked(false)} className="hover:bg-black/10 px-2 rounded transition text-xs font-bold">Relock</button>
                    </div>
                    
                    <div className="flex-1 overflow-auto p-4 space-y-3 custom-scrollbar">
                        {secretNotes.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                                <i className="fas fa-ghost text-4xl mb-2"></i>
                                <p>No sensitive data found.</p>
                            </div>
                        ) : (
                            secretNotes.map(note => (
                                <div key={note.id} className="p-3 bg-neutral-800/50 border-l-2 border-amber-600 rounded-r shadow-sm">
                                    <p className="text-sm text-amber-200/80 leading-relaxed">{note.content}</p>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 bg-neutral-800 border-t border-amber-900/20 flex gap-2">
                        <input 
                            className="flex-1 bg-black/40 border border-amber-900/50 rounded p-2 text-xs focus:border-amber-500 outline-none transition-all placeholder:text-amber-900/50"
                            placeholder="Deposit new secret..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addNote()}
                        />
                        <button 
                            onClick={addNote}
                            className="w-10 h-10 bg-amber-600 text-black rounded flex items-center justify-center hover:bg-amber-400 shadow-inner"
                        >
                            <i className="fas fa-key"></i>
                        </button>
                    </div>
                </div>
            )}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #451a03; border-radius: 2px; }
            `}</style>
        </div>
    );
};

export default MindVault;
