import React from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { 
    ChevronLeft, 
    MessageSquare, 
    Send, 
    Clock, 
    Shield, 
    User, 
    CheckCircle2, 
    XCircle,
    AlertTriangle,
    Zap
} from 'lucide-react';
import { toast } from 'sonner';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ auth, ticket }) {
    const { data, setData, post, processing, reset } = useForm({
        message: '',
    });

    const submitReply = (e) => {
        e.preventDefault();
        post(route('support.reply', ticket.id), {
            onSuccess: () => {
                reset();
                toast.success('Reply transmitted');
            }
        });
    };

    const closeTicket = () => {
        if (confirm('Verify ticket resolution and close protocol?')) {
            post(route('support.close', ticket.id), {
                onSuccess: () => toast.success('Ticket closed successfully')
            });
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'high': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'medium': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        }
    };

    return (
        <div className="space-y-12">
            <Head title={`Ticket: ${ticket.subject}`} />

            {/* Header moved inside component */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <Link href={route('support.index')} className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm">
                        <ChevronLeft size={20} strokeWidth={3} />
                    </Link>
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">{ticket.subject}</h2>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Node #SR-{String(ticket.id || 0).padStart(4, '0')}</span>
                            <div className="w-1 h-1 rounded-full bg-zinc-300"></div>
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                        </div>
                    </div>
                </div>
                {ticket.status !== 'closed' && (
                    <button 
                        onClick={closeTicket}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                        <CheckCircle2 size={16} />
                        Resolve Protocol
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Message Stream */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="space-y-6">
                        {ticket.messages.map((message) => message && (
                            <div key={message.id} className={`flex gap-6 ${message.is_admin_reply ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center text-xs font-black shadow-lg ${
                                    message.is_admin_reply 
                                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-zinc-900/20' 
                                    : 'bg-emerald-500 text-white shadow-emerald-500/20'
                                }`}>
                                    {message.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className={`flex-1 space-y-2 ${message.is_admin_reply ? 'text-right' : ''}`}>
                                    <div className={`flex items-center gap-3 mb-1 ${message.is_admin_reply ? 'justify-end' : ''}`}>
                                        <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest">{message.user.name}</span>
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{new Date(message.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className={`p-6 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm border ${
                                        message.is_admin_reply 
                                        ? 'bg-zinc-900 dark:bg-white text-zinc-100 dark:text-zinc-900 border-zinc-800 dark:border-zinc-200 rounded-tr-none' 
                                        : 'bg-white dark:bg-[#161615] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/5 rounded-tl-none'
                                    }`}>
                                        {message.message}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {ticket.status !== 'closed' ? (
                        <div className="bg-white dark:bg-[#161615] rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/5 shadow-sm">
                            <form onSubmit={submitReply} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-4">Response Buffer</label>
                                    <textarea 
                                        value={data.message}
                                        onChange={e => setData('message', e.target.value)}
                                        placeholder="Transmit technical response..."
                                        className="w-full p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-[2rem] outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm font-medium h-32 resize-none"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button 
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {processing ? 'Transmitting...' : 'Send Response'}
                                        <Send size={16} strokeWidth={3} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="p-12 rounded-[2.5rem] bg-zinc-50 dark:bg-white/5 border border-dashed border-zinc-200 dark:border-white/10 text-center space-y-4">
                            <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto text-zinc-400 shadow-sm">
                                <XCircle size={32} />
                            </div>
                            <h4 className="text-xl font-black text-zinc-400 uppercase tracking-tighter">Protocol Closed</h4>
                            <p className="text-sm text-zinc-500 font-medium max-w-xs mx-auto">This ticket has been resolved and marked as closed. You can no longer transmit responses.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-[#161615] rounded-[2rem] p-8 border border-zinc-200 dark:border-white/5 shadow-sm space-y-8">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Node Intel</p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Protocol Status</p>
                                        <p className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{ticket.status.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Initialization</p>
                                        <p className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{new Date(ticket.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-zinc-100 dark:bg-white/5"></div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Client Agent</p>
                            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-black/20 border border-zinc-100 dark:border-white/5 flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-[10px]">
                                    {ticket.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-black text-zinc-900 dark:text-white truncate">{ticket.user.name}</p>
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest truncate">{ticket.user.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Show.layout = page => <AuthenticatedLayout children={page} />;
