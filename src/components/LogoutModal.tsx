import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";

interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function LogoutModal({ open, onClose, onConfirm, loading }: LogoutModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 grid place-items-center px-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl p-6"
            style={{
              background: "hsla(0, 0%, 8%, 0.85)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid hsla(0, 0%, 100%, 0.10)",
              boxShadow: "0 16px 48px hsla(0, 0%, 0%, 0.55)",
            }}
          >
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-destructive/15 text-destructive">
              <LogOut className="size-6" />
            </div>
            <h2 className="mt-4 text-center text-lg font-semibold text-white">Sign out?</h2>
            <p className="mt-2 text-center text-sm text-white/55">
              You'll need to sign in again to access your rooms and messages.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-white/75 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 rounded-2xl bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground disabled:opacity-60"
              >
                {loading ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
