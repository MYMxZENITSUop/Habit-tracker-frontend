"use client";

import { useState } from "react";
import { signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function PhoneAuthPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);

  // ======================
  // SEND OTP
  // ======================
  async function sendOtp() {
    if (!phone.startsWith("+")) {
      alert("Phone number must include country code, e.g. +91XXXXXXXXXX");
      return;
    }

    setLoading(true);

    try {
      // Create reCAPTCHA once
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
          }
        );
      }
      
      const appVerifier = (window as any).recaptchaVerifier;

      const result = await signInWithPhoneNumber(
        auth,
        phone,
        appVerifier
      );

      setConfirmation(result);
      alert("OTP sent");
    } catch (err) {
      console.error("Send OTP failed:", err);
      alert("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  // ======================
  // VERIFY OTP
  // ======================
  async function verifyOtp() {
    if (!confirmation) return;

    setLoading(true);

    try {
      const result = await confirmation.confirm(otp);
      const firebaseToken = await result.user.getIdToken();

      // Send Firebase token to backend
      const res = await fetch(
        "https://fastapi-task-manager-w8k2.onrender.com/auth/phone/verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firebase_token: firebaseToken }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Backend authentication failed");
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Verify OTP failed:", err);
      alert("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-80 p-6 border rounded">
        <h1 className="text-xl font-bold mb-4">Phone Login</h1>

        {!confirmation ? (
          <>
            <input
              placeholder="+91XXXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mb-3 p-2 border"
            />

            <button
              onClick={sendOtp}
              className="w-full bg-black text-white p-2"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full mb-3 p-2 border"
            />

            <button
              onClick={verifyOtp}
              className="w-full bg-green-600 text-white p-2"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {/* REQUIRED FOR FIREBASE */}
        <div id="recaptcha-container"></div>
      </div>
    </main>
  );
}
