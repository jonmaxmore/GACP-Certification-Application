'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/services/auth-provider';
import { Icons } from '@/components/ui/icons';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function SettingsPage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { language, setLanguage, dict } = useLanguage();

    const handleLanguageChange = () => {
        const newLang = language === 'th' ? 'en' : 'th';
        setLanguage(newLang);
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const sections = [
        {
            title: dict.settings.general,
            items: [
                {
                    icon: <Icons.Globe className="w-5 h-5 text-blue-500" />,
                    label: dict.settings.language,
                    value: language === 'th' ? 'ไทย' : 'English',
                    action: handleLanguageChange
                },
                {
                    icon: <Icons.User className="w-5 h-5 text-primary" />,
                    label: dict.sidebar.profile,
                    value: user?.firstName || dict.common.edit,
                    action: () => router.push('/farmer/profile')
                }
            ]
        },
        {
            title: dict.settings.security,
            items: [
                {
                    icon: <Icons.Secure className="w-5 h-5 text-emerald-500" />,
                    label: dict.settings.changePassword,
                    value: '***********',
                    action: () => console.log('Change password')
                },
                /*
                {
                    icon: <Icons.Secure className="w-5 h-5 text-gray-500" />,
                    label: '2FA',
                    value: 'OFF',
                    action: () => console.log('Toggle 2FA')
                }
                */
            ]
        },
        {
            title: dict.settings.notifications,
            items: [
                {
                    icon: <Icons.Bell className="w-5 h-5 text-amber-500" />,
                    label: dict.settings.notifications,
                    value: 'ON',
                    action: () => console.log('Toggle Notif')
                }
            ]
        }
    ];

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-24">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary-100">
                    <Icons.Settings className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{dict.settings.title}</h1>
                    <p className="text-gray-500 text-sm">System configuration and preferences</p>
                </div>
            </div>

            {/* Menu Sections */}
            <div className="space-y-6">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">{section.title}</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {section.items.map((item, itemIdx) => (
                                <button
                                    key={itemIdx}
                                    onClick={item.action}
                                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-200">
                                            {item.icon}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900">{item.label}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-500 font-medium">{item.value}</span>
                                        <Icons.ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="w-full py-4 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all shadow-sm flex items-center justify-center gap-2 mt-8"
            >
                <Icons.Logout className="w-5 h-5" />
                {dict.sidebar.logout}
            </button>
        </div>
    );
}

