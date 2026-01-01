import { NextRequest, NextResponse } from 'next/server';

const SOUNDLENS_API_BASE_URL = process.env.SOUNDLENS_API_URL ?? 'http://host.docker.internal:8000';

/**
 * トラック情報取得API
 * GET /api/soundlens/tracks/[trackId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
): Promise<NextResponse> {
  try {
    const { trackId } = await params;

    // Authorizationヘッダーを取得
    const authorization = request.headers.get('authorization');

    if (!authorization) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // SoundLens APIにリクエスト
    // Spotify APIは "Bearer {token}" 形式を要求するため、Bearerプレフィックスを追加
    const authHeader = authorization.startsWith('Bearer ')
      ? authorization
      : `Bearer ${authorization}`;

    const response = await fetch(`${SOUNDLENS_API_BASE_URL}/api/tracks/${trackId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': authHeader,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SoundLens API error:', {
        status: response.status,
        statusText: response.statusText,
        trackId,
        authorization: authHeader.substring(0, 20) + '...',
        errorText,
      });
      return NextResponse.json(
        { error: `SoundLens API error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data: unknown = await response.json();
    console.log('SoundLens API response:', JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Track fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch track information' },
      { status: 500 }
    );
  }
}
