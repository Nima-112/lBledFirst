import { API_ORIGIN } from "@/lib/api";

const LOVABLE_ASSET_ORIGIN = "https://bled-first-discovery.lovable.app";

/**
 * Nettoie une URL avant toute utilisation : retire les backticks `` ` `` que l'admin
 * colle parfois depuis Discord/Markdown, les espaces superflus, les guillemets
 * wrappés etc. Renvoie null si rien de valide.
 */
export function sanitizeUrl(raw?: string | null): string | null {
  if (!raw) return null;
  let s = String(raw).trim();
  if (!s) return null;
  while (s.startsWith("`") || s.startsWith('"') || s.startsWith("'")) {
    s = s.slice(1).trim();
  }
  while (s.endsWith("`") || s.endsWith('"') || s.endsWith("'")) {
    s = s.slice(0, -1).trim();
  }
  s = s.replace(/\s+/g, "");
  if (!s) return null;
  // Cas spécifique "internal" : /uploads/... autorisé
  if (s.startsWith("/")) return s;
  if (/^(https?:|data:|blob:)/i.test(s)) return s;
  return null;
}

export function cdnAssetUrl(url?: string | null) {
  const clean = sanitizeUrl(url);
  if (!clean) return undefined;
  if (/^(https?:|data:|blob:)/i.test(clean)) return clean;
  if (clean.startsWith("/__l5e/assets-v1/")) {
    return `${LOVABLE_ASSET_ORIGIN}${clean}`;
  }
  return clean;
}

/**
 * Résout une URL d'upload backend (ex: /uploads/avatars/xxx.jpg)
 * en URL absolue pointant vers le serveur API.
 */
export function resolveUploadUrl(url?: string | null): string | undefined {
  const clean = sanitizeUrl(url);
  if (!clean) return undefined;
  if (/^(https?:|data:|blob:)/i.test(clean)) return clean;
  return `${API_ORIGIN}${clean}`;
}