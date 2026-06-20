import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Server, User, Globe, Play, Square, Trash2, ExternalLink, Search, Filter, Cpu, Layers } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, instances }) {
    const { post, processing } = useForm();

    const performAction = (instanceId, action) => {
        if (action === 'terminate' && !confirm('Are you absolutely sure? This will destroy all data.')) {
            return;
        }
        post(route('admin.fleet.action', { instance: instanceId, action }));
    };

    return (
        <div className="space-y-10">
            <Head title="Fleet Management" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">Global Fleet</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Monitor and control every container instance across your worker nodes.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2 shadow-sm">
                        <Search size={18} className="text-zinc-400 mr-2" />
                        <input type="text" placeholder="Filter fleet..." className="bg-transparent border-none outline-none text-sm font-medium w-48" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#161615] rounded-[2rem] shadow-sm border border-zinc-200 dark:border-white/5 overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-zinc-50/50 dark:bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 dark:border-white/5">
                                <th className="px-8 py-5">Instance Identity</th>
                                <th className="px-8 py-5">Resource Plan</th>
                                <th className="px-8 py-5">Live Status</th>
                                <th className="px-8 py-5">Network Access</th>
                                <th className="px-8 py-5 text-right">Node Operations</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-zinc-200 dark:divide-white/5">
                            {instances.data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 grayscale opacity-20">
                                            <Layers size={48} />
                                            <p className="font-black uppercase tracking-widest text-xs">No active nodes detected</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                instances.data.map((instance) => (
                                    <tr key={instance.id} className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-emerald-500 transition-colors">
                                                    <Server size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-900 dark:text-white leading-tight">{instance.name}</div>
                                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                        <User size={10} className="opacity-50" />
                                                        {instance.user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 flex items-center justify-center text-zinc-400">
                                                    <Cpu size={14} />
                                                </div>
                                                <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-tighter text-xs">{instance.order.plan_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                                instance.live_status === 'running' 
                                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' 
                                                : instance.live_status === 'stopped'
                                                ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20'
                                                : 'bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border-zinc-100 dark:border-white/10'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    instance.live_status === 'running' 
                                                    ? 'bg-emerald-500 animate-pulse' 
                                                    : instance.live_status === 'stopped'
                                                    ? 'bg-red-500'
                                                    : 'bg-zinc-400'
                                                }`}></span>
                                                {instance.live_status || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <a 
                                                href={`https://${instance.public_url}`} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors group/link"
                                            >
                                                <Globe size={14} className="opacity-50 group-hover/link:text-emerald-500 transition-colors" />
                                                {instance.public_url}
                                                <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                            </a>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => performAction(instance.id, 'start')} 
                                                    disabled={processing} 
                                                    className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm shadow-emerald-500/5"
                                                    title="Start Instance"
                                                >
                                                    <Play size={16} fill="currentColor" />
                                                </button>
                                                <button 
                                                    onClick={() => performAction(instance.id, 'stop')} 
                                                    disabled={processing} 
                                                    className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 hover:bg-amber-500 hover:text-white transition-all shadow-sm shadow-amber-500/5"
                                                    title="Stop Instance"
                                                >
                                                    <Square size={16} fill="currentColor" />
                                                </button>
                                                <div className="w-px h-8 bg-zinc-200 dark:bg-white/5 mx-1"></div>
                                                <button 
                                                    onClick={() => performAction(instance.id, 'terminate')} 
                                                    disabled={processing} 
                                                    className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 hover:bg-red-500 hover:text-white transition-all shadow-sm shadow-red-500/5"
                                                    title="Terminate Instance"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-zinc-200 dark:divide-white/5">
                    {instances.data.length === 0 ? (
                        <div className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-4 grayscale opacity-20">
                                <Layers size={48} />
                                <p className="font-black uppercase tracking-widest text-xs">No active nodes detected</p>
                            </div>
                        </div>
                    ) : (
                        instances.data.map((instance) => (
                            <div key={instance.id} className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                                            <Server size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-zinc-900 dark:text-white leading-tight">{instance.name}</div>
                                            <div className="text-[10px] text-zinc-500 font-medium">{instance.user.email}</div>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                        instance.live_status === 'running' 
                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' 
                                        : 'bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border-zinc-100 dark:border-white/10'
                                    }`}>
                                        {instance.live_status || 'Offline'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-zinc-50 dark:bg-white/[0.02] rounded-xl border border-zinc-100 dark:border-white/5">
                                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Plan</p>
                                        <p className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">{instance.order.plan_name}</p>
                                    </div>
                                    <div className="p-3 bg-zinc-50 dark:bg-white/[0.02] rounded-xl border border-zinc-100 dark:border-white/5">
                                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Endpoint</p>
                                        <a href={`https://${instance.public_url}`} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-emerald-500 truncate block">
                                            {instance.public_url}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => performAction(instance.id, 'start')} 
                                        disabled={processing} 
                                        className="flex-1 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                                    >
                                        <Play size={14} fill="currentColor" /> Start
                                    </button>
                                    <button 
                                        onClick={() => performAction(instance.id, 'stop')} 
                                        disabled={processing} 
                                        className="flex-1 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                                    >
                                        <Square size={14} fill="currentColor" /> Stop
                                    </button>
                                    <button 
                                        onClick={() => performAction(instance.id, 'terminate')} 
                                        disabled={processing} 
                                        className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <Pagination links={instances.links} />
            </div>
        </div>
    );
}

Index.layout = page => <AuthenticatedLayout children={page} />;
