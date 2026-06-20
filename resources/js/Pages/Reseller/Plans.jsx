import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { 
    Tag, 
    Save, 
    Info, 
    ChevronRight,
    Zap,
    TrendingUp
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { toast } from 'sonner';

export default function Plans({ auth, plans, overrides }) {
    const { data, setData, post, processing } = useForm({
        plan_id: '',
        custom_price: '',
    });

    const updatePrice = (planId, price) => {
        post(route('reseller.plans.update'), {
            data: { plan_id: planId, custom_price: price },
            onSuccess: () => toast.success('Pricing strategy updated.'),
        });
    };

    return (
        <div className="space-y-12 pb-20">
            <Head title="Custom Pricing" />

            <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">Profit Architect</h2>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Define your margins by overriding base plan costs for your clients.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {plans.map((plan) => {
                    const override = overrides[plan.id];
                    const currentPrice = override ? override.custom_price : plan.price;
                    const margin = currentPrice - plan.price;

                    return (
                        <div key={plan.id} className="bg-white dark:bg-[#161615] rounded-[2.5rem] p-10 border border-zinc-200 dark:border-white/5 shadow-sm hover:border-emerald-500/20 transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                                <div className="space-y-4 max-w-md">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 transition-colors">
                                            <Zap size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black uppercase tracking-tight">{plan.name}</h3>
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Base: ₱{parseFloat(plan.price).toLocaleString()}/mo</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{plan.description}</p>
                                </div>

                                <div className="flex-1 flex flex-col md:flex-row items-center gap-6 md:justify-end">
                                    <div className="w-full md:w-48 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Your Selling Price</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-400">₱</span>
                                            <input 
                                                type="number" 
                                                defaultValue={currentPrice}
                                                onBlur={(e) => updatePrice(plan.id, e.target.value)}
                                                className="w-full pl-8 pr-4 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none focus:border-emerald-500 transition-all font-black text-lg" 
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center md:items-end">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Estimated Margin</p>
                                        <div className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest ${margin >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {margin >= 0 ? '+' : ''}₱{parseFloat(margin).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-8 rounded-[2rem] bg-zinc-900 text-white border border-emerald-500/30 flex gap-6 items-start">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                    <Info size={24} />
                </div>
                <div className="space-y-2">
                    <h5 className="font-black uppercase text-sm tracking-widest">Settlement Protocol</h5>
                    <p className="text-xs font-medium text-zinc-400 leading-relaxed">
                        When a client provisions a node, the <span className="text-white font-bold">Base Price</span> will be deducted from your reseller credit balance. 
                        The <span className="text-emerald-500 font-bold">Selling Price</span> you define here is what the client will see and pay to you directly via your custom payment gateway.
                    </p>
                </div>
            </div>
        </div>
    );
}

Plans.layout = page => <AuthenticatedLayout children={page} />;
