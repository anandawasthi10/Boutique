/**
 * URL Utilities
 * Conforms to Security and Access Document Section 4
 */

/**
 * Ensures a return destination URL is strictly a relative path on this site.
 * Rejects external URLs, protocol-relative URLs (//), and dangerous schemes (javascript:, data:).
 * Conforms to Security and Access Document Section 4.
 */
export function sanitizeReturnUrl(returnTo?: string | null, fallback: string = '/account'): string {
  if (!returnTo || typeof returnTo !== 'string') {
    return fallback;
  }

  const trimmed = returnTo.trim();

  // Must begin with single forward slash and not double forward slash or backslash
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback;
  }

  // Reject URLs containing protocol specifiers or backslashes
  if (trimmed.includes('://') || trimmed.includes('\\')) {
    return fallback;
  }

  // Parse against dummy localhost origin to ensure no host / port override
  try {
    const url = new URL(trimmed, 'http://localhost');
    if (url.origin !== 'http://localhost') {
      return fallback;
    }
    // Return relative path + search + hash
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
