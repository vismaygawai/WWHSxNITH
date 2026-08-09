export const POPULAR_AVATAR_PRESETS = [
  { id: "bottts-cyber", style: "bottts", seed: "cyber-punk", label: "Cyber Bot" },
  { id: "bottts-matrix", style: "bottts", seed: "matrix-matrix", label: "Matrix Bot" },
  { id: "lorelei-luna", style: "lorelei", seed: "Luna", label: "Lorelei" },
  { id: "lorelei-felix", style: "lorelei", seed: "Felix", label: "Felix" },
  { id: "adventurer-hero", style: "adventurer", seed: "Hero", label: "Adventurer" },
  { id: "adventurer-shadow", style: "adventurer", seed: "Shadow", label: "Shadow" },
  { id: "micah-designer", style: "micah", seed: "Designer", label: "Micah" },
  { id: "micah-artist", style: "micah", seed: "Artist", label: "Artist" },
  { id: "miniavs-pixel", style: "miniavs", seed: "Pixel", label: "Mini 3D" },
  { id: "thumbs-up", style: "thumbs", seed: "Awesome", label: "Thumbs Up" },
  { id: "big-smile", style: "big-smile", seed: "Joyful", label: "Big Smile" },
  { id: "open-peeps", style: "open-peeps", seed: "Casual", label: "Open Peep" },
  { id: "avataaars-zack", style: "avataaars", seed: "Zack", label: "Classic Zack" },
  { id: "avataaars-aneka", style: "avataaars", seed: "Aneka", label: "Classic Aneka" },
  { id: "avataaars-jasper", style: "avataaars", seed: "Jasper", label: "Classic Jasper" },
  { id: "avataaars-willow", style: "avataaars", seed: "Willow", label: "Classic Willow" },
];

export function getAvatarUrl(seedOrUrl?: string, fallbackSeed: string = "Felix"): string {
  if (!seedOrUrl) {
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fallbackSeed)}`;
  }
  if (seedOrUrl.startsWith("http://") || seedOrUrl.startsWith("https://") || seedOrUrl.startsWith("data:")) {
    return seedOrUrl;
  }
  if (seedOrUrl.includes(":")) {
    const [style, seed] = seedOrUrl.split(":");
    return `https://api.dicebear.com/7.x/${encodeURIComponent(style)}/svg?seed=${encodeURIComponent(seed)}`;
  }
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seedOrUrl)}`;
}
