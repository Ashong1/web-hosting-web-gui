import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    CreditCard, 
    Download, 
    Clock, 
    AlertCircle, 
    CheckCircle2, 
    ChevronRight, 
    Search, 
    Filter, 
    FileText, 
    HelpCircle,
    Layers,
    Wallet,
    Calendar,
    ArrowUpRight,
    History,
    FileCheck,
    Plus,
    Zap,
    TrendingUp,
    TrendingDown,
    ShieldCheck,
    Smartphone,
    UploadCloud,
    XCircle
} from 'lucide-react';
import Pagination from '@/Components/Pagination';
import { toast } from 'sonner';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, orders, transactions, adminSettings }) {
    const [activeTab, setActiveTab] = useState('credits');
    const [topupAmount, setTopupAmount] = useState(500);
    const [showManualModal, setShowManualModal] = useState(false);

    const subscriptions = (orders?.data || []).filter(o => o.status === 'fulfilled' || o.status === 'approved');

    const { data, setData, post, processing, reset } = useForm({
        amount: 500,
        payment_proof: null,
    });

    const handleTopup = async () => {
        try {
            const response = await axios.post(route('payment.topup-intent'), {
                amount: topupAmount
            });
            
            if (response.data.client_secret) {
                toast.success(`Redirecting to GCash/Maya for ₱${topupAmount} top-up...`);
                setTimeout(() => window.location.reload(), 2000);
            }
        } catch (error) {
            toast.error('Top-up initialization failed.');
        }
    };

    const submitManual = (e) => {
        e.preventDefault();
        post(route('payment.manual-topup'), {
            onSuccess: () => {
                setShowManualModal(false);
                reset();
                toast.success('Manual deposit submitted for verification.');
            }
        });
    };

    return (
        <>
            <Head title="Billing" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">Fiscal Control</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Manage your cloud credits and records.</p>
                </div>
                <div className="flex bg-white dark:bg-[#161615] p-1 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
                    <button onClick={() => setActiveTab('credits')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'credits' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}>Credits</button>
                    <button onClick={() => setActiveTab('ledger')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'ledger' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}>Ledger</button>
                </div>
            </div>

            <div className="space-y-10">
                {/* Credit Balance Card */}
                <div className="bg-gradient-to-br from-zinc-900 to-black rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5 transition-colors duration-700">
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest">
                                <ShieldCheck size={14} className="text-emerald-400" /> Secure Cloud Wallet
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Available Credit Balance</p>
                                <h3 className="text-6xl font-black tracking-tighter mt-2">₱{parseFloat(auth.user.credits).toLocaleString()}</h3>
                            </div>
                            <p className="text-zinc-400 font-medium leading-relaxed max-w-md">
                                Use your credits for instant, 1-click node provisioning and renewals. Top-up via GCash, Maya, or Credit Card.
                            </p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 space-y-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Instant Top-up</p>
                            <div className="grid grid-cols-3 gap-3">
                                {[500, 1000, 2500].map(amt => (
                                    <button 
                                        key={amt}
                                        onClick={() => { setTopupAmount(amt); setData('amount', amt); }}
                                        className={`py-3 rounded-xl font-black text-xs transition-all border ${topupAmount === amt ? 'bg-white text-black border-white' : 'bg-black/20 text-white border-white/10 hover:border-white/30'}`}
                                    >
                                        ₱{amt}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    onClick={handleTopup}
                                    className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
                                >
                                    Deposit <Plus size={18} strokeWidth={3} />
                                </button>
                                <button 
                                    onClick={() => setShowManualModal(true)}
                                    className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
                                >
                                    QRPH <Smartphone size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {showManualModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" onClick={() => setShowManualModal(false)}></div>
                        <div className="relative w-full max-w-lg bg-white dark:bg-[#161615] rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-white/5 p-10 overflow-hidden">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-black tracking-tighter uppercase">Manual GCash Deposit</h3>
                                <button onClick={() => setShowManualModal(false)}><XCircle size={24} className="text-zinc-400" /></button>
                            </div>

                            <form onSubmit={submitManual} className="space-y-8">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="p-4 bg-white rounded-3xl border-4 border-emerald-500/20 shadow-2xl">
                                        {adminSettings?.gcash_qr_path ? (
                                            <img src={`/storage/${adminSettings.gcash_qr_path}`} className="w-40 h-40 rounded-xl object-contain" alt="GCash QRPH" />
                                        ) : (
                                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=GCashQRPH" className="w-40 h-40 rounded-xl" alt="GCash QRPH Placeholder" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">Scan to Pay ₱{parseFloat(data.amount).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block p-6 border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-[2rem] hover:border-emerald-500/50 transition-colors cursor-pointer text-center group">
                                        <input type="file" className="hidden" onChange={e => setData('payment_proof', e.target.files[0])} accept="image/*" required />
                                        <div className="flex flex-col items-center gap-2">
                                            <UploadCloud size={20} className="text-zinc-400 group-hover:text-emerald-500" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">{data.payment_proof ? data.payment_proof.name : 'Upload Screenshot'}</p>
                                        </div>
                                    </label>
                                </div>

                                <button disabled={processing || !data.payment_proof} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Submit Deposit Proof</button>
                            </form>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-[#161615] rounded-[2rem] p-8 border border-zinc-200 dark:border-white/5 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Commitment</p>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">₱{subscriptions.reduce((acc, o) => acc + parseFloat(o.amount), 0).toLocaleString()}</span>
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">/mo</span>
                        </div>
                    </div>
                </div>

                {activeTab === 'credits' && (
                    <div className="bg-white dark:bg-[#161615] rounded-[2rem] shadow-sm border border-zinc-200 dark:border-white/5 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-zinc-50/50 dark:bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 dark:border-white/5">
                                        <th className="px-8 py-5">Type</th>
                                        <th className="px-8 py-5">Description</th>
                                        <th className="px-8 py-5">Amount</th>
                                        <th className="px-8 py-5 text-right">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-zinc-200 dark:divide-white/5">
                                    {(transactions || []).map((tx) => (
                                        <tr key={tx.id}>
                                            <td className="px-8 py-5">{tx.type}</td>
                                            <td className="px-8 py-5">{tx.description}</td>
                                            <td className="px-8 py-5 font-black">₱{Math.abs(parseFloat(tx.amount)).toLocaleString()}</td>
                                            <td className="px-8 py-5 text-right font-medium">{new Date(tx.created_at).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = page => <AuthenticatedLayout children={page} />;
