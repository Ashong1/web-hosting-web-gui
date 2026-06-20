import React, { useEffect, useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    Power, 
    PowerOff, 
    RefreshCcw, 
    Terminal, 
    Activity, 
    Settings, 
    ExternalLink, 
    ShieldCheck, 
    Container, 
    Globe, 
    Plus, 
    Key, 
    Cpu, 
    ArrowUpRight, 
    XCircle, 
    AlertCircle,
    CheckCircle2,
    Sparkles,
    HelpCircle,
    ArrowRight,
    Zap,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import TransmissionCenter from '@/Components/TransmissionCenter';

export default function Dashboard({ auth, instances, recentActivity }) {
    const { post, processing } = useForm();
    const [filter, setFilter] = useState('all');
    const [localInstances, setLocalInstances] = useState(instances || []);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    useEffect(() => {
        if (instances) {
            setLocalInstances(instances);
        }
    }, [instances]);

    useEffect(() => {
        // Trigger onboarding modal if user has 0 instances (and instances have loaded) and hasn't dismissed it
        if (instances && instances.length === 0 && !localStorage.getItem('onboarding_dismissed')) {
            setShowWelcomeModal(true);
        }
    }, [instances]);

    const dismissOnboarding = () => {
        localStorage.setItem('onboarding_dismissed', 'true');
        setShowWelcomeModal(false);
    };

    const startOnboarding = () => {
        localStorage.setItem('onboarding_dismissed', 'true');
        setShowWelcomeModal(false);
        router.visit('/deploy/new?tour=true');
    };

    // Real-time Node Status Listener
    useEffect(() => {
        if (window.Echo) {
            const channel = window.Echo.private(`App.Models.User.${auth.user.id}`);
            
            channel.listen('NodeStatusUpdated', (e) => {
                setLocalInstances(prev => {
                    const exists = prev.some(i => i.id === e.instance.id);
                    if (!exists && e.instance.status === 'active') {
                        // This might be a new instance that just finished provisioning
                        return [e.instance, ...prev];
                    }
                    return prev.map(instance => 
                        instance.id === e.instance.id 
                            ? { ...instance, ...e.instance, live_status: e.status } 
                            : instance
                    );
                });
                toast.success(e.message);
            });

            channel.listen('ProvisioningProgressUpdated', (e) => {
                if (e.status === 'completed' && e.step === 'final') {
                    // We can either wait for the NodeStatusUpdated or reload
                    // router.reload({ only: ['instances'] });
                }
            });

            return () => {
                channel.stopListening('NodeStatusUpdated');
                channel.stopListening('ProvisioningProgressUpdated');
            };
        }
    }, [auth.user.id]);

    const performAction = (instanceId, action) => {
        post(route('instances.action', { instance: instanceId, action }), {
            onSuccess: () => toast.success(`Instance ${action}ed successfully`),
        });
    };

    const getDaysLeft = (dateString) => {
        if (!dateString) return null;
        const expiry = new Date(dateString);
        const now = new Date();
        return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    };

    const activeCount = localInstances?.filter(i => i.live_status === 'running').length || 0;
    const expiringCount = localInstances?.filter(i => {
        const days = getDaysLeft(i.order?.expires_at);
        return days !== null && days <= 7;
    }).length || 0;

    const filteredInstances = localInstances?.filter(i => {
        if (filter === 'running') return i.live_status === 'running';
        if (filter === 'expiring') {
            const days = getDaysLeft(i.order?.expires_at);
            return days !== null && days <= 7;
        }
        return true;
    }) || [];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
    };

    return (
        <div className="space-y-12 pb-20">
            <Head title="Dashboard - AseroTech Cloud" />
            <TransmissionCenter userId={auth.user.id} />

            <AnimatePresence>
                {showWelcomeModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-[#161615] rounded-2xl md:rounded-[3rem] p-6 md:p-10 max-w-lg w-full shadow-2xl border border-emerald-500/20 text-center relative overflow-hidden"
                        >
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full"></div>
                            
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-emerald-500 mx-auto mb-6">
                                <Sparkles size={32} />
                            </div>
                            
                            <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase mb-4">Welcome to <span className="text-emerald-500">AseroTech</span></h3>
                            <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-8 md:mb-10 leading-relaxed">
                                Ready to bring your application to the world? We can guide you through deploying your very first website and linking a database in under 60 seconds.
                            </p>

                            <div className="space-y-3 md:space-y-4">
                                <button 
                                    onClick={startOnboarding}
                                    className="w-full py-4 md:py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    Yes, let's deploy!
                                    <ArrowRight size={18} strokeWidth={3} />
                                </button>
                                <button 
                                    onClick={dismissOnboarding}
                                    className="w-full py-3 md:py-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-colors"
                                >
                                    No thanks, I'll explore myself
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header section with animations */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">My Websites</h2>
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] animate-pulse">
                            Online
                        </div>
                    </div>
                    <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-medium tracking-tight">Real-time status and control panel.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href={route('deploy.new')} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 group">
                        <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
                        Add New Website
                    </Link>
                </div>
            </motion.div>

            {/* Bento Grid Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="md:col-span-8 bg-white dark:bg-[#161615] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-zinc-200 dark:border-white/5 shadow-sm relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 md:gap-8">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1rem] md:rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                <ShieldCheck size={24} className="md:w-8 md:h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg md:text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase leading-none">Security Status</h3>
                                <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">Advanced protection is active across your fleet.</p>
                            </div>
                        </div>
                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-black/40 border border-zinc-100 dark:border-white/5 shadow-sm">
                                <Sparkles size={10} className="text-emerald-500 animate-pulse" />
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Fleet Score</span>
                            </div>
                            <span className="text-xl md:text-2xl font-black text-emerald-500 font-mono">
                                {localInstances.length > 0 
                                    ? Math.round(localInstances.reduce((acc, i) => acc + (i.health_score || 0), 0) / localInstances.length) 
                                    : 100}%
                            </span>
                        </div>
                    </div>
                </motion.div>

                <motion.button 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setFilter(filter === 'running' ? 'all' : 'running')}
                    className={`md:col-span-4 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border shadow-sm flex flex-col justify-between group transition-all duration-500 text-left relative overflow-hidden ${filter === 'running' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white dark:bg-[#161615] border-zinc-200 dark:border-white/5 text-zinc-900 dark:text-white'}`}
                >
                    <div className={`flex items-center gap-3 relative z-10 ${filter === 'running' ? 'text-white/80' : 'text-zinc-400'}`}>
                        <Container size={16} />
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">Running Services</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-4 md:mt-6 relative z-10 font-mono">
                        <span className={`text-4xl md:text-5xl font-black tracking-tighter leading-none ${filter === 'running' ? 'text-white' : ''}`}>{activeCount}</span>
                        <span className={`text-lg md:text-xl font-bold tracking-tight ${filter === 'running' ? 'text-white/40' : 'text-zinc-300 dark:text-zinc-700'}`}>/ {instances?.length || 0}</span>
                    </div>
                    {filter === 'running' && <motion.div layoutId="filterGlow" className="absolute inset-0 bg-white/10 blur-3xl rounded-full scale-150" />}
                </motion.button>
            </div>

            {/* Instance Cards & Activity Feed Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 text-left">
                {/* Cards Column */}
                <div className="lg:col-span-8 space-y-6 md:space-y-8">
                    <motion.div 
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredInstances.map((instance) => {
                                const isRunning = instance.live_status === 'running';
                                
                                return (
                                    <motion.div 
                                        key={instance.id} 
                                        variants={item}
                                        layout
                                        className={`group relative bg-white dark:bg-[#161615] border border-zinc-200 dark:border-white/5 rounded-[2rem] md:rounded-[3rem] overflow-hidden flex flex-col transition-all duration-500 hover:shadow-2xl ${isRunning ? 'hover:border-emerald-500/30 shadow-emerald-500/5' : instance.order?.status === 'suspended' ? 'border-amber-500/50 shadow-amber-500/5' : 'hover:border-blue-500/30'}`}
                                    >
                                        {/* Suspension Banner */}
                                        {instance.order?.status === 'suspended' && (
                                            <div className="bg-amber-500 px-6 py-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-white">
                                                    <AlertCircle size={14} strokeWidth={3} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Protocol Suspended</span>
                                                </div>
                                                <Link href={route('billing.index')} className="text-[9px] font-black uppercase tracking-widest text-white underline underline-offset-2 hover:opacity-80 transition-opacity">Reactivate Now</Link>
                                            </div>
                                        )}

                                        {/* Running Glow Effect */}
                                        {isRunning && (
                                            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 animate-pulse"></div>
                                        )}

                                        <div className="p-6 md:p-10 flex-1 flex flex-col gap-6 md:gap-8">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1.5 md:space-y-2">
                                                    <Link href={route('instances.show', instance.id)} className="group/title inline-block">
                                                        <h4 className="text-lg md:text-2xl font-black tracking-tight text-zinc-900 dark:text-white group-hover/title:text-emerald-500 transition-colors uppercase leading-none">{instance.name}</h4>
                                                    </Link>
                                                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                                        <p className="text-[8px] md:text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{instance.order?.plan_name}</p>
                                                        <span className="text-[8px] md:text-[10px] font-black text-emerald-500/50">/</span>
                                                        <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${instance.health_score >= 90 ? 'text-emerald-500' : 'text-amber-500'}`}>Health: {instance.health_score || 0}%</span>
                                                    </div>
                                                </div>
                                                <div className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border transition-all duration-500 ${
                                                    isRunning 
                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                                                    : instance.status === 'provisioning'
                                                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                    : instance.status === 'failed'
                                                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 border-zinc-200 dark:border-white/10'
                                                }`}>
                                                    <span className="flex items-center gap-1.5 md:gap-2">
                                                        <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
                                                            isRunning ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                                                            instance.status === 'provisioning' ? 'bg-amber-500 animate-pulse' :
                                                            instance.status === 'failed' ? 'bg-red-500' :
                                                            'bg-zinc-400'
                                                        }`}></span>
                                                        {instance.status === 'provisioning' ? 'Setting up...' : (instance.live_status || 'Offline')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-4 md:space-y-6 flex-1">
                                                <div className="p-4 md:p-5 rounded-[1rem] md:rounded-[1.5rem] bg-zinc-50 dark:bg-black/20 border border-zinc-100 dark:border-white/5 flex items-center justify-between group/link cursor-pointer hover:bg-zinc-100 dark:hover:bg-black/40 transition-all">
                                                    <div className="overflow-hidden flex-1 mr-4">
                                                        <p className="text-[8px] md:text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Access Endpoint</p>
                                                        <p className="text-[10px] md:text-xs font-bold text-zinc-600 dark:text-zinc-300 truncate">{instance.public_url}</p>
                                                    </div>
                                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-zinc-400 group-hover/link:text-emerald-500 transition-all shadow-sm">
                                                        <ExternalLink size={12} className="md:w-3.5 md:h-3.5" />
                                                    </div>
                                                </div>

                                                {/* Activity Mini Indicator */}
                                                {isRunning && (
                                                    <div className="flex gap-1 items-end h-3 md:h-4 px-2">
                                                        {[...Array(12)].map((_, i) => (
                                                            <div 
                                                                key={i}
                                                                className="flex-1 bg-emerald-500/20 rounded-full animate-bar-pulse"
                                                                style={{ 
                                                                    height: '3px',
                                                                    animationDelay: `${i * 0.1}s`,
                                                                    animationDuration: `${0.8 + Math.random() * 0.5}s`
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                )}

                                                {instance.status === 'provisioning' && (
                                                    <div className="space-y-2 md:space-y-3 px-2">
                                                        <div className="flex justify-between items-center text-[7px] md:text-[8px] font-black uppercase tracking-widest text-amber-500/80">
                                                            <span>Setting up server...</span>
                                                            <Loader2 size={10} className="animate-spin" />
                                                        </div>
                                                        <div className="h-1 w-full bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div 
                                                                animate={{ x: [-100, 400] }}
                                                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                                className="w-1/3 h-full bg-gradient-to-r from-transparent via-amber-500 to-transparent"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 border-t border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]">
                                            <button onClick={() => performAction(instance.id, 'start')} disabled={processing || isRunning || instance.status === 'provisioning'} className="py-4 md:py-6 text-[8px] md:text-[10px] font-black uppercase tracking-widest flex flex-col items-center justify-center gap-1.5 md:gap-2 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-20 border-r border-zinc-200 dark:border-white/5"><Power size={16} className="md:w-[18px] md:h-[18px]" /> <span>Start</span></button>
                                            <button onClick={() => performAction(instance.id, 'restart')} disabled={processing || instance.status === 'provisioning'} className="py-4 md:py-6 text-[8px] md:text-[10px] font-black uppercase tracking-widest flex flex-col items-center justify-center gap-1.5 md:gap-2 hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-zinc-900 transition-all border-r border-zinc-200 dark:border-white/5"><RefreshCcw size={16} className="md:w-[18px] md:h-[18px]" /> <span>Reset</span></button>
                                            <button onClick={() => performAction(instance.id, 'stop')} disabled={processing || !isRunning || instance.status === 'provisioning'} className="py-4 md:py-6 text-[8px] md:text-[10px] font-black uppercase tracking-widest flex flex-col items-center justify-center gap-1.5 md:gap-2 hover:bg-red-500 hover:text-white transition-all disabled:opacity-20"><PowerOff size={16} className="md:w-[18px] md:h-[18px]" /> <span>Stop</span></button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {/* Empty State / Add Card */}
                        {filteredInstances.length === 0 && (
                            <motion.div variants={item} className="col-span-full py-20 md:py-32 text-center bg-zinc-50 dark:bg-white/[0.02] border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-[2rem] md:rounded-[3rem] flex flex-col items-center gap-4 md:gap-6 text-left">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-white dark:bg-zinc-900 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-zinc-300 shadow-xl"><Container size={32} className="md:w-10 md:h-10" /></div>
                                <div className="space-y-1 text-center">
                                    <p className="text-zinc-400 font-black uppercase tracking-widest text-[10px] md:text-xs">You don't have any active websites yet.</p>
                                    <Link href={route('deploy.new')} className="text-emerald-500 font-black uppercase tracking-widest text-[8px] md:text-[10px] hover:underline">Add your first website</Link>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {/* Activity Feed Column */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-4 space-y-6 md:space-y-8"
                >
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Recent Activity</h3>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            {recentActivity?.length === 0 ? (
                                <div className="p-8 md:p-10 text-center border-2 border-dashed border-zinc-100 dark:border-white/5 rounded-[2rem] md:rounded-[2.5rem] grayscale opacity-30">
                                    <Zap size={20} className="mx-auto mb-3 md:w-6 md:h-6" />
                                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">No activity yet.</p>
                                </div>
                            ) : (
                                recentActivity.map((log, i) => (
                                    <motion.div 
                                        key={log.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="p-4 md:p-5 bg-white dark:bg-[#161615] border border-zinc-200 dark:border-white/5 rounded-2xl md:rounded-3xl group/log hover:border-emerald-500/20 transition-all shadow-sm"
                                    >
                                        <div className="flex gap-3 md:gap-4">
                                            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-zinc-50 dark:bg-white/5 flex items-center justify-center text-zinc-400 group-hover/log:text-emerald-500 transition-colors`}>
                                                <Activity size={12} className="md:w-3.5 md:h-3.5" />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-0.5 md:space-y-1">
                                                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <p className="text-[10px] md:text-xs font-bold text-zinc-900 dark:text-white truncate">
                                                    {log.action.replace('instance.', '').toUpperCase()}
                                                </p>
                                                <p className="text-[8px] md:text-[10px] text-zinc-500 font-medium truncate">
                                                    {log.instance?.name || 'System Protocol'}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <Link href={route('security.activity')} className="block w-full py-3 md:py-4 text-center border border-zinc-200 dark:border-white/5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 transition-all">
                            View Full Log
                        </Link>
                    </div>

                    {/* Quick Support Card */}
                    <div className="p-6 md:p-8 bg-zinc-900 rounded-[2rem] md:rounded-[2.5rem] text-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(16,185,129,0.4),transparent)]"></div>
                        <div className="relative z-10 space-y-4 md:space-y-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl">
                                <HelpCircle size={20} className="md:w-6 md:h-6" />
                            </div>
                            <div className="space-y-1.5 md:space-y-2">
                                <h4 className="text-base md:text-lg font-black uppercase tracking-tight">Need Help?</h4>
                                <p className="text-[10px] md:text-xs text-zinc-400 font-medium leading-relaxed">Our support team is online and ready to assist you with your hosting.</p>
                            </div>
                            <Link href={route('support.index')} className="inline-flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-white transition-colors">
                                Get Help <ArrowRight size={12} className="md:w-3.5 md:h-3.5" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

Dashboard.layout = page => <AuthenticatedLayout children={page} />;
