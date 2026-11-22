import 'server-only';

import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const ADMIN_SESSION_COOKIE = 'sukpa_admin_session';
const ADMIN_SESSION_MAX_AGE = 8 * 60 * 60;

function getAdminSecret(): string | null {
  const secret = process.env.ADMIN_SECRET_KEY;
  return secret && secret.length >= 32 ? secret : null;
}

export function isAdminAuthConfigured(): boolean {
  return getAdminSecret() !== null;
}

function signSession(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;

  try {
    const originUrl = new URL(origin);
    const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0].trim();
    const requestHost = forwardedHost || request.headers.get('host');
    const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0].trim();
    const requestProtocol = forwardedProtocol
      ? `${forwardedProtocol.replace(/:$/, '')}:`
      : new URL(request.url).protocol;

    return Boolean(requestHost)
      && originUrl.host.toLowerCase() === requestHost?.toLowerCase()
      && originUrl.protocol === requestProtocol;
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string): boolean {
  const secret = getAdminSecret();
  if (!secret) return false;

  const submittedDigest = createHmac('sha256', secret).update(password).digest();
  const expectedDigest = createHmac('sha256', secret).update(secret).digest();
  return timingSafeEqual(submittedDigest, expectedDigest);
}

export async function createAdminSession(): Promise<void> {
  const secret = getAdminSecret();
  if (!secret) throw new Error('ADMIN_SECRET_KEY must contain at least 32 characters');

  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE;
  const payload = `${expiresAt}.${randomBytes(16).toString('base64url')}`;
  const token = `${payload}.${signSession(payload, secret)}`;
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = getAdminSecret();
  if (!secret) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return false;

  const [expiresAtText, nonce, signature, ...extra] = token.split('.');
  if (!expiresAtText || !nonce || !signature || extra.length > 0) return false;

  const expiresAt = Number(expiresAtText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return false;

  const payload = `${expiresAtText}.${nonce}`;
  const expectedSignature = Buffer.from(signSession(payload, secret), 'base64url');
  const providedSignature = Buffer.from(signature, 'base64url');
  return providedSignature.length === expectedSignature.length
    && timingSafeEqual(providedSignature, expectedSignature);
}

export async function requireAdmin(request: Request): Promise<NextResponse | null> {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { success: false, error: 'ระบบล็อกอินผู้ดูแลยังตั้งค่าไม่สมบูรณ์' },
      { status: 503 }
    );
  }

  const origin = request.headers.get('origin');
  const isReadOnly = request.method === 'GET' || request.method === 'HEAD';
  if ((origin && !isSameOriginRequest(request)) || (!origin && !isReadOnly)) {
    return NextResponse.json(
      { success: false, error: 'คำขอไม่ถูกต้อง' },
      { status: 403 }
    );
  }

  if (!await isAdminAuthenticated()) {
    return NextResponse.json(
      { success: false, error: 'กรุณาเข้าสู่ระบบผู้ดูแลก่อน' },
      { status: 401 }
    );
  }

  return null;
}
