"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const [dark, setDark] = useState(true);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const router = useRouter();

  // 🔐 Google Login Handler
  async function handleGoogleLogin() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const idToken = await result.user.getIdToken();

      const data = await apiFetch("/auth/google", {
        method: "POST",
        body: JSON.stringify({
          firebase_token: idToken,
        }),
      });

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      router.push("/dashboard");
    } catch (error) {
      console.error("Google login failed:", error);
      alert("Google login failed. Please try again.");
    }
  }

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white transition-all">
        {/* 🌙 Theme Toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-200 dark:bg-gray-800"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* 🔐 Auth Card */}
        <Card className="w-full max-w-md bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-2xl">
          <CardContent className="p-8">
            <h1 className="text-3xl font-bold text-center mb-2">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>

            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
              {mode === "login"
                ? "Build habits. Stay consistent."
                : "Start tracking your habits today."}
            </p>

            {/* 👤 Name (Signup only) */}
            {mode === "signup" && (
              <input
                type="text"
                placeholder="Full Name"
                className="w-full mb-4 px-4 py-3 rounded bg-white dark:bg-black border border-gray-300 dark:border-gray-700 focus:outline-none"
              />
            )}

            {/* 📧 Email */}
            <input
              type="email"
              placeholder="Email"
              className="w-full mb-4 px-4 py-3 rounded bg-white dark:bg-black border border-gray-300 dark:border-gray-700 focus:outline-none"
            />

            {/* 🔑 Password */}
            <input
              type="password"
              placeholder="Password"
              className="w-full mb-6 px-4 py-3 rounded bg-white dark:bg-black border border-gray-300 dark:border-gray-700 focus:outline-none"
            />

            {/* ✅ Primary Button */}
            <Button className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 rounded mb-4">
              {mode === "login" ? "Sign In" : "Sign Up"}
            </Button>

            {/* ➖ Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
              <span className="px-3 text-sm text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
            </div>

            {/* 🔴 Google Login */}
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-black py-3 rounded"
            >
              Continue with Google
            </Button>

            {/* 🔁 Switch Login / Signup */}
            <p className="text-center text-sm mt-6 text-gray-500">
              {mode === "login"
                ? "Don’t have an account?"
                : "Already have an account?"}{" "}
              <span
                onClick={() =>
                  setMode(mode === "login" ? "signup" : "login")
                }
                className="text-green-500 cursor-pointer hover:underline"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

