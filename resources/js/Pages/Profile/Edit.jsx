import React, { useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { User, Lock, Save, CheckCircle2, Shield, Download, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ auth, status }) {
    const { user } = auth;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const {
        data: passwordData,
        setData: setPasswordData,
        errors: passwordErrors,
        put,
        reset: resetPassword,
        processing: passwordProcessing,
        recentlySuccessful: passwordRecentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (recentlySuccessful) toast.success('Profile updated successfully');
    }, [recentlySuccessful]);

    useEffect(() => {
        if (passwordRecentlySuccessful) toast.success('Password changed successfully');
    }, [passwordRecentlySuccessful]);

    const submitProfile = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            preserveScroll: true,
            onError: () => toast.error('Please fix the errors below')
        });
    };

    const submitPassword = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => resetPassword(),
            onError: () => toast.error('Password update failed')
        });
    };

    const handleExport = () => {
        toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
            loading: 'Generating data archive...',
            success: 'Data archive ready for download',
            error: 'Export failed',
        });
        window.location.href = route('profile.export');
    };

    const handleDeleteAccount = () => {
        if (confirm('Are you absolutely sure? This will permanently delete your account and all associated data from AseroTech Cloud.')) {
            router.post(route('profile.destroy'));
        }
    };

    const inputClasses = "w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium";
    const labelClasses = "block text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2 ml-1";
    const sectionClasses = "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-8 rounded-3xl shadow-sm";

    return (
        <div className="max-w-3xl mx-auto space-y-12">
            <Head title="Profile" />

            <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">Identity Control</h2>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Manage your security credentials and profile metadata.</p>
            </div>

            <div className="space-y-8">
                {/* Profile Information */}
                <div className={sectionClasses}>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Profile Information</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Update your primary identification.</p>
                        </div>
                    </div>

                    <form onSubmit={submitProfile} className="space-y-6">
                        <div>
                            <label className={labelClasses}>Full Name</label>
                            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={inputClasses} required />
                        </div>
                        <div>
                            <label className={labelClasses}>Email Address</label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={inputClasses} required />
                        </div>
                        <button disabled={processing} className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold shadow-xl">
                            <Save size={18} /> Update Profile
                        </button>
                    </form>
                </div>

                {/* Update Password */}
                <div className={sectionClasses}>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                            <Lock size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Security Credentials</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Reset your encrypted authentication key.</p>
                        </div>
                    </div>

                    <form onSubmit={submitPassword} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>New Password</label>
                                <input type="password" value={passwordData.password} onChange={(e) => setPasswordData('password', e.target.value)} className={inputClasses} required />
                            </div>
                            <div>
                                <label className={labelClasses}>Confirm Password</label>
                                <input type="password" value={passwordData.password_confirmation} onChange={(e) => setPasswordData('password_confirmation', e.target.value)} className={inputClasses} required />
                            </div>
                        </div>
                        <button disabled={passwordProcessing} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
                            <Lock size={18} /> Change Password
                        </button>
                    </form>
                </div>

                {/* Data & Privacy (Blueprint 4) */}
                <div className={`${sectionClasses} border-red-500/10`}>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Data & Privacy</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Complying with Data Privacy Act protocol (RA 10173).</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="p-6 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/5 space-y-4">
                            <div className="flex items-start gap-4">
                                <Download className="text-zinc-400 mt-1" size={18} />
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white leading-none">Export My Data</h4>
                                    <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">Download a complete JSON archive of your account profile, order history, and metadata.</p>
                                </div>
                            </div>
                            <button onClick={handleExport} className="w-full py-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 rounded-xl font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-zinc-50 transition-colors">Generate Data Export</button>
                        </div>

                        <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/10 space-y-4">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="text-red-500 mt-1" size={18} />
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black uppercase tracking-tight text-red-600 dark:text-red-400 leading-none">Danger Zone</h4>
                                    <p className="text-[10px] text-red-500/70 font-medium leading-relaxed">Revoke your consent and permanently erase your account. This action is irreversible.</p>
                                </div>
                            </div>
                            <button onClick={handleDeleteAccount} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-600/20 hover:bg-red-500 transition-colors">Delete My Account</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Edit.layout = page => <AuthenticatedLayout children={page} />;


Edit.layout = page => <AuthenticatedLayout children={page} />;
