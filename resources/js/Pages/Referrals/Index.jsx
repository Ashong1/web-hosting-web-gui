import React from 'react';
import { Head } from '@inertiajs/react';
import { 
    Users, 
    TrendingUp, 
    Copy, 
    CheckCircle2, 
    ShieldCheck,
    Zap
} from 'lucide-react';
import { toast } from 'sonner';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, referral_code, referrals, total_earned }) {
    const referralLink = `${window.location.origin}/register?ref=${referral_code}`;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Referral link copied to clipboard');
    };

    return (
        <div className="space-y-12">
            <Head title="Referrals & Affiliates" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">Affiliate Relay</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mt-1">Grow the ecosystem, earn cloud credits.</p>
                </div>
            </div>

            <div className="space-y-10">
                {/* Promo Banner */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20">
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest">
                                <Zap size={14} className="text-amber-400" /> Ecosystem Growth Program
                            </div>
                            <h3 className="text-4xl font-black tracking-tighter leading-none uppercase">Invite your fleet, <br/>get paid in credits.</h3>
                            <p className="text-indigo-100/70 font-medium leading-relaxed max-w-md">
                                Receive a <span className="text-white font-bold text-lg mx-1">5% commission</span> on every renewal made by clients you onboard.
                            </p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200/50">Your Unique invite Link</p>
                            <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                                <code className="text-xs font-mono text-indigo-100 truncate flex-1">{referralLink}</code>
                                <button onClick={() => copyToClipboard(referralLink)} className="p-2 rounded-xl bg-white text-indigo-600 hover:scale-110 transition-all shadow-lg"><Copy size={16} /></button>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -bottom-20 -right-20 opacity-10 rotate-12"><Users size={400} /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-[#161615] rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/5 shadow-sm space-y-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 w-fit"><Users size={24} /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Referrals</p>
                            <p className="text-3xl font-black text-zinc-900 dark:text-white mt-1">{referrals.length}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#161615] rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/5 shadow-sm space-y-4">
                        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 w-fit"><TrendingUp size={24} /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Commission Earned</p>
                            <p className="text-3xl font-black text-zinc-900 dark:text-white mt-1">₱{parseFloat(total_earned).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#161615] rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/5 shadow-sm space-y-4">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 w-fit"><ShieldCheck size={24} /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Current Balance</p>
                            <p className="text-3xl font-black text-zinc-900 dark:text-white mt-1">₱{parseFloat(auth.user.credits).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Index.layout = page => <AuthenticatedLayout children={page} />;
