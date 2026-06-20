import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ShieldAlert, Zap, Lock, ChevronLeft, Box } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AcceptableUsePolicy() {
    return (
        <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-emerald-500/30">
            <Head title="Acceptable Use Policy - AseroTech Cloud" />
            
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
                            <ShieldAlert size={12} /> Usage Protocol
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none">Acceptable <br/><span className="text-emerald-500">Use Policy.</span></h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Last updated: June 06, 2026</p>
                    </div>

                    <div className="prose prose-zinc dark:prose-invert max-w-none space-y-10">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <span className="text-emerald-500">01.</span> Purpose
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                This Acceptable Use Policy (AUP) outlines the rules and regulations for using AseroTech Cloud infrastructure. Our goal is to maintain a high-performance environment for all users while ensuring legal and ethical compliance.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <span className="text-emerald-500">02.</span> Prohibited Activities
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                Users are strictly prohibited from using our services for:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-tight">
                                <li>Phishing, Malware distribution, or Social Engineering.</li>
                                <li>Crypto-mining (unless explicitly authorized in a high-tier plan).</li>
                                <li>DDoS attacks, Port Scanning, or Network Probing.</li>
                                <li>Hosting illegal content, child abuse material, or extremist propaganda.</li>
                                <li>Unsolicited Bulk Email (Spam) or mass marketing via unauthorized SMTP.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <span className="text-emerald-500">03.</span> Resource Abuse
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                While we provide dedicated resources, excessive noise or activities that negatively impact our physical host nodes (e.g., extreme I/O abuse) will result in automatic throttling or temporary suspension.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <span className="text-emerald-500">04.</span> Enforcement
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                Violation of this AUP will result in immediate service termination without refund. We reserve the right to cooperate with law enforcement agencies and provide relevant data in cases of criminal activity.
                            </p>
                        </section>
                    </div>

                    <div className="p-8 bg-zinc-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-2 text-left">
                            <h4 className="text-xl font-black uppercase tracking-tight">Report Abuse</h4>
                            <p className="text-zinc-400 text-sm font-medium">Spotted a violation on our network?</p>
                        </div>
                        <Link href={route('support.index')} className="px-8 py-4 bg-white text-zinc-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">
                            Submit Report
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
