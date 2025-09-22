"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Button from '../../../ui/Button.js';
import Image from "next/image";
import {FcGoogle} from "react-icons/fc"
import favicon from "../../favicon.ico"
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();

    if (!res.ok) {
      setError(result.error || "Invalid email or password.");
      setLoading(false);
      return;
    }

    const { session } = result;
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    setLoading(false);
    router.push("/dashboard");
  };

  const handleGoogleLogin = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/oauth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  if (loading) {
    return <div>Checking session...</div>;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-secondary-100 to-primary-150">
        <div className="max-w-md text-center px-8">
          <Image src="/clock.svg" alt="Clock" className="mx-auto" width={250} height={250} />
          <h2 className="mt-6 text-2xl font-semibold text-text-primary">Track Your Shifts</h2>
          <p className="mt-2 text-text-secondary">Track shifts, payment, and audit your paychecks.</p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md p-6">
          <div className="flex justify-center items-center gap-1 mb-6">
            <Image
              src={favicon}
              alt="favicon"
              className="w-10 h-10"
              width={40}
              height={40}
              />
            <h1 className="text-text-primary text-2xl sm:text-3xl font-bold">Shiftlytics</h1>
          </div>
        
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-black sm:text-base font-medium">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm"
                style={{ borderColor: "#748cab" }}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm text-black sm:text-base font-medium">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm"
                style={{ borderColor: "#748cab" }}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-black sm:text-base text-center">{error}</p>
            )}
            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Sign in"}
            </Button>
          </form>
          {/* Footer + Google Log in*/} 
          <div className="my-5 flex items-center">
            <div className="h-px flex-1 bg-border-light" />
              <span className="mx-3 text-xs text-text-secondary">or</span>
            <div className="h-px flex-1 bg-border-light" />
          </div>
            <div>
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-border-light bg-white px-4 py-2.5 text-sm font-medium hover:bg-surface-hover"
                disabled={loading}
              >
                <FcGoogle />
                Continue with Google
              </button>
            </div>
          <div className="mt-6 text-center text-sm">
            <span className="text-black">Don’t have an account?</span>{" "}
            <a href="/signup" className="font-medium text-info">Sign up</a>
          </div>
        </div>
      </div>
    </div>
  );
}

