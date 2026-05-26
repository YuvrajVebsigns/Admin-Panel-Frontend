/**
 * Determines if a given image URL should bypass Next.js image optimization.
 *
 * Next.js image optimization proxies remote images through /_next/image.
 * If the upstream hostname resolves to a private IP (e.g. via NAT64 or internal DNS),
 * Next.js blocks the request for security. This utility detects such hostnames
 * so we can set `unoptimized={true}` on those specific <Image> components.
 */

const PRIVATE_IP_HOSTNAMES = ['beracore-media-bucket.idr01.zata.ai'] as const;

export function shouldSkipOptimization(src: string): boolean {
  if (!src) return false;

  try {
    const url = new URL(src);
    return PRIVATE_IP_HOSTNAMES.some((hostname) => url.hostname === hostname);
  } catch {
    // Not a full URL (relative path) — Next.js handles these fine
    return false;
  }
}
