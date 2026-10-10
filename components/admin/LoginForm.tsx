"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { sanitizeEmail, validateEmail } from "@/lib/validation/donation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError("Please enter a valid email address.");
      document.getElementById("admin-email")?.focus();
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      document.getElementById("admin-password")?.focus();
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sanitizeEmail(email), password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Login failed. Please try again.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="admin-email" className="block text-xs font-semibold text-[#2B201A]/80 mb-1">Email</label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          className="input-warm"
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="block text-xs font-semibold text-[#2B201A]/80 mb-1">Password</label>
        <div className="relative">
          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            className="input-warm pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2B201A]/50 hover:text-[#2B201A] transition-colors p-1 flex items-center justify-center cursor-pointer focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {error && <p role="alert" className="text-sm font-semibold text-[#B3261E]">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>Log in</span>
      </button>
    </form>
  );
}
