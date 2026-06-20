import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Save, RefreshCcw, Lock, AlertCircle } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import axios from 'axios';

export default function EnvEditor({ instanceId }) {
    const [loading, setLoading] = useState(true);
    const { data, setData, post, processing } = useForm({
        env_vars: []
    });

    useEffect(() => {
        fetchEnvVars();
    }, [instanceId]);

    const fetchEnvVars = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('instances.env_vars', instanceId));
            // Assuming response returns array of {key, value}
            setData('env_vars', response.data.env_vars || []);
        } catch (error) {
            toast.error('Failed to fetch environment variables');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setData('env_vars', [...data.env_vars, { key: '', value: '' }]);
    };

    const handleRemove = (index) => {
        setData('env_vars', data.env_vars.filter((_, i) => i !== index));
    };

    const handleChange = (index, field, value) => {
        const updated = [...data.env_vars];
        updated[index][field] = value;
        setData('env_vars', updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('instances.env_vars.update', instanceId), {
            onSuccess: () => toast.success('Environment variables synchronized.'),
        });
    };

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center bg-[#161615] rounded-[2rem] border border-white/5">
                <RefreshCcw size={24} className="text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-[#161615] rounded-[2rem] border border-white/5 p-8 md:p-12 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Environment Secrets</h3>
                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Encrypted key-value pairs for your runtime environment.</p>
                </div>
                <button 
                    type="button" 
                    onClick={handleAdd}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all"
                >
                    <Plus size={14} /> Add Variable
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                    {data.env_vars.map((env, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-4 group">
                            <div className="flex-1">
                                <input 
                                    type="text" 
                                    placeholder="VARIABLE_KEY"
                                    value={env.key}
                                    onChange={(e) => handleChange(index, 'key', e.target.value.toUpperCase())}
                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 font-mono text-[10px] text-emerald-500 focus:border-emerald-500/50 outline-none transition-all"
                                />
                            </div>
                            <div className="flex-[2] relative">
                                <input 
                                    type="text" 
                                    placeholder="value"
                                    value={env.value}
                                    onChange={(e) => handleChange(index, 'value', e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 font-mono text-[10px] text-zinc-300 focus:border-emerald-500/50 outline-none transition-all pr-10"
                                />
                                <Lock size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700" />
                            </div>
                            <button 
                                type="button" 
                                onClick={() => handleRemove(index)}
                                className="p-3 text-zinc-600 hover:text-red-500 transition-colors self-end md:self-center"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    {data.env_vars.length === 0 && (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-white/5 rounded-[2rem]">
                            <div className="p-4 rounded-2xl bg-white/5 text-zinc-500">
                                <AlertCircle size={32} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">No Custom Secrets Defined</p>
                        </div>
                    )}
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl max-w-lg">
                        <AlertCircle size={16} className="text-emerald-500 shrink-0" />
                        <p className="text-[9px] font-bold text-emerald-400 uppercase leading-relaxed">Saving will trigger an automatic rolling redeploy to apply new configurations.</p>
                    </div>
                    <button 
                        disabled={processing}
                        className="w-full md:w-auto px-10 py-4 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 transition-transform disabled:opacity-50"
                    >
                        Save & Redeploy
                    </button>
                </div>
            </form>
        </div>
    );
}
