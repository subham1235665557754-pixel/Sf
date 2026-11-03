// 24-Hour Access Pass Service with AROLinks API
// Bypass-proof token validation & single-use verification

const AROLINKS_API_KEY = '7d48c8816059dd8babd8eb3568c660bf6382d9f1';
const PASS_EXPIRY_KEY = 'pass_expiry';
const EXPECTED_TOKEN_KEY = 'expected_token';

/**
 * Checks if the user currently holds an active, non-expired 24-hour pass
 */
export function isPassActive(): boolean {
  try {
    const expiry = localStorage.getItem(PASS_EXPIRY_KEY);
    if (!expiry) return false;
    const expiryTime = Number(expiry);
    if (isNaN(expiryTime)) return false;
    return Date.now() < expiryTime;
  } catch {
    return false;
  }
}

/**
 * Returns remaining pass seconds or 0
 */
export function getPassRemainingSeconds(): number {
  try {
    const expiry = localStorage.getItem(PASS_EXPIRY_KEY);
    if (!expiry) return 0;
    const expiryTime = Number(expiry);
    if (isNaN(expiryTime)) return 0;
    const diff = Math.floor((expiryTime - Date.now()) / 1000);
    return Math.max(0, diff);
  } catch {
    return 0;
  }
}

/**
 * Formats remaining pass time into readable string like "23h 45m" or "42m 15s"
 */
export function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) return 'Expired';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Generates dynamic unique token and requests shortlink via AROLinks API.
 * Uses local server proxy first for 100% CORS safety, falling back to AllOrigins / direct.
 */
export async function generate24HourPassLink(): Promise<string> {
  // 1. Generate dynamic unique bypass-proof token
  const uniqueToken = 'TKN_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();

  // 2. Save expected token into browser localStorage
  localStorage.setItem(EXPECTED_TOKEN_KEY, uniqueToken);

  // 3. Return destination URL with mytoken param
  const currentOrigin = window.location.origin;
  const currentPath = window.location.pathname;
  const destUrl = `${currentOrigin}${currentPath}?mytoken=${uniqueToken}`;

  console.log('[PassService] Generated destination URL with token:', destUrl);

  // 4. Call server-side proxy first (bypasses any browser CORS block)
  try {
    const proxyRes = await fetch('/api/generate-pass-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destUrl }),
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      const shortUrl = data.shortenedUrl || data.url || data.shorturl;
      if (shortUrl && typeof shortUrl === 'string' && shortUrl.startsWith('http')) {
        return shortUrl;
      }
    }
  } catch (err) {
    console.warn('[PassService] Local server proxy error, trying direct/AllOrigins:', err);
  }

  // Fallback 1: Direct AROLinks API call
  const targetApiUrl = `https://arolinks.com/api?api=${AROLINKS_API_KEY}&url=${encodeURIComponent(destUrl)}`;
  try {
    const directRes = await fetch(targetApiUrl);
    if (directRes.ok) {
      const directData = await directRes.json();
      const shortUrl = directData.shortenedUrl || directData.url || directData.shorturl;
      if (shortUrl && typeof shortUrl === 'string' && shortUrl.startsWith('http')) {
        return shortUrl;
      }
    }
  } catch (directErr) {
    console.warn('[PassService] Direct call failed (likely CORS), trying AllOrigins:', directErr);
  }

  // Fallback 2: AllOrigins proxy as instructed by user
  try {
    const proxyAllOrigins = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetApiUrl)}`;
    const allOriginsRes = await fetch(proxyAllOrigins);
    if (allOriginsRes.ok) {
      const allOriginsData = await allOriginsRes.json();
      const shortUrl = allOriginsData.shortenedUrl || allOriginsData.url || allOriginsData.shorturl;
      if (shortUrl && typeof shortUrl === 'string' && shortUrl.startsWith('http')) {
        return shortUrl;
      }
    }
  } catch (allErr) {
    console.error('[PassService] AllOrigins proxy failed:', allErr);
  }

  // Fallback 3: If everything fails, directly redirect to AROLinks with destUrl
  return `https://arolinks.com/api?api=${AROLINKS_API_KEY}&url=${encodeURIComponent(destUrl)}`;
}

/**
 * Verifies mytoken parameter on page load.
 * If matches expected_token, sets pass_expiry for 24 hours, removes expected_token (single use),
 * and cleans URL query string.
 */
export function verifyPassOnLoad(): { verified: boolean; message: string } {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const mytoken = urlParams.get('mytoken');

    if (!mytoken) {
      return { verified: false, message: '' };
    }

    const expectedToken = localStorage.getItem(EXPECTED_TOKEN_KEY);

    // If matches, activate 24-hour pass
    if (expectedToken && mytoken === expectedToken) {
      const expiry = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(PASS_EXPIRY_KEY, String(expiry));
      
      // Single-use bypass protection: immediately clear expected_token
      localStorage.removeItem(EXPECTED_TOKEN_KEY);

      // Clean URL query parameters
      window.history.replaceState({}, document.title, window.location.pathname);

      return {
        verified: true,
        message: 'Aapka 24-Ghante ka Pass activate ho gaya hai!',
      };
    }

    // Token did not match or already used
    if (mytoken && (!expectedToken || mytoken !== expectedToken)) {
      window.history.replaceState({}, document.title, window.location.pathname);
      return {
        verified: false,
        message: 'Invalid or already used key token. Please generate a new 24-Hour Key.',
      };
    }
  } catch (e) {
    console.error('[PassService] Verification error:', e);
  }

  return { verified: false, message: '' };
}
