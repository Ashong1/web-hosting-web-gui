import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Edit2, Trash2, X, Check, Box, Cpu, HardDrive, Zap, Search, Filter } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, plans }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        price: '',
        image: '',
        description: '',
        features: '',
        resource_limits: { cpu: '1', memory: '1024' },
        is_active: true,
    });

    const openModal = (plan = null) => {
        setEditingPlan(plan);
        if (plan) {
            setData({
                name: plan.name,
                price: plan.price,
                image: plan.image,
                description: plan.description || '',
                features: plan.features.join('\n'),
                resource_limits: plan.resource_limits,
                is_active: plan.is_active,
            });
        } else {
            reset();
        }
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const formattedData = {
            ...data,
            features: data.features.split('\n').filter(f => f.trim() !== ''),
        };

        if (editingPlan) {
            put(route('admin.plans.update', editingPlan.id), {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post(route('admin.plans.store'), {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const deletePlan = (id) => {
        if (confirm('Are you sure you want to delete this plan?')) {
            destroy(route('admin.plans.destroy', id));
        }
    };

    return (
        <div className="space-y-10">
            <Head title="Plans Management" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">Plan Architect</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Define and optimize commercial tiers.</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-sm uppercase tracking-widest shadow-xl shadow-black/10 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={18} strokeWidth={3} />
                    Create Tier
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-white dark:bg-[#161615] rounded-[2rem] p-8 border border-zinc-200 dark:border-white/5 shadow-sm hover:border-emerald-500/30 transition-all duration-300 group flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 text-zinc-400 group-hover:text-emerald-500 transition-colors">
                                    <Box size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                    plan.is_active 
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' 
                                    : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20'
                                }`}>
                                    {plan.is_active ? 'Active Tier' : 'Deactivated'}
                                </span>
                            </div>
                            
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-zinc-900 dark:text-white">₱{parseFloat(plan.price).toLocaleString()}</span>
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">/mo</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 py-4 border-y border-zinc-100 dark:border-white/5">
                                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                                    <Cpu size={14} className="opacity-50" />
                                    <span className="text-xs font-bold uppercase tracking-widest">{plan.resource_limits.cpu} vCPU</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                                    <HardDrive size={14} className="opacity-50" />
                                    <span className="text-xs font-bold uppercase tracking-widest">{plan.resource_limits.memory} MB</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button onClick={() => openModal(plan)} className="flex-1 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white font-black text-[10px] uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-white/10 transition-all">Edit</button>
                            <button onClick={() => deletePlan(plan.id)} className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
                
                <button onClick={() => openModal()} className="bg-zinc-50/50 dark:bg-white/[0.02] rounded-[2rem] p-8 border-2 border-dashed border-zinc-200 dark:border-white/10 flex flex-col items-center justify-center gap-4 text-zinc-400 hover:border-emerald-500/50 hover:text-emerald-500 transition-all group min-h-[300px]">
                    <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-zinc-100 dark:border-white/5 shadow-sm group-hover:scale-110 transition-transform"><Plus size={32} /></div>
                    <span className="font-black text-xs uppercase tracking-widest">Architect New Tier</span>
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-xl bg-white dark:bg-[#161615] rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-white/5 p-8 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black tracking-tighter uppercase">{editingPlan ? 'Edit Plan' : 'Architect Tier'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-400 transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Tier Name</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Name" className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Price (PHP)</label>
                                    <input type="number" value={data.price} onChange={e => setData('price', e.target.value)} placeholder="0.00" className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl font-medium" />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white font-black text-[10px] uppercase tracking-widest">Cancel</button>
                                <button disabled={processing} className="flex-[2] py-4 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all">Save Tier</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

Index.layout = page => <AuthenticatedLayout children={page} />;
