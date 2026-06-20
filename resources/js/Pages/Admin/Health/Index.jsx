import React from 'react';
import { Head } from '@inertiajs/react';
import { Activity, Server, Globe, Cpu, Zap, AlertCircle, CheckCircle2, Wifi, Clock, Layers } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ health }) {
    return (
        <div className="space-y-10">
            <Head title="System Health - Admin" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">System Core Pulse</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Real-time status monitoring for critical infrastructure APIs.</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Global Ops Nominal</span>
                </div>
            </div>

            {/* Global Infrastructure Handshake */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(health.services).map(([key, service]) => (
                    <div key={key} className="bg-white dark:bg-[#161615] rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/5 space-y-6 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div className={`p-4 rounded-2xl ${service.status === 'online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {key === 'cloudflare' && <Globe size={24} />}
                                {key === 'proxmox' && <Server size={24} />}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                service.status === 'online' 
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' 
                                : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20'
                            }`}>
                                {service.status}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">{service.name}</h3>
                            <div className="flex items-center gap-2 text-zinc-500">
                                <Clock size={12} />
                                <span className="text-[10px] font-bold uppercase">API Latency: {service.latency}ms</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Layers size={18} className="text-emerald-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Compute Fleet Clusters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(health.nodes).map(([id, node]) => (
                        <div key={id} className="bg-white dark:bg-[#161615] rounded-[2rem] p-8 border border-zinc-200 dark:border-white/5 space-y-5">
                            <div className="flex justify-between items-center">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                    <Cpu size={20} />
                                </div>
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                                    (node.status === 'operational' || node.status === 'online') 
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' 
                                    : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20'
                                }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${(node.status === 'operational' || node.status === 'online') ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                    <span className="text-[8px] font-black uppercase tracking-widest">{node.status}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider truncate">{node.name}</h4>
                                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">{node.location}</p>
                            </div>
                            <div className="pt-4 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Latency</span>
                                <span className="text-[10px] font-black text-emerald-500 font-mono">{node.latency}ms</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Queue Backlog */}
                <div className="bg-white dark:bg-[#161615] rounded-[2.5rem] p-10 border border-zinc-200 dark:border-white/5 space-y-8">
                    <div className="flex items-center gap-4">
                        <Activity className="text-emerald-500" size={20} />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Queue Processing Pipeline</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-zinc-900 dark:text-white font-mono">{health.queue.backlog}</p>
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Pending Jobs</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-red-500 font-mono">{health.queue.failed}</p>
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Failed Tasks</p>
                        </div>
                    </div>
                </div>

                {/* Fleet Overview */}
                <div className="bg-white dark:bg-[#161615] rounded-[2.5rem] p-10 border border-zinc-200 dark:border-white/5 space-y-8">
                    <div className="flex items-center gap-4">
                        <Zap className="text-amber-500" size={20} />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Cluster Fleet Utilization</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-zinc-900 dark:text-white font-mono">{health.cluster.total_instances}</p>
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Nodes Provisioned</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-emerald-500 font-mono">{health.cluster.active_instances}</p>
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Operational Nodes</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 flex gap-4">
                <AlertCircle className="text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase leading-relaxed">
                    Infrastructure heartbeats are measured via direct API handshakes. High latency or degraded status in Dokploy may impact deployment orchestration times.
                </p>
            </div>
        </div>
    );
}

Index.layout = page => <AuthenticatedLayout children={page} />;
