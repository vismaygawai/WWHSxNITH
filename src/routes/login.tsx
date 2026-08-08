import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import DarkVeil from "@/components/DarkVeil";
import { useAuth } from "@/hooks/use-auth";
import api from "@/services/api";
import { ALLOWED_DOMAIN, BRAND_NAME, BRAND_TAGLINE, SAMPLE_EMAIL } from "@/lib/brand";

export const Route = createFileRoute("/login")({
  component: Login,
});

type Mode = "signin" | "signup";

const GOOGLE_CLIENT_ID = "182255210945-ecnl2fl1p6hn74d3dlbr4lo28h5vtnmt.apps.googleusercontent.com";

function isAllowedEmail(email: string) {
  return email.trim().toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
}

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25";

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  minLength,
}: {
  id?: string;
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
        id={id}
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

function Login() {
  const nav = useNavigate();
  const { user, ready, login, signup } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) nav({ to: "/rooms", replace: true });
  }, [nav, ready, user]);

  useEffect(() => {
    const handleGoogleResponse = async (response: any) => {
      if (response.credential) {
        setBusy(true);
        setError(null);
        try {
          const { data } = await api.post("/auth/google", { credential: response.credential });
          if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            window.dispatchEvent(new Event("storage"));
            toast.success("Signed in with Google!");
            nav({ to: "/rooms", replace: true });
          }
        } catch (err: any) {
          setError(err.response?.data?.message || "Google Sign-In failed.");
        } finally {
          setBusy(false);
        }
      }
    };

    const setupGoogle = () => {
      if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
      }
    };

    setupGoogle();
    const interval = setInterval(setupGoogle, 1000);
    return () => clearInterval(interval);
  }, [nav]);

  async function handleGoogleSignIn() {
    if (busy) return;
    setError(null);

    const windowGoogle = (window as any).google;

    if (windowGoogle?.accounts?.oauth2) {
      const client = windowGoogle.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "email profile openid",
        callback: async (tokenResponse: any) => {
          if (tokenResponse.access_token) {
            setBusy(true);
            try {
              const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const profile = await res.json();
              const { data } = await api.post("/auth/google", { email: profile.email, name: profile.name });
              if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                window.dispatchEvent(new Event("storage"));
                toast.success("Signed in with Google!");
                nav({ to: "/rooms", replace: true });
              }
            } catch (err: any) {
              setError(err.response?.data?.message || "Google Sign-In failed.");
            } finally {
              setBusy(false);
            }
          }
        },
      });
      client.requestAccessToken();
      return;
    }

    if (windowGoogle?.accounts?.id) {
      windowGoogle.accounts.id.prompt();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    const mail = email.trim().toLowerCase();
    if (!isAllowedEmail(mail)) {
      setError(`Only @${ALLOWED_DOMAIN} email addresses can join.`);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (mode === "signup" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        await login(mail, password);
        nav({ to: "/rooms", replace: true });
      } else {
        if (!name.trim()) {
          setError("Name is required.");
          setBusy(false);
          return;
        }
        await signup(name.trim(), mail, password);
        setSentTo(mail);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Something went wrong.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleForgot() {
    const mail = email.trim().toLowerCase();
    if (!isAllowedEmail(mail)) {
      setError(`Enter your @${ALLOWED_DOMAIN} email first, then tap reset.`);
      return;
    }
    setBusy(true);
    try {
      await api.post("/auth/forget-password/viaEmail", { email: mail });
      toast.success("Password reset link sent — check your inbox.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send reset link.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="dark min-h-app bg-background text-foreground grid place-items-center px-6">
        <p className="text-sm text-muted-foreground">Restoring your session…</p>
      </div>
    );
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
          className="absolute inset-0 md:hidden"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--background) 0%, transparent) 0%, color-mix(in oklab, var(--background) 15%, transparent) 35%, color-mix(in oklab, var(--background) 60%, transparent) 62%, color-mix(in oklab, var(--background) 92%, transparent) 88%, var(--background) 100%)",
          }}
        />
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              "linear-gradient(90deg, color-mix(in oklab, var(--background) 0%, transparent) 0%, color-mix(in oklab, var(--background) 10%, transparent) 35%, color-mix(in oklab, var(--background) 62%, transparent) 60%, color-mix(in oklab, var(--background) 95%, transparent) 80%, var(--background) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 min-h-app grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.15fr_1fr]">
        {/* LEFT — hero */}
        <div className="flex flex-col justify-end md:justify-center px-6 pt-24 md:p-12 lg:p-20 xl:p-28">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
              {BRAND_NAME}
            </h1>
            <p className="mt-4 max-w-md text-base md:text-lg text-white/65">
              {BRAND_TAGLINE}
            </p>
          </motion.div>
        </div>

        {/* RIGHT — sign in */}
        <div className="flex items-center justify-center px-6 pb-16 pt-10 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-sm rounded-3xl p-6 md:p-7"
            style={{
              background: "hsla(0, 0%, 8%, 0.62)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid hsla(0, 0%, 100%, 0.10)",
              boxShadow: "0 12px 40px hsla(0, 0%, 0%, 0.45)",
            }}
          >
            {sentTo ? (
              <div className="text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <MailCheck className="size-6" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white">Check your inbox</h2>
                <p className="mt-2 text-sm text-white/60">
                  We sent a confirmation link to{" "}
                  <span className="text-primary">{sentTo}</span>. Click it to activate your
                  account, then come back and sign in.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSentTo(null);
                    setMode("signin");
                    setPassword("");
                    setConfirm("");
                  }}
                  className="mt-6 w-full rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-white/80 hover:bg-white/5"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-white">Members only</h2>
                <p className="mt-1.5 text-sm text-white/60">
                  Use your institute account — like{" "}
                  <span className="text-primary">{SAMPLE_EMAIL}</span>.
                </p>

                {/* Custom Styled Google Auth Button - Matches Project A UI 100% */}
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleGoogleSignIn}
                  className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 backdrop-blur-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-60"
                >
                  <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.15C3.26 21.3 7.31 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.28C.46 8.21 0 10.05 0 12s.46 3.79 1.28 5.42l4-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.58l4 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="mt-4 flex items-center gap-3 text-xs text-white/35">
                  <span className="h-px flex-1 bg-white/10" />
                  <span>OR</span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
                  {(["signin", "signup"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMode(m);
                        setError(null);
                      }}
                      className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                        mode === m
                          ? "bg-primary text-primary-foreground"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {m === "signin" ? "Sign in" : "Sign up"}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                  {mode === "signup" && (
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                    />
                  )}
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder={SAMPLE_EMAIL}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                  <PasswordInput
                    placeholder="Password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    value={password}
                    onChange={setPassword}
                    required
                    minLength={8}
                  />
                  {mode === "signup" && (
                    <PasswordInput
                      placeholder="Confirm password"
                      autoComplete="new-password"
                      value={confirm}
                      onChange={setConfirm}
                      required
                      minLength={8}
                    />
                  )}

                  {error && <p className="text-xs text-destructive">{error}</p>}

                  <button
                    type="submit"
                    disabled={busy}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-6px_hsla(152,55%,45%,0.55)] disabled:opacity-70"
                  >
                    {busy && <Loader2 className="size-4 animate-spin" />}
                    {mode === "signin" ? "Sign in" : "Create account"}
                  </button>
                </form>

                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={handleForgot}
                    disabled={busy}
                    className="mt-3 w-full text-center text-xs text-white/45 hover:text-white/70"
                  >
                    Forgot password?
                  </button>
                )}

                <p className="mt-4 text-center text-xs text-white/40">
                  Only @{ALLOWED_DOMAIN} accounts can join.
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
