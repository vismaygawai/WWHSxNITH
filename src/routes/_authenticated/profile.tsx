import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LogOut, Check, ShieldCheck, UserCheck, Save, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { BRAND_NAME, isAdminEmail } from "@/lib/brand";
import { POPULAR_AVATAR_PRESETS, getAvatarUrl } from "@/lib/avatar";
import api from "@/services/api";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, logout } = useAuth();
  const qc = useQueryClient();
  const nav = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatar || user?.email || "Felix");
  const [nameInput, setNameInput] = useState<string>(user?.name || "");

  const isAdmin = isAdminEmail(user?.email);

  useEffect(() => {
    if (user?.name) {
      setNameInput(user.name);
    }
    if (user?.avatar) {
      setSelectedAvatar(user.avatar);
    } else {
      const saved = localStorage.getItem(`avatar_seed_${user?._id}`);
      if (saved) setSelectedAvatar(saved);
      else if (user?.email) setSelectedAvatar(user.email);
    }
  }, [user]);

  async function handleSelectAvatar(seed: string) {
    setSelectedAvatar(seed);
    if (user?._id) {
      localStorage.setItem(`avatar_seed_${user._id}`, seed);
    }
    try {
      await api.put("/auth/profile", { avatar: seed, name: nameInput.trim() });
      if (user) {
        const updatedUser = { ...user, avatar: seed };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("storage"));
      }
      toast.success("Avatar updated!");
    } catch {
      toast.error("Failed to save avatar to server");
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSavingProfile(true);
    try {
      await api.put("/auth/profile", { name: nameInput.trim(), avatar: selectedAvatar });
      toast.success("Profile saved successfully!");
      if (user) {
        const updatedUser = { ...user, name: nameInput.trim(), avatar: selectedAvatar };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("storage"));
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to update profile";
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    await qc.cancelQueries();
    qc.clear();
    await logout();
    nav({ to: "/login", replace: true });
  }

  return (
    <div className="px-4 md:px-8 pt-4 pb-36 max-w-xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Profile</h1>
          <p className="mt-1 text-sm text-white/55">Manage your identity and account settings</p>
        </div>
      </div>

      {/* Symmetrical Glassmorphic Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6 rounded-3xl border border-white/10 bg-[#0f0e16]/60 p-6 md:p-8 backdrop-blur-2xl shadow-xl space-y-6"
      >
        {/* Avatar Display & Header */}
        <div className="flex flex-col items-center sm:flex-row sm:items-center gap-5 pb-6 border-b border-white/10">
          <div className="relative">
            <img
              src={getAvatarUrl(selectedAvatar, user?.email)}
              alt="Profile Avatar"
              className="size-20 rounded-full object-cover bg-primary/10 ring-2 ring-primary/40 shadow-lg"
            />
            <span className="absolute bottom-0 right-0 size-4 rounded-full bg-emerald-400 ring-2 ring-background" />
          </div>
          <div className="text-center sm:text-left min-w-0">
            <h2 className="text-xl font-semibold text-white truncate">{user?.name || "Member"}</h2>
            <p className="text-sm text-white/50 truncate mt-0.5">{user?.email}</p>

            {isAdmin ? (
              <span className="inline-flex items-center gap-1.5 mt-2 rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-semibold text-amber-400 ring-1 ring-amber-500/30">
                <ShieldCheck className="size-3.5" /> Admin • {BRAND_NAME}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 mt-2 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-medium text-primary ring-1 ring-primary/25">
                <UserCheck className="size-3.5" /> NITH Member
              </span>
            )}
          </div>
        </div>

        {/* Avatar Selector Gallery */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-white/45 mb-3">
            Choose Avatar Preset
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {POPULAR_AVATAR_PRESETS.map((preset) => {
              const isSelected = selectedAvatar === preset.seed;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectAvatar(preset.seed)}
                  className={`relative flex flex-col items-center p-1.5 rounded-2xl border transition-all ${
                    isSelected
                      ? "border-primary bg-primary/15 ring-2 ring-primary/30 scale-105"
                      : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                  }`}
                  title={preset.label}
                >
                  <img
                    src={getAvatarUrl(preset.seed)}
                    alt={preset.label}
                    className="size-10 rounded-full object-cover"
                  />
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground text-[10px]">
                      <Check className="size-3 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Editable Name Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-white/45 mb-1.5">
              Full Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name"
                className="flex-1 min-w-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-95 transition-opacity disabled:opacity-40"
              >
                {savingProfile ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-white/45 mb-1.5">
              Institute Email
            </label>
            <input
              type="email"
              readOnly
              value={user?.email || ""}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 outline-none cursor-default opacity-80"
            />
          </div>
        </form>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-5 py-3 text-sm font-semibold text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-60"
          >
            <LogOut className="size-4" /> {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
