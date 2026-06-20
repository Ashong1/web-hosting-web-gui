import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Key, Plus, Trash2, Copy, CheckCircle2, Shield, Code, Terminal, Zap, ExternalLink, Info, AlertTriangle, Eye, EyeOff, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import Pagination from '@/Components/Pagination';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, apiKeys }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, reset, delete: destroy } = useForm({
        name: '',
    });

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState(flash?.new_key || null);

    const createKey = (e) => {
        e.preventDefault();
        post(route('developer.keys.store'), {
            onSuccess: (page) => {
                setIsCreateModalOpen(false);
                reset();
                if (page.props.flash?.new_key) {
                    setNewlyCreatedKey(page.props.flash.new_key);
                }
            },
        });
    };

    const revokeKey = (id) => {
        if (confirm('Are you sure? Any systems using this key will immediately lose access.')) {
            destroy(route('developer.keys.destroy', id), {
                onSuccess: () => toast.success('API Key revoked'),
            });
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="space-y-12">
            <Head title="Developer Center" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">Developer Center</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Automate your infrastructure deployments.</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-sm uppercase tracking-widest shadow-xl shadow-black/10 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={18} strokeWidth={3} />
                    Generate Key
                </button>
            </div>

            <div className="space-y-10">
                {newlyCreatedKey && (
                    <div className="p-8 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg"><Shield size={24} /></div>
                            <div className="flex-1 space-y-4">
                                <h4 className="text-lg font-black text-zinc-900 dark:text-white uppercase">Key Generated</h4>
                                <div className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-black/40 border border-emerald-500/20 rounded-2xl font-mono text-emerald-600 break-all">{newlyCreatedKey}</div>
                                <button onClick={() => setNewlyCreatedKey(null)} className="text-[10px] font-black uppercase text-emerald-600 hover:underline">I have stored this key safely</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-[#161615] rounded-[2rem] shadow-sm border border-zinc-200 dark:border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="bg-zinc-50/50 dark:bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 dark:border-white/5">
                                    <th className="px-8 py-5">Identifier</th>
                                    <th className="px-8 py-5 text-right">Node Revocation</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-zinc-200 dark:divide-white/5">
                                {apiKeys.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="2" className="px-8 py-10 text-center text-zinc-400 italic">No active secrets found.</td>
                                    </tr>
                                ) : (
                                    apiKeys.data.map((key) => (
                                        <tr key={key.id}>
                                            <td className="px-8 py-5 font-bold">{key.name}</td>
                                            <td className="px-8 py-5 text-right">
                                                <button onClick={() => revokeKey(key.id)} className="p-2.5 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/10"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Usage Protocols (The Polish) */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400">
                            <Code size={20} />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Usage Protocols</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* cURL Snippet */}
                        <div className="bg-zinc-900 rounded-[2rem] p-8 space-y-6 relative group overflow-hidden border border-white/5">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Terminal size={80} className="text-white" />
                            </div>
                            <div className="space-y-1 relative z-10">
                                <h4 className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em]">Rest Protocol</h4>
                                <p className="text-lg font-black text-white uppercase tracking-tight">Manual cURL</p>
                            </div>
                            <div className="bg-black/60 rounded-2xl p-5 border border-white/10 relative group/code">
                                <pre className="text-[10px] font-mono text-zinc-400 leading-relaxed overflow-x-auto no-scrollbar">
{`curl -X GET "https://portal.aserotech.com/api/v1/status" \\
  -H "Authorization: Bearer YOUR_SECRET_KEY" \\
  -H "Accept: application/json"`}
                                </pre>
                                <button 
                                    onClick={() => copyToClipboard('curl -X GET "https://portal.aserotech.com/api/v1/status" -H "Authorization: Bearer YOUR_SECRET_KEY"')}
                                    className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover/code:opacity-100"
                                >
                                    <Copy size={14} className="text-zinc-400" />
                                </button>
                            </div>
                        </div>

                        {/* Python Snippet */}
                        <div className="bg-zinc-900 rounded-[2rem] p-8 space-y-6 relative group overflow-hidden border border-white/5">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap size={80} className="text-white" />
                            </div>
                            <div className="space-y-1 relative z-10">
                                <h4 className="text-blue-500 font-black text-[10px] uppercase tracking-[0.2em]">SDK Protocol</h4>
                                <p className="text-lg font-black text-white uppercase tracking-tight">Asero SDK (Python)</p>
                            </div>
                            <div className="bg-black/60 rounded-2xl p-5 border border-white/10 relative group/code">
                                <pre className="text-[10px] font-mono text-zinc-400 leading-relaxed overflow-x-auto no-scrollbar">
{`import requests

key = "YOUR_SECRET_KEY"
url = "https://portal.aserotech.com/api/v1/status"

resp = requests.get(url, headers={"Authorization": f"Bearer {key}"})
print(resp.json())`}
                                </pre>
                                <button 
                                    onClick={() => copyToClipboard('import requests\n\nkey = "YOUR_SECRET_KEY"\nurl = "https://portal.aserotech.com/api/v1/status"\n\nresp = requests.get(url, headers={"Authorization": f"Bearer {key}"})\nprint(resp.json())')}
                                    className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover/code:opacity-100"
                                >
                                    <Copy size={14} className="text-zinc-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" onClick={() => setIsCreateModalOpen(false)}></div>
                    <div className="relative w-full max-w-lg bg-white dark:bg-[#161615] rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-white/5 p-10">
                        <h3 className="text-xl font-black uppercase mb-8">Authorize Agent</h3>
                        <form onSubmit={createKey} className="space-y-6">
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Key Name" className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl outline-none" required />
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-4 rounded-2xl bg-zinc-100 dark:bg-white/5 font-black text-[10px] uppercase">Abort</button>
                                <button disabled={processing} className="flex-[2] py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs uppercase shadow-xl transition-all">Generate Secret</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

Index.layout = page => <AuthenticatedLayout children={page} />;
