import React, { useState, useEffect } from 'react';
import { History, RotateCcw, CheckCircle2, XCircle, Clock, Zap, RefreshCcw, ExternalLink } from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import axios from 'axios';

export default function DeploymentHistory({ instanceId }) {
    const [deployments, setDeployments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDeployments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('instances.deployments', instanceId));
            setDeployments(response.data.deployments || []);
        } catch (error) {
            toast.error('Failed to synchronize deployment history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeployments();
    }, [instanceId]);

    const handleRollback = (deploymentId) => {
        if (!confirm('Are you sure you want to rollback to this specific deployment? This will replace the current live version.')) return;
        
        router.post(route('instances.rollback', { instance: instanceId, deployment: deploymentId }), {}, {
            onSuccess: () => toast.success('Rollback protocol engaged. Reverting infrastructure...'),
        });
    };

    return (
        <div className="bg-[#161615] rounded-[2.5rem] border border-white/5 overflow-hidden">
            <div className="px-10 py-6 border-b border-white/5 bg-black/20 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <History size={16} className="text-emerald-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Deployment Timeline</h3>
                </div>
                <button onClick={fetchDeployments} className="text-zinc-500 hover:text-white transition-colors">
                    <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="divide-y divide-white/5">
                {deployments.map((dep, index) => (
                    <div key={dep.id} className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors relative">
                        {index === 0 && (
                            <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,184,129,0.5)]"></div>
                        )}
                        
                        <div className="flex items-center gap-6 flex-1">
                            <div className={`p-3 rounded-xl border ${dep.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                {dep.status === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <p className="text-sm font-black text-white uppercase tracking-tight">Deployment #{dep.id.split('_')[1] || dep.id}</p>
                                    {index === 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Active</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 uppercase"><Clock size={10} /> {new Date(dep.createdAt).toLocaleString()}</span>
                                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 uppercase font-mono tracking-tighter"><Zap size={10} /> {dep.hash || 'sha256:unknown'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {index !== 0 && dep.status === 'success' && (
                                <button 
                                    onClick={() => handleRollback(dep.id)}
                                    className="flex-1 md:flex-none px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all"
                                >
                                    <RotateCcw size={14} /> Rollback
                                </button>
                            )}
                            <button className="p-3 text-zinc-500 hover:text-white transition-colors">
                                <ExternalLink size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {deployments.length === 0 && !loading && (
                    <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-6 rounded-3xl bg-white/5 text-zinc-600">
                            <Zap size={48} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">No Deployments Found</p>
                            <p className="text-[10px] text-zinc-600 font-medium">Trigger a manual redeploy to start your timeline.</p>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="p-20 flex items-center justify-center">
                        <RefreshCcw size={24} className="text-emerald-500 animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
}
