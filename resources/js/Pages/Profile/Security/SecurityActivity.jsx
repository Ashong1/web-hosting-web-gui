import React from 'react';
import { Head } from '@inertiajs/react';
import { Shield, Clock, Globe, Activity, Terminal, ShieldAlert, AlertTriangle } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function SecurityActivity({ auth, logs }) {
    const getEventColor = (event) => {
        if (event.includes('reject') || event.includes('stop')) return 'text-red-500 bg-red-500/10 border-red-500/20';
        if (event.includes('approve') || event.includes('start')) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    };

    return (
        <div className="space-y-12">
            <Head title="Security Activity" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">Security Activity</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Monitor authentication events and technical mutations.</p>
                </div>
            </div>

            <div className="space-y-10">
                {/* Logs Table */}
                <div className="bg-white dark:bg-[#161615] rounded-[2rem] shadow-sm border border-zinc-200 dark:border-white/5 overflow-hidden">
                    <div className="px-8 py-6 border-b border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-transparent flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-400">
                            <Activity size={18} />
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">Transmission Log</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="bg-zinc-50/50 dark:bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 dark:border-white/5">
                                    <th className="px-8 py-5">Protocol Event</th>
                                    <th className="px-8 py-5">Target Node</th>
                                    <th className="px-8 py-5">Transmission Context</th>
                                    <th className="px-8 py-5 text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-zinc-200 dark:divide-white/5">
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-5 font-bold uppercase text-[10px]">{log.event}</td>
                                        <td className="px-8 py-5 font-mono text-[10px] text-zinc-500">{log.target_id || '---'}</td>
                                        <td className="px-8 py-5 font-medium text-zinc-400">{JSON.stringify(log.metadata)}</td>
                                        <td className="px-8 py-5 text-right font-medium text-zinc-400 tabular-nums">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={logs.links} />
                </div>
            </div>
        </div>
    );
}

SecurityActivity.layout = page => <AuthenticatedLayout children={page} />;
