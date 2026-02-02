"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { signInWithGoogle } from "@/lib/googleAuth";

export default function GoogleButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (loading) return;

    try {
      setLoading(true);

      // 1️⃣ Firebase auth (popup)
      const firebaseToken = await signInWithGoogle();

      // 2️⃣ Backend auth
      const res = await fetch(
        "https://fastapi-task-manager-w8k2.onrender.com/auth/google",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firebase_token: firebaseToken }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Google login failed");
      }

      // 3️⃣ Store tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      // 4️⃣ Redirect
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Google auth error:", err);
      alert("Google login failed");
      setLoading(false); // only reset on error
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      className={`
        w-full flex items-center justify-center gap-2
        rounded-lg border px-4 py-2
        transition
        ${loading ? "opacity-60 cursor-not-allowed" : "hover:bg-black/10"}
      `}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          <img src="/google.svg" alt="Google" className="h-4 w-4" />
          Continue with Google
        </>
      )}
    </button>
  );
}


