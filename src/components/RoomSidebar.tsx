import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MessagesSquare, ChevronLeft, X } from "lucide-react";
import api from "@/services/api";

interface Room {
  _id: string;
  roomId: string;
  title: string;
}

interface RoomSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function RoomSidebar({ open, onClose }: RoomSidebarProps) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  const { data: rooms = [] } = useQuery({
    queryKey: ["joined-rooms"],
    queryFn: async () => {
      const { data } = await api.get("/room/joined");
      return (data.rooms ?? []) as Room[];
    },
  });

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-[17rem] flex flex-col overflow-hidden"
            style={{
              background: "hsla(0, 0%, 8%, 0.88)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              borderRight: "1px solid hsla(0, 0%, 100%, 0.08)",
              boxShadow: "4px 0 24px hsla(0, 0%, 0%, 0.4)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-5 pb-3">
              <span className="text-sm font-semibold text-white/80">Your Rooms</span>
              <button
                type="button"
                onClick={onClose}
                className="text-white/40 hover:text-white/70"
                aria-label="Close sidebar"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Room list */}
            <nav className="flex-1 overflow-y-auto px-2.5 space-y-1 pb-4">
              {rooms.length === 0 ? (
                <p className="px-3 py-4 text-xs text-white/40">No rooms joined yet.</p>
              ) : (
                rooms.map((room) => {
                  const active = path.includes(room.roomId);
                  return (
                    <Link
                      key={room._id}
                      to="/rooms/$slug"
                      params={{ slug: room.roomId }}
                      onClick={onClose}
                      className={`relative flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        active ? "text-primary-foreground" : "text-white/55 hover:text-white/85"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="room-sidebar-active"
                          className="absolute inset-0 rounded-2xl bg-primary shadow-[0_4px_14px_-2px_hsla(152,55%,45%,0.35)]"
                          transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        />
                      )}
                      <MessagesSquare className="size-4 relative z-10 shrink-0" strokeWidth={active ? 2.4 : 2} />
                      <span className="relative z-10 truncate">{room.title}</span>
                    </Link>
                  );
                })
              )}
            </nav>

            {/* Back to rooms list */}
            <div className="px-3 pb-4">
              <Link
                to="/rooms"
                onClick={onClose}
                className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2.5 text-sm text-white/55 hover:text-white/80 ring-1 ring-white/10"
              >
                <ChevronLeft className="size-4" /> All Rooms
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
