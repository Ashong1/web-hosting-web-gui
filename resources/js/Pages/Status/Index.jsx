import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Activity, ShieldCheck, Globe, Server, CheckCircle2, AlertTriangle, XCircle, ChevronRight, Box, Clock, History, Zap } from 'lucide-react';

export default function Index({ status, brand }) {
    const getStatusColor = (s) => {
        if (s === 'operational') return 'text-emerald-500';
        if (s === 'degraded') return 'text-amber-500';
        return 'text-red-500';
    };

    const getStatusBg = (s) => {
        if (s === 'operational') return 'bg-emerald-500/10 border-emerald-500/20';
        if (s === 'degraded') return 'bg-amber-500/10 border-amber-500/20';
        return 'bg-red-500/10 border-red-500/20';
    };

    const getStatusIcon = (s) => {
        if (s === 'operational') return <CheckCircle2 size={18} className="text-emerald-500" />;
        if (s === 'degraded') return <AlertTriangle size={18} className="text-amber-500" />;
        return <XCircle size={18} className="text-red-500" />;
    };

    return (
        <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-emerald-500/30">
            <Head title="System Status - AseroTech Cloud" />

            <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-16">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                            <Box size={22} className="text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">
                            {brand?.name || 'AseroCloud'}
                        </span>
                    </Link>
                    <div className="flex items-center gap-3 px-6 py-3 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-2xl">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${status.summary.incident ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            {status.summary.message}
                        </span>
                    </div>
                </div>

                {/* Main Status Block */}
                <div className="bg-white dark:bg-[#161615] rounded-[2.5rem] border border-zinc-200 dark:border-white/5 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500"></div>
                    
                    <div className="p-8 md:p-12 space-y-12">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Component Status</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Real-time infrastructure health report</p>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                <Clock size={12} />
                                90 Day Snapshot
                            </div>
                        </div>

                        <div className="space-y-10">
                            {status.components.map((component, i) => (
                                <div key={i} className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">{component.name}</h3>
                                                {component.latency > 0 && (
                                                    <span className="text-[8px] font-black bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded-full text-zinc-500 uppercase tracking-widest">
                                                        {component.latency}ms
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-zinc-500 font-medium">{component.description}</p>
                                        </div>
                                        <div className={`flex items-center gap-3 px-3 py-1.5 rounded-full border self-start md:self-auto ${getStatusBg(component.status)}`}>
                                            {getStatusIcon(component.status)}
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${getStatusColor(component.status)}`}>
                                                {component.status}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Uptime Grid */}
                                    <div className="flex gap-1 h-8">
                                        {component.uptime_history.map((dayStatus, j) => (
                                            <div 
                                                key={j} 
                                                className={`flex-1 rounded-sm transition-opacity hover:opacity-50 cursor-help ${dayStatus === 'operational' ? 'bg-emerald-500/40' : 'bg-amber-500'}`}
                                                title={`${90 - j} days ago: ${dayStatus}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 pt-1">
                                        <span>90 Days Ago</span>
                                        <span>Today</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="px-10 py-6 bg-zinc-50/50 dark:bg-black/20 border-t border-zinc-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Activity size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Global Ops Nominal</span>
                        </div>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase">Last Handshake: {new Date(status.last_updated).toLocaleString()}</span>
                    </div>
                </div>

                {/* Incident History */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400">
                            <History size={20} />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Incident History</h3>
                    </div>

                    <div className="space-y-6">
                        {status.incidents.map((incident) => (
                            <div key={incident.id} className="p-8 bg-white dark:bg-[#161615] rounded-[2rem] border border-zinc-200 dark:border-white/5 space-y-4 relative group hover:border-emerald-500/20 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h4 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight">{incident.title}</h4>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{incident.date}</p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest self-start sm:self-auto">
                                        {incident.status}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                    {incident.body}
                                </p>
                                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ShieldCheck size={20} className="text-emerald-500/20" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-12 border-t border-zinc-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">&copy; {new Date().getFullYear()} {brand?.name} infrastructure</p>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">Automated status stream v3.0</p>
                    </div>
                    <Link 
                        href="/login"
                        className="flex items-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all group"
                    >
                        Enter Cloud Dashboard <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

