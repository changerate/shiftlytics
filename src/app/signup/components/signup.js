"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

import Button from '../../../ui/Button.js';

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

 const handleSignUp = async (e) => {
  e.preventDefault();
  setError("");

  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  setLoading(true);

 const res = await fetch("/api/signup", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      company,
      position
    }),
  });
  const result = await res.json();
  if (!result.ok) {
    setError(result.error);
    setLoading(false);
    return;
  }
  alert(result.message);
  setLoading(false);
  router.push("/login");
};
  return (
    <div
      className="bg-background min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
    >
      <div
        className="p-8 rounded-lg shadow-md w-full max-w-md sm:max-w-lg lg:max-w-xl"
      >
        <h1
          className="text-text-primary text-2xl sm:text-3xl font-bold mb-6 text-center"
        >
          Sign Up
        </h1>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm text-black sm:text-base font-medium"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2"
              style={{
                borderColor: "#748cab",
              }}
              required
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm text-black sm:text-base font-medium"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2"
              style={{
                borderColor: "#748cab", // silver_lake_blue
              }}
              required
            />
          </div>
          <div>
            <label
              htmlFor="company"
              className="block text-sm text-black sm:text-base font-medium"
            >
              Company
            </label>
            <input
              type="text"
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2"
              style={{
                borderColor: "#748cab", // silver_lake_blue
              }}
              required
            />
          </div>
          <div>
            <label
              htmlFor="position"
              className="block text-sm text-black sm:text-base font-medium"
            >
              Position
            </label>
            <input
              type="text"
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2"
              style={{
                borderColor: "#748cab", // silver_lake_blue
              }}
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm text-black sm:text-base font-medium"
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
                borderColor: "#748cab", // silver_lake_blue
              }}
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm text-black sm:text-base font-medium"
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
                borderColor: "#748cab", // silver_lake_blue
              }}
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm text-black sm:text-base font-medium"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2"
              style={{
                borderColor: "#748cab", // silver_lake_blue
              }}
              required
            />
          </div>
          {error && (
            <p
              className="text-sm text-black sm:text-base text-center"
              style={{ color: "#d4dfe8" }} // silver_lake_blue-900
            >
              {error}
            </p>
          )}
            <Button
                type="submit"
                className="w-full py-2 px-4 rounded-lg font-medium transition-colors"
                disabled={loading}
            >
                {loading ? "Signing up..." : "Sign Up"}
          </Button>


        </form>
        <div className="mt-6 text-center">
          <p
            className="text-sm text-black sm:text-base"
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
