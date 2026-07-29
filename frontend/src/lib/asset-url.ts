const LOVABLE_ASSET_ORIGIN = "https://bled-first-discovery.lovable.app";

export function cdnAssetUrl(url: string) {
  if (!url) return url;
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  if (url.startsWith("/__l5e/assets-v1/")) {
    return `${LOVABLE_ASSET_ORIGIN}${url}`;
  }
  return url;
}