import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Globe, Wifi, Server, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GlobalStatusBoard() {
    const [monitors, setMonitors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGlobalStatus();
        const interval = setInterval(fetchGlobalStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchGlobalStatus = async () => {
        try {
            const response = await fetch('/api/v1/status');
            if (!response.ok) {
                console.error('Status Hub API rejected request:', response.status);
                return;
            }
            const data = await response.json();
            console.log('Status Hub Transmission Received:', data);
            if (data.monitors && Array.isArray(data.monitors)) {
                setMonitors(data.monitors);
            }
        } catch (error) {
            console.error('Global health check failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="h-64 flex flex-col items-center justify-center bg-zinc-50 dark:bg-black/20 rounded-[2.5rem] border border-zinc-200 dark:border-white/5 animate-pulse">
            <Activity size={32} className="text-zinc-300 dark:text-zinc-700 animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Synchronizing Global Status Hub...</p>
        </div>
    );

    const downCount = monitors.filter(m => m.status === 'down').length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${downCount === 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                        {downCount === 0 ? 'All Systems Operational' : `${downCount} Infrastructure Alert(s)`}
                    </span>
                </div>
                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Live Response</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {monitors.map((monitor, i) => (
                    <motion.div 
                        key={monitor.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-5 bg-white dark:bg-[#161615] border border-zinc-100 dark:border-white/5 rounded-3xl shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl ${monitor.status === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {monitor.type === 'http' ? <Globe size={16} /> : <Server size={16} />}
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-tight">{monitor.name}</p>
                                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 truncate max-w-[120px]">{monitor.url || 'Internal Core'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`text-[10px] font-black uppercase tracking-widest font-mono ${monitor.status === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {monitor.status === 'up' ? `${monitor.latency}ms` : 'Offline'}
                            </p>
                            <div className="flex gap-0.5 justify-end mt-1">
                                {[1, 2, 3, 4, 5].map(j => (
                                    <div key={j} className={`w-1 h-2 rounded-full ${monitor.status === 'up' ? 'bg-emerald-500/20 group-hover:bg-emerald-500/40' : 'bg-red-500/20 group-hover:bg-red-500/40'} transition-colors`}></div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {monitors.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-zinc-100 dark:border-white/5 rounded-[2.5rem]">
                    <Wifi size={40} className="mx-auto text-zinc-200 dark:text-white/10 mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-400">No monitoring satellites detected.</p>
                </div>
            )}
        </div>
    );
}
