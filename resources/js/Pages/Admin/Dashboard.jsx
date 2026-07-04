import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
    Users, 
    Server, 
    CircleDollarSign, 
    Clock, 
    ArrowUpRight, 
    CheckCircle2, 
    XCircle, 
    MoreHorizontal, 
    ExternalLink, 
    Activity,
    AlertCircle,
    ChevronRight,
    Search,
    Filter,
    ShieldCheck,
    Wifi
} from 'lucide-react';
import GlobalStatusBoard from '@/Components/GlobalStatusBoard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Dashboard({ auth, pendingOrders, totalClients, activeInstances, totalRevenue, recentActivity, uptimeKumaUrl }) {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showRejectForm, setShowRejectForm] = useState(false);
    
    const { post, processing, data, setData, reset } = useForm({
        notes: '',
    });

    const approve = (orderId) => {
        if (!confirm('Are you sure you want to approve and deploy this instance?')) return;
        post(route('admin.orders.approve', orderId), {
            onSuccess: () => setSelectedOrder(null)
        });
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        post(route('admin.orders.reject', selectedOrder.id), {
            onSuccess: () => {
                setSelectedOrder(null);
                reset('notes');
            }
        });
    };

    const openModal = (order) => {
        setSelectedOrder(order);
        setShowRejectForm(false);
    };

    return (
        <div className="space-y-10">
            <Head title="Admin Dashboard" />

            {/* Header moved inside component */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">Control Plane</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Orchestrate your global cloud infrastructure and client fleet.</p>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Total Clients</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black text-zinc-900 dark:text-white leading-none">{totalClients}</span>
                                <span className="text-[10px] font-bold text-emerald-500 flex items-center mb-1">
                                    <ArrowUpRight size={10} strokeWidth={3} />
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                            <Server size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Running Instances</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black text-zinc-900 dark:text-white leading-none">{activeInstances}</span>
                                <span className="text-[10px] font-bold text-blue-500 flex items-center mb-1">
                                    <Activity size={10} strokeWidth={3} className="mr-1" />
                                    Live
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                            <CircleDollarSign size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Total Revenue</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-500 leading-none">₱{totalRevenue.toLocaleString()}</span>
                                <span className="text-[10px] font-bold text-zinc-400 mb-1">MRR</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${pendingOrders.length > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-zinc-100 dark:bg-white/5 text-zinc-400'}`}>
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Pending Orders</p>
                            <div className="flex items-end gap-2">
                                <span className={`text-3xl font-black leading-none ${pendingOrders.length > 0 ? 'text-amber-500' : 'text-zinc-900 dark:text-white'}`}>{pendingOrders.length}</span>
                                {pendingOrders.length > 0 && (
                                    <span className="text-[10px] font-bold text-amber-500 flex items-center mb-1 animate-pulse">
                                        <AlertCircle size={10} strokeWidth={3} className="mr-1" />
                                        Action
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Order Fulfillment Queue */}
                    <div className="glass-panel rounded-[2rem] overflow-hidden">
                        <div className="px-8 py-6 border-b border-zinc-200 dark:border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">Fulfillment Queue</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Verify payments and authorize deployments.</p>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-zinc-50/50 dark:bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 dark:border-white/5">
                                        <th className="px-8 py-4">Client</th>
                                        <th className="px-8 py-4">Plan</th>
                                        <th className="px-8 py-4">Amount</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-zinc-200 dark:divide-white/5">
                                    {pendingOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4 grayscale opacity-20">
                                                    <CheckCircle2 size={48} />
                                                    <p className="font-black uppercase tracking-widest text-xs">Queue is clear</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        pendingOrders.map((order) => (
                                            <tr 
                                                key={order.id} 
                                                className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                                                onClick={() => openModal(order)}
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-xs text-zinc-500">
                                                            {order.user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-zinc-900 dark:text-white">{order.user.name}</div>
                                                            <div className="text-xs text-zinc-500 dark:text-zinc-400">{order.user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-xs font-medium">
                                                    <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-tighter">{order.plan_name}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="font-black text-zinc-900 dark:text-white">₱{parseFloat(order.amount).toLocaleString()}</div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10">
                                                        Verify
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* System Health Status (Native Design) */}
                    <div className="glass-panel rounded-[2rem] overflow-hidden">
                        <div className="px-8 py-6 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between">
                            <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">Infrastructure Health</h3>
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 animate-pulse">
                                <Activity size={18} />
                            </div>
                        </div>
                        <div className="p-8">
                            <GlobalStatusBoard />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Activity Log */}
                    <div className="glass-panel rounded-[2rem] overflow-hidden">
                        <div className="px-8 py-6 border-b border-zinc-200 dark:border-white/5">
                            <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">System Activity</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-1">
                                {recentActivity.map((activity, index) => (
                                    <div key={index} className="flex gap-4 p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group">
                                        <div className="relative">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10 mt-1.5 relative z-10"></div>
                                            {index !== recentActivity.length - 1 && (
                                                <div className="absolute top-4 left-1.25 w-px h-full bg-zinc-100 dark:bg-zinc-800 -translate-x-1/2"></div>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed tracking-tight">{activity.description}</p>
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-500 transition-colors">
                                                <Clock size={10} />
                                                {activity.created_at}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Verification Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" onClick={() => setSelectedOrder(null)}></div>
                    <div className="relative w-full max-w-4xl glass-modal rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden">
                        <div className="flex-1 bg-zinc-100 dark:bg-black/40 flex items-center justify-center p-8">
                            {selectedOrder.payment_proof_path ? (
                                <img src={`/storage/${selectedOrder.payment_proof_path}`} className="max-w-full max-h-[500px] rounded-2xl shadow-2xl" />
                            ) : (
                                <div className="text-zinc-400 flex flex-col items-center gap-4">
                                    <Clock size={64} className="opacity-20" />
                                    <p className="font-black uppercase tracking-widest text-xs">No visual proof required (Balance Pay)</p>
                                </div>
                            )}
                        </div>
                        <div className="md:w-[380px] p-8 space-y-8">
                            <h3 className="text-2xl font-black uppercase tracking-tighter">Verify Transaction</h3>
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 space-y-1">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase">Amount</p>
                                    <p className="text-xl font-black">₱{parseFloat(selectedOrder.amount).toLocaleString()}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 space-y-1">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase">Plan</p>
                                    <p className="text-sm font-bold uppercase">{selectedOrder.plan_name}</p>
                                </div>
                            </div>
                            {!showRejectForm ? (
                                <div className="space-y-3">
                                    <button 
                                        onClick={() => approve(selectedOrder.id)} 
                                        disabled={processing} 
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all text-white rounded-2xl font-black text-xs uppercase tracking-widest"
                                    >
                                        Approve & Deploy
                                    </button>
                                    <button 
                                        onClick={() => setShowRejectForm(true)} 
                                        className="w-full py-4 bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all text-white rounded-2xl font-black text-xs uppercase tracking-widest"
                                    >
                                        Reject Transaction
                                    </button>
                                    <button 
                                        onClick={() => setSelectedOrder(null)} 
                                        className="w-full py-4 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 active:scale-95 transition-all rounded-2xl font-black text-xs uppercase tracking-widest text-zinc-900 dark:text-white"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleRejectSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase">Rejection Reason</label>
                                        <textarea
                                            value={data.notes}
                                            onChange={e => setData('notes', e.target.value)}
                                            placeholder="Enter rejection reason for client..."
                                            required
                                            className="w-full h-32 p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm placeholder-zinc-400"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <button 
                                            type="submit" 
                                            disabled={processing} 
                                            className="flex-1 py-4 bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all text-white rounded-2xl font-black text-xs uppercase tracking-widest"
                                        >
                                            Reject
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => { setShowRejectForm(false); reset('notes'); }} 
                                            className="flex-1 py-4 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 active:scale-95 transition-all rounded-2xl font-black text-xs uppercase tracking-widest text-zinc-900 dark:text-white"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

Dashboard.layout = page => <AuthenticatedLayout children={page} />;
