'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApplicationService, Application } from "@/lib/services/application-service";
import { AuthService } from "@/lib/services/auth-service";
import { useRouter } from "next/navigation";
import { IconSearch, Icons } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// --- Modern Icons ---
const HomeIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
);
const BellIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
);
const UserIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const PlusIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
const MoreHorizontaly = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
);

export default function DashboardPage() {
    const router = useRouter();
    const { dict } = useLanguage();
    const [user, setUser] = useState<any>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const u = AuthService.getUser();
        if (!u) { router.push("/login"); return; }
        setUser(u);

        // Load "Feed" (Applications)
        ApplicationService.getMyApplications().then(res => {
            if (res.success) {
                const apps = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
                setApplications(apps);
            }
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="h-screen flex items-center justify-center bg-white"><div className="animate-spin w-8 h-8 border-2 border-slate-200 border-t-black rounded-full"></div></div>;

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex justify-center">

            {/* L: Sidebar (Desktop) */}
            <div className="hidden lg:flex w-[275px] flex-col h-screen sticky top-0 px-4 py-4 border-r border-slate-100 items-end pr-8">
                <div className="flex flex-col gap-6 w-full max-w-[220px]">
                    <div className="text-3xl font-black tracking-tighter hover:bg-slate-50 p-3 rounded-full w-fit cursor-pointer transition-colors">
                        <Icons.Leaf className="w-8 h-8 text-black" />
                    </div>

                    <nav className="space-y-2">
                        <NavItem href="/farmer/dashboard" icon={HomeIcon} label="Home" active />
                        <NavItem href="/farmer/notifications" icon={BellIcon} label="Notifications" />
                        <NavItem href="/farmer/profile" icon={UserIcon} label="Profile" />
                    </nav>

                    <Link href="/farmer/applications/new" className="bg-primary text-white font-bold text-lg py-3.5 rounded-full shadow-lg hover:bg-primary-hover transition-colors text-center w-full block mt-4">
                        New Post
                    </Link>
                </div>
            </div>

            {/* C: Main Feed */}
            <div className="w-full max-w-[600px] border-r border-slate-100 min-h-screen">

                {/* Mobile Header (Sticky) */}
                <div className="lg:hidden sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100 flex items-center justify-between px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <Icons.Leaf className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-lg">Home</div>
                    <div className="w-8"></div>
                </div>

                {/* Desk Header */}
                <div className="hidden lg:flex sticky top-0 bg-white/90 backdrop-blur-sm z-40 border-b border-slate-100 px-4 py-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <h2 className="text-xl font-bold">Home</h2>
                </div>

                {/* Create Bar */}
                <div className="hidden sm:block p-4 border-b border-slate-100">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0"></div>
                        <div className="flex-1">
                            <input type="text" placeholder="What's happening on your farm?" className="w-full py-2 outline-none text-lg placeholder:text-slate-500" />
                            <div className="flex justify-between items-center mt-3">
                                <div className="flex gap-2 text-primary">
                                    <div className="w-8 h-8 rounded-full hover:bg-green-50 flex items-center justify-center cursor-pointer">📷</div>
                                    <div className="w-8 h-8 rounded-full hover:bg-green-50 flex items-center justify-center cursor-pointer">📍</div>
                                </div>
                                <button className="bg-primary/50 text-white font-bold px-4 py-1.5 rounded-full text-sm cursor-not-allowed">Post</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed Stream */}
                <div>
                    {applications.length > 0 ? (
                        applications.map((app) => (
                            <FeedCard key={app._id} app={app} user={user} />
                        ))
                    ) : (
                        <div className="p-8 text-center">
                            <h3 className="text-xl font-bold mb-2">Welcome to GACP!</h3>
                            <p className="text-slate-500 mb-6">This is where your certification journey lives. Start by creating your first application.</p>
                            <Link href="/farmer/applications/new" className="inline-block bg-sky-500 text-white font-bold py-2 px-6 rounded-full hover:bg-sky-600 transition-colors">
                                Let's go!
                            </Link>
                        </div>
                    )}
                </div>

            </div>

            {/* R: Widgets (Trends) */}
            <div className="hidden lg:block w-[350px] pl-8 py-4 h-screen sticky top-0">
                <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                    <h3 className="font-bold text-xl mb-4 text-slate-900">Trends for you</h3>
                    <TrendItem category="Technology" tag="#SmartFarming" posts="12.5K posts" />
                    <TrendItem category="Regulation" tag="#GACP2026" posts="2,400 posts" />
                    <TrendItem category="Market" tag="#ThaiHerbsExport" posts="50K posts" />
                </div>

                <div className="text-sm text-slate-400 leading-relaxed px-2">
                    Terms of Service Privacy Policy Cookie Policy<br />
                    © 2026 GACP Platform, Inc.
                </div>
            </div>

        </div>
    );
}

