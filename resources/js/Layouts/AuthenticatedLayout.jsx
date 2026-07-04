import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    Box, 
    LayoutDashboard, 
    ShoppingCart, 
    CreditCard, 
    Users, 
    Layers, 
    Settings, 
    LogOut, 
    Moon, 
    Sun, 
    Bell, 
    Search, 
    Command, 
    Activity, 
    Zap, 
    LifeBuoy, 
    Shield, 
    ChevronLeft, 
    Menu, 
    X,
    PanelLeftClose,
    PanelLeftOpen,
    Server,
    Palette,
    TrendingUp,
    Lock,
    Book,
    HelpCircle
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useTheme } from '@/Components/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import AiChathead from '@/Components/AiChathead';

export default function AuthenticatedLayout({ children }) {
    const { url, props } = usePage();
    const user = props?.auth?.user;
    const brand = props?.brand;
    const { isDark, toggleTheme } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDocsOpen, setIsDocsOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    
    useEffect(() => {
        fetchNotifications();
        
        if (window.Echo && user?.id) {
            const channel = window.Echo.private(`App.Models.User.${user.id}`);
            channel.listen('SystemSignalBroadcast', (e) => {
                setNotifications(prev => [
                    {
                        id: String(Math.random().toString(36)).substr(2, 9),
                        data: { message: e.message },
                        created_at: e.timestamp,
                        read_at: null
                    },
                    ...prev
                ]);
                setUnreadCount(prev => prev + 1);
                toast.info(e.message);
            });
            return () => window.Echo.leave(`App.Models.User.${user.id}`);
        }
    }, [user?.id]);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications');
            const data = await response.json();
            setNotifications(data.notifications || []);
            setUnreadCount((data.notifications || []).filter(n => !n.read_at).length);
        } catch (error) {
            console.error('Signal sync failed');
        }
    };

    const markAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            await fetch('/api/notifications/mark-as-read', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                }
            });
            setUnreadCount(0);
            fetchNotifications();
        } catch (error) {
            console.error('Mark as read failed');
        }
    };

    const deleteNotification = async (id, e) => {
        e.stopPropagation();
        try {
            await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                }
            });
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Notification cleared');
        } catch (error) {
            console.error('Delete failed');
        }
    };

    const getNotificationIcon = (data) => {
        const msg = (data?.message || '').toLowerCase();
        if (msg.includes('provision') || msg.includes('deploy')) return <Zap size={14} className="text-emerald-500" />;
        if (msg.includes('suspend') || msg.includes('halt') || msg.includes('expiry')) return <AlertCircle size={14} className="text-amber-500" />;
        if (msg.includes('failed') || msg.includes('error')) return <XCircle size={14} className="text-red-500" />;
        if (msg.includes('ticket') || msg.includes('support')) return <LifeBuoy size={14} className="text-blue-500" />;
        return <Bell size={14} className="text-zinc-400" />;
    };
    
    const isActive = (path) => url.startsWith(path);

    const NavLink = ({ href, icon: Icon, children, active }) => (
        <Link 
            href={href} 
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                active 
                ? 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5'
            }`}
        >
            <div className={`flex items-center justify-center shrink-0 ${isCollapsed ? 'w-full' : ''}`}>
                <Icon size={18} strokeWidth={active ? 2.5 : 2} className={`${active ? 'text-emerald-500' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`} />
            </div>
            {!isCollapsed && (
                <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="truncate"
                >
                    {children}
                </motion.span>
            )}
        </Link>
    );

    const sidebarJSX = (
        <div className="flex flex-col h-full overflow-hidden">
            {/* 1. HEADER: Org Selector */}
            <div className={`flex items-center justify-between p-4 border-b border-zinc-100 dark:border-white/5 ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0 shadow-sm border border-emerald-500/20">
                        {brand?.logo ? (
                            <img src={`/storage/${brand.logo}`} className="w-5 h-5 object-contain" />
                        ) : (
                            <Box size={20} strokeWidth={2} />
                        )}
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                                {brand?.name || 'AseroTech'}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-medium truncate uppercase tracking-widest">Hosting</span>
                        </div>
                    )}
                </div>
                {!isCollapsed && (
                    <button className="p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors shrink-0">
                        <ChevronLeft size={16} />
                    </button>
                )}
            </div>

            {/* 2. NAVIGATION LINKS */}
            <div className="flex-1 overflow-y-auto px-3 py-6 space-y-8 no-scrollbar">
                {user.is_admin ? (
                    <div className="space-y-1">
                        {!isCollapsed && <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Admin Settings</p>}
                        <NavLink href={route('admin.dashboard')} icon={Shield} active={isActive('/admin/dashboard')}>Dashboard</NavLink>
                        <NavLink href={route('admin.health')} icon={Activity} active={isActive('/admin/health')}>System Health</NavLink>
                        <NavLink href={route('admin.infrastructure.index')} icon={Server} active={isActive('/admin/infrastructure')}>Infrastructure</NavLink>
                        <NavLink href={route('admin.finance.index')} icon={TrendingUp} active={isActive('/admin/finance')}>Finance</NavLink>
                        <NavLink href={route('admin.fleet.index')} icon={Layers} active={isActive('/admin/fleet')}>All Instances</NavLink>
                        <NavLink href={route('admin.clients.index')} icon={Users} active={isActive('/admin/clients')}>Users & Clients</NavLink>
                        <NavLink href={route('admin.plans.index')} icon={Settings} active={isActive('/admin/plans')}>Global Plans</NavLink>
                        <NavLink href={route('admin.security.index')} icon={Lock} active={isActive('/admin/security')}>Security</NavLink>
                        <NavLink href={route('reseller.index')} icon={Palette} active={isActive('/branding')}>Platform Branding</NavLink>
                        <NavLink href={route('support.index')} icon={LifeBuoy} active={isActive('/support')}>Support Tickets</NavLink>
                    </div>
                ) : (
                    <>
                        <div className="space-y-1">
                            {!isCollapsed && <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">My Services</p>}
                            <NavLink href={route('dashboard')} icon={LayoutDashboard} active={isActive('/dashboard')}>My Websites</NavLink>
                            <NavLink href={route('orders.index')} icon={ShoppingCart} active={isActive('/orders')}>Shop</NavLink>
                            <NavLink href={route('billing.index')} icon={CreditCard} active={isActive('/billing')}>Billing & Credits</NavLink>
                        </div>
                        
                        <div className="space-y-1">
                            {!isCollapsed && <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Reseller Tools</p>}
                            <NavLink href={route('reseller.dashboard')} icon={Zap} active={isActive('/reseller/dashboard')}>Business Hub</NavLink>
                            <NavLink href={route('reseller.clients.index')} icon={Users} active={isActive('/reseller/clients')}>My Clients</NavLink>
                            <NavLink href={route('reseller.plans.index')} icon={Layers} active={isActive('/reseller/plans')}>Pricing & Plans</NavLink>
                            <NavLink href={route('reseller.index')} icon={Settings} active={isActive('/branding')}>Store Settings</NavLink>
                        </div>

                        <div className="space-y-1">
                            {!isCollapsed && <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Account</p>}
                            <NavLink href={route('referrals.index')} icon={Users} active={isActive('/referrals')}>Referrals</NavLink>
                            <NavLink href={route('developer.index')} icon={Command} active={isActive('/developer')}>API Access</NavLink>
                            <button 
                                onClick={() => setIsDocsOpen(true)}
                                className={`flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5`}
                            >
                                <div className={`flex items-center justify-center shrink-0 ${isCollapsed ? 'w-full' : ''}`}>
                                    <Book size={18} className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                                </div>
                                {!isCollapsed && <span className="truncate">Help & Guides</span>}
                            </button>
                            <NavLink href={route('security.activity')} icon={Shield} active={isActive('/security-activity')}>Activity Log</NavLink>
                            <NavLink href={route('support.index')} icon={LifeBuoy} active={isActive('/support')}>Customer Support</NavLink>
                        </div>
                    </>
                )}
            </div>

            {/* 3. FOOTER ACTIONS */}
            <div className="p-3 border-t border-zinc-100 dark:border-white/5 space-y-2">
                {/* Sign Out Action */}
                <button 
                    onClick={() => {
                        setIsMobileOpen(false);
                        setShowLogoutConfirm(true);
                    }}
                    className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <div className={`flex items-center justify-center shrink-0 ${isCollapsed ? 'w-full' : ''}`}>
                        <LogOut size={18} strokeWidth={2} className="group-hover:rotate-12 transition-transform" />
                    </div>
                    {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Log Out</span>}
                </button>
                
                {/* Version String */}
                {!isCollapsed && (
                    <div className="text-[10px] text-center text-zinc-400 font-medium pt-1">
                        Version v1.0.0
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-500 font-sans flex overflow-hidden relative">
            {/* Glowing background elements for Liquid Glass theme */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }}></div>
            </div>
            <Toaster richColors position="top-right" />
            
            {/* Desktop Sidebar */}
            <motion.aside 
                animate={{ width: isCollapsed ? 72 : 260 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="hidden lg:block h-screen sticky top-0 z-50 overflow-hidden glass-sidebar"
            >
                {sidebarJSX}
            </motion.aside>

            {/* Mobile Header Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 z-[100] px-4 flex items-center justify-between glass-panel !rounded-none !border-b !border-0">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="p-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl shadow-lg active:scale-95 transition-all"
                    >
                        {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                    <div className="flex items-center gap-2 px-2">
                        <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Box size={16} className="text-white" strokeWidth={3} />
                        </div>
                        <span className="text-sm font-black tracking-tighter text-zinc-900 dark:text-white uppercase truncate max-w-[100px]">
                            {brand?.name}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => toggleTheme()} className="p-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 text-zinc-400">
                        {isDark ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                    <Link href={route('profile.edit')} className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center text-[10px] font-black text-white dark:text-zinc-900 shadow-md">
                        {user.name.charAt(0).toUpperCase()}
                    </Link>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] lg:hidden"
                        />
                        <motion.aside 
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed inset-y-0 left-0 w-[280px] z-[120] lg:hidden shadow-2xl overflow-hidden glass-sidebar"
                        >
                            {sidebarJSX}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Docs Slide-out Panel */}
            <AnimatePresence>
                {isDocsOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDocsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
                        />
                        <motion.aside 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed inset-y-0 right-0 w-full max-w-md z-[160] shadow-2xl overflow-hidden flex flex-col glass-sidebar !border-l !border-r-0"
                        >
                            <div className="p-8 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center bg-zinc-50/50 dark:bg-white/[0.02]">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black uppercase tracking-tighter">Help Center</h3>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">AseroTech Hosting Guides</p>
                                </div>
                                <button onClick={() => setIsDocsOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors text-zinc-400">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
                                <div className="space-y-6 text-left">
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">Quick Guides</h4>
                                    <div className="space-y-4">
                                        {[
                                            { q: 'How do I point my domain?', a: 'Create a CNAME record in your domain provider pointing to your Website settings ID.' },
                                            { q: 'Linking a Database', a: 'Use the internal name (like app-db) for your apps to talk to each other safely.' },
                                            { q: 'SSL Configuration', a: 'SSL is automatic. Just make sure your domain is active in our system.' }
                                        ].map((doc, i) => (
                                            <div key={i} className="p-5 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-2xl space-y-2">
                                                <p className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{doc.q}</p>
                                                <p className="text-[10px] font-medium text-zinc-500 leading-relaxed">{doc.a}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-8 bg-emerald-600 rounded-[2rem] text-white space-y-4 shadow-xl shadow-emerald-600/20 text-left">
                                    <HelpCircle size={32} />
                                    <h4 className="text-lg font-black uppercase leading-none">Need More Help?</h4>
                                    <p className="text-xs text-emerald-100/60 font-medium">Our local support team is ready to help you with any questions.</p>
                                    <Link href={route('support.index')} className="block w-full py-4 bg-white text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest text-center shadow-lg">Contact Support</Link>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 h-screen overflow-y-auto relative pt-16 lg:pt-0 z-10">
                {/* Minimal Top Bar for Desktop */}
                <nav className="hidden lg:flex h-16 px-8 items-center justify-between sticky top-0 z-40 glass-panel !rounded-none !border-b !border-0">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
                            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            <Menu size={20} strokeWidth={2.5} />
                        </button>
                        
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-200/50 dark:border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            Production Environment
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => toggleTheme()}
                            className="p-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm"
                        >
                            {isDark ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
                        </button>

                        <div className="relative group">
                            <button 
                                onClick={markAsRead}
                                className="p-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 text-zinc-400 hover:text-emerald-500 transition-all relative"
                            >
                                <Bell size={20} strokeWidth={2.5} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-[#09090b] animate-pulse"></span>
                                )}
                            </button>
                            
                            <div className="absolute top-full right-0 mt-4 w-96 p-6 rounded-[2.5rem] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 z-[110] glass-modal">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Signals</p>
                                        <p className="text-[9px] text-zinc-500 font-medium">Real-time system telemetry</p>
                                    </div>
                                    {unreadCount > 0 && (
                                        <button onClick={markAsRead} className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-colors">Mark all read</button>
                                    )}
                                </div>
                                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 no-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="py-12 text-center grayscale opacity-20 space-y-3">
                                            <div className="w-12 h-12 bg-zinc-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
                                                <Zap size={24} />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Transmissions</p>
                                        </div>
                                    ) : (
                                        notifications.map((n) => (
                                            <div key={n.id} className={`p-4 rounded-2xl border transition-all cursor-pointer group/item relative ${n.read_at ? 'bg-zinc-50/50 dark:bg-white/[0.02] border-zinc-100 dark:border-white/5' : 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 shadow-sm'}`}>
                                                <div className="flex gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${n.read_at ? 'bg-zinc-100 dark:bg-white/10 text-zinc-400' : 'bg-white dark:bg-zinc-900 border border-emerald-500/20 text-emerald-500'}`}>
                                                        {getNotificationIcon(n.data)}
                                                    </div>
                                                    <div className="flex-1 space-y-1 overflow-hidden pr-6">
                                                        <p className={`text-xs font-bold leading-tight ${n.read_at ? 'text-zinc-500' : 'text-zinc-900 dark:text-white'}`}>{n.data.message || 'System Update'}</p>
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={10} className="text-zinc-400" />
                                                            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">{new Date(n.created_at).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={(e) => deleteNotification(n.id, e)}
                                                        className="absolute top-4 right-4 opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all text-zinc-400"
                                                    >
                                                        <X size={14} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-white/5">
                                    <Link href={route('security.activity')} className="block text-center text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-emerald-500 transition-colors">View All Security Transmissions</Link>
                                </div>
                            </div>
                        </div>

                        <Link 
                            href={route('profile.edit')} 
                            className="flex items-center gap-3 p-1 pr-4 rounded-2xl bg-zinc-900 dark:bg-white border border-zinc-800 dark:border-zinc-200 shadow-xl transition-all group overflow-hidden"
                        >
                            <div className="w-9 h-9 rounded-xl bg-white/10 dark:bg-zinc-900 flex items-center justify-center text-xs font-black text-white dark:text-white group-hover:scale-105 transition-transform">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden sm:flex flex-col items-start leading-none">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white dark:text-zinc-900">{user.name.split(' ')[0]}</span>
                                <span className="text-[8px] font-bold uppercase tracking-tighter text-emerald-500/80">{user.role}</span>
                            </div>
                        </Link>
                    </div>
                </nav>

                {/* Page Content */}
                <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    {children}
                </main>

                {/* Footer */}
                <footer className="max-w-7xl mx-auto px-8 py-10 border-t border-zinc-200 dark:border-white/5 flex flex-col items-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
                    <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                <Activity size={10} className="text-emerald-500" />
                                Node 01-PH
                            </div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">&copy; {new Date().getFullYear()} {brand?.name}</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6">
                            <Link href={route('legal.terms')} className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-emerald-500 transition-colors">Terms</Link>
                            <Link href={route('legal.privacy')} className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-emerald-500 transition-colors">Privacy</Link>
                            <Link href={route('legal.aup')} className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-emerald-500 transition-colors">AUP</Link>
                            <Link href={route('legal.refund')} className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-emerald-500 transition-colors">Refunds</Link>
                        </div>
                    </div>
                    
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400">AseroTechCloud is a DTI-registered business.</p>
                </footer>
            </div>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="rounded-[2.5rem] p-8 md:p-10 max-w-sm w-full shadow-2xl text-center relative overflow-hidden glass-modal"
                        >
                            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-[1.25rem] flex items-center justify-center text-red-500 mx-auto mb-6">
                                <LogOut size={24} />
                            </div>
                            
                            <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase mb-2">Engage Sign Out?</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-8 leading-relaxed">
                                You are about to terminate your administrative session. Active build pipelines will continue running in the background.
                            </p>

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 py-4 rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:text-zinc-700 dark:hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowLogoutConfirm(false);
                                        router.post(route('logout'));
                                    }}
                                    className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AiChathead />
        </div>
    );
}
