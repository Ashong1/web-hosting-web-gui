import React, { useState, useEffect, useRef } from 'react';
import { RefreshCcw, Terminal as TerminalIcon, Search, Download, Zap } from 'lucide-react';
import axios from 'axios';

export default function BuildLogsViewer({ instanceId, onComplete }) {
    const [logs, setLogs] = useState('Initializing build pipeline...');
    const [loading, setLoading] = useState(true);
    const [autoScroll, setAutoScroll] = useState(true);
    const scrollRef = useRef(null);

    const fetchLogs = async () => {
        try {
            const response = await axios.get(route('instances.build_logs', instanceId));
            const newLogs = response.data.logs || 'Connecting to build engine...';
            setLogs(newLogs);
            
            // Check if build is finished based on common success strings if needed
            // Or just rely on the instance status polling from parent
        } catch (error) {
            setLogs('Deployment in progress. Waiting for log buffer...');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 3000);
        return () => clearInterval(interval);
    }, [instanceId]);

    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, autoScroll]);

    return (
        <div className="bg-[#09090b] rounded-[2rem] border border-emerald-500/20 overflow-hidden flex flex-col h-[500px] shadow-2xl shadow-emerald-500/5">
            <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-emerald-500/5">
                <div className="flex items-center gap-3">
                    <Zap size={16} className="text-emerald-500 fill-emerald-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Live Synthesis Stream</h3>
                </div>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={autoScroll} 
                            onChange={(e) => setAutoScroll(e.target.checked)}
                            className="w-3 h-3 rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Auto-Scroll</span>
                    </label>
                    <button onClick={fetchLogs} className="text-emerald-500 hover:text-emerald-400 transition-colors">
                        <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>
            
            <div 
                ref={scrollRef}
                className="flex-1 p-8 font-mono text-[11px] overflow-y-auto selection:bg-emerald-500/30 selection:text-emerald-200 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
            >
                <pre className="whitespace-pre-wrap text-zinc-300 leading-relaxed">
                    {logs}
                </pre>
            </div>

            <div className="px-8 py-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
                    Orchestrator v2.4 • Build Pipeline Alpha
                </p>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active Stream</span>
                </div>
            </div>
        </div>
    );
}
