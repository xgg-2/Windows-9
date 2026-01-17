import React, { useState, useEffect } from 'react';

const ChronoNexus: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [events, setEvents] = useState<{id: string, name: string, time: string, type: 'past' | 'future'}[]>([]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const addEvent = (name: string, type: 'past' | 'future') => {
        const newEvent = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            time: currentTime.toLocaleTimeString(),
            type
        };
        setEvents([newEvent, ...events]);
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0c] text-cyan-400 font-mono overflow-hidden">
            <div className="p-6 bg-black border-b border-cyan-900/50 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-2xl tracking-tighter font-bold uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                        Chrono Nexus
                    </h2>
                    <p className="text-[10px] opacity-50 tracking-widest">Temporal Synchronization Active</p>
                </div>
                <div className="text-right">
                    <div className="text-xl tabular-nums">{currentTime.toLocaleTimeString()}</div>
                    <div className="text-[10px] opacity-50 uppercase">{currentTime.toLocaleDateString()}</div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-3 custom-scrollbar">
                {events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 scale-150 grayscale">
                        <i className="fas fa-atom fa-spin text-6xl mb-4"></i>
                        <p className="text-xs uppercase tracking-[0.2em]">Awaiting Temporal Data...</p>
                    </div>
                ) : (
                    events.map(event => (
                        <div key={event.id} className="group relative overflow-hidden border border-cyan-900/30 bg-cyan-950/10 p-4 rounded-sm animate-popIn">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${event.type === 'past' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'}`}>
                                    {event.type === 'past' ? 'Memory Anchor' : 'Possibility Vector'}
                                </span>
                                <span className="text-[10px] opacity-30">{event.time}</span>
                            </div>
                            <p className="text-sm text-cyan-100 group-hover:text-cyan-400 transition-colors">
                                {event.name}
                            </p>
                            <div className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 bg-black border-t border-cyan-900/50 space-y-3 shrink-0">
                <div className="flex gap-2">
                    <button 
                        onClick={() => addEvent("Reality baseline recorded", 'past')}
                        className="flex-1 py-2 border border-red-900/50 hover:bg-red-900/20 text-red-400 text-[10px] uppercase tracking-tighter transition-all active:scale-95"
                    >
                        Anchor Past
                    </button>
                    <button 
                        onClick={() => addEvent("Probability stream detected", 'future')}
                        className="flex-1 py-2 border border-blue-900/50 hover:bg-blue-900/20 text-blue-400 text-[10px] uppercase tracking-tighter transition-all active:scale-95"
                    >
                        Map Future
                    </button>
                </div>
                <div className="text-[9px] text-center opacity-30 animate-pulse">
                    Scanning for timeline inconsistencies...
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #083344; border-radius: 2px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #0e7490; }
            `}</style>
        </div>
    );
};

export default ChronoNexus;
