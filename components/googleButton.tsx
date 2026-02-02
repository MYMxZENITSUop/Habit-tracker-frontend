"use client";

import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function GoogleButton() {
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    if (loading) return; // prevent double click

    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseToken = await result.user.getIdToken();

      const res = await fetch(
        "https://fastapi-task-manager-w8k2.onrender.com/auth/google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ firebase_token: firebaseToken }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Google login failed");
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Google auth error:", err);
      alert("Google login failed");
    } finally {
      setLoading(false);
    }
  }

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


