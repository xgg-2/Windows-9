import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../context/OSContext';
import { APPS } from '../constants';

interface Message {
    id: number;
    sender: 'user' | 'bot';
    text: string;
}

const Assistant: React.FC = () => {
    const { isAssistantOpen, launchApp, updateSystemSetting, systemSettings } = useOS();
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, sender: 'bot', text: 'Hi! I\'m Halo, your system intelligence. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    if (!isAssistantOpen) return null;

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const responseText = processCommand(userMsg.text);
            const botMsg: Message = { id: Date.now() + 1, sender: 'bot', text: responseText };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 800 + Math.random() * 500);
    };

    const processCommand = (cmd: string): string => {
        const lower = cmd.toLowerCase();

        // App Launching
        for (const appId of Object.keys(APPS)) {
            const app = APPS[appId as keyof typeof APPS];
            if (lower.includes(`open ${app.title.toLowerCase()}`) || lower.includes(`launch ${app.title.toLowerCase()}`)) {
                launchApp(appId as any);
                return `Opening ${app.title} for you.`;
            }
        }

        // System Settings
        if (lower.includes('wifi') || lower.includes('wi-fi')) {
            if (lower.includes('on') || lower.includes('enable')) {
                updateSystemSetting('wifiEnabled', true);
                return "Wi-Fi enabled.";
            }
            if (lower.includes('off') || lower.includes('disable')) {
                updateSystemSetting('wifiEnabled', false);
                return "Wi-Fi disabled.";
            }
            return `Wi-Fi is currently ${systemSettings.wifiEnabled ? 'On' : 'Off'}.`;
        }
        
        if (lower.includes('bluetooth')) {
             if (lower.includes('on') || lower.includes('enable')) {
                updateSystemSetting('bluetoothEnabled', true);
                return "Bluetooth enabled.";
            }
            if (lower.includes('off') || lower.includes('disable')) {
                updateSystemSetting('bluetoothEnabled', false);
                return "Bluetooth disabled.";
            }
            return `Bluetooth is currently ${systemSettings.bluetoothEnabled ? 'On' : 'Off'}.`;
        }

        if (lower.includes('night light') || lower.includes('dark mode')) {
             if (lower.includes('on') || lower.includes('enable')) {
                updateSystemSetting('nightLight', true);
                return "Night light enabled.";
            }
            if (lower.includes('off') || lower.includes('disable')) {
                updateSystemSetting('nightLight', false);
                return "Night light disabled.";
            }
        }
        
        if (lower.includes('volume')) {
            if (lower.includes('max') || lower.includes('100')) {
                updateSystemSetting('volume', 100);
                return "Volume set to maximum.";
            }
            if (lower.includes('mute') || lower.includes('0')) {
                updateSystemSetting('volume', 0);
                return "Volume muted.";
            }
        }

        // General Fun
        if (lower.includes('joke')) {
            const jokes = [
                "Why do programmers prefer dark mode? Because light attracts bugs.",
                "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
                "I would tell you a UDP joke, but you might not get it."
            ];
            return jokes[Math.floor(Math.random() * jokes.length)];
        }
        
        if (lower.includes('time')) {
            return `It is currently ${new Date().toLocaleTimeString()}.`;
        }
        
        if (lower.includes('who are you') || lower.includes('what are you')) {
            return "I am Halo, a simulated AI assistant built for Windows 9 Professional.";
        }
        
        if (lower.includes('clear')) {
            setMessages([{ id: Date.now(), sender: 'bot', text: 'Chat cleared.' }]);
            return '';
        }

        return "I'm not sure how to handle that command yet. Try asking me to open apps or change settings.";
    };

    return (
        <div 
            className="absolute top-0 right-0 bottom-12 w-80 bg-white/80 backdrop-blur-xl shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[5000] border-l border-white/20 flex flex-col animate-slide-left transition-transform"
        >
            {/* Header */}
            <div className="h-16 flex items-center px-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white mr-3 shadow-lg">
                    <i className="fas fa-sparkles"></i>
                </div>
                <div>
                    <div className="font-bold text-gray-800">Halo Intelligence</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Preview</div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
                {messages.map((msg) => (
                    msg.text && (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div 
                                className={`
                                    max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm
                                    ${msg.sender === 'user' 
                                        ? 'bg-blue-600 text-white rounded-br-none' 
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'}
                                `}
                            >
                                {msg.text}
                            </div>
                        </div>
                    )
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                         <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 shadow-sm">
                             <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                             <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                             <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                         </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/50 border-t border-gray-200/50">
                <form onSubmit={handleSend} className="relative">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        className="w-full bg-white border border-gray-200 rounded-full pl-4 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                        autoFocus
                    />
                    <button 
                        type="submit"
                        disabled={!input.trim()}
                        className="absolute right-1.5 top-1.5 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-default transition"
                    >
                        <i className="fas fa-arrow-up text-xs"></i>
                    </button>
                </form>
            </div>
            
            <style>{`
                @keyframes slide-left {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-left {
                    animation: slide-left 0.3s cubic-bezier(0.1, 0.9, 0.2, 1);
                }
            `}</style>
        </div>
    );
};

export default Assistant;