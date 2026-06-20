import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Scale, Shield, FileText, ChevronLeft, Box } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-emerald-500/30">
            <Head title="Terms of Service - AseroTech Cloud" />
            
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
                            <Scale size={12} /> Legal Protocol
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none">Terms of <br/><span className="text-emerald-500">Service.</span></h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Last updated: June 06, 2026</p>
                    </div>

                    <div className="prose prose-zinc dark:prose-invert max-w-none space-y-10">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <span className="text-emerald-500">01.</span> Acceptance of Terms
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                By accessing and using AseroTech Cloud ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. AseroTech reserves the right to update these terms at any time without prior notice.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <span className="text-emerald-500">02.</span> Resource Usage & Fair Use
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                Our infrastructure is optimized for performance. While we provide dedicated resources via Proxmox virtualization, users must not engage in activities that degrade the service for others, including:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400">
                                <li>Cryptocurrency mining (unauthorized).</li>
                                <li>Mass mailing or spamming via unauthorized SMTP.</li>
                                <li>DDoS attacks or network scanning.</li>
                                <li>Hosting illegal content or copyright-infringing material.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <span className="text-emerald-500">03.</span> Credit & Billing System
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                AseroTech operates on a prepaid credit system (PHP). Credits are non-refundable once added to your wallet. Service suspension occurs automatically if your balance reaches zero or if an invoice remains unpaid past its due date.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <span className="text-emerald-500">04.</span> Data & Backups
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                While we provide automated backup tools for certain tiers, users are ultimately responsible for their own data. AseroTech is not liable for data loss resulting from hardware failure, software bugs, or user error.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <span className="text-emerald-500">05.</span> Termination
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                We reserve the right to terminate accounts that violate our terms or engage in fraudulent activity. Upon termination, all data associated with the account may be permanently deleted.
                            </p>
                        </section>
                    </div>

                    <div className="p-8 bg-zinc-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-2">
                            <h4 className="text-xl font-black uppercase tracking-tight">Have Questions?</h4>
                            <p className="text-zinc-400 text-sm font-medium">Contact our legal department for clarification on any protocol.</p>
                        </div>
                        <Link href={route('support.index')} className="px-8 py-4 bg-white text-zinc-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">
                            Contact Support
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
