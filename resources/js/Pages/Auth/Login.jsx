import React, { useState } from 'react';
import { useForm, Link, Head } from '@inertiajs/react';
import { Box, ArrowRight, Lock, Mail, ShieldCheck, Key, Moon, Sun, Cloud, Server, Activity, Shield, Terminal, Globe, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '@/Components/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login({ brand }) {
    const { isDark, toggleTheme } = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#09090b] text-[#1b1b18] dark:text-[#EDEDEC] font-sans transition-colors duration-500 overflow-x-hidden relative flex flex-col items-center justify-center">
            <Head title={`Sign In - ${brand?.name || 'AseroTech Cloud'}`} />

            {/* Animated Cinematic Background */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
                <motion.div 
                    animate={{ 
                        x: [-10, 10, -10], 
                        y: [-10, 10, -10] 
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 blur-[80px] rounded-full will-change-transform"
                ></motion.div>
                <motion.div 
                    animate={{ 
                        x: [10, -10, 10], 
                        y: [10, -10, 10] 
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 blur-[80px] rounded-full will-change-transform"
                ></motion.div>
            </div>

            {/* Content Wrap */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-5xl px-6 relative z-10 will-change-transform"
            >
                <div className="flex flex-col lg:flex-row overflow-hidden bg-white/80 dark:bg-[#161615]/80 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-zinc-200 dark:border-white/5 relative group">
                    
                    {/* Left: Form Section */}
                    <div className="flex-[1.2] p-10 md:p-14 lg:p-16 flex flex-col justify-center gap-10">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-emerald-500 transition-colors">
                                <ChevronLeft size={16} /> Back to Home
                            </Link>
                            <button onClick={toggleTheme} className="p-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-400">
                                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">Log In</h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Enter your details to access your account.</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Email Address</label>
                                <div className="relative group/input">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/input:text-emerald-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        autoFocus
                                        className="w-full pl-14 pr-5 py-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-bold"
                                        required
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Password</label>
                                    <Link href={route('password.request')} className="text-[10px] font-black text-emerald-500 uppercase hover:underline">Reset</Link>
                                </div>
                                <div className="relative group/input">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/input:text-emerald-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full pl-14 pr-12 py-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-bold"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-emerald-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase">{errors.password}</p>}
                            </div>

                            <button
                                disabled={processing}
                                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-zinc-900/20 dark:shadow-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 group/btn mt-4"
                            >
                                {processing ? 'Logging in...' : 'Log In'}
                                <ArrowRight className="group-hover/btn:translate-x-2 transition-transform" size={18} strokeWidth={3} />
                            </button>
                        </form>

                        <div className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            Don't have an account? <Link href="/register" className="text-emerald-500 hover:underline">Sign Up</Link>
                        </div>
                    </div>

                    {/* Right: System Trust Sidebar */}
                    <div className="hidden lg:flex flex-1 bg-zinc-900 relative min-h-[400px] lg:min-h-auto overflow-hidden flex-col p-12 lg:p-16 border-l border-white/5 group/trust">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_-20%,rgba(16,185,129,0.8),transparent)]"></div>
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:30px_30px]"></div>

                        <div className="relative z-10 space-y-12">
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                                    <ShieldCheck size={28} />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight">Secure Login <br/><span className="text-emerald-500">Authorized.</span></h3>
                            </div>

                            <div className="space-y-8 text-left">
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Network Status</span>
                                        <span className="text-[10px] font-black uppercase text-emerald-500 animate-pulse">Live</span>
                                    </div>
                                    <div className="flex gap-1.5 h-8 items-end">
                                        {[...Array(20)].map((_, i) => (
                                            <div key={i} className="flex-1 bg-emerald-500/40 rounded-full h-full" style={{ height: `${Math.random() * 100}%` }}></div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-[8px] font-bold uppercase text-zinc-500">Uptime (24h)</span>
                                        <span className="text-[10px] font-black text-white font-mono">99.99%</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { title: "Quezon Node PH", status: "Operational", icon: Globe },
                                        { title: "Cloudflare Edge", status: "Protected", icon: Shield },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400"><item.icon size={16} /></div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-white">{item.title}</p>
                                                <p className="text-[8px] font-bold uppercase text-emerald-500">{item.status}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Floating Tech Elements */}
                        <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                            className="absolute -bottom-20 -right-20 w-64 h-64 border-4 border-dashed border-emerald-500/10 rounded-full"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Footer */}
            <div className="fixed bottom-8 text-center space-y-4 z-20">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400">&copy; {new Date().getFullYear()} {brand?.name || 'AseroTech'} Hosting</p>
            </div>
        </div>
    );
}
