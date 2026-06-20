import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Box, ArrowRight, Lock, Mail, ShieldCheck, Key, Moon, Sun, Cloud, Server, Activity, Shield, Terminal, Globe, ChevronLeft } from 'lucide-react';
import { useTheme } from '@/Components/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResetPassword({ token, email, brand }) {
    const { isDark, toggleTheme } = useTheme();
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.update'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#09090b] text-[#1b1b18] dark:text-[#EDEDEC] font-sans transition-colors duration-500 overflow-x-hidden relative flex flex-col items-center justify-center">
            <Head title={`Reset Password - ${brand?.name || 'AseroTech Cloud'}`} />

            {/* Animated Cinematic Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
                <motion.div 
                    animate={{ x: [-20, 20, -20], y: [-20, 20, -20] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full"
                ></motion.div>
                <motion.div 
                    animate={{ x: [20, -20, 20], y: [20, -20, 20] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full"
                ></motion.div>
            </div>

            {/* Content Wrap */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-5xl px-6 relative z-10"
            >
                <div className="flex flex-col lg:flex-row overflow-hidden bg-white/80 dark:bg-[#161615]/80 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-zinc-200 dark:border-white/5 relative group">
                    
                    {/* Left: Form Section */}
                    <div className="flex-[1.2] p-10 md:p-14 lg:p-16 flex flex-col justify-center gap-10">
                        <div className="flex items-center justify-end">
                            <button onClick={toggleTheme} className="p-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-400">
                                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">Reset Security Key</h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Input your new cryptographic password below.</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Identity (Email)</label>
                                <div className="relative group/input">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/input:text-emerald-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full pl-14 pr-5 py-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm font-bold"
                                        required
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">New Security Key (Password)</label>
                                <div className="relative group/input">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/input:text-emerald-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full pl-14 pr-5 py-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm font-bold"
                                        required
                                    />
                                </div>
                                {errors.password && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Confirm Security Key</label>
                                <div className="relative group/input">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/input:text-emerald-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="w-full pl-14 pr-5 py-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm font-bold"
                                        required
                                    />
                                </div>
                                {errors.password_confirmation && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase">{errors.password_confirmation}</p>}
                            </div>

                            <button
                                disabled={processing}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 group/btn mt-4"
                            >
                                {processing ? 'Updating...' : 'Commit New Password'}
                                <ArrowRight className="group-hover/btn:translate-x-2 transition-transform" size={18} strokeWidth={3} />
                            </button>
                        </form>
                    </div>

                    {/* Right: Security Visual */}
                    <div className="flex-1 bg-zinc-100 dark:bg-black/60 relative min-h-[300px] lg:min-h-auto overflow-hidden flex items-center justify-center border-l border-zinc-200 dark:border-white/5 group/scanner">
                        {/* Scanning Laser */}
                        <motion.div 
                            animate={{ top: ['-10%', '110%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            className="absolute left-0 w-full h-2 bg-emerald-500 shadow-[0_0_40px_10px_rgba(16,185,129,1)] z-20"
                        />
                        <div className="absolute inset-0 bg-emerald-500/5 group-hover/scanner:bg-emerald-500/10 transition-colors duration-1000"></div>
                        
                        {/* Floating Tech Grid Background */}
                        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(rgba(16,185,129,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.5)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]"></div>

                        <div className="relative z-10 flex flex-col items-center gap-10 p-12 text-center">
                            <div className="relative w-40 h-40 flex items-center justify-center">
                                {/* Orbiting Rings */}
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-4 border-dashed border-emerald-500/80 rounded-full" />
                                <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute -inset-6 border-4 border-emerald-500/50 rounded-full" />
                                
                                <motion.div 
                                    whileHover={{ scale: 1.1 }}
                                    className="w-24 h-24 bg-white dark:bg-zinc-800 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.6)] flex items-center justify-center text-emerald-500 border-4 border-emerald-500 relative z-10 overflow-hidden"
                                >
                                    <ShieldCheck size={48} strokeWidth={2} />
                                </motion.div>
                            </div>
                            
                            <div className="space-y-2 relative z-10">
                                <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center justify-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,1)]"></span>
                                    Reset Protocol Authorized
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-[250px] mx-auto">Cryptographic token validated. Proceed to update your credentials.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Footer */}
            <div className="fixed bottom-8 text-center space-y-4 z-20">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400">&copy; {new Date().getFullYear()} {brand?.name || 'AseroTech'} Protocol</p>
            </div>
        </div>
    );
}
