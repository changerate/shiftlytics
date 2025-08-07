"use client";

import Button from '../../../components/Button';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { ensureUserProfile } from "../../../utils/profileUtils";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true); // Initial loading on mount
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
            router.replace("/dashboard"); // Avoid back button weirdness
        } else {
            setLoading(false); // Done loading only if no session
        }
        };
        checkSession();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);


        
        const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        });

        if (error) {
            setError(error.message || "Invalid email or password.");
            setLoading(false);
        } else {
            const user = data.user;
        
        if (user) {
            // Ensure user profile exists using utility function
            const profileResult = await ensureUserProfile(user);
            
            if (!profileResult.success) {
            console.error('Profile handling failed:', profileResult.error);
            setError(profileResult.error);
            setLoading(false);
            return;
            }
            
            console.log('Profile ready:', profileResult.profile);
        }
        
        setLoading(false);
        router.push("/dashboard");
        }
    };



    const handleGoogleLogin = async () => {
        setError("");

        const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${window.location.origin}/dashboard`,
        },
        });

        if (error) {
        setError(error.message || "Google login failed.");
        }
        // Note: Profile creation for OAuth will be handled by the auth state change listener
        // or in a separate callback page
    };

    if (loading) {
        return (
        <div className="min-h-screen flex items-center justify-center text-white">
            Checking session...
        </div>
        );
    }

    return (
        <div
            className="bg-background min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
        >
            <div
                className="bg-primary-variant p-8 rounded-lg shadow-md w-full max-w-md sm:max-w-lg lg:max-w-xl"
                // style={{ backgroundColor: "#1d2d44" }}
            >
                <h1
                    className="text-black text-2xl sm:text-3xl font-bold mb-6 text-center"
                // style={{ color: "#f0ebd8" }}
                >
                Login
                </h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm sm:text-base font-medium"
                            // style={{ color: "#c5d3e6" }}
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm"
                            style={{
                                    // backgroundColor: "#3e5c76",
                                    borderColor: "#748cab",
                                    color: "black",
                            }}
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm sm:text-base font-medium"
                            // style={{ color: "#c5d3e6" }}
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm"
                            style={{
                                // backgroundColor: "#3e5c76",
                                borderColor: "#748cab",
                                color: "black",
                            }}
                            required
                        />
                    </div>
                    {error && (
                        <p
                        className="text-sm text-black sm:text-base text-center"
                        // style={{ color: "#d4dfe8" }}
                        >
                        {error}
                        </p>
                    )}
                    <Button 
                        type='submit'
                        variant='primary'
                        className='w-full py-2'
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </Button>
                </form>
                <div className="mt-6 text-center">
                    <Button 
                        onClick={handleGoogleLogin}
                        className="w-full my-2 py-2 px-4 rounded-lg font-medium transition-colors"
                        style={{
                        backgroundColor: "#547da0",
                        color: "#f0ebd8",
                        }}
                        disabled={loading}
                    >
                        Log In with Google
                    </Button>
                </div>
                <div className="mt-6 text-center">
                    <p className="text-black text-sm sm:text-base" >
                        Don't have an account yet?{" "}
                        <a
                            href="/signup"
                            className="text-black font-medium"
                        >
                            Sign Up 
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
