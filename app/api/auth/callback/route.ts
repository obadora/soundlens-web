import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 環境変数を実行時に評価（ビルド時ではなく）
    // 後方互換性のため両方の環境変数名をサポート
    const API_BASE_URL = process.env.SOUNDLENS_API_URL ?? process.env.API_URL ?? 'http://host.docker.internal:8000';

    const body: unknown = await request.json();
    console.log('Exchanging token with backend:', `${API_BASE_URL}/auth/callback`);

    const response = await fetch(`${API_BASE_URL}/auth/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      return NextResponse.json(
        { error: 'Failed to exchange token', details: errorText },
        { status: response.status }
      );
    }

    const data: unknown = await response.json();
    console.log('Token exchanged successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
