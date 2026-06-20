import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Shield, Lock, Eye, ChevronLeft, Box } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-emerald-500/30">
            <Head title="Privacy Policy - AseroTech Cloud" />
            
            {/* Header */}
            <nav className="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-20">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform duration-500">
                        <Box size={22} className="text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">
                        AseroTech<span className="text-emerald-500">Cloud</span>
                    </span>
                </Link>
                <Link href="/" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <ChevronLeft size={16} /> Back to Launchpad
                </Link>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-20">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                            <Shield size={12} /> Privacy Protocol
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none">Privacy <br/><span className="text-emerald-500">Policy.</span></h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Last updated: June 06, 2026</p>
                    </div>

                    <div className="prose prose-zinc dark:prose-invert max-w-none space-y-10">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <span className="text-emerald-500">01.</span> Data Collection
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                We collect minimal information necessary to provide our hosting services. This includes your name, email address, and billing information. We also log IP addresses for security auditing and to prevent fraudulent access to our infrastructure.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <span className="text-emerald-500">02.</span> How We Use Your Data
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                Your data is used exclusively for:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400">
                                <li>Authenticating your access to the control panel.</li>
                                <li>Processing transactions and managing your credit balance.</li>
                                <li>Sending critical system alerts and deployment notifications.</li>
                                <li>Providing technical support via our ticket system.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <span className="text-emerald-500">03.</span> Data Sovereignty
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                We do not sell or rent your personal information to third parties. Data may be shared with service providers (like payment processors) only to the extent necessary to complete a transaction. We comply with Philippine data privacy laws and cooperate with law enforcement only when required by a valid court order.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <span className="text-emerald-500">04.</span> Infrastructure Security
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                We implement hardware-level isolation via Proxmox and network-level protection via Cloudflare. Your application data and databases are stored in secure environments with restricted access. Users are encouraged to use strong passwords and rotate API keys regularly.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <span className="text-emerald-500">05.</span> Cookies
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                We use essential session cookies to keep you logged in and functional cookies to remember your theme preferences. We do not use tracking or advertising cookies.
                            </p>
                        </section>
                    </div>

                    <div className="p-8 bg-zinc-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-2">
                            <h4 className="text-xl font-black uppercase tracking-tight">Security Audit</h4>
                            <p className="text-zinc-400 text-sm font-medium">Want to know more about how we secure our nodes?</p>
                        </div>
                        <Link href={route('support.index')} className="px-8 py-4 bg-white text-zinc-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">
                            Request Security Doc
                        </Link>
                    </div>
                </motion.div>
            </main>

            <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-zinc-200 dark:border-white/5 text-center">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} AseroTech Hosting. All Rights Reserved. Quezon Node PH.
                </p>
            </footer>
        </div>
    );
}
