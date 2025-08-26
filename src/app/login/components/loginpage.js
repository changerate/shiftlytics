"use client";

import Button from "../../../components/Button";
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Checking session...
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="p-8 rounded-lg shadow-md w-full max-w-md sm:max-w-lg lg:max-w-xl">
        <h1 className="text-black text-2xl sm:text-3xl font-bold mb-6 text-center">
          Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-black text-sm sm:text-base font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm"
              style={{ borderColor: "#748cab", color: "black" }}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-black text-sm sm:text-base font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm"
              style={{ borderColor: "#748cab", color: "black" }}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-black sm:text-base text-center">
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button
            onClick={handleGoogleLogin}
            className="w-full py-2 px-4 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: "#547da0", color: "#f0ebd8" }}
            disabled={loading}
          >
            Log In with Google
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-black text-sm sm:text-base">
            Don't have an account yet?{" "}
            <a href="/signup" className="font-medium" style={{ color: "#547da0" }}>
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
