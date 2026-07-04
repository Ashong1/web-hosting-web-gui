import React, { useState, useEffect, useRef } from 'react';
import { RefreshCcw, Terminal as TerminalIcon, Search, Download, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function LogsViewer({ instanceId }) {
    const [logs, setLogs] = useState('Initializing log stream...');
    const [loading, setLoading] = useState(true);
    const [autoScroll, setAutoScroll] = useState(true);
    const [diagnosing, setDiagnosing] = useState(false);
    const [showDiag, setShowDiag] = useState(false);
    const [diagnosis, setDiagnosis] = useState(null);
    const scrollRef = useRef(null);

    const runDiagnosis = async () => {
        setDiagnosing(true);
        setShowDiag(true);
        try {
            const response = await axios.post(route('instances.diagnose_logs', instanceId), { type: 'runtime' });
            setDiagnosis(response.data.diagnosis);
        } catch (error) {
            setDiagnosis('### ⚠️ Diagnostic Failure\n\nUnable to connect to the AI diagnostic service at this time. Please try muli.');
        } finally {
            setDiagnosing(false);
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
        html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-[10px] text-emerald-400 overflow-x-auto my-3 whitespace-pre-wrap">$1</pre>');
        html = html.replace(/`(.*?)`/g, '<code class="bg-black/30 px-1.5 py-0.5 rounded font-mono text-[10px] text-emerald-300 font-bold">$1</code>');
        html = html.split('\n').map(line => {
            if (line.trim().startsWith('<li') || line.trim().startsWith('<h') || line.trim().startsWith('<pre') || line.trim().startsWith('</pre') || line.trim() === '') {
                return line;
            }
            return line + '<br/>';
        }).join('\n');
        return html;
    };

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
        <div className="flex flex-col lg:flex-row gap-6 w-full h-[500px] md:h-[600px]">
            {/* Logs Window */}
            <div className="flex-1 bg-[#161615] rounded-[2rem] border border-white/5 overflow-hidden flex flex-col h-full">
                <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-3">
                        <TerminalIcon size={16} className="text-emerald-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Application Logs</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={runDiagnosis}
                            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                            <Sparkles size={10} />
                            Diagnose with AI
                        </button>
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

            {/* AI Diagnostics Panel */}
            {showDiag && (
                <div className="w-full lg:w-[350px] xl:w-[400px] bg-[#161615] rounded-[2rem] border border-emerald-500/20 overflow-hidden flex flex-col h-full shadow-2xl shadow-emerald-500/5 transition-all">
                    <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-emerald-500/5">
                        <div className="flex items-center gap-3">
                            <Sparkles size={14} className="text-emerald-500 animate-pulse" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">AI Diagnostics</h3>
                        </div>
                        <button onClick={() => { setShowDiag(false); setDiagnosis(null); }} className="text-zinc-500 hover:text-white text-[9px] uppercase tracking-widest font-black">Close</button>
                    </div>
                    <div className="flex-1 p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent text-zinc-300 text-[11px] leading-relaxed select-text">
                        {diagnosing ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                                <RefreshCcw size={20} className="text-emerald-500 animate-spin" />
                                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Sinusuri ang iyong logs gamit ang AI...</p>
                            </div>
                        ) : (
                            <div className="space-y-3" dangerouslySetInnerHTML={{ __html: renderMarkdown(diagnosis) }} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
