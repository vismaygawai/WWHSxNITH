import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  MessagesSquare,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import wwhsLogo from "@/assets/wwhs.svg";
import { BRAND_NAME } from "@/lib/brand";

type Item = { to: string; label: string; icon: LucideIcon };

export const NAV_ITEMS: Item[] = [
  { to: "/rooms", label: "Rooms", icon: MessagesSquare },
  { to: "/members", label: "Members", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
];

const STORAGE_KEY = "sidenav-collapsed";

export function SideNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty("--sidenav-width", collapsed ? "5rem" : "15rem");
  }, [collapsed]);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? "5rem" : "15rem" }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="hidden md:flex fixed left-3 top-3 bottom-3 z-30 flex-col rounded-3xl overflow-hidden"
      style={{
        background: "hsla(0, 0%, 8%, 0.62)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid hsla(0, 0%, 100%, 0.10)",
        boxShadow: "0 12px 40px hsla(0, 0%, 0%, 0.45), 0 1px 0 hsla(0, 0%, 100%, 0.06) inset",
      }}
    >
      {/* Top Logo Container - Centered when collapsed */}
      <div
        className={`flex items-center pt-5 pb-4 ${collapsed ? "justify-center px-0" : "px-4 gap-3"}`}
      >
        <img
          src={wwhsLogo}
          alt=""
          className="size-9 shrink-0 rounded-xl object-contain shadow-sm"
        />
        {!collapsed && (
          <span className="text-sm font-semibold leading-tight text-white/90 truncate">
            {BRAND_NAME}
          </span>
        )}
      </div>

      {/* Navigation Items - Centered icons when collapsed */}
      <nav className={`flex-1 space-y-2.5 ${collapsed ? "px-2" : "px-3"}`}>
        {NAV_ITEMS.map((it) => {
          const active = path === it.to || path.startsWith(it.to + "/");
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`relative flex items-center h-11 text-sm font-medium transition-colors ${
                collapsed ? "justify-center w-full rounded-2xl" : "gap-3 px-3.5 rounded-2xl"
              } ${active ? "text-primary-foreground" : "text-white/60 hover:text-white/90"}`}
            >
              {active && (
                <motion.span
                  layoutId="sidenav-active"
                  className="absolute inset-0 rounded-2xl bg-primary shadow-[0_4px_18px_-2px_hsla(152,55%,45%,0.45)]"
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                />
              )}
              <Icon className="size-5 relative z-10 shrink-0" strokeWidth={active ? 2.4 : 2} />
              {!collapsed && <span className="relative z-10 truncate">{it.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Toggle Button - Symmetrically aligned */}
      <div className="p-3 flex justify-center">
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          className="flex h-9 w-full items-center justify-center rounded-2xl bg-white/5 text-white/50 hover:text-white/80 ring-1 ring-white/10 transition-colors"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>
    </motion.aside>
  );
}
