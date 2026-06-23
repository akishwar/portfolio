/**
 * Helper to get the image URL.
 * Checks for session-cached uploads to support immediate browser preview
 * before the GitHub-triggered Vercel deployment completes.
 */
export function getImageUrl(path: string): string {
  if (!path) return '';
  if (typeof window !== 'undefined' && path.startsWith('/uploads/')) {
    const cached = sessionStorage.getItem(`preview-${path}`);
    if (cached) return cached;
  }
  return path;
}
