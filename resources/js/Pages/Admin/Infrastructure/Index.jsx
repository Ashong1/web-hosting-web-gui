import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { 
    Cpu, 
    Database, 
    HardDrive, 
    Activity, 
    ShieldCheck, 
    Clock, 
    Server, 
    RefreshCcw, 
    CheckCircle2, 
    XCircle,
    Zap,
    Wind,
    Thermometer
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export default function Index({ auth }) {
    const [metrics, setMetrics] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchMetrics = async () => {
        try {
            const response = await fetch(route('admin.infrastructure.metrics'));
            const data = await response.json();
            setMetrics(data);
            
            const newPoint = {
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                cpu: data.cpu.load_1 * 10, // Scaling for visual impact
                memory: data.memory.percent
            };
            
            setHistory(prev => [...prev.slice(-19), newPoint]);
            setLoading(false);
        } catch (error) {
            console.error('Host probe failed');
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center animate-pulse">
            <Activity size={48} className="text-emerald-500 animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Probing Bare Metal...</p>
        </div>
    );

    return (
        <div className="space-y-10">
            <Head title="Infrastructure Hub" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">Host Intel</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Direct telemetry from your primary compute node.</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase text-emerald-500 flex items-center gap-2">
                    <ShieldCheck size={14} /> System Secure
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Uptime Card */}
                <div className="md:col-span-4 bg-white dark:bg-[#161615] rounded-[2rem] p-8 border border-zinc-200 dark:border-white/5 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 text-zinc-400">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Host Uptime</p>
                            <p className="text-sm font-bold text-zinc-900 dark:text-white mt-1">{metrics.uptime}</p>
                        </div>
                    </div>
                </div>

                {/* Service Status */}
                <div className="md:col-span-8 bg-white dark:bg-[#161615] rounded-[2rem] p-8 border border-zinc-200 dark:border-white/5 shadow-sm flex items-center justify-around gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${metrics.services.docker ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            <Zap size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Docker Engine</p>
                            <p className="text-sm font-bold uppercase">{metrics.services.docker ? 'Active' : 'Offline'}</p>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-zinc-100 dark:bg-white/5"></div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                            <Wind size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nginx Core</p>
                            <p className="text-sm font-bold uppercase">Ready</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* CPU Telemetry */}
                <div className="bg-white dark:bg-[#161615] rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/5 shadow-sm space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                                <Cpu size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">CPU Load Average</h3>
                                <p className="text-xs text-zinc-400 font-medium font-mono">1m: {metrics.cpu.load_1} | 5m: {metrics.cpu.load_5}</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <YAxis hide />
                                <Area type="monotone" dataKey="cpu" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorCpu)" animationDuration={1000} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Memory Telemetry */}
                <div className="bg-white dark:bg-[#161615] rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/5 shadow-sm space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                                <Database size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">RAM Utilization</h3>
                                <p className="text-xs text-zinc-400 font-medium font-mono">{metrics.memory.used}MB / {metrics.memory.total}MB</p>
                            </div>
                        </div>
                        <span className="text-2xl font-black text-blue-500 font-mono tracking-tighter">{metrics.memory.percent}%</span>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <YAxis hide />
                                <Area type="monotone" dataKey="memory" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorMem)" animationDuration={1000} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Disk Health */}
            <div className="bg-white dark:bg-[#161615] rounded-[2.5rem] p-10 border border-zinc-200 dark:border-white/5 shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
                        <HardDrive size={24} />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Storage Integrity</h3>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
                        <span>Root Partition (/)</span>
                        <span>{metrics.disk.used}GB / {metrics.disk.total}GB Used</span>
                    </div>
                    <div className="h-4 w-full bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden p-1">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${metrics.disk.percent}%` }}
                            className={`h-full rounded-full transition-all duration-1000 ${metrics.disk.percent > 90 ? 'bg-red-500' : metrics.disk.percent > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

Index.layout = page => <AuthenticatedLayout children={page} />;
