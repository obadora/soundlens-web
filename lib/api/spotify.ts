/**
 * Spotify認証API クライアント
 * Next.jsのAPI Routeをプロキシとして使用してCORS問題を回避
 */

// ===== 型定義 =====

/**
 * トークン交換リクエスト
 */
export interface TokenRequest {
  code: string;
}

/**
 * トークンレスポンス
 */
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/**
 * ログインURLレスポンス
 */
export interface LoginUrlResponse {
  auth_url: string;
}

// ===== API関数 =====

/**
 * Spotify認証URL取得
 * GET /api/auth/login (Next.js API Route経由)
 */
export async function getLoginUrl(): Promise<LoginUrlResponse> {
  const response = await fetch("/api/auth/login", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get login URL: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 認証コードをアクセストークンに交換
 * POST /api/auth/callback (Next.js API Route経由)
 */
export async function exchangeToken(code: string): Promise<TokenResponse> {
  const response = await fetch("/api/auth/callback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange token: ${response.statusText}`);
  }

  return response.json();
}
