import React, { useState, useEffect } from 'react';

const MindVault: React.FC = () => {
    const [pin, setPin] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [secretNotes, setSecretNotes] = useState<{id: number, content: string}[]>(() => {
        const saved = localStorage.getItem('win9_vault_notes');
        return saved ? JSON.parse(saved) : [];
    });
    const [newNote, setNewNote] = useState('');

    useEffect(() => {
        localStorage.setItem('win9_vault_notes', JSON.stringify(secretNotes));
    }, [secretNotes]);

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

    const deleteNote = (id: number) => {
        setSecretNotes(secretNotes.filter(n => n.id !== id));
    };

    return (
        <div className="flex flex-col h-full bg-[#f0f0f0] text-gray-800">
            {!isUnlocked ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-100">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                        <i className="fas fa-lock text-4xl text-white"></i>
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-gray-800">Protected Vault</h2>
                    <p className="text-sm text-gray-500 mb-6">Please enter your security PIN to continue</p>
                    <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
                        <input 
                            type="password"
                            maxLength={4}
                            autoFocus
                            className="bg-gray-50 border border-gray-300 rounded p-3 text-center text-2xl tracking-[0.5em] w-48 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                            placeholder="****"
                        />
                        <button 
                            onClick={handleUnlock}
                            className="w-full mt-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition active:scale-95 shadow-md"
                        >
                            Unlock Vault
                        </button>
                    </div>
                    <p className="mt-4 text-xs text-gray-400">Default PIN: 0000</p>
                </div>
            ) : (
                <div className="flex flex-col h-full bg-white">
                    {/* Header/Toolbar */}
                    <div className="bg-[#f5f6f7] border-b border-gray-300 p-2 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2 px-2 py-1 text-gray-700">
                            <i className="fas fa-shield-halved text-blue-600"></i>
                            <span className="text-xs font-bold uppercase tracking-wider">Secure Storage</span>
                        </div>
                        <button 
                            onClick={() => setIsUnlocked(false)} 
                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 border border-gray-300 rounded text-xs transition"
                        >
                            Lock Vault
                        </button>
                    </div>
                    
                    {/* Notes Area */}
                    <div className="flex-1 overflow-auto p-4 space-y-2 bg-gray-50 custom-scrollbar">
                        {secretNotes.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-30 text-gray-400 italic">
                                <i className="fas fa-folder-open text-4xl mb-2"></i>
                                <p>No encrypted entries found.</p>
                            </div>
                        ) : (
                            secretNotes.map(note => (
                                <div key={note.id} className="group p-3 bg-white border border-gray-200 rounded shadow-sm hover:border-blue-300 transition-all flex justify-between items-start">
                                    <p className="text-sm text-gray-700 leading-relaxed pr-4">{note.content}</p>
                                    <button 
                                        onClick={() => deleteNote(note.id)}
                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-300 flex gap-2">
                        <input 
                            className="flex-1 bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
                            placeholder="Type a new secret note..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addNote()}
                        />
                        <button 
                            onClick={addNote}
                            className="w-10 h-10 bg-blue-600 text-white rounded flex items-center justify-center hover:bg-blue-700 shadow-md active:scale-90 transition"
                        >
                            <i className="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            )}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; border: 2px solid #f1f1f1; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #bbb; }
            `}</style>
        </div>
    );
};

export default MindVault;
