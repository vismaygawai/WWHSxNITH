import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, MessagesSquare, LogIn } from "lucide-react";
import api from "@/services/api";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export const Route = createFileRoute("/_authenticated/rooms/")({
  component: RoomsIndex,
});

interface Room {
  _id: string;
  roomId: string;
  title: string;
  description?: string;
}

function RoomsIndex() {
  const { data: rooms, isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data } = await api.get("/room/allRooms");
      return (data.rooms ?? []) as Room[];
    },
  });

  async function handleJoin(roomId: string) {
    try {
      await api.get(`/room/${roomId}/join`);
    } catch {
      // User may already be joined — that's fine
    }
  }

  return (
    <div className="px-4 md:px-8 pt-[max(1.25rem,env(safe-area-inset-top))] pb-36 max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Rooms</h1>
      <p className="mt-1.5 text-sm text-white/55">{BRAND_TAGLINE}</p>

      {isLoading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      ) : rooms && rooms.length > 0 ? (
        <div className="mt-6 space-y-3">
          {rooms.map((r, i) => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <Link
                to="/rooms/$slug"
                params={{ slug: r.roomId }}
                onClick={() => handleJoin(r._id)}
                className="flex items-center gap-4 rounded-3xl border border-border bg-card px-4 py-4 backdrop-blur-xl hover:border-primary/40 transition-colors"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-xl ring-1 ring-primary/25">
                  <MessagesSquare className="size-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-white truncate">{r.title}</div>
                  {r.description && (
                    <div className="text-sm text-white/50 truncate">{r.description}</div>
                  )}
                </div>
                <LogIn className="size-4 text-white/30 shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="mt-10 text-sm text-white/50">No rooms yet.</p>
      )}
    </div>
  );
}
