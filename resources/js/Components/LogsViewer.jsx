import React, { useState, useEffect, useRef } from 'react';
import { RefreshCcw, Terminal as TerminalIcon, Search, Download } from 'lucide-react';
import axios from 'axios';

export default function LogsViewer({ instanceId }) {
    const [logs, setLogs] = useState('Initializing log stream...');
    const [loading, setLoading] = useState(true);
    const [autoScroll, setAutoScroll] = useState(true);
    const scrollRef = useRef(null);

    const fetchLogs = async () => {
        try {
            const response = await axios.get(route('instances.logs', instanceId));
            setLogs(response.data.logs || 'No logs available for this node.');
        } catch (error) {
            setLogs('Failed to retrieve logs from infrastructure node.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, [instanceId]);

    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, autoScroll]);

    const downloadLogs = () => {
        const element = document.createElement("a");
        const file = new Blob([logs], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `node-${instanceId}-logs.txt`;
        document.body.appendChild(element);
        element.click();
    };

    return (
        <div className="bg-[#161615] rounded-[2rem] border border-white/5 overflow-hidden flex flex-col h-[400px] md:h-[600px]">
            <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-3">
                    <TerminalIcon size={16} className="text-emerald-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Application Logs</h3>
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
                    <button onClick={fetchLogs} className="text-zinc-500 hover:text-white transition-colors">
                        <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={downloadLogs} className="text-zinc-500 hover:text-white transition-colors">
                        <Download size={14} />
                    </button>
                </div>
            </div>
            
            <div 
                ref={scrollRef}
                className="flex-1 p-8 font-mono text-[11px] overflow-y-auto selection:bg-emerald-500/30 selection:text-emerald-200 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
            >
                <pre className="whitespace-pre-wrap text-emerald-500/90 leading-relaxed">
                    {logs}
                </pre>
            </div>

            <div className="px-8 py-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
                    Streamed via Dokploy Orchestrator v2
                </p>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live Sync</span>
                </div>
            </div>
        </div>
    );
}
