import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    ChevronLeft, 
    Activity, 
    ShieldCheck, 
    Globe, 
    Settings, 
    Key, 
    Terminal as TerminalIcon, 
    Power, 
    PowerOff, 
    RefreshCcw, 
    Cpu, 
    Database, 
    Network, 
    Clock, 
    ExternalLink,
    AlertCircle,
    Zap,
    Lock,
    Copy,
    Trash2,
    Plus,
    XCircle,
    Maximize2,
    Save,
    RotateCcw,
    History,
    HardDrive,
    ArrowUpDown,
    FileText,
    List,
    Server,
    Layers
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';
import Terminal from '@/Components/Terminal';
import StatusBoard from '@/Components/StatusBoard';
import LogsViewer from '@/Components/LogsViewer';
import EnvEditor from '@/Components/EnvEditor';
import BackupManager from '@/Components/BackupManager';
import DeploymentHistory from '@/Components/DeploymentHistory';
import BuildLogsViewer from '@/Components/BuildLogsViewer';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ auth, instance }) {
    const { post, processing } = useForm();
    const [metrics, setMetrics] = useState([]);
    const [currentMetrics, setCurrentMetrics] = useState(null);
    const [loadingMetrics, setLoadingMetrics] = useState(true);
    const [activeTab, setActiveTab] = useState('telemetry');
    const [showSecret, setShowSecret] = useState(false);

    const scalingForm = useForm({
        cpu: instance?.order?.plan?.resource_limits?.cpu || '1',
        memory: instance?.order?.plan?.resource_limits?.memory || '1024',
        replicas: instance?.replicas || '1',
    });
// ... (rest of the code update will be handled in a larger replace or multiple replaces)

    if (!instance) return null;

    useEffect(() => {
        fetchMetricsHistory();
        const interval = setInterval(fetchLiveMetrics, 5000);
        return () => clearInterval(interval);
    }, [instance.id]);

    const fetchMetricsHistory = async () => {
        try {
            const response = await fetch(route('instances.metrics_history', instance.id));
            const data = await response.json();
            
            if (data.history) {
                const historyPoints = data.history.map(point => ({
                    time: new Date(point.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    cpu: parseFloat(point.cpu),
                    memory: parseFloat(point.memory),
                }));
                setMetrics(historyPoints);
            }
        } catch (error) {
            console.error('History sync failed');
        }
    };

    const fetchLiveMetrics = async () => {
        try {
            const response = await fetch(route('instances.metrics', instance.id));
            const data = await response.json();
            
            if (data.metrics) {
                const parseMetric = (val) => {
                    if (val === null || val === undefined) return 0;
                    // Handle formats like "1.2 MiB", "10%", "5.5 KB/s"
                    const s = String(val).replace(/[^0-9.]/g, '');
                    const n = parseFloat(s);
                    return isNaN(n) ? 0 : n;
                };

                const newPoint = {
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    cpu: parseMetric(data.metrics.cpu),
                    memory: parseMetric(data.metrics.memory),
                    disk: parseMetric(data.metrics.disk_read),
                    net: parseMetric(data.metrics.net_in),
                };

                setCurrentMetrics(data.metrics);
                setMetrics(prev => [...prev.slice(-49), newPoint]); // Keep more points for better resolution
            }
        } catch (error) {
            console.error('Metrics sync failed');
        } finally {
            setLoadingMetrics(false);
        }
    };

    const handleScalingSubmit = (e) => {
        e.preventDefault();
        scalingForm.post(route('instances.resources.update', instance.id), {
            onSuccess: () => toast.success('Resource allocation updated.'),
        });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const performAction = (action) => {
        router.post(route('instances.action', { instance: instance.id, action }));
    };

    return (
        <div className="space-y-8">
            <Head title={`Node: ${instance.name}`} />

            {/* Suspension Warning Banner */}
            {instance.order?.status === 'suspended' && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-[2rem] bg-amber-500 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-amber-500/20 border border-amber-400/50"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                            <AlertCircle size={32} strokeWidth={3} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black uppercase tracking-tight leading-none">Infrastructure Halted</h3>
                            <p className="text-xs font-medium opacity-90 leading-relaxed">This node is currently suspended due to an expired resource protocol. Your data is being retained for <span className="font-black">7 days</span>. Top up your credits to reactivate instantly.</p>
                        </div>
                    </div>
                    <Link href={route('billing.index')} className="w-full md:w-auto px-10 py-4 bg-white text-amber-600 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all text-center">
                        Top Up Wallet
                    </Link>
                </motion.div>
            )}

            {/* Header */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <Link href={route('dashboard')} className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-500">
                        <ChevronLeft size={20} strokeWidth={3} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            instance.live_status === 'running' 
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' 
                            : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20'
                        }`}>
                            {instance.live_status}
                        </span>
                    </div>
                </div>

                <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase break-all">{instance.name}</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">ID: {instance.dokploy_service_id}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex bg-white dark:bg-[#161615] p-1 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm justify-between sm:justify-start">
                        <button onClick={() => performAction('start')} disabled={instance.live_status === 'running'} className="p-4 sm:p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-zinc-400 disabled:opacity-20"><Power size={20} /></button>
                        <button onClick={() => performAction('restart')} className="p-4 sm:p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-400"><RefreshCcw size={20} /></button>
                        <button onClick={() => performAction('stop')} disabled={instance.live_status !== 'running'} className="p-4 sm:p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-zinc-400 disabled:opacity-20"><PowerOff size={20} /></button>
                    </div>
                    <a href={`https://${instance.public_url}`} target="_blank" className="w-full sm:w-auto bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                        Access Node <ExternalLink size={16} />
                    </a>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-white/5 rounded-2xl w-full overflow-x-auto no-scrollbar scroll-smooth">
                {[
                    { id: 'telemetry', icon: Activity, label: 'Stats' },
                    { id: 'console', icon: TerminalIcon, label: 'Console' },
                    { id: 'logs', icon: FileText, label: 'Logs' },
                    { id: 'scaling', icon: Maximize2, label: 'Scale' },
                    { id: 'env', icon: Lock, label: 'Secrets' },
                    { id: 'backups', icon: ShieldCheck, label: 'Backups' },
                    { id: 'history', icon: History, label: 'History' },
                    { id: 'database', icon: Database, label: 'Database' },
                    { id: 'cicd', icon: Zap, label: 'CI/CD' },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 min-w-fit px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400'}`}
                    >
                        <tab.icon size={14} /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    {instance.deployment_status === 'deploying' && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                            <BuildLogsViewer instanceId={instance.id} />
                        </div>
                    )}

                    {activeTab === 'telemetry' && (
                        <div className="space-y-6">
                            <StatusBoard instanceId={instance.id} />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* CPU */}
                                <div className="bg-white dark:bg-[#161615] rounded-[2rem] p-6 border border-zinc-200 dark:border-white/5 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Cpu size={14} className="text-emerald-500" />
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">vCPU</h3>
                                            </div>
                                            <span className="text-lg font-black text-emerald-500 font-mono tracking-tighter">{String(currentMetrics?.cpu || '0%')}</span>
                                            </div>
                                            <div className="h-32 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={metrics}>
                                                <Area type="monotone" dataKey="cpu" stroke="#10b881" strokeWidth={3} fill="#10b88110" animationDuration={500} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* RAM */}
                                <div className="bg-white dark:bg-[#161615] rounded-[2rem] p-6 border border-zinc-200 dark:border-white/5 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Database size={14} className="text-blue-500" />
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">RAM</h3>
                                            </div>
                                            <span className="text-lg font-black text-blue-500 font-mono tracking-tighter">{String(currentMetrics?.memory || '0 MiB')}</span>
                                            </div>
                                            <div className="h-32 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={metrics}>
                                                <Area type="monotone" dataKey="memory" stroke="#3b82f6" strokeWidth={3} fill="#3b82f610" animationDuration={500} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Disk I/O */}
                                <div className="bg-white dark:bg-[#161615] rounded-[2rem] p-6 border border-zinc-200 dark:border-white/5 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <HardDrive size={14} className="text-purple-500" />
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Disk I/O</h3>
                                            </div>
                                            <span className="text-lg font-black text-purple-500 font-mono tracking-tighter">{String(currentMetrics?.disk_read || '0 KB/s')}</span>
                                            </div>
                                            <div className="h-32 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={metrics}>
                                                <Area type="monotone" dataKey="disk" stroke="#a855f7" strokeWidth={3} fill="#a855f710" animationDuration={500} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Network */}
                                <div className="bg-white dark:bg-[#161615] rounded-[2rem] p-6 border border-zinc-200 dark:border-white/5 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <ArrowUpDown size={14} className="text-amber-500" />
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Bandwidth</h3>
                                            </div>
                                            <span className="text-lg font-black text-amber-500 font-mono tracking-tighter">{String(currentMetrics?.net_in || '0 Mbps')}</span>
                                            </div>
                                            <div className="h-32 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={metrics}>
                                                <Area type="monotone" dataKey="net" stroke="#f59e0b" strokeWidth={3} fill="#f59e0b10" animationDuration={500} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'console' && (
                        <div className="h-[400px] md:h-[600px] -mx-4 md:mx-0">
                            <Terminal instanceId={instance.id} />
                        </div>
                    )}

                    {activeTab === 'logs' && (
                        <div className="-mx-4 md:mx-0">
                            <LogsViewer instanceId={instance.id} />
                        </div>
                    )}

                    {activeTab === 'env' && (
                        <div className="-mx-4 md:mx-0">
                            <EnvEditor instanceId={instance.id} />
                        </div>
                    )}

                    {activeTab === 'backups' && (
                        <div className="-mx-4 md:mx-0">
                            <BackupManager 
                                instanceId={instance.id} 
                                initialAutoBackups={instance.auto_backups_enabled} 
                            />
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="-mx-4 md:mx-0">
                            <DeploymentHistory instanceId={instance.id} />
                        </div>
                    )}

                    {activeTab === 'database' && (
                        <div className="bg-white dark:bg-[#161615] rounded-[2rem] p-8 md:p-12 border border-zinc-200 dark:border-white/5 space-y-10">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-3xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                    <Database size={28} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Database Protocol</h3>
                                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Secure connection parameters for your provisioned data node.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { label: 'Host', value: instance.credentials?.db_host || 'localhost' },
                                    { label: 'Database', value: instance.credentials?.db_name || 'app_db' },
                                    { label: 'Username', value: instance.credentials?.db_user || 'admin' },
                                    { label: 'Password', value: instance.credentials?.db_pass || '••••••••', secret: true },
                                    { label: 'Port', value: instance.credentials?.db_type === 'postgresql' ? '5432' : '3306' },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">{item.label}</label>
                                        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-black/20 rounded-2xl border border-zinc-100 dark:border-white/5">
                                            <code className="text-xs font-mono truncate text-zinc-900 dark:text-zinc-300">
                                                {item.secret && !showSecret ? '••••••••••••••••' : item.value}
                                            </code>
                                            <div className="flex items-center gap-2">
                                                {item.secret && (
                                                    <button onClick={() => setShowSecret(!showSecret)} className="text-zinc-400 hover:text-zinc-600">
                                                        {showSecret ? <Lock size={14} /> : <ShieldCheck size={14} />}
                                                    </button>
                                                )}
                                                <button onClick={() => copyToClipboard(item.value)} className="text-emerald-500"><Copy size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'scaling' && (
                        <div className="bg-white dark:bg-[#161615] rounded-[2rem] p-8 md:p-12 border border-zinc-200 dark:border-white/5 space-y-10">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    <Layers size={28} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Elastic Scaling</h3>
                                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Adjust resource allocation and horizontal redundancy.</p>
                                </div>
                            </div>

                            <form onSubmit={handleScalingSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">vCPU Limit (Cores)</label>
                                        <input type="number" step="0.1" value={scalingForm.data.cpu} onChange={e => scalingForm.setData('cpu', e.target.value)} className="w-full p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl font-black outline-none focus:border-amber-500/50 transition-all" />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Memory Limit (MB)</label>
                                        <input type="number" step="128" value={scalingForm.data.memory} onChange={e => scalingForm.setData('memory', e.target.value)} className="w-full p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl font-black outline-none focus:border-amber-500/50 transition-all" />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Node Replicas</label>
                                        <input type="number" step="1" min="1" max="10" value={scalingForm.data.replicas} onChange={e => scalingForm.setData('replicas', e.target.value)} className="w-full p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl font-black outline-none focus:border-amber-500/50 transition-all" />
                                    </div>
                                </div>
                                
                                <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-4">
                                    <AlertCircle className="text-amber-500 shrink-0" />
                                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase leading-relaxed">Increasing replicas will trigger horizontal scaling. Your application must be stateless or use persistent volumes for data consistency.</p>
                                </div>

                                <button disabled={scalingForm.processing} className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50">Commit Infrastructure Update</button>
                            </form>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-[#161615] rounded-[2rem] p-6 md:p-8 border border-zinc-200 dark:border-white/5 space-y-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Technical Credentials</p>
                        <div className="space-y-4">
                            {Object.entries(instance.credentials || {})
                                .filter(([_, value]) => typeof value !== 'object' && value !== null)
                                .map(([key, value]) => (
                                <div key={key} className="space-y-2">
                                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{key}</label>
                                    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-black/20 rounded-2xl border border-zinc-100 dark:border-white/5">
                                        <code className="text-[10px] font-mono truncate mr-2">{value}</code>
                                        <button onClick={() => copyToClipboard(String(value))} className="text-emerald-500"><Copy size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Show.layout = page => <AuthenticatedLayout children={page} />;
