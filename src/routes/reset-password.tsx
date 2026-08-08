import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import DarkVeil from "@/components/DarkVeil";
import api from "@/services/api";
import { BRAND_NAME } from "@/lib/brand";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
});

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25";

function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  minLength,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  required?: boolean;
  minLength?: number;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 outline-none"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}


function ResetPassword() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract reset token from URL query params
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get("token");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await api.post(`/auth/reset-password?token=${token}`, { newPassword: password });
      toast.success("Password updated.");
      nav({ to: "/login", replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dark relative min-h-app overflow-hidden bg-background text-foreground">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <DarkVeil
          hueShift={140}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.4}
          scanlineFrequency={0}
          warpAmount={0}
          resolutionScale={1}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--background) 20%, transparent) 0%, color-mix(in oklab, var(--background) 80%, transparent) 60%, var(--background) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 grid min-h-app place-items-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm rounded-3xl p-6 md:p-7"
          style={{
            background: "hsla(0, 0%, 8%, 0.62)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid hsla(0, 0%, 100%, 0.10)",
            boxShadow: "0 12px 40px hsla(0, 0%, 0%, 0.45)",
          }}
        >
          <h1 className="text-lg font-semibold text-white">Set a new password</h1>

          {!token ? (
            <>
              <p className="mt-2 text-sm text-white/60">
                This reset link is invalid or has expired. Request a new one from the sign-in
                screen.
              </p>
              <button
                type="button"
                onClick={() => nav({ to: "/login" })}
                className="mt-6 w-full rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-white/80 hover:bg-white/5"
              >
                Back to sign in
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <PasswordInput
                placeholder="New password"
                autoComplete="new-password"
                value={password}
                onChange={setPassword}
                required
                minLength={8}
              />
              <PasswordInput
                placeholder="Confirm new password"
                autoComplete="new-password"
                value={confirm}
                onChange={setConfirm}
                required
                minLength={8}
              />

              {error && <p className="text-xs text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-6px_hsla(152,55%,45%,0.55)] disabled:opacity-70"
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                Update password
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
