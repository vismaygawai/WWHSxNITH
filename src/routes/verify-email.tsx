import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import DarkVeil from "@/components/DarkVeil";
import api from "@/services/api";

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmail,
});

function VerifyEmail() {
  const nav = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hash = searchParams.get("hash");

    if (!hash) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    api
      .get(`/auth/verify-acc?hash=${hash}`)
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified! You can now sign in.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed. The link may have expired.");
      });
  }, []);

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
          className="w-full max-w-sm rounded-3xl p-6 md:p-7 text-center"
          style={{
            background: "hsla(0, 0%, 8%, 0.62)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid hsla(0, 0%, 100%, 0.10)",
            boxShadow: "0 12px 40px hsla(0, 0%, 0%, 0.45)",
          }}
        >
          {status === "loading" && (
            <>
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                <Loader2 className="size-6 animate-spin" />
              </div>
              <h1 className="mt-4 text-lg font-semibold text-white">Verifying your email…</h1>
              <p className="mt-2 text-sm text-white/55">Hold on, this won't take long.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                <CheckCircle2 className="size-6" />
              </div>
              <h1 className="mt-4 text-lg font-semibold text-white">Email verified!</h1>
              <p className="mt-2 text-sm text-white/60">{message}</p>
              <button
                type="button"
                onClick={() => nav({ to: "/login" })}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-6px_hsla(152,55%,45%,0.55)]"
              >
                Sign in
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-destructive/15 text-destructive">
                <XCircle className="size-6" />
              </div>
              <h1 className="mt-4 text-lg font-semibold text-white">Verification failed</h1>
              <p className="mt-2 text-sm text-white/60">{message}</p>
              <button
                type="button"
                onClick={() => nav({ to: "/login" })}
                className="mt-6 w-full rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-white/80 hover:bg-white/5"
              >
                Back to sign in
              </button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
