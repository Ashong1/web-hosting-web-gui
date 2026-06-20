import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Shield, Clock, User, Globe, Info, Activity, Terminal, Search, Filter, ShieldAlert, X, ChevronDown } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function SecurityLedger({ auth, logs, users, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [userId, setUserId] = useState(filters.user_id || '');

    const handleFilter = () => {
        router.get(route('admin.security.ledger'), { search, user_id: userId }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setUserId('');
        router.get(route('admin.security.ledger'));
    };

    const getEventColor = (event) => {
        if (event.startsWith('admin.')) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        if (event.includes('reject') || event.includes('stop') || event.includes('failed')) return 'text-red-500 bg-red-500/10 border-red-500/20';
        if (event.includes('approve') || event.includes('start') || event.includes('success')) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    };

    return (
        <div className="space-y-10">
            <Head title="Security Ledger" />

            {/* Header with Search & Filter */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">Security Ledger</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Real-time audit stream of all platform transmissions.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-2 shadow-sm w-full sm:w-auto">
                        <Search size={18} className="text-zinc-400 mr-2" />
                        <input 
                            type="text" 
                            placeholder="Search event, IP, or data..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleFilter()}
                            className="bg-transparent border-none outline-none text-sm font-medium w-full sm:w-48" 
                        />
                    </div>
                    
                    <div className="relative w-full sm:w-auto">
                        <select 
                            value={userId}
                            onChange={e => setUserId(e.target.value)}
                            className="appearance-none bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-2 pr-10 text-sm font-medium w-full focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        >
                            <option value="">All Agents</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                            onClick={handleFilter}
                            className="flex-1 sm:flex-none px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-80 transition-all"
                        >
                            Filter
                        </button>
                        {(search || userId) && (
                            <button 
                                onClick={clearFilters}
                                className="p-2 bg-zinc-100 dark:bg-white/5 rounded-xl text-zinc-500 hover:text-red-500 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="bg-white dark:bg-[#161615] rounded-[2rem] shadow-sm border border-zinc-200 dark:border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="bg-zinc-50/50 dark:bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 dark:border-white/5">
                                    <th className="px-8 py-5 text-center w-16">Status</th>
                                    <th className="px-8 py-5">Event Protocol</th>
                                    <th className="px-8 py-5">Agent Identity</th>
                                    <th className="px-8 py-5">Security Metadata</th>
                                    <th className="px-8 py-5 text-right">Transmission Log</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-zinc-200 dark:divide-white/5">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 grayscale opacity-20">
                                                <ShieldAlert size={48} />
                                                <p className="font-black uppercase tracking-widest text-xs">No audit logs match your criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-5 text-center">
                                                <div className={`w-2 h-2 rounded-full mx-auto ${log.event.includes('error') || log.event.includes('failed') ? 'bg-red-500' : 'bg-emerald-500'} shadow-[0_0_8px_currentColor]`} />
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="space-y-1">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getEventColor(log.event)}`}>
                                                        {log.event.replace('.', ': ')}
                                                    </span>
                                                    <p className="text-[10px] font-mono text-zinc-500">{log.ip_address}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                                        <User size={14} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-zinc-900 dark:text-white leading-tight">{log.user?.name || 'System Protocol'}</div>
                                                        <div className="text-[9px] text-zinc-500 font-medium uppercase tracking-widest">{log.user?.role || 'Service'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="max-w-[300px] bg-zinc-50 dark:bg-black/20 p-2.5 rounded-xl border border-zinc-100 dark:border-white/5">
                                                    <code className="text-[9px] font-mono text-zinc-500 break-all line-clamp-2 leading-relaxed">
                                                        {JSON.stringify(log.metadata)}
                                                    </code>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="space-y-1">
                                                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                                                        {new Date(log.created_at).toLocaleTimeString()}
                                                    </div>
                                                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                                                        {new Date(log.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={logs.links} />
                </div>
            </div>
        </div>
    );
}

SecurityLedger.layout = page => <AuthenticatedLayout children={page} />;


SecurityLedger.layout = page => <AuthenticatedLayout children={page} />;
