import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2, CheckCircle2, XCircle, ChevronRight, Activity } from 'lucide-react';

export default function TransmissionCenter({ userId }) {
    const [tasks, setTasks] = useState({});

    useEffect(() => {
        if (window.Echo) {
            const channel = window.Echo.private(`App.Models.User.${userId}`);
            
            channel.listen('ProvisioningProgressUpdated', (e) => {
                setTasks(prev => {
                    const newTasks = { ...prev };
                    
                    if (e.status === 'completed' && e.step === 'final') {
                        // Mark as done but keep for a few seconds
                        newTasks[e.orderId] = { ...e, isDone: true };
                        setTimeout(() => {
                            setTasks(current => {
                                const updated = { ...current };
                                delete updated[e.orderId];
                                return updated;
                            });
                        }, 10000);
                    } else if (e.status === 'failed') {
                        newTasks[e.orderId] = { ...e, isError: true };
                    } else {
                        newTasks[e.orderId] = e;
                    }
                    
                    return newTasks;
                });
            });

            return () => channel.stopListening('ProvisioningProgressUpdated');
        }
    }, [userId]);

    const taskList = Object.values(tasks);
    if (taskList.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto md:bottom-8 md:right-8 z-[100] w-auto md:w-full md:max-w-sm space-y-4">
            <AnimatePresence>
                {taskList.map((task) => (
                    <motion.div
                        key={task.orderId}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="bg-white dark:bg-[#161615] rounded-3xl p-6 border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden relative"
                    >
                        {/* Progress Background */}
                        <div 
                            className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-1000 ease-out"
                            style={{ width: `${task.progress}%` }}
                        />

                        <div className="flex items-start gap-5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                task.isError ? 'bg-red-500/10 text-red-500' : 
                                task.isDone ? 'bg-emerald-500/10 text-emerald-500' : 
                                'bg-zinc-100 dark:bg-white/5 text-emerald-500'
                            }`}>
                                {task.isError ? <XCircle size={24} /> : 
                                 task.isDone ? <CheckCircle2 size={24} className="animate-in zoom-in duration-500" /> : 
                                 <Zap size={24} className="animate-pulse" />}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Deployment Progress</h4>
                                    <span className="text-[10px] font-black text-emerald-500 font-mono">{task.progress}%</span>
                                </div>
                                
                                <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                                    {task.isError ? 'Setup Failed' : task.message}
                                </p>
                                
                                <div className="flex items-center gap-2 pt-2">
                                    <div className="flex-1 h-1 bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${task.progress}%` }}
                                            className={`h-full ${task.isError ? 'bg-red-500' : 'bg-emerald-500'}`}
                                        />
                                    </div>
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Step: {task.step}</span>
                                </div>
                            </div>
                        </div>

                        {task.isDone && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 pt-4 border-t border-zinc-100 dark:border-white/5 flex justify-between items-center"
                            >
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Website ready</span>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white hover:text-emerald-500 transition-colors"
                                >
                                    Refresh List <ChevronRight size={14} strokeWidth={3} />
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
