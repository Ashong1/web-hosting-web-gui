import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { 
    Shield, 
    Palette, 
    Globe, 
    Mail, 
    Zap, 
    Plus, 
    Trash2, 
    Save, 
    Layout, 
    Image as ImageIcon,
    ExternalLink,
    Lock,
    Wallet
} from 'lucide-react';
import { toast } from 'sonner';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, settings }) {
    const { data, setData, post, processing, errors } = useForm({
        brand_name: settings?.brand_name || '',
        support_email: settings?.support_email || '',
        custom_domain: settings?.custom_domain || '',
        nameserver_1: settings?.nameserver_1 || '',
        nameserver_2: settings?.nameserver_2 || '',
        logo: null,
        gcash_qr: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('reseller.update'), {
            onSuccess: () => toast.success('Branding protocol updated.'),
        });
    };

    return (
        <div className="space-y-12 pb-20 max-w-4xl mx-auto">
            <Head title={auth.user.is_admin ? "Platform Branding" : "White-Label Branding"} />

            <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">
                    {auth.user.is_admin ? 'Global Platform Identity' : 'White-Label Engine'}
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">
                    {auth.user.is_admin ? 'Configure the root platform brand and global payment methods.' : 'Empower your agency by rebranding the orchestration dashboard.'}
                </p>
            </div>

            <form onSubmit={submit} className="space-y-8">
                {/* Brand Identity */}
                <div className="bg-white dark:bg-[#161615] rounded-[2.5rem] p-10 border border-zinc-200 dark:border-white/5 shadow-sm space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                            <Palette size={24} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Brand Identity</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Brand Name</label>
                            <input 
                                type="text" 
                                value={data.brand_name} 
                                onChange={e => setData('brand_name', e.target.value)} 
                                placeholder="AseroTech" 
                                className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none focus:border-emerald-500 transition-all font-bold" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Support Email</label>
                            <input 
                                type="email" 
                                value={data.support_email} 
                                onChange={e => setData('support_email', e.target.value)} 
                                placeholder="support@yourbrand.com" 
                                className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none focus:border-emerald-500 transition-all font-bold" 
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Dashboard Logo</label>
                        <div className="flex items-center gap-6 p-6 border-2 border-dashed border-zinc-100 dark:border-white/5 rounded-[2rem]">
                            {settings?.logo_path ? (
                                <img src={`/storage/${settings.logo_path}`} className="w-16 h-16 rounded-xl object-contain bg-zinc-50 dark:bg-black/20" />
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300">
                                    <ImageIcon size={32} />
                                </div>
                            )}
                            <div className="flex-1">
                                <input 
                                    type="file" 
                                    onChange={e => setData('logo', e.target.files[0])} 
                                    className="text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-zinc-900 file:text-white dark:file:bg-white dark:file:text-black hover:file:opacity-80" 
                                />
                                <p className="text-[9px] text-zinc-400 mt-2 uppercase tracking-widest">Recommended: Transparent PNG, 512x512px</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Configuration */}
                <div className="bg-white dark:bg-[#161615] rounded-[2.5rem] p-10 border border-emerald-500/30 shadow-[0_0_40px_-15px_rgba(16,185,129,0.2)] space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight">Payment Configuration</h3>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Receive funds directly from your clients</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10">
                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 ml-1">Your Personal GCash QR Code</label>
                        <div className="flex items-center gap-6 p-6 border-2 border-dashed border-emerald-500/20 bg-white dark:bg-[#161615] rounded-[2rem]">
                            {settings?.gcash_qr_path ? (
                                <img src={`/storage/${settings.gcash_qr_path}`} className="w-24 h-24 rounded-xl object-contain bg-zinc-50 dark:bg-black/20 p-2 border border-zinc-100 dark:border-white/5 shadow-sm" />
                            ) : (
                                <div className="w-24 h-24 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300 border border-zinc-200 dark:border-white/5">
                                    <Shield size={40} />
                                </div>
                            )}
                            <div className="flex-1 space-y-3">
                                <input 
                                    type="file" 
                                    onChange={e => setData('gcash_qr', e.target.files[0])} 
                                    className="text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-emerald-500 file:text-white dark:file:bg-emerald-600 hover:file:opacity-80 transition-opacity cursor-pointer" 
                                />
                                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                                    Upload your personal GCash QR code here. When your clients purchase or top-up, they will scan this exact code to send payments <span className="font-bold text-zinc-900 dark:text-white">directly to your wallet</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Domain & DNS */}
                <div className="bg-white dark:bg-[#161615] rounded-[2.5rem] p-10 border border-zinc-200 dark:border-white/5 shadow-sm space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                            <Globe size={24} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Private Infrastructure</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Custom Dashboard Domain</label>
                            <input 
                                type="text" 
                                value={data.custom_domain} 
                                onChange={e => setData('custom_domain', e.target.value)} 
                                placeholder="portal.youragency.com" 
                                className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none focus:border-blue-500 transition-all font-mono text-sm" 
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Nameserver 1</label>
                                <input 
                                    type="text" 
                                    value={data.nameserver_1} 
                                    onChange={e => setData('nameserver_1', e.target.value)} 
                                    placeholder="ns1.youragency.com" 
                                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none font-mono text-xs" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Nameserver 2</label>
                                <input 
                                    type="text" 
                                    value={data.nameserver_2} 
                                    onChange={e => setData('nameserver_2', e.target.value)} 
                                    placeholder="ns2.youragency.com" 
                                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none font-mono text-xs" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-4">
                        <Lock className="text-blue-500 shrink-0" size={20} />
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase leading-relaxed tracking-tight">
                            DNS propagation for private nameservers can take up to 24 hours. Ensure your domain registrar is pointing to our primary Tiaong Node.
                        </p>
                    </div>
                </div>

                <button 
                    disabled={processing}
                    className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    Engage White-Label Protocol
                    <Save size={18} strokeWidth={3} />
                </button>
            </form>
        </div>
    );
}

Index.layout = page => <AuthenticatedLayout children={page} />;
