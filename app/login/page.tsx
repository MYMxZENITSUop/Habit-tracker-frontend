"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();

  // 🔁 login / signup mode
  const [mode, setMode] = useState<"login" | "signup">("login");

  async function handleGoogleLogin() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const data = await apiFetch("/auth/google", {
        method: "POST",
        body: JSON.stringify({ firebase_token: idToken }),
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
    <div className="dark">
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white px-4">

        {/* 🌌 Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#00ff9c33,transparent_40%),radial-gradient(circle_at_80%_80%,#00ff9c22,transparent_40%)]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent rotate-6 scale-125" />

        {/* 🧊 Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md"
        >
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(0,255,156,0.15)]">
            <CardContent className="p-8">

              {/* Logo */}
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.6)]">
                  <div className="h-8 w-8 rounded-full border-2 border-white/90 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-emerald-400">
                  HabitFlow
                </h1>
                <p className="text-sm text-white/60 mt-2">
                  {mode === "login"
                    ? "Welcome back. Stay consistent."
                    : "Create your account and start building habits"}
                </p>
              </div>

              {/* 👤 Name (Signup only) */}
              {mode === "signup" && (
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full mb-4 px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:border-emerald-400 transition"
                />
              )}

              {/* Email */}
              <input
                type="email"
                placeholder="Email"
                className="w-full mb-4 px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:border-emerald-400 transition"
              />

              {/* Password */}
              <input
                type="password"
                placeholder="Password"
                className="w-full mb-6 px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:border-emerald-400 transition"
              />

              {/* Primary Button */}
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-3 rounded-lg mb-4">
                {mode === "login" ? "Sign In" : "Create Account"}
              </Button>

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="px-3 text-sm text-white/40">OR</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Google */}
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 border-emerald-400/40 text-emerald-400 hover:bg-emerald-500/10 py-3 rounded-lg"
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.2 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.1 24.5c0-1.64-.15-3.21-.43-4.73H24v9.46h12.43c-.54 2.9-2.15 5.36-4.58 7.02l7.05 5.48C43.93 37.36 46.1 31.5 46.1 24.5z"/>
                  <path fill="#FBBC05" d="M10.54 28.41c-.48-1.45-.76-2.99-.76-4.41s.27-2.96.76-4.41l-7.98-6.19C.92 16.24 0 20.01 0 24s.92 7.76 2.56 10.6l7.98-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.77l-7.05-5.48c-1.96 1.32-4.48 2.1-8.85 2.1-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </Button>

              {/* Toggle */}
              <p className="text-center text-sm mt-6 text-white/50">
                {mode === "login"
                  ? "Don’t have an account?"
                  : "Already have an account?"}{" "}
                <span
                  onClick={() =>
                    setMode(mode === "login" ? "signup" : "login")
                  }
                  className="text-emerald-400 cursor-pointer hover:underline"
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </span>
              </p>

            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
