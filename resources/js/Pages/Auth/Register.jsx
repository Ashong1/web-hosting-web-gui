import React, { useState } from 'react';
import { useForm, Link, Head } from '@inertiajs/react';
import { Box, ArrowRight, Lock, Mail, ShieldCheck, User, Moon, Sun, Cloud, Server, Activity, Shield, Terminal, Globe, ChevronLeft, Zap, Users, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '@/Components/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function Register() {
    const { isDark, toggleTheme } = useTheme();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
        privacy: false,
    });

    const [passwordStrength, setPasswordStrength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const isSubmitDisabled = !data.terms || !data.privacy || processing;

    const checkStrength = (pass) => {
        let score = 0;
        if (pass.length > 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        setPasswordStrength(score);
    };

    const submit = (e) => {
        e.preventDefault();
        if (!data.terms || !data.privacy) {
            alert('Please agree to the Terms of Service and Privacy Policy to continue.');
            return;
        }
        post('/register');
    };

    return (
        <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#09090b] text-[#1b1b18] dark:text-[#EDEDEC] font-sans transition-colors duration-500 overflow-x-hidden relative flex flex-col items-center justify-center">
            <Head title="Create Account - AseroTech Cloud" />

            {/* Animated Cinematic Background */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
                <motion.div 
                    animate={{ x: [-15, 15, -15], y: [-20, 20, -25] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 blur-[80px] rounded-full will-change-transform"
                ></motion.div>
                <motion.div 
                    animate={{ x: [15, -15, 15], y: [25, -20, 20] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
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
                    
                    {/* Left: Registration Form */}
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
                            <h2 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">Create Account</h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">Join AseroTech to start hosting your applications.</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Full Name</label>
                                    <div className="relative group/input">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/input:text-emerald-500 transition-colors"><User size={18} /></div>
                                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} autoFocus className="w-full pl-14 pr-5 py-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-bold" required />
                                    </div>
                                    {errors.name && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Email Address</label>
                                    <div className="relative group/input">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/input:text-emerald-500 transition-colors"><Mail size={18} /></div>
                                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full pl-14 pr-5 py-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-bold" required />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Password</label>
                                    <div className="relative group/input">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/input:text-emerald-500 transition-colors"><Lock size={18} /></div>
                                        <input 
                                            type={showPassword ? 'text' : 'password'} 
                                            value={data.password} 
                                            onChange={e => {
                                                setData('password', e.target.value);
                                                checkStrength(e.target.value);
                                            }} 
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
                                    <div className="flex gap-1 px-1 pt-1">
                                        {[...Array(4)].map((_, i) => {
                                            let strengthColor = 'bg-zinc-200/50 dark:bg-zinc-800 border border-zinc-300/70 dark:border-white/10'; // Inactive
                                            if (i < passwordStrength) {
                                                if (passwordStrength === 1) strengthColor = 'bg-red-500 border-red-600 shadow-[0_0_8px_rgba(239,68,68,0.4)]';
                                                else if (passwordStrength === 2) strengthColor = 'bg-orange-500 border-orange-600 shadow-[0_0_8px_rgba(249,115,22,0.4)]';
                                                else if (passwordStrength === 3) strengthColor = 'bg-amber-500 border-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.4)]';
                                                else strengthColor = 'bg-emerald-500 border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
                                            }
                                            return (
                                                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${strengthColor}`} />
                                            );
                                        })}
                                    </div>
                                    {errors.password && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase">{errors.password}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Confirm Password</label>
                                    <div className="relative group/input">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/input:text-emerald-500 transition-colors"><ShieldCheck size={18} /></div>
                                        <input 
                                            type={showConfirmPassword ? 'text' : 'password'} 
                                            value={data.password_confirmation} 
                                            onChange={e => setData('password_confirmation', e.target.value)} 
                                            className="w-full pl-14 pr-12 py-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-bold" 
                                            required 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-emerald-500 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 px-1">
                                <div className="flex items-center gap-3">
                                    <label className="relative flex items-center cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={data.terms} 
                                            onChange={e => setData('terms', e.target.checked)} 
                                            className="peer sr-only"
                                            required
                                        />
                                        <div className="w-5 h-5 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-md transition-all peer-checked:bg-emerald-500 peer-checked:border-emerald-500 flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                    </label>
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
                                        I have read and agree to the <Link href={route('legal.terms')} className="text-emerald-500 hover:underline">Terms of Service</Link>
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="relative flex items-center cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={data.privacy} 
                                            onChange={e => setData('privacy', e.target.checked)} 
                                            className="peer sr-only"
                                            required
                                        />
                                        <div className="w-5 h-5 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-md transition-all peer-checked:bg-emerald-500 peer-checked:border-emerald-500 flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                    </label>
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
                                        I acknowledge the <Link href={route('legal.privacy')} className="text-emerald-500 hover:underline">Privacy Policy</Link>
                                    </span>
                                </div>
                            </div>

                            <button
                                disabled={isSubmitDisabled}
                                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-zinc-900/20 dark:shadow-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-30 disabled:hover:scale-100 group/btn mt-4"
                            >
                                {processing ? 'Creating Account...' : 'Create Account'}
                                <ArrowRight className="group-hover/btn:translate-x-2 transition-transform" size={18} strokeWidth={3} />
                            </button>
                        </form>

                        <div className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            Already have an account? <Link href="/login" className="text-emerald-500 hover:underline">Log In</Link>
                        </div>
                    </div>

                    {/* Right: Protocol Benefits Sidebar */}
                    <div className="hidden lg:flex flex-1 bg-zinc-900 relative min-h-[400px] lg:min-h-auto overflow-hidden flex-col p-12 lg:p-16 border-l border-white/5 group/perks">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_-20%,rgba(16,185,129,0.8),transparent)]"></div>
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:30px_30px]"></div>

                        <div className="relative z-10 space-y-12">
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                                    <ShieldCheck size={28} />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight">Hosting Benefits <br/><span className="text-emerald-500">Unlocked.</span></h3>
                            </div>

                            <div className="space-y-8 text-left">
                                {[
                                    { title: "Instant Setup", desc: "Deploy WordPress, APIs, or Apps in < 60s.", icon: Zap },
                                    { title: "Philippines Hosting", desc: "Fast PH-based server nodes.", icon: Activity },
                                    { title: "Advanced Security", desc: "Automated Cloudflare protection & SSL.", icon: Shield },
                                    { title: "24/7 Support", desc: "Help from our local PH support team.", icon: Users },
                                ].map((perk, i) => (
                                    <div key={i} className="flex gap-5 group/item">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover/item:text-emerald-500 group-hover/item:border-emerald-500/30 transition-all">
                                            <perk.icon size={18} />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-100">{perk.title}</h4>
                                            <p className="text-[10px] font-medium text-zinc-500 leading-relaxed">{perk.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed italic">"The best choice for hosting in the Philippines."</p>
                            </div>
                        </div>

                        {/* Floating Tech Elements */}
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            className="absolute -bottom-20 -right-20 w-64 h-64 border-4 border-dashed border-emerald-500/10 rounded-full"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Footer */}
            <div className="fixed bottom-8 text-center space-y-4 z-20">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400">&copy; {new Date().getFullYear()} AseroTech Cloud Infrastructure</p>
            </div>
        </div>
    );
}
