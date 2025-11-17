// Edge Runtime compatible JWT verification using Web Crypto API
// This is used in middleware which runs in Edge Runtime

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  firebaseUid: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

/**
 * Decode JWT payload (without verification)
 * Used in Edge Runtime where Node.js crypto is not available
 */
export function decodeTokenPayload(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf-8')
    );

    return decoded as TokenPayload;
  } catch (error) {
    console.error('Token decoding failed:', error);
    return null;
  }
}

/**
 * Verify JWT token expiration
 * Returns true if token is valid (not expired)
 */
export function isTokenValid(payload: TokenPayload): boolean {
  if (!payload.exp) {
    return false;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp > currentTime;
}

/**
 * Verify JWT token signature using Web Crypto API
 * This is compatible with Edge Runtime
 */
export async function verifyTokenEdge(
  token: string,
  secret: string
): Promise<TokenPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Decode payload
    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf-8')
    ) as TokenPayload;

    // Check expiration
    if (!isTokenValid(payload)) {
      console.error('Token expired');
      return null;
    }

    // Verify signature using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const signatureBuffer = Buffer.from(signatureB64, 'base64url');

    // Import secret key
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Verify signature
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      data
    );

    if (!isValid) {
      console.error('Invalid token signature');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Quick token validation for Edge Runtime
 * Decodes and checks expiration without full signature verification
 * Use this for middleware where performance matters
 */
export function quickValidateToken(token: string): TokenPayload | null {
  try {
    const payload = decodeTokenPayload(token);
    if (!payload) {
      return null;
    }

    if (!isTokenValid(payload)) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Quick token validation failed:', error);
    return null;
  }
}
