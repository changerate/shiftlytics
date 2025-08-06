"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message || "Invalid email or password.");
      setLoading(false);
    } else {
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
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "#0d1321" }}
    >
      <div
        className="p-8 rounded-lg shadow-md w-full max-w-md sm:max-w-lg lg:max-w-xl"
        style={{ backgroundColor: "#1d2d44" }}
      >
        <h1
          className="text-2xl sm:text-3xl font-bold mb-6 text-center"
          style={{ color: "#f0ebd8" }}
        >
          Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm sm:text-base font-medium"
              style={{ color: "#c5d3e6" }}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: "#3e5c76",
                borderColor: "#748cab",
                color: "#f0ebd8",
              }}
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm sm:text-base font-medium"
              style={{ color: "#c5d3e6" }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: "#3e5c76",
                borderColor: "#748cab",
                color: "#f0ebd8",
              }}
              required
            />
          </div>
          {error && (
            <p
              className="text-sm sm:text-base text-center"
              style={{ color: "#d4dfe8" }}
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: "#4260a6",
              color: "#f0ebd8",
            }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={handleGoogleLogin}
            className="w-full py-2 px-4 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: "#547da0",
              color: "#f0ebd8",
            }}
          >
            Log In with Google
          </button>
        </div>
      </div>
    </div>
  );
}
