import React, { useState, useEffect } from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { Joyride, STATUS } from 'react-joyride';
import { 
    Globe, 
    Box, 
    Zap, 
    Cpu, 
    ShieldCheck, 
    XCircle,
    ArrowRight,
    Code,
    Settings,
    Layers,
    Lock,
    Plus,
    Trash2,
    Database,
    HardDrive
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { toast } from 'sonner';

export default function Create({ auth, plans }) {
    const { pricing_rates } = usePage().props;
    const cpuRate = pricing_rates?.cpu ?? 250;
    const ramRate = pricing_rates?.ram ?? 150;
    const storageRate = pricing_rates?.storage ?? 5;

    const [step, setStep] = useState(1);
    const [runTour, setRunTour] = useState(false);

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get('tour') === 'true') {
            setRunTour(true);
        }
    }, []);

    const { data, setData, post, processing, errors } = useForm({
        plan_id: '',
        project_type: 'application',
        database_type: 'none',
        build_strategy: 'nixpacks',
        app_name: '',
        subdomain: '',
        repository_url: '',
        repository_branch: 'main',
        install_command: 'npm install',
        build_command: 'npm run build',
        compose_file: '',
        env_vars: [{ key: '', value: '' }],
        volumes: [],
        aup_agreed: false,
        cpu: 1,
        memory: 1024,
        storage: 10,
        replicas: 1,
    });

    const handleAddEnv = () => setData('env_vars', [...data.env_vars, { key: '', value: '' }]);
    const handleEnvChange = (index, field, value) => {
        const updated = [...data.env_vars];
        updated[index][field] = value;
        setData('env_vars', updated);
    };
    const handleRemoveEnv = (index) => setData('env_vars', data.env_vars.filter((_, i) => i !== index));

    const handleAddVolume = () => setData('volumes', [...data.volumes, { name: 'data', path: '/var/www/html/storage' }]);
    const handleVolumeChange = (index, field, value) => {
        const updated = [...data.volumes];
        updated[index][field] = value;
        setData('volumes', updated);
    };
    const handleRemoveVolume = (index) => setData('volumes', data.volumes.filter((_, i) => i !== index));

    const submit = (e) => {
        e.preventDefault();
        post(route('deploy.store'), {
            onSuccess: () => toast.success('Orchestration protocol engaged.'),
        });
    };

    const tourSteps = [
        {
            target: '.tour-tier',
            content: 'First, select your Compute Tier. This defines the framework (like WordPress or Laravel) and the hardware resources allocated to your site.',
            disableBeacon: true,
        },
        {
            target: '.tour-database',
            content: 'Next, select a Database. If your application needs a database (like MySQL or PostgreSQL), select it here and we will automatically provision and link it.',
        },
        {
            target: '.tour-name',
            content: 'Give your application a recognizable name for your dashboard.',
        },
        {
            target: '.tour-subdomain',
            content: 'Choose a unique subdomain. This is where your website will be live on the internet.',
        },
        {
            target: '.tour-continue',
            content: 'Click Continue to configure your source code and environment variables!',
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <Head title="Deploy New App" />
            
            <Joyride
                steps={tourSteps}
                run={runTour}
                continuous={true}
                showSkipButton={true}
                styles={{
                    options: {
                        arrowColor: '#161615',
                        backgroundColor: '#161615',
                        overlayColor: 'rgba(0, 0, 0, 0.8)',
                        primaryColor: '#10b981',
                        textColor: '#fff',
                        zIndex: 1000,
                    },
                    tooltipContainer: {
                        textAlign: 'left',
                        padding: '20px'
                    },
                    buttonNext: {
                        backgroundColor: '#10b981',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        textTransform: 'uppercase'
                    },
                    buttonBack: {
                        color: '#a1a1aa',
                        marginRight: '10px'
                    },
                    buttonSkip: {
                        color: '#a1a1aa'
                    }
                }}
            />

            <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">Orchestrator Protocol</h2>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Provision production-grade applications with zero manual server interaction.</p>
            </div>

            <div className="bg-white dark:bg-[#161615] rounded-[2.5rem] border border-zinc-200 dark:border-white/5 shadow-2xl overflow-hidden">
                {/* Stepper */}
                <div className="px-10 py-8 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-black/20">
                    <div className="flex gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`flex items-center gap-2 ${step === i ? 'text-emerald-500' : 'text-zinc-400'}`}>
                                <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center font-black text-xs transition-all ${step === i ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'border-zinc-200 dark:border-white/10'}`}>
                                    {i}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${step === i ? 'opacity-100' : 'opacity-40'}`}>
                                    {i === 1 ? 'Resource' : i === 2 ? 'Code' : i === 3 ? 'Secrets' : 'Storage'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={submit} className="p-10 lg:p-16 space-y-12">
                    {step === 1 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Orchestration Type</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setData('project_type', 'application')}
                                        className={`p-6 rounded-3xl border text-left transition-all ${data.project_type === 'application' ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5 text-zinc-500'}`}
                                    >
                                        <div className="flex items-center gap-4 mb-2">
                                            <Box size={24} />
                                            <span className="text-sm font-black uppercase tracking-widest">Single App</span>
                                        </div>
                                        <p className="text-[10px] font-medium opacity-80 leading-relaxed">Standard deployment for Web Apps, APIs, and microservices with automatic build pipelines.</p>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setData('project_type', 'compose')}
                                        className={`p-6 rounded-3xl border text-left transition-all ${data.project_type === 'compose' ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5 text-zinc-500'}`}
                                    >
                                        <div className="flex items-center gap-4 mb-2">
                                            <Layers size={24} />
                                            <span className="text-sm font-black uppercase tracking-widest">Docker Compose</span>
                                        </div>
                                        <p className="text-[10px] font-medium opacity-80 leading-relaxed">Multi-container orchestration for complex stacks. Deploy multiple services with a single YAML.</p>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4 tour-tier">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Compute Tier (Framework)</label>
                                    <select value={data.plan_id} onChange={e => setData('plan_id', e.target.value)} className="w-full p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none text-sm font-black uppercase tracking-widest" required>
                                        <option value="">Select Protocol</option>
                                        {plans.map(p => <option key={p.id} value={p.id}>{p.name} - ₱{p.price}/mo</option>)}
                                        <option value="custom">Custom Flex Node (Configure below)</option>
                                    </select>
                                </div>
                                <div className="space-y-4 tour-database">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Database Provider</label>
                                    <select value={data.database_type} onChange={e => setData('database_type', e.target.value)} className="w-full p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none text-sm font-black uppercase tracking-widest">
                                        <option value="none">No Database Needed</option>
                                        <option value="mysql">MySQL 8.0</option>
                                        <option value="postgresql">PostgreSQL 15</option>
                                        <option value="mariadb">MariaDB 10.6</option>
                                        <option value="mongodb">MongoDB 6.0</option>
                                        <option value="redis">Redis Cache</option>
                                    </select>
                                </div>

                                {data.plan_id === 'custom' && (
                                    <div className="col-span-full bg-zinc-50 dark:bg-black/40 rounded-3xl p-8 border border-zinc-200 dark:border-white/5 space-y-6">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-emerald-500">Resource Customization</h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* CPU Slider */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                    <span>vCPU Cores</span>
                                                    <span className="text-zinc-900 dark:text-white">{data.cpu} Cores</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setData('cpu', Math.max(0.5, data.cpu - 0.5))}
                                                        className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl font-black text-base text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                                                    >
                                                        -
                                                    </button>
                                                    <input 
                                                        type="range" 
                                                        min="0.5" 
                                                        max="8" 
                                                        step="0.5"
                                                        value={data.cpu} 
                                                        onChange={e => setData('cpu', parseFloat(e.target.value))}
                                                        className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-500" 
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setData('cpu', Math.min(8, data.cpu + 0.5))}
                                                        className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl font-black text-base text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* RAM Slider */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                    <span>Memory (RAM)</span>
                                                    <span className="text-zinc-900 dark:text-white">
                                                        {data.memory >= 1024 ? `${data.memory / 1024} GB` : `${data.memory} MB`}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setData('memory', Math.max(512, data.memory - 512))}
                                                        className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl font-black text-base text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                                                    >
                                                        -
                                                    </button>
                                                    <input 
                                                        type="range" 
                                                        min="512" 
                                                        max="16384" 
                                                        step="512"
                                                        value={data.memory} 
                                                        onChange={e => setData('memory', parseInt(e.target.value))}
                                                        className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-500" 
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setData('memory', Math.min(16384, data.memory + 512))}
                                                        className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl font-black text-base text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* SSD Storage Slider */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                    <span>SSD Storage</span>
                                                    <span className="text-zinc-900 dark:text-white">{data.storage} GB</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setData('storage', Math.max(10, data.storage - 10))}
                                                        className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl font-black text-base text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                                                    >
                                                        -
                                                    </button>
                                                    <input 
                                                        type="range" 
                                                        min="10" 
                                                        max="200" 
                                                        step="10"
                                                        value={data.storage} 
                                                        onChange={e => setData('storage', parseInt(e.target.value))}
                                                        className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-500" 
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setData('storage', Math.min(200, data.storage + 10))}
                                                        className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl font-black text-base text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Replicas Slider */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                    <span>Replicas</span>
                                                    <span className="text-zinc-900 dark:text-white">{data.replicas} Instance(s)</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setData('replicas', Math.max(1, data.replicas - 1))}
                                                        className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl font-black text-base text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                                                    >
                                                        -
                                                    </button>
                                                    <input 
                                                        type="range" 
                                                        min="1" 
                                                        max="5" 
                                                        step="1"
                                                        value={data.replicas} 
                                                        onChange={e => setData('replicas', parseInt(e.target.value))}
                                                        className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-500" 
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setData('replicas', Math.min(5, data.replicas + 1))}
                                                        className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl font-black text-base text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Calculated Price Summary */}
                                        <div className="pt-6 border-t border-zinc-200 dark:border-white/5 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Estimated Cost</p>
                                                <p className="text-2xl font-black text-zinc-900 dark:text-white">
                                                    ₱{(((parseFloat(data.cpu) || 1) * cpuRate) + (((parseInt(data.memory) || 1024) / 1024) * ramRate) + ((parseInt(data.storage) || 10) * storageRate)) * (parseInt(data.replicas) || 1)}
                                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">/mo</span>
                                                </p>
                                            </div>
                                            <div className="text-[9px] font-black uppercase text-zinc-400 tracking-widest text-right leading-relaxed max-w-xs">
                                                Rates: ₱{cpuRate}/vCPU · ₱{ramRate}/GB RAM · ₱{storageRate}/GB SSD
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4 tour-name">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Instance Name</label>
                                    <input type="text" value={data.app_name} onChange={e => setData('app_name', e.target.value)} placeholder="My Super Project" className="w-full p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none text-sm font-bold" required />
                                </div>
                                <div className="space-y-4 tour-subdomain">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Public Subdomain</label>
                                    <div className="flex items-center">
                                        <input type="text" value={data.subdomain} onChange={e => setData('subdomain', e.target.value.toLowerCase())} placeholder="my-app" className="flex-1 p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-l-2xl outline-none text-sm font-bold" required />
                                        <span className="p-5 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 border-l-0 rounded-r-2xl text-xs font-black text-zinc-500">.aserotech.com</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                            {data.project_type === 'application' ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Build Strategy</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button 
                                                    type="button"
                                                    onClick={() => setData('build_strategy', 'nixpacks')}
                                                    className={`p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${data.build_strategy === 'nixpacks' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5 text-zinc-500'}`}
                                                >
                                                    Nixpacks (Auto)
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setData('build_strategy', 'dockerfile')}
                                                    className={`p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${data.build_strategy === 'dockerfile' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5 text-zinc-500'}`}
                                                >
                                                    Dockerfile
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Git Branch</label>
                                            <input type="text" value={data.repository_branch} onChange={e => setData('repository_branch', e.target.value)} className="w-full p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none text-sm font-bold" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Source Repository (HTTPS)</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400"><Code size={20} /></div>
                                            <input type="url" value={data.repository_url} onChange={e => setData('repository_url', e.target.value)} placeholder="https://github.com/user/repo" className="w-full pl-14 pr-5 py-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none text-sm font-mono" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Install Cmd</label>
                                            <input type="text" value={data.install_command} onChange={e => setData('install_command', e.target.value)} className="w-full p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none text-sm font-mono" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Build Cmd</label>
                                            <input type="text" value={data.build_command} onChange={e => setData('build_command', e.target.value)} className="w-full p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none text-sm font-mono" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">docker-compose.yml</label>
                                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Native YAML Syntax</span>
                                    </div>
                                    <textarea 
                                        value={data.compose_file}
                                        onChange={e => setData('compose_file', e.target.value)}
                                        rows={12}
                                        placeholder={`version: '3.8'\nservices:\n  web:\n    image: nginx:latest\n    ports:\n      - "80:80"`}
                                        className="w-full p-6 bg-zinc-900 border border-white/10 rounded-3xl font-mono text-xs text-emerald-500 outline-none focus:border-emerald-500/50 transition-all leading-relaxed"
                                    />
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-3">
                                        <Settings size={14} className="text-zinc-400 shrink-0" />
                                        <p className="text-[9px] text-zinc-500 font-bold uppercase">External resources like databases will be auto-linked if defined in the compose file.</p>
                                    </div>
                                </div>
                            )}
                            <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-4">
                                <Settings className="text-blue-500 shrink-0" />
                                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase leading-relaxed">System will auto-detect Dockerfile or Node.js environment from root.</p>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Environment Transmissions</label>
                                    <button type="button" onClick={handleAddEnv} className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1.5"><Plus size={14} /> Add Mapping</button>
                                </div>
                                <div className="space-y-3">
                                    {data.env_vars.map((env, i) => (
                                        <div key={i} className="flex gap-3 animate-in slide-in-from-top-2 duration-300">
                                            <input type="text" placeholder="KEY" value={env.key} onChange={e => handleEnvChange(i, 'key', e.target.value.toUpperCase())} className="flex-1 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl font-mono text-[10px]" />
                                            <input type="text" placeholder="VALUE" value={env.value} onChange={e => handleEnvChange(i, 'value', e.target.value)} className="flex-1 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl font-mono text-[10px]" />
                                            <button type="button" onClick={() => handleRemoveEnv(i)} className="p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-4">
                                <Lock className="text-amber-500 shrink-0" />
                                <p className="text-[10px] text-amber-600 dark:text-amber-500 font-bold uppercase leading-relaxed">Environment variables are encrypted at rest with AES-256-GCM before transmission to Dokploy.</p>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Persistent Volumes (Docker)</label>
                                    <button type="button" onClick={handleAddVolume} className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1.5"><Plus size={14} /> Add Mount</button>
                                </div>
                                <div className="space-y-3">
                                    {data.volumes.map((vol, i) => (
                                        <div key={i} className="flex gap-3 animate-in slide-in-from-top-2 duration-300">
                                            <div className="flex-1 space-y-2">
                                                <label className="text-[8px] font-black uppercase text-zinc-400 ml-1">Volume Name</label>
                                                <input type="text" placeholder="e.g. uploads" value={vol.name} onChange={e => handleVolumeChange(i, 'name', e.target.value.toLowerCase())} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl font-mono text-[10px]" />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <label className="text-[8px] font-black uppercase text-zinc-400 ml-1">Mount Path (Internal)</label>
                                                <input type="text" placeholder="e.g. /var/www/html/uploads" value={vol.path} onChange={e => handleVolumeChange(i, 'path', e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl font-mono text-[10px]" />
                                            </div>
                                            <button type="button" onClick={() => handleRemoveVolume(i)} className="mt-7 p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    ))}
                                    {data.volumes.length === 0 && (
                                        <div className="p-8 border-2 border-dashed border-zinc-100 dark:border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4">
                                            <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-white/5 flex items-center justify-center text-zinc-400">
                                                <HardDrive size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">No Volumes Defined</p>
                                                <p className="text-[10px] text-zinc-500 font-medium">Your data will be ephemeral and lost on redeploy.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex gap-4">
                                <ShieldCheck className="text-indigo-500 shrink-0" />
                                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase leading-relaxed">Persistent volumes ensure that user uploads, databases, and logs remain intact across infrastructure updates.</p>
                            </div>

                            <div className="pt-8 border-t border-zinc-100 dark:border-white/5 space-y-4">
                                <div className="flex items-start gap-4 p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl group cursor-pointer" onClick={() => setData('aup_agreed', !data.aup_agreed)}>
                                    <div className="relative flex items-center mt-1">
                                        <input 
                                            type="checkbox" 
                                            checked={data.aup_agreed} 
                                            onChange={e => setData('aup_agreed', e.target.checked)} 
                                            className="peer sr-only"
                                            required
                                        />
                                        <div className="w-6 h-6 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-white/10 rounded-lg transition-all peer-checked:bg-emerald-500 peer-checked:border-emerald-500 flex items-center justify-center">
                                            <div className="w-3 h-3 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase tracking-tight text-zinc-900 dark:text-white">I agree to the Acceptable Use Policy.</p>
                                        <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">I confirm that this server will <span className="text-red-500 font-black">NOT</span> be used for crypto-mining, phishing, or hosting illegal content as defined in our <Link href={route('legal.aup')} className="text-emerald-500 underline">AUP Protocol</Link>.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 pt-6 border-t border-zinc-100 dark:border-white/5">
                        {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="flex-1 py-5 rounded-2xl bg-zinc-100 dark:bg-white/5 font-black text-xs uppercase tracking-widest transition-all">Previous</button>}
                        {step < 4 ? (
                            <button type="button" onClick={() => setStep(step + 1)} className="tour-continue flex-[2] py-5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3">Continue Protocol <ArrowRight size={18} strokeWidth={3} /></button>
                        ) : (
                            <button disabled={processing || !data.aup_agreed} className="tour-submit flex-[2] py-5 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale transition-all">Engage Deployment <Zap size={18} fill="currentColor" /></button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

Create.layout = page => <AuthenticatedLayout children={page} />;
