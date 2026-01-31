"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function GoogleButton() {
  async function handleGoogleLogin() {
    try {
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
    }
  }

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-2 border p-2 rounded mb-4 hover:bg-gray-100"
    >
      {/* Inline SVG — no broken image */}
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path
          fill="#EA4335"
          d="M24 9.5c3.2 0 5.3 1.4 6.5 2.5l4.8-4.8C32.2 4.4 28.4 2.5 24 2.5 14.9 2.5 7.2 8.4 4.5 16.5l5.9 4.6C12 14.8 17.6 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.1 24.5c0-1.5-.1-2.6-.4-3.8H24v7.2h12.7c-.3 1.9-1.9 4.8-5.2 6.8l6.3 4.9c3.7-3.4 7-8.5 7-15.1z"
        />
        <path
          fill="#FBBC05"
          d="M10.4 28.9c-.4-1.1-.6-2.2-.6-3.4s.2-2.3.6-3.4l-5.9-4.6C3 20.1 2 22.9 2 25.5s1 5.4 2.5 7.9l5.9-4.5z"
        />
        <path
          fill="#34A853"
          d="M24 46.5c6.4 0 11.8-2.1 15.7-5.7l-6.3-4.9c-1.7 1.2-4 2-9.4 2-6.4 0-12-5.3-13.9-12.4l-5.9 4.6C7.2 40.6 14.9 46.5 24 46.5z"
        />
      </svg>

      <span>Continue with Google</span>
    </button>
  );
}

