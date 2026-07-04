import React, { useState } from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { 
    ShoppingCart, 
    CheckCircle2, 
    ChevronRight, 
    CreditCard, 
    Image, 
    ArrowRight, 
    Box, 
    Zap, 
    Cpu, 
    ShieldCheck, 
    Globe, 
    XCircle,
    UploadCloud,
    Smartphone,
    Wallet,
    TrendingUp
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { toast } from 'sonner';

export default function Index({ auth, plans, adminSettings }) {
    const { pricing_rates } = usePage().props;
    const cpuRate = pricing_rates?.cpu ?? 250;
    const ramRate = pricing_rates?.ram ?? 150;
    const storageRate = pricing_rates?.storage ?? 5;

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [step, setStep] = useState(1);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        plan_id: '',
        app_name: '',
        subdomain: '',
        payment_method: 'credits',
        payment_proof: null,
        cpu: 1,
        ram: 1024,
        storage: 10,
        replicas: 1,
    });

    const getCustomPrice = () => {
        const cpu = parseFloat(data.cpu) || 1;
        const memoryGb = (parseInt(data.ram) || 1024) / 1024;
        const storage = parseInt(data.storage) || 10;
        const replicas = parseInt(data.replicas) || 1;
        return ((cpu * cpuRate) + (memoryGb * ramRate) + (storage * storageRate)) * replicas;
    };

    const effectivePrice = selectedPlan?.id === 'custom' ? getCustomPrice() : (selectedPlan ? parseFloat(selectedPlan.price) : 0);

    const openOrderModal = (plan) => {
        setSelectedPlan(plan);
        setData(d => ({
            ...d,
            plan_id: plan.id,
            cpu: 1,
            ram: 1024,
            storage: 10,
            replicas: 1,
        }));
        setStep(1);
    };

    const openCustomOrderModal = () => {
        const virtualPlan = {
            id: 'custom',
            name: 'Custom Flex Node',
            price: cpuRate + ramRate + (10 * storageRate),
            features: ['Configurable vCPU', 'Configurable RAM', 'Configurable SSD', 'Automatic Provisioning']
        };
        setSelectedPlan(virtualPlan);
        setData(d => ({
            ...d,
            plan_id: 'custom',
            cpu: 1,
            ram: 1024,
            storage: 10,
            replicas: 1,
            app_name: '',
            subdomain: '',
            payment_method: 'credits',
            payment_proof: null,
        }));
        setStep(1);
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const submit = (e) => {
        e.preventDefault();
        post(route('orders.store'), {
            onSuccess: () => {
                setSelectedPlan(null);
                reset();
                toast.success('Fulfillment request received.');
            }
        });
    };

    return (
        <div className="space-y-12">
            <Head title="Marketplace" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">Cloud Marketplace</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Launch specialized hosting tiers in seconds.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <div key={plan.id} className="group bg-white dark:bg-[#161615] rounded-[2.5rem] p-10 border border-zinc-200 dark:border-white/5 shadow-sm hover:border-emerald-500/30 transition-all duration-500 flex flex-col relative overflow-hidden">
                        <div className="mb-8 flex justify-between items-start">
                            <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all duration-500 shadow-inner">
                                <Box size={28} />
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 leading-none">Bundle Discount Applied</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">₱{parseFloat(plan.price).toLocaleString()}</span>
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">/mo</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">{plan.name}</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed line-clamp-2">{plan.description}</p>
                        </div>
                        
                        <div className="flex-1 space-y-4 mb-10">
                            {plan.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm font-bold text-zinc-700 dark:text-zinc-300">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 size={12} strokeWidth={3} /></div>
                                    {feature}
                                </div>
                            ))}
                        </div>
                        
                        <button onClick={() => openOrderModal(plan)} className="w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-2px] transition-all">Provision {plan.name}</button>
                    </div>
                ))}

                {/* Custom Flex Node Card */}
                <div className="group bg-gradient-to-br from-zinc-900 to-black dark:from-[#1c1c1a] dark:to-[#0f0f0e] rounded-[2.5rem] p-10 border border-zinc-200 dark:border-white/5 hover:border-emerald-500/30 shadow-2xl flex flex-col relative overflow-hidden transition-all duration-500">
                    <div className="mb-8 flex justify-between items-start">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-all duration-500">
                            <Zap size={28} />
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">Flex Tier</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-2xl font-black tracking-tight text-white mb-2">Custom Flex Node</h3>
                        <p className="text-sm text-zinc-400 font-medium leading-relaxed line-clamp-2">Build your own virtual hosting cluster. Scale vCPU, Memory, and SSD storage dynamically.</p>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-4 mb-8 text-zinc-300">
                            <div className="flex items-center gap-3 text-sm font-bold">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 size={12} strokeWidth={3} /></div>
                                0.5 to 8 vCPU Cores (₱{cpuRate}/core)
                            </div>
                            <div className="flex items-center gap-3 text-sm font-bold">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 size={12} strokeWidth={3} /></div>
                                512 MB to 16 GB RAM (₱{ramRate}/GB)
                            </div>
                            <div className="flex items-center gap-3 text-sm font-bold">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 size={12} strokeWidth={3} /></div>
                                10 GB to 200 GB Storage (₱{storageRate}/GB)
                            </div>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-medium leading-relaxed border-t border-zinc-800 pt-4 mb-8">
                            * Custom resources use on-demand rates. Standard plans have pre-packaged bundle discounts of up to 68% pre-applied.
                        </div>
                    </div>
                    
                    <button onClick={openCustomOrderModal} className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-2px] transition-all">Configure Flex Node</button>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-[80px] group-hover:bg-emerald-500/20 transition-colors"></div>
                </div>
            </div>

            {selectedPlan && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" onClick={() => setSelectedPlan(null)}></div>
                    <div className="relative w-full max-w-2xl bg-white dark:bg-[#161615] rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-white/5 overflow-hidden flex flex-col p-10">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black tracking-tighter uppercase">Fulfillment Engine</h3>
                            <button onClick={() => setSelectedPlan(null)}><XCircle size={24} className="text-zinc-400" /></button>
                        </div>

                        <form onSubmit={submit} className="space-y-8">
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <input type="text" placeholder="Instance Name" value={data.app_name} onChange={e => setData('app_name', e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none" required />
                                        <div className="flex items-center">
                                            <input type="text" placeholder="subdomain" value={data.subdomain} onChange={e => setData('subdomain', e.target.value.toLowerCase())} className="flex-1 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-l-2xl outline-none" required />
                                            <span className="p-4 bg-zinc-100 dark:bg-white/5 rounded-r-2xl text-xs font-black uppercase">.aserotech.com</span>
                                        </div>
                                    </div>

                                    {selectedPlan.id === 'custom' && (
                                        <div className="bg-zinc-50 dark:bg-black/40 rounded-3xl p-6 border border-zinc-200 dark:border-white/5 space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Resource Customization</p>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {/* CPU Slider */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                                        <span>vCPU Cores</span>
                                                        <span className="text-zinc-900 dark:text-white">{data.cpu} Cores</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            type="button"
                                                            onClick={() => setData('cpu', Math.max(0.5, data.cpu - 0.5))}
                                                            className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl font-black text-base text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                                                        >
                                                            -
                                                        </button>
                                                        <input 
                                                            type="range" 
                                                            min="0.5" 
                                                            max="8" 
                                                            step="0.5"
                                                            value={data.cpu} 
                                                            onChange={e => setData('cpu', parseFloat(e.target.value))}
                                                            className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-500" 
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => setData('cpu', Math.min(8, data.cpu + 0.5))}
                                                            className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl font-black text-base text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* RAM Slider */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                                        <span>Memory (RAM)</span>
                                                        <span className="text-zinc-900 dark:text-white">
                                                            {data.ram >= 1024 ? `${data.ram / 1024} GB` : `${data.ram} MB`}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            type="button"
                                                            onClick={() => setData('ram', Math.max(512, data.ram - 512))}
                                                            className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl font-black text-base text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                                                        >
                                                            -
                                                        </button>
                                                        <input 
                                                            type="range" 
                                                            min="512" 
                                                            max="16384" 
                                                            step="512"
                                                            value={data.ram} 
                                                            onChange={e => setData('ram', parseInt(e.target.value))}
                                                            className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-500" 
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => setData('ram', Math.min(16384, data.ram + 512))}
                                                            className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl font-black text-base text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* SSD Storage Slider */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                                        <span>SSD Storage</span>
                                                        <span className="text-zinc-900 dark:text-white">{data.storage} GB</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            type="button"
                                                            onClick={() => setData('storage', Math.max(10, data.storage - 10))}
                                                            className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl font-black text-base text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                                                        >
                                                            -
                                                        </button>
                                                        <input 
                                                            type="range" 
                                                            min="10" 
                                                            max="200" 
                                                            step="10"
                                                            value={data.storage} 
                                                            onChange={e => setData('storage', parseInt(e.target.value))}
                                                            className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-500" 
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => setData('storage', Math.min(200, data.storage + 10))}
                                                            className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl font-black text-base text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Replicas Slider */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                                        <span>Replicas</span>
                                                        <span className="text-zinc-900 dark:text-white">{data.replicas} Instance(s)</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            type="button"
                                                            onClick={() => setData('replicas', Math.max(1, data.replicas - 1))}
                                                            className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl font-black text-base text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                                                        >
                                                            -
                                                        </button>
                                                        <input 
                                                            type="range" 
                                                            min="1" 
                                                            max="5" 
                                                            step="1"
                                                            value={data.replicas} 
                                                            onChange={e => setData('replicas', parseInt(e.target.value))}
                                                            className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-500" 
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => setData('replicas', Math.min(5, data.replicas + 1))}
                                                            className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl font-black text-base text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price summary */}
                                            <div className="pt-4 border-t border-zinc-200 dark:border-white/5 flex flex-col gap-2">
                                                <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                                    <span>Flex Pricing</span>
                                                    <span className="text-zinc-900 dark:text-white text-sm">₱{effectivePrice.toLocaleString()}/mo</span>
                                                </div>
                                                <div className="text-[8px] font-black uppercase text-zinc-400 tracking-widest text-right leading-relaxed">
                                                    Rates: ₱{cpuRate}/vCPU · ₱{ramRate}/GB RAM · ₱{storageRate}/GB SSD
                                                </div>
                                                <div className="text-[9px] text-zinc-400 font-medium leading-relaxed mt-1">
                                                    * Note: On-demand rates apply to custom configurations. Pre-packaged plans include bundle discounts.
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Select Settlement Method</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button 
                                                type="button" 
                                                onClick={() => setData('payment_method', 'credits')}
                                                className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${data.payment_method === 'credits' ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900' : 'bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/5 text-zinc-500'}`}
                                            >
                                                <Wallet size={24} />
                                                <span className="text-[10px] font-black uppercase">Credits</span>
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setData('payment_method', 'qrph')}
                                                className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${data.payment_method === 'qrph' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/5 text-zinc-500'}`}
                                            >
                                                <Smartphone size={24} />
                                                <span className="text-[10px] font-black uppercase">GCash QRPH</span>
                                            </button>
                                        </div>
                                    </div>

                                    <button type="button" onClick={nextStep} className="w-full py-5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs uppercase tracking-[0.2em] shadow-xl">Proceed to Authorization</button>
                                </div>
                            )}

                            {step === 2 && data.payment_method === 'credits' && (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-[2rem] bg-zinc-900 text-white border border-emerald-500/30">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <Wallet className="text-emerald-500" />
                                                <h5 className="font-black uppercase text-xs">Cloud Credits</h5>
                                            </div>
                                            <CheckCircle2 className="text-emerald-500" />
                                        </div>
                                        <p className="text-[10px] uppercase font-bold text-zinc-400">Available Balance</p>
                                        <p className="text-2xl font-black">₱{parseFloat(auth.user.credits).toLocaleString()}</p>
                                    </div>
                                    
                                    <div className="flex gap-4">
                                        <button type="button" onClick={prevStep} className="flex-1 py-4 rounded-2xl bg-zinc-100 dark:bg-white/5 font-black text-[10px] uppercase">Back</button>
                                        <button disabled={processing || auth.user.credits < effectivePrice} className="flex-[2] py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs uppercase shadow-xl transition-all">
                                            {auth.user.credits < effectivePrice ? 'Insufficient Balance' : 'Confirm Provisioning'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && data.payment_method === 'qrph' && (
                                <div className="space-y-8">
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <div className="p-4 bg-white rounded-3xl border-4 border-emerald-500/20 shadow-2xl">
                                            {adminSettings?.gcash_qr_path ? (
                                                <img src={`/storage/${adminSettings.gcash_qr_path}`} className="w-48 h-48 rounded-xl object-contain" alt="GCash QRPH" />
                                            ) : (
                                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=GCashQRPH" className="w-48 h-48 rounded-xl" alt="GCash QRPH Placeholder" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">Scan with GCash or Maya</p>
                                            <p className="text-[10px] font-medium text-zinc-500">Pay exactly ₱{effectivePrice.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block p-8 border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-[2rem] hover:border-emerald-500/50 transition-colors cursor-pointer text-center group">
                                            <input type="file" className="hidden" onChange={e => setData('payment_proof', e.target.files[0])} accept="image/*" required />
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 transition-colors">
                                                    <UploadCloud size={24} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">{data.payment_proof ? data.payment_proof.name : 'Upload Screenshot'}</p>
                                                    <p className="text-[10px] font-medium text-zinc-500">PNG, JPG or JPEG (Max 5MB)</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="flex gap-4">
                                        <button type="button" onClick={prevStep} className="flex-1 py-4 rounded-2xl bg-zinc-100 dark:bg-white/5 font-black text-[10px] uppercase">Back</button>
                                        <button disabled={processing || !data.payment_proof} className="flex-[2] py-4 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase shadow-xl transition-all">
                                            Submit Proof
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

Index.layout = page => <AuthenticatedLayout children={page} />;
