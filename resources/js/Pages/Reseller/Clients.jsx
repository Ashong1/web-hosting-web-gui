import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    Users, 
    Box, 
    ChevronRight, 
    ShieldCheck,
    Search,
    Filter
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Clients({ auth, clients }) {
    return (
        <div className="space-y-10 pb-20">
            <Head title="Client Management" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">Client Fleet</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Manage the entities under your orchestration.</p>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search Fleet Ops..." 
                        className="pl-12 pr-6 py-4 bg-white dark:bg-[#161615] border border-zinc-200 dark:border-white/5 rounded-2xl outline-none focus:border-emerald-500 transition-all font-bold text-sm min-w-[300px]" 
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-[#161615] rounded-[2.5rem] border border-zinc-200 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-100 dark:border-white/5">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Identity</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Live Nodes</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Balance</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                            {clients.data.map((client) => (
                                <tr key={client.id} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 font-black">
                                                {client.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-sm uppercase tracking-tight">{client.name}</p>
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{client.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${client.is_suspended ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                            {client.is_suspended ? 'Suspended' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <Box size={14} className="text-zinc-400" />
                                            <span className="font-black text-sm">{client.instances_count}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="font-black text-sm text-emerald-500">₱{parseFloat(client.credits).toLocaleString()}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-3 rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-all">
                                            <ChevronRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {clients.data.length === 0 && (
                    <div className="py-20 text-center space-y-4">
                        <Users className="mx-auto text-zinc-200 dark:text-zinc-800" size={64} />
                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">No clients found in your fleet</p>
                    </div>
                )}
            </div>
            
            {/* Pagination placeholder */}
            <div className="flex justify-center gap-2">
                {clients.links.map((link, i) => {
                    const Component = link.url ? Link : 'span';
                    return (
                        <Component 
                            key={i}
                            href={link.url}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                link.active 
                                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl' 
                                : link.url 
                                    ? 'bg-white dark:bg-white/5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-white/5' 
                                    : 'bg-zinc-50 dark:bg-white/5 text-zinc-300 dark:text-zinc-700 cursor-not-allowed border border-transparent opacity-40'
                            }`}
                        />
                    );
                })}
            </div>
        </div>
    );
}

Clients.layout = page => <AuthenticatedLayout children={page} />;
