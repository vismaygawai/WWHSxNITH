export const POPULAR_AVATAR_PRESETS = [
  { id: "felix", seed: "Felix", label: "Felix" },
  { id: "aneka", seed: "Aneka", label: "Aneka" },
  { id: "zack", seed: "Zack", label: "Zack" },
  { id: "molly", seed: "Molly", label: "Molly" },
  { id: "jasper", seed: "Jasper", label: "Jasper" },
  { id: "willow", seed: "Willow", label: "Willow" },
  { id: "oliver", seed: "Oliver", label: "Oliver" },
  { id: "luna", seed: "Luna", label: "Luna" },
  { id: "leo", seed: "Leo", label: "Leo" },
  { id: "maya", seed: "Maya", label: "Maya" },
  { id: "ethan", seed: "Ethan", label: "Ethan" },
  { id: "sofia", seed: "Sofia", label: "Sofia" },
];

export function getAvatarUrl(seedOrUrl?: string, fallbackSeed: string = "Felix"): string {
  if (!seedOrUrl) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fallbackSeed)}`;
  }
  if (seedOrUrl.startsWith("http://") || seedOrUrl.startsWith("https://") || seedOrUrl.startsWith("data:")) {
    return seedOrUrl;
  }
  if (seedOrUrl.includes(":")) {
    const seed = seedOrUrl.split(":")[1];
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seedOrUrl)}`;
}
