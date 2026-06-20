import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
    ShieldAlert, 
    ShieldCheck, 
    Shield, 
    Lock, 
    Unlock, 
    Zap, 
    Activity, 
    Search, 
    Filter, 
    Trash2, 
    Plus, 
    XCircle,
    Globe,
    AlertTriangle,
    CheckCircle2,
    Eye,
    Terminal,
    History
} from 'lucide-react';
import { toast } from 'sonner';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, firewallRules, recentScans, instances }) {
    const [activeTab, setActiveTab] = useState('firewall');
    const [isFirewallModalOpen, setIsFirewallModalOpen] = useState(false);
    
    const firewallForm = useForm({
        ip_address: '',
        type: 'block',
        notes: '',
    });

    const scanForm = useForm({
        instance_id: '',
        type: 'malware',
    });

    const handleFirewallSubmit = (e) => {
        e.preventDefault();
        firewallForm.post(route('admin.security.firewall.store'), {
            onSuccess: () => {
                setIsFirewallModalOpen(false);
                firewallForm.reset();
                toast.success('Firewall protocol updated.');
            }
        });
    };

    const triggerScan = (instanceId, type) => {
        scanForm.post(route('admin.security.scan.trigger', instanceId), {
            onSuccess: () => toast.success('Security probe finalized.'),
        });
    };

    const deleteRule = (id) => {
        if (confirm('Verify protocol withdrawal?')) {
            firewallForm.delete(route('admin.security.firewall.destroy', id));
        }
    };

    return (
        <div className="space-y-10 pb-20">
            <Head title="Security Command" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">Security Command</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Platform-wide threat mitigation and integrity enforcement.</p>
                </div>
                <div className="flex bg-white dark:bg-[#161615] p-1 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
                    <button 
                        onClick={() => setActiveTab('firewall')}
                        className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'firewall' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        Firewall
                    </button>
                    <button 
                        onClick={() => setActiveTab('probes')}
                        className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'probes' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        Probes
                    </button>
                    <Link 
                        href={route('admin.security.ledger')}
                        className="px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all text-zinc-400 hover:text-zinc-600"
                    >
                        Audit
                    </Link>
                </div>
            </div>

            {/* Global Security Pulse */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#161615] rounded-[2rem] p-8 border border-zinc-200 dark:border-white/5 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Threat Posture</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Optimal</span>
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#161615] rounded-[2rem] p-8 border border-zinc-200 dark:border-white/5 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
                            <Lock size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Blocked Entities</p>
                            <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1 font-mono">{firewallRules.filter(r => r.type === 'block').length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#161615] rounded-[2rem] p-8 border border-zinc-200 dark:border-white/5 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 shadow-inner">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Global Probes</p>
                            <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1 font-mono">{recentScans.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {activeTab === 'firewall' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white dark:bg-[#161615] rounded-[2rem] shadow-sm border border-zinc-200 dark:border-white/5 overflow-hidden">
                        <div className="px-8 py-6 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-transparent">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-400">
                                    <Globe size={18} />
                                </div>
                                <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">Platform Firewall</h3>
                            </div>
                            <button 
                                onClick={() => setIsFirewallModalOpen(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-[10px] uppercase tracking-widest shadow-lg"
                            >
                                <Plus size={14} strokeWidth={3} />
                                New Protocol
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-zinc-50/50 dark:bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 dark:border-white/5">
                                        <th className="px-8 py-5">IP Address</th>
                                        <th className="px-8 py-5">Protocol Type</th>
                                        <th className="px-8 py-5">Context</th>
                                        <th className="px-8 py-5 text-right">Revocation</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-zinc-200 dark:divide-white/5">
                                    {firewallRules.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center grayscale opacity-20">
                                                <Shield size={48} className="mx-auto mb-4" />
                                                <p className="font-black uppercase tracking-widest text-xs">No active firewall protocols</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        firewallRules.map((rule) => (
                                            <tr key={rule.id} className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="px-8 py-5 font-mono font-bold text-zinc-900 dark:text-white">{rule.ip_address}</td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                        rule.type === 'block' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 border-red-100 dark:border-red-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20'
                                                    }`}>
                                                        {rule.type}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 font-medium text-zinc-400">{rule.notes || '---'}</td>
                                                <td className="px-8 py-5 text-right">
                                                    <button onClick={() => deleteRule(rule.id)} className="p-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-400 hover:text-red-500 transition-all">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'probes' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white dark:bg-[#161615] rounded-[2.5rem] p-10 border border-zinc-200 dark:border-white/5 shadow-sm space-y-8">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">Integrity Probes</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Trigger manual security scans across compute clusters.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {instances.map(instance => (
                                <div key={instance.id} className="p-6 bg-zinc-50 dark:bg-black/20 border border-zinc-100 dark:border-white/5 rounded-3xl space-y-6 group">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-zinc-400">Node Identity</p>
                                            <p className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">{instance.name}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 transition-colors shadow-sm">
                                            <Terminal size={18} />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => triggerScan(instance.id, 'malware')}
                                            className="flex-1 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                                        >
                                            Malware Scan
                                        </button>
                                        <button 
                                            onClick={() => triggerScan(instance.id, 'integrity')}
                                            className="flex-1 py-3 bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 dark:hover:bg-white/10 transition-all"
                                        >
                                            Integrity
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scan Ledger */}
                    <div className="bg-white dark:bg-[#161615] rounded-[2.5rem] shadow-sm border border-zinc-200 dark:border-white/5 overflow-hidden">
                        <div className="px-8 py-6 border-b border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-transparent flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-400">
                                <History size={18} />
                            </div>
                            <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">Historical Probes</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-zinc-50/50 dark:bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 dark:border-white/5">
                                        <th className="px-8 py-5">Target Node</th>
                                        <th className="px-8 py-5">Probe Type</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5">Result Findings</th>
                                        <th className="px-8 py-5 text-right">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-zinc-200 dark:divide-white/5">
                                    {recentScans.map(scan => (
                                        <tr key={scan.id} className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-5 font-bold uppercase">{scan.instance.name}</td>
                                            <td className="px-8 py-5">
                                                <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest">{scan.type}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                    scan.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-100 dark:border-amber-500/20'
                                                }`}>
                                                    {scan.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 font-medium text-zinc-500 dark:text-zinc-400 font-mono text-[10px]">{JSON.stringify(scan.result)}</td>
                                            <td className="px-8 py-5 text-right text-zinc-400 tabular-nums font-medium">{new Date(scan.scanned_at).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Firewall Modal */}
            {isFirewallModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" onClick={() => setIsFirewallModalOpen(false)}></div>
                    <div className="relative w-full max-w-lg bg-white dark:bg-[#161615] rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-white/5 p-10 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-2xl font-black tracking-tighter uppercase">Shield Protocol</h3>
                            <button onClick={() => setIsFirewallModalOpen(false)} className="p-2 rounded-xl bg-zinc-50 dark:bg-white/5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">
                                <XCircle size={22} />
                            </button>
                        </div>

                        <form onSubmit={handleFirewallSubmit} className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">IP Identifier</label>
                                <input 
                                    type="text" 
                                    value={firewallForm.data.ip_address} 
                                    onChange={e => firewallForm.setData('ip_address', e.target.value)} 
                                    placeholder="0.0.0.0" 
                                    className="w-full p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none font-mono text-sm" 
                                    required 
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Action Protocol</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        type="button" 
                                        onClick={() => firewallForm.setData('type', 'block')}
                                        className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${firewallForm.data.type === 'block' ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-400'}`}
                                    >
                                        Block Traffic
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => firewallForm.setData('type', 'allow')}
                                        className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${firewallForm.data.type === 'allow' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-400'}`}
                                    >
                                        Whitelist IP
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Administrative Notes</label>
                                <textarea 
                                    value={firewallForm.data.notes} 
                                    onChange={e => firewallForm.setData('notes', e.target.value)} 
                                    placeholder="Context for this transmission..." 
                                    className="w-full p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none text-sm h-32 resize-none" 
                                />
                            </div>

                            <button 
                                disabled={firewallForm.processing}
                                className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                Commit Security Policy
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

Index.layout = page => <AuthenticatedLayout children={page} />;
