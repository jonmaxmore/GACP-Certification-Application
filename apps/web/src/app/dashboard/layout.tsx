'use client';

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    ClipboardList,
    Users,
    Settings,
    LogOut,
    Menu
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Task Queue', href: '/dashboard/tasks', icon: ClipboardList },
        // { name: 'Auditors', href: '/dashboard/auditors', icon: Users }, // Future
        // { name: 'Settings', href: '/dashboard/settings', icon: Settings }, // Future
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b">
                <h1 className="text-xl font-bold">GACP Admin</h1>
                <p className="text-sm text-gray-500">{user?.role === 'officer' ? 'Officer Portal' : 'Admin Portal'}</p>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                                }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t">
                <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
                        <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
                    </div>
                </div>
                <Button variant="outline" className="w-full justify-start" onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </div>
    );

    return (
        <AuthGuard allowedRoles={['officer', 'admin']}>
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                {/* Desktop Sidebar */}
                <aside className="hidden w-64 bg-white border-r dark:bg-gray-950 md:block">
                    <SidebarContent />
                </aside>

                {/* Mobile Sidebar */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetContent side="left" className="p-0 w-64">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Mobile Header */}
                    <header className="flex items-center justify-between p-4 bg-white border-b md:hidden dark:bg-gray-950">
                        <h1 className="text-lg font-bold">GACP Admin</h1>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                    </header>

                    <div className="flex-1 overflow-auto p-6">
                        {children}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