// --- Sub Components ---

function NavItem({ href, icon: Icon, label, active }: any) {
    return (
        <Link href={href} className="group flex items-center gap-4 p-3 rounded-full hover:bg-slate-100 transition-all w-fit pr-6">
            <Icon className={`w-7 h-7 ${active ? 'fill-black' : ''}`} />
            <span className={`text-xl ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
        </Link>
    )
}

function TrendItem({ category, tag, posts }: any) {
    return (
        <div className="py-3 cursor-pointer hover:bg-slate-200/50 -mx-2 px-2 rounded-lg transition-colors">
            <div className="text-xs text-slate-500 flex justify-between">
                <span>{category} · Trending</span>
                <MoreHorizontaly className="w-4 h-4" />
            </div>
            <div className="font-bold text-slate-900 mt-0.5">{tag}</div>
            <div className="text-xs text-slate-500 mt-0.5">{posts}</div>
        </div>
    )
}

function FeedCard({ app, user }: { app: Application, user: any }) {
    return (
        <div className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0"></div> {/* Avatar */}
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-900">
                            <span className="font-bold hover:underline">{user?.firstName || 'User'}</span>
                            <span className="text-slate-500 text-sm">@{user?.username || 'farmer'} · 2h</span>
                        </div>
                        <div className="group-hover:bg-blue-50 p-2 rounded-full -mr-2 transition-colors">
                            <MoreHorizontaly className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                        </div>
                    </div>

                    <p className="mt-1 text-slate-900 text-[15px] leading-normal">
                        Just submitted a new request for <strong>{app.plant}</strong>! 🌿 <br />
                        Status: <span className="text-blue-500 hover:underline">#{app.status}</span>
                    </p>

                    <div className="mt-3 border rounded-xl overflow-hidden border-slate-200 hover:bg-slate-50 transition-colors">
                        <div className="h-32 bg-slate-100 w-full flex items-center justify-center text-slate-400">
                            Application Preview Image
                        </div>
                        <div className="p-3">
                            <div className="text-slate-500 text-sm">gacp.moph.go.th</div>
                            <div className="font-medium">Application ID: {app._id.slice(-8)}</div>
                        </div>
                    </div>

                    <div className="flex justify-between mt-3 max-w-md text-slate-500">
                        <div className="flex items-center gap-2 group/icon hover:text-blue-500 cursor-pointer">
                            <div className="p-2 rounded-full group-hover/icon:bg-blue-50 transition-colors">
                                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.295c-4.42 0-8.005-3.58-8.005-8z"></path></svg>
                            </div>
                            <span className="text-sm">2</span>
                        </div>
                        <div className="flex items-center gap-2 group/icon hover:text-green-500 cursor-pointer">
                            <div className="p-2 rounded-full group-hover/icon:bg-green-50 transition-colors">
                                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></svg>
                            </div>
                            <span className="text-sm">5</span>
                        </div>
                        <div className="flex items-center gap-2 group/icon hover:text-red-500 cursor-pointer">
                            <div className="p-2 rounded-full group-hover/icon:bg-red-50 transition-colors">
                                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zM12.609 5.15c1.715-2.003 3.524-2.175 4.908-2.094 1.932.11 3.655 1.218 4.519 2.972 1.144 2.32 1.146 5.253-.941 9.09C19.23 18.55 15.69 22 12.01 22c-3.69 0-7.228-3.45-9.106-6.882-2.09-3.83-2.08-6.75-.935-9.08.864-1.75 2.585-2.86 4.516-2.97 1.383-.08 3.19.08 4.904 2.08l.61.73.61-.73z"></path></svg>
                            </div>
                            <span className="text-sm">24</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FeedSkeleton() {
    return (
        <div className="w-full max-w-[600px] mx-auto border-r border-slate-100 h-full overflow-hidden bg-white">
            <div className="h-[53px] border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur z-10" />
            <div className="p-4 border-b border-slate-100">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
                    <div className="flex-1 space-y-2 py-1">
                        <div className="h-8 bg-slate-100 rounded-full w-full animate-pulse" />
                    </div>
                </div>
            </div>
            {[1, 2, 3].map(i => (
                <div key={i} className="p-4 border-b border-slate-100">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse flex-shrink-0" />
                        <div className="flex-1 space-y-3">
                            <div className="flex justify-between">
                                <div className="h-4 bg-slate-100 rounded w-32 animate-pulse" />
                                <div className="h-4 bg-slate-100 rounded w-8 animate-pulse" />
                            </div>
                            <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
                            <div className="h-32 bg-slate-100 rounded-xl w-full animate-pulse" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}


