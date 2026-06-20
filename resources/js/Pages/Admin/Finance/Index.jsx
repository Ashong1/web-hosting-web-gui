import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
    TrendingUp, 
    TrendingDown, 
    Wallet, 
    CreditCard, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Clock, 
    ShieldCheck, 
    Filter, 
    Search,
    History,
    FileText,
    Users,
    ChevronRight,
    Zap
} from 'lucide-react';
import Pagination from '@/Components/Pagination';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, stats, transactions }) {
    return (
        <div className="space-y-10">
            <Head title="Finance Hub" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">Finance Command</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Oversee platform liquidity, revenue streams, and credit circulation.</p>
                </div>
            </div>

            {/* Financial Telemetry */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#161615] rounded-[2rem] p-8 border border-zinc-200 dark:border-white/5 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Cash Revenue</p>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">₱{parseFloat(stats.total_cash).toLocaleString()}</span>
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">+ Live</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#161615] rounded-[2rem] p-8 border border-zinc-200 dark:border-white/5 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Credits in Circulation</p>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">₱{parseFloat(stats.total_credits).toLocaleString()}</span>
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#161615] rounded-[2rem] p-8 border border-zinc-200 dark:border-white/5 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <Zap size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Active Commitments</p>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">{stats.active_subscriptions}</span>
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Nodes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction Ledger */}
            <div className="bg-white dark:bg-[#161615] rounded-[2rem] shadow-sm border border-zinc-200 dark:border-white/5 overflow-hidden">
                <div className="px-8 py-6 border-b border-zinc-200 dark:border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-zinc-50/50 dark:bg-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-400">
                            <History size={18} />
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">Global Credit Ledger</h3>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-zinc-50/50 dark:bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 dark:border-white/5">
                                <th className="px-8 py-5">Agent</th>
                                <th className="px-8 py-5">Type</th>
                                <th className="px-8 py-5">Description</th>
                                <th className="px-8 py-5">Amount</th>
                                <th className="px-8 py-5 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-zinc-200 dark:divide-white/5">
                            {transactions.data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 grayscale opacity-20">
                                            <CreditCard size={48} />
                                            <p className="font-black uppercase tracking-widest text-xs">No transactions recorded</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.data.map((tx) => (
                                    <tr key={tx.id} className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-500">
                                                    {tx.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-900 dark:text-white leading-tight">{tx.user.name}</div>
                                                    <div className="text-[10px] text-zinc-400">{tx.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                tx.type === 'deposit' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20'
                                            }`}>
                                                {tx.type}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-zinc-700 dark:text-zinc-300">{tx.description}</td>
                                        <td className={`px-8 py-5 font-black ${tx.type === 'deposit' ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {tx.type === 'deposit' ? '+' : '-'} ₱{Math.abs(parseFloat(tx.amount)).toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5 text-right font-medium text-zinc-400 tabular-nums">
                                            {new Date(tx.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination links={transactions.links} />
            </div>
        </div>
    );
}

Index.layout = page => <AuthenticatedLayout children={page} />;
