import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { User, Mail, Calendar, ShieldAlert, ShieldCheck, MoreVertical, Search, Filter, UserMinus, UserCheck } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, clients }) {
    const { post, processing } = useForm();

    const suspend = (clientId) => {
        if (!confirm('Are you sure you want to change this client\'s status?')) return;
        post(route('admin.clients.suspend', clientId));
    };

    return (
        <div className="space-y-10">
            <Head title="Clients" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">Client Directory</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Manage access and monitor activity across your customer base.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2 shadow-sm">
                        <Search size={18} className="text-zinc-400 mr-2" />
                        <input type="text" placeholder="Search clients..." className="bg-transparent border-none outline-none text-sm font-medium w-48" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#161615] rounded-[2rem] shadow-sm border border-zinc-200 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-zinc-50/50 dark:bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 dark:border-white/5">
                                <th className="px-8 py-5">Client Profile</th>
                                <th className="px-8 py-5">Email Address</th>
                                <th className="px-8 py-5">Fleet Status</th>
                                <th className="px-8 py-5">Access Level</th>
                                <th className="px-8 py-5">Registration</th>
                                <th className="px-8 py-5 text-right">Operational</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-zinc-200 dark:divide-white/5">
                            {clients.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 grayscale opacity-20">
                                            <User size={48} />
                                            <p className="font-black uppercase tracking-widest text-xs">No clients discovered</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                clients.data.map((client) => (
                                    <tr 
                                        key={client.id} 
                                        className={`group transition-colors ${client.is_suspended ? 'bg-red-500/[0.02] dark:bg-red-500/[0.02]' : 'hover:bg-zinc-50 dark:hover:bg-white/[0.02]'}`}
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-300 ${client.is_suspended ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                                    {client.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="font-bold text-zinc-900 dark:text-white leading-tight">{client.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-medium">
                                                <Mail size={14} className="opacity-50" />
                                                {client.email}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-zinc-900 dark:text-white">{client.instances_count}</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Instances</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                                client.is_suspended 
                                                ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20' 
                                                : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${client.is_suspended ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                                                {client.is_suspended ? 'Suspended' : 'Verified Access'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-medium">
                                                <Calendar size={14} className="opacity-50" />
                                                {new Date(client.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button 
                                                onClick={() => suspend(client.id)} 
                                                disabled={processing}
                                                className={`p-2 rounded-xl border transition-all ${
                                                    client.is_suspended 
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white' 
                                                    : 'bg-red-500/10 border-red-500/20 text-red-600 hover:bg-red-500 hover:text-white'
                                                }`}
                                                title={client.is_suspended ? 'Reactivate Client' : 'Suspend Client'}
                                            >
                                                {client.is_suspended ? <UserCheck size={18} /> : <UserMinus size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination links={clients.links} />
            </div>
        </div>
    );
}

Index.layout = page => <AuthenticatedLayout children={page} />;
