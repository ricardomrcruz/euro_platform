export type UserRole = 'GUEST' | 'CLIENT' | 'ADMIN';

export interface JwtPayload {
  sub: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tokenVersion: number;
}

// Hand-rolled rather than a library, but still UTF-8 safe -- names on a European site will
// routinely contain accented characters (e.g. "François"), which plain atob() alone garbles.
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}
