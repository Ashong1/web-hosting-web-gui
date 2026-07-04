import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Terminal, Cpu, FileText, RefreshCcw } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export default function AiChathead({ instanceId: manualId, instance: manualInstance }) {
    const { props } = usePage();
    const pageInstance = props?.instance;
    const instance = manualInstance || pageInstance;
    const instanceId = manualId || instance?.id;

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (instance) {
            setMessages([
                { 
                    sender: 'ai', 
                    text: `Hello! I am **AiRo**, your AI Copilot. 🤖\n\nI have real-time access to the logs and metrics of your container (**${instance.name}**). How can I assist you today?` 
                }
            ]);
        } else {
            setMessages([
                { 
                    sender: 'ai', 
                    text: "Hello! I am **AiRo**, your AI Copilot. 🤖\n\nYou are in the main workspace. How can I help you manage your hosting configuration today?" 
                }
            ]);
        }
    }, [instanceId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (textToSend) => {
        const query = textToSend || input;
        if (!query.trim()) return;

        if (!textToSend) {
            setInput('');
        }

        // Add user message
        setMessages(prev => [...prev, { sender: 'user', text: query }]);
        setLoading(true);

        try {
            const url = instanceId 
                ? route('instances.ask_ai', instanceId) 
                : route('ask_ai_general');
                
            const response = await axios.post(url, { 
                message: query
            });
            setMessages(prev => [...prev, { sender: 'ai', text: response.data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { 
                sender: 'ai', 
                text: '### ⚠️ Error\n\nHindi maikonekta sa AI Copilot sa ngayon. Mangyaring subukan muli mamaya.' 
            }]);
        } finally {
            setLoading(false);
        }
    };

    const renderMarkdown = (text) => {
        if (!text) return '';
        let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/^\s*[-*]\s+(.*)$/gm, '<li class="ml-4 list-disc my-1">$1</li>');
        html = html.replace(/^#### (.*)$/gm, '<h5 class="text-xs font-black uppercase text-zinc-400 tracking-tight my-2">$1</h5>');
        html = html.replace(/^### (.*)$/gm, '<h4 class="text-sm font-black uppercase text-white tracking-tight my-3">$1</h4>');
        html = html.replace(/^## (.*)$/gm, '<h3 class="text-base font-black uppercase text-white tracking-tight my-4">$1</h3>');
        html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-[9px] text-emerald-400 overflow-x-auto my-3 whitespace-pre-wrap">$1</pre>');
        html = html.replace(/`(.*?)`/g, '<code class="bg-black/30 px-1.5 py-0.5 rounded font-mono text-[10px] text-emerald-300 font-bold">$1</code>');
        html = html.split('\n').map(line => {
            if (line.trim().startsWith('<li') || line.trim().startsWith('<h') || line.trim().startsWith('<pre') || line.trim().startsWith('</pre') || line.trim() === '') {
                return line;
            }
            return line + '<br/>';
        }).join('\n');
        return html;
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Dialog Window */}
            {isOpen && (
                <div className="w-[360px] sm:w-[380px] h-[500px] bg-[#161615] rounded-[2.5rem] border border-emerald-500/20 shadow-2xl flex flex-col overflow-hidden mb-4 transition-all duration-300 translate-y-0 scale-100 origin-bottom-right">
                    {/* Header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-emerald-950 to-zinc-900 border-b border-white/5 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                                <Sparkles size={16} className="animate-pulse" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-white tracking-wider">AiRo</h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Active Assistant</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-lg text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                        {messages.map((msg, i) => (
                            <div 
                                key={i} 
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div 
                                    className={`max-w-[85%] rounded-3xl p-4 text-[11px] leading-relaxed select-text ${
                                        msg.sender === 'user' 
                                            ? 'bg-emerald-500 text-white rounded-br-none' 
                                            : 'bg-white/5 border border-white/5 text-zinc-300 rounded-bl-none'
                                    }`}
                                >
                                    <div 
                                        className="space-y-1"
                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                                    />
                                </div>
                            </div>
                        ))}
                        
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/5 text-zinc-300 rounded-3xl rounded-bl-none p-4 text-[11px] flex items-center gap-2">
                                    <RefreshCcw size={12} className="animate-spin text-emerald-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Processing request...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestion Chips */}
                    <div className="px-6 py-2 bg-black/20 border-t border-white/5 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
                        {instanceId ? (
                            <>
                                <button 
                                    disabled={loading}
                                    type="button"
                                    onClick={() => handleSend("Diagnose my build logs")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-white/5 text-[9px] font-black text-zinc-400 hover:text-emerald-400 uppercase tracking-widest shrink-0 transition-colors"
                                >
                                    <Terminal size={10} />
                                    Diagnose Build
                                </button>
                                <button 
                                    disabled={loading}
                                    type="button"
                                    onClick={() => handleSend("Diagnose my runtime logs")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-white/5 text-[9px] font-black text-zinc-400 hover:text-emerald-400 uppercase tracking-widest shrink-0 transition-colors"
                                >
                                    <FileText size={10} />
                                    Diagnose Logs
                                </button>
                                <button 
                                    disabled={loading}
                                    type="button"
                                    onClick={() => handleSend("Tell me about my server container status")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-white/5 text-[9px] font-black text-zinc-400 hover:text-emerald-400 uppercase tracking-widest shrink-0 transition-colors"
                                >
                                    <Cpu size={10} />
                                    Server Status
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    disabled={loading}
                                    type="button"
                                    onClick={() => handleSend("How do I deploy a website on AseroTech?")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-white/5 text-[9px] font-black text-zinc-400 hover:text-emerald-400 uppercase tracking-widest shrink-0 transition-colors"
                                >
                                    <Terminal size={10} />
                                    Deploy App
                                </button>
                                <button 
                                    disabled={loading}
                                    type="button"
                                    onClick={() => handleSend("How can I add credits using GCash or Maya?")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-white/5 text-[9px] font-black text-zinc-400 hover:text-emerald-400 uppercase tracking-widest shrink-0 transition-colors"
                                >
                                    <FileText size={10} />
                                    GCash Top-up
                                </button>
                                <button 
                                    disabled={loading}
                                    type="button"
                                    onClick={() => handleSend("How does the reseller white-label option work?")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-white/5 text-[9px] font-black text-zinc-400 hover:text-emerald-400 uppercase tracking-widest shrink-0 transition-colors"
                                >
                                    <Cpu size={10} />
                                    Reseller
                                </button>
                            </>
                        )}
                    </div>

                    {/* Input Bar */}
                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="p-4 bg-black/40 border-t border-white/5 flex gap-2"
                    >
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                            placeholder="Magtanong tungkol sa iyong container..."
                            className="flex-1 bg-white/5 border border-white/5 text-xs text-white rounded-2xl px-4 py-3 outline-none focus:border-emerald-500/50 transition-all disabled:opacity-50"
                        />
                        <button 
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="w-10 h-10 rounded-2xl bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                        >
                            <Send size={14} />
                        </button>
                    </form>
                </div>
            )}

            {/* Chathead Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 relative group ${
                    isOpen ? 'rotate-90' : ''
                }`}
            >
                {isOpen ? (
                    <X size={24} />
                ) : (
                    <Sparkles size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                )}
                {/* Notification Badge */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-[#09090b] rounded-full animate-bounce"></span>
                )}
            </button>
        </div>
    );
}
