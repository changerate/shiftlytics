"use client";
import { useRouter } from "next/navigation"; // Correct import for Next.js 13+ App Router
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter(); // Initialize the router

  // Mock user data
  const mockUsers = [
    { email: "user1@example.com", password: "password123" },
    { email: "user2@example.com", password: "password456" },
  ];

  const handleLogin = (e) => {
    e.preventDefault();

    // Check if user exists in mock data
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      setError("");
      router.push("/dashboard"); // Navigate to /dashboard
    } else {
      setError("Invalid email or password.");
    }
  };

  const handleGoogleLogin = () => {
    alert("Google login functionality will be implemented later.");
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
          Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
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
          >
            Log In
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={handleGoogleLogin}
            className="w-full py-2 px-4 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: "#547da0", // payne's_gray-600
              color: "#f0ebd8", // eggshell
            }}
          >
            Log In with Google
          </button>
        </div>
      </div>
    </div>
  );
}