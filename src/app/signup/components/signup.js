"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      alert("Sign-up successful! Please check your email to confirm your account.");
      setLoading(false);
      router.push("/login"); // Redirect to login page after successful sign-up
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "#0d1321" }} // rich_black
    >
      <div
        className="p-8 rounded-lg shadow-md w-full max-w-md sm:max-w-lg lg:max-w-xl"
        style={{ backgroundColor: "#1d2d44" }} // prussian_blue
      >
        <h1
          className="text-2xl sm:text-3xl font-bold mb-6 text-center"
          style={{ color: "#f0ebd8" }} // eggshell
        >
          Sign Up
        </h1>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm sm:text-base font-medium"
              style={{ color: "#c5d3e6" }} // prussian_blue-900
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
                backgroundColor: "#3e5c76", // payne's_gray
                borderColor: "#748cab", // silver_lake_blue
                color: "#f0ebd8", // eggshell
              }}
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm sm:text-base font-medium"
              style={{ color: "#c5d3e6" }} // prussian_blue-900
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
                backgroundColor: "#3e5c76", // payne's_gray
                borderColor: "#748cab", // silver_lake_blue
                color: "#f0ebd8", // eggshell
              }}
              required
            />
          </div>
          {error && (
            <p
              className="text-sm sm:text-base text-center"
              style={{ color: "#d4dfe8" }} // silver_lake_blue-900
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: "#4260a6", // rich_black-700
              color: "#f0ebd8", // eggshell
            }}
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p
            className="text-sm sm:text-base"
            style={{ color: "#c5d3e6" }} // prussian_blue-900
          >
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium"
              style={{ color: "#547da0" }} // payne's_gray-600
            >
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}