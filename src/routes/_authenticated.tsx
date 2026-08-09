import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import DarkVeil from "@/components/DarkVeil";
import InstallHint from "@/components/InstallHint";
import { SideNav, NAV_ITEMS } from "@/components/SideNav";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useGlobalNotifications } from "@/hooks/use-global-notifications";

export const Route = createFileRoute("/_authenticated")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const loc = useLocation();
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Global notifications — connects to all joined rooms via Socket.IO
  useGlobalNotifications(user?._id ?? null);

  const { pull, refreshing, threshold } = usePullToRefresh(async () => {
    await qc.invalidateQueries();
  });

  const isChatRoom =
    loc.pathname.startsWith("/rooms/") &&
    loc.pathname !== "/rooms" &&
    loc.pathname !== "/rooms/";

  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/login", replace: true });
  }, [navigate, ready, user]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.add("dark");
    return () => {
      root.classList.remove("dark");
    };
  }, []);

  if (!ready || !user) {
    return (
      <div className="dark relative min-h-app bg-background text-foreground grid place-items-center">
        <Loader2 className="size-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`dark relative isolate min-h-app text-foreground ${isChatRoom ? "pb-0 overflow-hidden h-dvh" : "pb-28 md:pb-8"}`}>
      {(pull > 0 || refreshing) && !isChatRoom && (
        <div
          aria-hidden
          className="md:hidden fixed left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          style={{
            top: `calc(env(safe-area-inset-top) + ${Math.max(8, pull - 28)}px)`,
            opacity: Math.min(1, pull / threshold),
            transition: refreshing ? "top 200ms ease-out, opacity 200ms ease-out" : undefined,
          }}
        >
          <div className="size-9 rounded-full bg-[#0f0e16]/85 backdrop-blur-xl ring-1 ring-white/10 grid place-items-center shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]">
            <Loader2
              className={`size-4 text-primary ${refreshing ? "animate-spin" : ""}`}
              style={!refreshing ? { transform: `rotate(${pull * 3}deg)` } : undefined}
            />
          </div>
        </div>
      )}

      {/* Animated DarkVeil — persistent across routes */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background"
      >
        <DarkVeil
          hueShift={140}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.45}
          scanlineFrequency={0}
          warpAmount={0}
          resolutionScale={1}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--background) 55%, transparent) 0%, color-mix(in oklab, var(--background) 65%, transparent) 50%, color-mix(in oklab, var(--background) 80%, transparent) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 32%, color-mix(in oklab, var(--background) 30%, transparent) 0%, color-mix(in oklab, var(--background) 60%, transparent) 55%, color-mix(in oklab, var(--background) 80%, transparent) 100%)",
          }}
        />
      </div>

      <SideNav />

      <div className={`relative z-10 transition-[padding] duration-300 md:pl-[calc(var(--sidenav-width,15rem)+1.5rem)] md:[--safe-top:0px] [--safe-top:env(safe-area-inset-top)] ${isChatRoom ? "h-full" : "[padding-top:var(--safe-top)]"}`}>
        <Outlet />
      </div>

      <InstallHint />

      {/* Floating liquid-glass pill bottom nav (hidden in chat rooms to prevent overlapping input bar) */}
      {!isChatRoom && (
        <nav
          className="md:hidden fixed left-0 right-0 z-20 flex flex-col items-center gap-1.5 px-3"
          style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <motion.div
            layout
            transition={{ type: "spring", damping: 18, stiffness: 160, mass: 0.7 }}
            className="relative flex items-center gap-1 px-2 py-2 rounded-full"
            style={{
              background: "hsla(0, 0%, 8%, 0.62)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid hsla(0, 0%, 100%, 0.10)",
              boxShadow: "0 12px 40px hsla(0, 0%, 0%, 0.45), 0 1px 0 hsla(0, 0%, 100%, 0.06) inset",
            }}
          >
            {NAV_ITEMS.map((t) => {
              const active = loc.pathname === t.to || loc.pathname.startsWith(t.to + "/");
              const Icon = t.icon;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className="relative flex flex-col items-center justify-center min-w-[72px] h-12 px-2 rounded-full"
                >
                  {active && (
                    <motion.div
                      layoutId="pill-active-bg"
                      className="absolute inset-0 rounded-full bg-primary shadow-[0_4px_18px_-2px_hsla(152,55%,45%,0.45)]"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}
                  <Icon
                    className={`size-[18px] relative z-10 ${active ? "text-primary-foreground" : "text-white/55"}`}
                    strokeWidth={active ? 2.4 : 2}
                  />
                  <span
                    className={`relative z-10 text-[10px] mt-0.5 font-medium tracking-wide ${
                      active ? "text-primary-foreground" : "text-white/55"
                    }`}
                  >
                    {t.label}
                  </span>
                </Link>
              );
            })}
          </motion.div>
        </nav>
      )}
    </div>
  );
}
