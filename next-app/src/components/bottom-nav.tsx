'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calculator, History, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const pathname = usePathname();

    const links = [
        { href: '/', label: 'Start', icon: Home },
        { href: '/calculator', label: 'Leki', icon: Calculator },
        { href: '/history', label: 'Historia', icon: History },
        { href: '/profile', label: 'Profil', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700">
            <div className="max-w-md mx-auto flex">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                'flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors',
                                isActive
                                    ? 'text-emerald-400'
                                    : 'text-slate-400 hover:text-slate-200'
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
