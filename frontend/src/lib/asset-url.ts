import { API_ORIGIN } from "@/lib/api";

const LOVABLE_ASSET_ORIGIN = "https://bled-first-discovery.lovable.app";

export function cdnAssetUrl(url: string) {
  if (!url) return url;
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  if (url.startsWith("/__l5e/assets-v1/")) {
    return `${LOVABLE_ASSET_ORIGIN}${url}`;
  }
  return url;
}

/**
 * Résout une URL d'upload backend (ex: /uploads/avatars/xxx.jpg)
 * en URL absolue pointant vers le serveur API.
 */
export function resolveUploadUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  return `${API_ORIGIN}${url}`;
}