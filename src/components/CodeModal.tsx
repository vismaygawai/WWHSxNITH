import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface CodeModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (code: string) => void;
}

export function CodeModal({ open, onClose, onSend }: CodeModalProps) {
  const [code, setCode] = useState("");

  const handleSend = () => {
    if (code.trim()) {
      onSend(`\`\`\`\n${code}\n\`\`\``);
      setCode("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[hsla(0,0%,8%,0.62)] backdrop-blur-[24px] rounded-3xl border border-white/10 p-6 shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Share Code</h2>
              <button
                onClick={onClose}
                className="p-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>
            <div className="relative flex-1">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-mono text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!code.trim()}
                className="px-5 py-2.5 rounded-full bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Share Code
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
