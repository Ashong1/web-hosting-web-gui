import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    LifeBuoy, 
    Plus, 
    MessageSquare, 
    Clock, 
    AlertCircle, 
    CheckCircle2, 
    ChevronRight, 
    Search, 
    Filter,
    Shield,
    XCircle,
    Send
} from 'lucide-react';
import Pagination from '@/Components/Pagination';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, tickets }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        subject: '',
        priority: 'low',
        message: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('support.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            }
        });
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'high': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'medium': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'in_progress': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'resolved': return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
            case 'closed': return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
            default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    return (
        <div className="space-y-12">
            <Head title="Support" />

            {/* Header moved inside component */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">Support Center</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Submit technical inquiries and track resolution protocols.</p>
                </div>
                {!auth.user.is_admin && (
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-sm uppercase tracking-widest shadow-xl shadow-black/10 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus size={18} strokeWidth={3} />
                        Open Ticket
                    </button>
                )}
            </div>

            <div className="space-y-10">
                {/* Tickets Table */}
                <div className="bg-white dark:bg-[#161615] rounded-[2rem] shadow-sm border border-zinc-200 dark:border-white/5 overflow-hidden">
                    <div className="px-8 py-6 border-b border-zinc-200 dark:border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-zinc-50/50 dark:bg-transparent">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-400">
                                <MessageSquare size={18} />
                            </div>
                            <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
                                {auth.user.is_admin ? 'Global Ticket Fleet' : 'My Support Tickets'}
                            </h3>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="bg-zinc-50/50 dark:bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 dark:border-white/5">
                                    <th className="px-8 py-5">Issue Identity</th>
                                    {auth.user.is_admin && <th className="px-8 py-5">Transmitter</th>}
                                    <th className="px-8 py-5">Priority</th>
                                    <th className="px-8 py-5">Lifecycle</th>
                                    <th className="px-8 py-5 text-right">Access</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-zinc-200 dark:divide-white/5">
                                {tickets.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={auth.user.is_admin ? 5 : 4} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 grayscale opacity-20">
                                                <LifeBuoy size={48} />
                                                <p className="font-black uppercase tracking-widest text-xs">No active tickets discovered</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    tickets.data.map((ticket) => ticket && (
                                        <tr key={ticket.id} className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-emerald-500 transition-colors">
                                                        <Shield size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-zinc-900 dark:text-white leading-tight">{ticket.subject}</div>
                                                        <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mt-1">ID: #SR-{String(ticket.id || 0).padStart(4, '0')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {auth.user.is_admin && (
                                                <td className="px-8 py-5">
                                                    <div className="font-bold text-zinc-700 dark:text-zinc-300">{ticket.user.name}</div>
                                                    <div className="text-[10px] text-zinc-400">{ticket.user.email}</div>
                                                </td>
                                            )}
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getPriorityColor(ticket.priority)}`}>
                                                    {ticket.priority}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${getStatusColor(ticket.status)}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'open' ? 'animate-pulse' : ''} bg-current`}></span>
                                                    {ticket.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <Link 
                                                    href={route('support.show', ticket.id)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 transition-transform group-hover:scale-105 active:scale-95"
                                                >
                                                    View
                                                    <ChevronRight size={12} strokeWidth={3} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={tickets.links} />
                </div>
            </div>

            {/* Create Ticket Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
                    <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" onClick={() => setIsCreateModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-white dark:bg-[#161615] rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-white/5 overflow-hidden flex flex-col">
                        <div className="px-10 py-8 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center bg-zinc-50/50 dark:bg-transparent">
                            <h3 className="text-xl font-black tracking-tighter uppercase">Support Protocol</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 rounded-xl bg-zinc-50 dark:bg-white/5 transition-colors">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <form onSubmit={submit} className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Subject</label>
                                    <input type="text" value={data.subject} onChange={e => setData('subject', e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none text-sm" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Urgency</label>
                                    <select value={data.priority} onChange={e => setData('priority', e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none text-sm font-black uppercase tracking-widest">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Manifest</label>
                                <textarea value={data.message} onChange={e => setData('message', e.target.value)} className="w-full p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-[2rem] outline-none text-sm h-48 resize-none" required />
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-4 rounded-2xl bg-zinc-100 dark:bg-white/5 font-black text-[10px] uppercase">Abort</button>
                                <button disabled={processing} className="flex-[2] py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs uppercase shadow-xl transition-all active:scale-95">Transmit Ticket</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

Index.layout = page => <AuthenticatedLayout children={page} />;
