"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icons, EyeIcon } from "@/components/ui/icons";
import { AuthService } from "@/lib/services/auth-service";

export default function LoginPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (AuthService.isAuthenticated()) {
            window.location.href = "/farmer/dashboard";
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // Defaulting to INDIVIDUAL for this simplified view
            const result = await AuthService.login({
                accountType: "INDIVIDUAL",
                identifier: identifier.replace(/-/g, ""),
                password
            });

            if (!result.success) {
                setError(result.error || 'Invalid credentials');
                setIsLoading(false);
                return;
            }

            window.location.href = "/farmer/dashboard";
        } catch (err) {
            setError("Connection failed");
            setIsLoading(false);
        }
    };

    const handleThaIDLogin = () => {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const redirectUri = `${window.location.origin}/auth/callback/thaid`;
        // ... (Simulating the same redirect logic but hidden behind a cleaner button)
        window.location.href = `${backendUrl}/api/mock-thaid/authorize?client_id=gacp-web&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid&state=xyz`;
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans text-slate-900">

            <div className="w-full max-w-[400px] flex flex-col gap-8">

                {/* Minimal Header */}
                <div className="text-center">
                    <div className="w-12 h-12 bg-primary rounded-xl mx-auto mb-6 flex items-center justify-center">
                        <Icons.Leaf className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Log in to GACP</h1>
                    <p className="text-slate-500">Manage your farm standards seamlessly.</p>
                </div>

                {/* Social Buttons Stack */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleThaIDLogin}
                        className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-full border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold text-slate-700 relative overflow-hidden group"
                    >
                        <div className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-[8px] font-bold">ID</div>
                        <span>Continue with ThaID</span>
                    </button>

                    <button className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-full border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold text-slate-700 opacity-60 cursor-not-allowed">
                        <span className="font-bold text-lg">G</span>
                        <span>Continue with Google</span>
                    </button>
                </div>

                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-100"></div>
                    <span className="flex-shrink-0 mx-4 text-xs font-medium text-slate-300">OR</span>
                    <div className="flex-grow border-t border-slate-100"></div>
                </div>

                {/* Clean Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Phone, email, or username"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-slate-300 rounded-lg px-4 py-3 outline-none transition-all placeholder:text-slate-400 font-medium"
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-slate-300 rounded-lg px-4 py-3 outline-none transition-all placeholder:text-slate-400 font-medium"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <EyeIcon open={showPassword} />
                        </button>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-full hover:bg-black transition-transform active:scale-95 disabled:opacity-70 mt-2"
                    >
                        {isLoading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>

                <div className="flex flex-col gap-4 text-center mt-2">
                    <Link href="/forgot-password" className="text-sm font-semibold text-slate-900 hover:underline">
                        Forgot password?
                    </Link>
                    <p className="text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-primary hover:text-green-600 font-bold hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}
