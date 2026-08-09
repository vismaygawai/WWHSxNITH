import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  VolumeX,
  Image as ImageIcon,
  MessageSquarePlus,
  Github,
  Download,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import DarkVeil from "@/components/DarkVeil";
import PublicNav from "@/components/PublicNav";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const RULES = [
  {
    icon: VolumeX,
    rule: "1st rule of WWHS?",
    description: "Don't talk about WWHS?.",
  },
  {
    icon: ImageIcon,
    rule: "2nd rule of WWHS?",
    description: "If your group icon isn't cursed, you're doing it wrong.",
  },
  {
    icon: MessageSquarePlus,
    rule: "3rd rule of WWHS?",
    description: "If this is your first time on WWHS?, you have to post.",
  },
];

function LandingPage() {
  const nav = useNavigate();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready && user) nav({ to: "/rooms", replace: true });
  }, [nav, ready, user]);

  return (
    <div className="dark relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* DarkVeil WebGL background */}
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
              "linear-gradient(180deg, color-mix(in oklab, var(--background) 0%, transparent) 0%, color-mix(in oklab, var(--background) 30%, transparent) 50%, color-mix(in oklab, var(--background) 80%, transparent) 100%)",
          }}
        />
      </div>

      <PublicNav />

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-6 pt-32 pb-20 text-center max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-white drop-shadow-sm">
            {BRAND_NAME}
          </h1>

          <p className="mt-6 max-w-lg text-lg md:text-xl text-white/65 leading-relaxed">
            {BRAND_TAGLINE}
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => nav({ to: "/login" })}
              className="flex items-center gap-2.5 rounded-2xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-6px_hsla(152,55%,45%,0.55)]"
            >
              Get Started
            </motion.button>

            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="/wwhs-mobile.apk"
              download="wwhs-mobile.apk"
              className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 backdrop-blur-sm"
            >
              <Download className="size-4" />
              Get the App
            </motion.a>
          </div>

          {/* Links Row */}
          <div className="mt-6 flex items-center gap-6 text-sm text-white/40">
            <a
              href="https://github.com/vismaygawai/WWHSxNITH"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-white/70 transition-colors"
            >
              <Github className="size-4" /> GitHub
            </a>
            <a
              href="https://github.com/vismaygawai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-white/70 transition-colors"
            >
              <ExternalLink className="size-4" /> Developer
            </a>
          </div>
        </motion.div>

        {/* Rule Cards Grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl w-full">
          {RULES.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={r.rule}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="rounded-3xl p-5 text-left flex flex-col justify-between"
                style={{
                  background: "hsla(0, 0%, 8%, 0.45)",
                  backdropFilter: "blur(16px) saturate(160%)",
                  WebkitBackdropFilter: "blur(16px) saturate(160%)",
                  border: "1px solid hsla(0, 0%, 100%, 0.08)",
                }}
              >
                <div>
                  <div className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-white/90">{r.rule}</h3>
                  <p className="mt-1.5 text-xs text-white/55 leading-relaxed">{r.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
