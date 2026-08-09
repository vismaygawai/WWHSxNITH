import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
import api from "@/services/api";
import { BRAND_NAME, isAdminEmail } from "@/lib/brand";

export const Route = createFileRoute("/_authenticated/members")({
  component: Members,
});

interface Member {
  _id: string;
  name: string;
  email: string;
}

function Members() {
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data } = await api.get("/auth/members");
      return (data.members ?? []) as Member[];
    },
  });

  return (
    <div className="px-4 md:px-8 pt-6 pb-10 max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Members</h1>
      <p className="mt-1.5 text-sm text-white/55">Everyone who's joined the community.</p>

      {isLoading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      ) : members.length === 0 ? (
        <p className="mt-10 text-sm text-white/50">No members yet.</p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {members.map((m) => {
            const savedSeed = localStorage.getItem(`avatar_seed_${m._id}`);
            const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(savedSeed || m.email)}`;
            const isAdmin = isAdminEmail(m.email);
            return (
              <div
                key={m._id}
                className={`flex items-center gap-3 rounded-3xl border px-4 py-3.5 backdrop-blur-xl ${
                  isAdmin ? "border-amber-500/30 bg-amber-500/5" : "border-white/10 bg-card"
                }`}
              >
                <img
                  src={avatarUrl}
                  alt=""
                  className="size-10 rounded-full object-cover bg-primary/10"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate">{m.name}</span>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400 ring-1 ring-amber-500/30 shrink-0">
                        <ShieldCheck className="size-3" /> Admin
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/45 truncate">{m.email}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
