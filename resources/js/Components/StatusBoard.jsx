import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Clock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatusBoard({ instanceId }) {
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000); // Sync every 30s
        return () => clearInterval(interval);
    }, [instanceId]);

    const fetchStatus = async () => {
        try {
            const response = await fetch(`/api/v1/nodes/${instanceId}/status`);
            const data = await response.json();
            setStatusData(data);
        } catch (error) {
            console.error('Network integrity check failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="h-48 flex items-center justify-center animate-pulse bg-zinc-50 dark:bg-black/20 rounded-[2rem]">
            <div className="flex items-center gap-3 text-zinc-400">
                <Activity size={20} className="animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest">Polling Status Hub...</span>
            </div>
        </div>
    );

    const isUp = statusData?.status === 'up';

    return (
        <div className="bg-white dark:bg-[#161615] rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/5 shadow-sm space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'} transition-colors duration-700`}>
                        <Globe size={24} />
                    </div>
                    <div>
                        <h4 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">Operational Status</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${isUp ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                                {isUp ? 'Network Interface Active' : 'Signal Degraded'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 px-4">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                            <ShieldCheck size={10} /> Uptime (24h)
                        </p>
                        <p className="text-xl font-black text-zinc-900 dark:text-white font-mono tracking-tighter">{String(statusData?.uptime_24h || '0')}%</p>
                    </div>
                    <div className="space-y-1 text-right sm:text-left">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center justify-end sm:justify-start gap-1.5">
                            <Clock size={10} /> Latency
                        </p>
                        <p className="text-xl font-black text-emerald-500 font-mono tracking-tighter">{String(statusData?.latency || '0')}ms</p>
                    </div>
                </div>
            </div>

            {/* History Bar */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Transmission History (Last 24 Cycles)</p>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Sync Every 60m</span>
                </div>
                <div className="flex gap-1 h-10 items-end">
                    {(statusData?.history || []).slice(-24).map((point, i) => (
                        <motion.div 
                            key={i}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: i * 0.02 }}
                            className={`flex-1 rounded-t-sm ${point === 1 ? 'bg-emerald-500/40 hover:bg-emerald-500' : 'bg-red-500/40 hover:bg-red-500'} transition-all cursor-pointer h-full`}
                            title={point === 1 ? 'Operational' : 'Outage Detected'}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
