import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    Users, 
    ShoppingCart, 
    TrendingUp, 
    Box, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    ArrowRight,
    Wallet,
    ShieldCheck
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { toast } from 'sonner';

export default function Dashboard({ auth, pendingOrders, stats }) {
    const { post, processing } = useForm();

    const approveOrder = (orderId) => {
        post(route('reseller.orders.approve', orderId), {
            onSuccess: () => toast.success('Order approved and infrastructure provisioned.'),
            onError: (errors) => toast.error(errors.error || 'Failed to approve order.')
        });
    };

    const rejectOrder = (orderId) => {
        const reason = window.prompt('Enter rejection reason:');
        if (reason) {
            post(route('reseller.orders.reject', orderId), {
                data: { notes: reason },
                onSuccess: () => toast.success('Order rejected.'),
            });
        }
    };

    return (
        <div className="space-y-10 pb-20">
            <Head title="Business Hub" />

            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">Business Hub</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Orchestrate your fleet and manage client settlements.</p>
                </div>
                <div className="flex gap-4">
                    <Link href={route('reseller.plans.index')} className="px-6 py-3 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-50 transition-all">Manage Plans</Link>
                    <Link href={route('reseller.index')} className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all">Branding Settings</Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-[#161615] p-8 rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500"><TrendingUp size={20} /></div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Revenue</p>
                        <h3 className="text-3xl font-black tracking-tighter">₱{parseFloat(stats.totalRevenue).toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#161615] p-8 rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500"><Users size={20} /></div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Active Clients</p>
                        <h3 className="text-3xl font-black tracking-tighter">{stats.totalClients}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#161615] p-8 rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500"><Box size={20} /></div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Live Nodes</p>
                        <h3 className="text-3xl font-black tracking-tighter">{stats.activeInstances}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#161615] p-8 rounded-[2rem] border border-emerald-500/20 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500"><Wallet size={20} /></div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Your Credits</p>
                        <h3 className="text-3xl font-black tracking-tighter">₱{parseFloat(stats.credits).toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Pending Orders */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Clock className="text-zinc-400" size={20} />
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Pending Client Requests</h4>
                </div>

                {pendingOrders.length === 0 ? (
                    <div className="bg-zinc-50 dark:bg-white/5 rounded-[2rem] p-12 text-center border-2 border-dashed border-zinc-200 dark:border-white/10">
                        <ShieldCheck className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" size={48} />
                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">No pending fulfillment requests</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {pendingOrders.map((order) => (
                            <div key={order.id} className="bg-white dark:bg-[#161615] p-6 rounded-3xl border border-zinc-200 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-emerald-500/30 transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 transition-colors">
                                        <ShoppingCart size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h5 className="font-black text-sm uppercase">{order.user.name}</h5>
                                            <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-white/5 text-[8px] font-black text-zinc-500 uppercase tracking-widest">Order #{order.id}</span>
                                        </div>
                                        <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tighter">
                                            Plan: <span className="text-zinc-900 dark:text-white">{order.plan_name}</span> • 
                                            Amount: <span className="text-emerald-500">₱{parseFloat(order.amount).toLocaleString()}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {order.payment_proof_path && (
                                        <a 
                                            href={`/storage/${order.payment_proof_path}`} 
                                            target="_blank" 
                                            className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                                        >
                                            View Proof
                                        </a>
                                    )}
                                    <button 
                                        onClick={() => rejectOrder(order.id)}
                                        disabled={processing}
                                        className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <XCircle size={18} />
                                    </button>
                                    <button 
                                        onClick={() => approveOrder(order.id)}
                                        disabled={processing}
                                        className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        Approve & Provision
                                        <CheckCircle2 size={16} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

Dashboard.layout = page => <AuthenticatedLayout children={page} />;
