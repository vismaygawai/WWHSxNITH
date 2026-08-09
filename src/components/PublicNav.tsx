import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Menu, X, Download, Github } from "lucide-react";
import { useState } from "react";
import wwhsLogo from "@/assets/wwhs.svg";
import { BRAND_NAME } from "@/lib/brand";

export default function PublicNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-[#0b0a10]/70 backdrop-blur-xl">
      <div className="w-full flex items-center justify-between px-6 md:px-10 py-3.5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <img
            src={wwhsLogo}
            alt={BRAND_NAME}
            className="size-9 rounded-xl object-contain shadow-sm"
          />
          <span className="text-base font-semibold tracking-tight text-white">{BRAND_NAME}</span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-3">
          <a
            href="https://github.com/vismaygawai/WWHSxNITH"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            <Github className="size-4" /> GitHub
          </a>
          <a
            href="/wwhs-mobile.apk"
            download="wwhs-mobile.apk"
            className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            <Download className="size-4" /> Get App
          </a>
          <Link
            to="/login"
            className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_-4px_hsla(152,55%,45%,0.5)] hover:opacity-95 transition-opacity ml-2"
          >
            Sign in
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="md:hidden text-white/70 hover:text-white p-1"
          aria-label="Toggle menu"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden px-6 py-4 space-y-3 bg-[#0b0a10]/95 border-b border-white/10 backdrop-blur-xl"
        >
          <a
            href="https://github.com/vismaygawai/WWHSxNITH"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white"
          >
            <Github className="size-4" /> GitHub
          </a>
          <a
            href="/wwhs-mobile.apk"
            download="wwhs-mobile.apk"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white"
          >
            <Download className="size-4" /> Get the App
          </a>
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="block rounded-2xl bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground shadow-md"
          >
            Sign in
          </Link>
        </motion.div>
      )}
    </header>
  );
}
