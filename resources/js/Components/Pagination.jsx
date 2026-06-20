import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ links }) {
    if (links.length <= 3) return null;

    return (
        <div className="flex items-center justify-between px-8 py-6 bg-zinc-50/50 dark:bg-white/[0.02] border-t border-zinc-200 dark:border-white/5">
            <div className="flex gap-2">
                {links.map((link, key) => {
                    if (link.url === null) {
                        return (
                            <div
                                key={key}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest opacity-40 cursor-not-allowed flex items-center gap-2"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    }

                    return (
                        <Link
                            key={key}
                            href={link.url}
                            className={`px-4 py-2 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                                link.active 
                                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-lg shadow-black/10' 
                                : 'bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
