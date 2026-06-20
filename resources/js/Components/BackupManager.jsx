import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, RefreshCcw, HardDrive, Clock, History, Trash2, RotateCcw, AlertCircle } from 'lucide-react';
import { useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';
import axios from 'axios';

export default function BackupManager({ instanceId, initialAutoBackups }) {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [backupName, setBackupName] = useState('');
    const [autoBackups, setAutoBackups] = useState(initialAutoBackups);
    const [toggling, setToggling] = useState(false);

    useEffect(() => {
        fetchBackups();
    }, [instanceId]);

    const fetchBackups = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('instances.backups', instanceId));
            setBackups(response.data.backups || []);
        } catch (error) {
            toast.error('Failed to fetch backup history.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAuto = async () => {
        setToggling(true);
        router.post(route('instances.backups.toggle_auto', instanceId), {}, {
            onSuccess: () => {
                setAutoBackups(!autoBackups);
            },
            onFinish: () => setToggling(false)
        });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!backupName) return;
        
        setCreating(true);
        router.post(route('instances.backups.create', instanceId), {
            name: backupName
        }, {
            onSuccess: () => {
                setBackupName('');
                fetchBackups();
            },
            onFinish: () => setCreating(false)
        });
    };

    const handleRestore = (backupId) => {
        if (!confirm('CRITICAL: This will overwrite current data. Proceed with restoration?')) return;
        
        router.post(route('instances.backups.restore', { instance: instanceId, backup: backupId }), {}, {
            onSuccess: () => toast.success('Restoration protocol engaged.'),
        });
    };

    const handleDelete = (backupId) => {
        if (!confirm('Are you sure you want to permanently delete this snapshot? This action cannot be undone.')) return;
        
        router.delete(route('instances.backups.destroy', { instance: instanceId, backup: backupId }), {
            onSuccess: () => {
                toast.success('Snapshot purged successfully.');
                fetchBackups();
            },
        });
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-8">
            {/* Creation Section */}
            <div className="bg-[#161615] rounded-[2.5rem] border border-white/5 p-8 md:p-12 space-y-8">
                <div className="flex items-center gap-6">
                    <div className="p-4 rounded-[1.5rem] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <ShieldCheck size={28} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Snapshots & Recovery</h3>
                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Manual and automated data redundancy management.</p>
                    </div>
                </div>

                <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4">
                    <input 
                        type="text" 
                        placeholder="Snapshot Name (e.g. Pre-Update)"
                        value={backupName}
                        onChange={(e) => setBackupName(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white outline-none focus:border-emerald-500/50 transition-all"
                    />
                    <button 
                        disabled={creating || !backupName}
                        className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {creating ? <RefreshCcw size={14} className="animate-spin" /> : <Plus size={14} />} Create Snapshot
                    </button>
                </form>
            </div>

            {/* Auto Backup Toggle */}
            <div className="bg-[#161615] rounded-[2.5rem] border border-white/5 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl border transition-colors ${autoBackups ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'}`}>
                        <Clock size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">Automated Maintenance Window</h4>
                        <p className="text-[10px] text-zinc-500 font-medium">Nightly snapshots are triggered at 2:00 AM local time.</p>
                    </div>
                </div>
                
                <button 
                    onClick={handleToggleAuto}
                    disabled={toggling}
                    className={`relative w-16 h-8 rounded-full transition-all duration-500 overflow-hidden border-2 ${autoBackups ? 'bg-emerald-500 border-emerald-500/20' : 'bg-zinc-800 border-white/10'}`}
                >
                    <motion.div 
                        animate={{ x: autoBackups ? 32 : 4 }}
                        className="w-5 h-5 bg-white rounded-full shadow-lg absolute top-1 left-0"
                    />
                    {toggling && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <RefreshCcw size={12} className="animate-spin text-white" />
                        </div>
                    )}
                </button>
            </div>

            {/* List Section */}
            <div className="bg-[#161615] rounded-[2.5rem] border border-white/5 overflow-hidden">
                <div className="px-10 py-6 border-b border-white/5 bg-black/20 flex justify-between items-center">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Snapshot History</h4>
                    <button onClick={fetchBackups} className="text-zinc-500 hover:text-white transition-colors">
                        <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className="divide-y divide-white/5">
                    {backups.map((backup) => (
                        <div key={backup.id} className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-6 flex-1">
                                <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400">
                                    <History size={20} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-white uppercase tracking-tight">{backup.name}</p>
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 uppercase"><Clock size={10} /> {new Date(backup.created_at).toLocaleString()}</span>
                                        <span className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 uppercase"><HardDrive size={10} /> {formatSize(backup.size_bytes)}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                            backup.status === 'completed' 
                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        }`}>
                                            {backup.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button 
                                    onClick={() => handleRestore(backup.id)}
                                    className="flex-1 md:flex-none px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all"
                                >
                                    <RotateCcw size={14} /> Restore
                                </button>
                                <button 
                                    onClick={() => handleDelete(backup.id)}
                                    className="flex-1 md:flex-none px-4 py-3 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center justify-center gap-2 transition-all"
                                    title="Delete Snapshot"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}

                    {backups.length === 0 && !loading && (
                        <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="p-6 rounded-3xl bg-white/5 text-zinc-600">
                                <ShieldCheck size={48} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">No Snapshots Found</p>
                                <p className="text-[10px] text-zinc-600 font-medium">Protect your data by creating a manual snapshot now.</p>
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

            <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10">
                <AlertCircle size={20} className="text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase leading-relaxed">
                    Restoration is an atomic operation. The current node state will be purged and replaced with the snapshot data. Ensure you have backed up any ephemeral state before proceeding.
                </p>
            </div>
        </div>
    );
}
