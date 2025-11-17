import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';

export function getTokenFromCookies(req: NextRequest): string | null {
  return req.cookies.get('token')?.value || null;
}

export function setTokenCookie(res: NextResponse, token: string): void {
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export function removeTokenCookie(res: NextResponse): void {
  res.cookies.delete('token');
}

export async function authenticateRequest(req: NextRequest) {
  const token = getTokenFromCookies(req);

  if (!token) {
    return { authenticated: false, user: null };
  }

  const payload = verifyToken(token);

  if (!payload) {
    return { authenticated: false, user: null };
  }

  return { authenticated: true, user: payload };
}
