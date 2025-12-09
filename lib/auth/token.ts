/**
 * トークン管理ユーティリティ
 */

import { TokenResponse } from '@/lib/api/spotify';

const ACCESS_TOKEN_KEY = 'spotify_access_token';
const REFRESH_TOKEN_KEY = 'spotify_refresh_token';
const EXPIRES_AT_KEY = 'spotify_expires_at';

/**
 * トークンを保存
 */
export function saveToken(tokenResponse: TokenResponse): void {
  if (typeof window === 'undefined') return;

  const expiresAt = Date.now() + tokenResponse.expires_in * 1000;

  localStorage.setItem(ACCESS_TOKEN_KEY, tokenResponse.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refresh_token);
  localStorage.setItem(EXPIRES_AT_KEY, expiresAt.toString());
}

/**
 * アクセストークン取得
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * リフレッシュトークン取得
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * トークンの有効期限チェック
 */
export function isTokenExpired(): boolean {
  if (typeof window === 'undefined') return true;

  const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
  if (!expiresAt) return true;

  return Date.now() >= parseInt(expiresAt);
}

/**
 * 認証済みかチェック
 */
export function isAuthenticated(): boolean {
  return getAccessToken() !== null && !isTokenExpired();
}

/**
 * トークンをクリア（ログアウト）
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
}
