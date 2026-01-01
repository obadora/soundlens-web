/**
 * SoundLens API クライアント
 * Next.jsのAPI Routeをプロキシとして使用してCORS問題を回避
 */

import { getAccessToken } from '@/lib/auth/token';

// ===== 型定義 =====

/**
 * Spotifyアーティスト情報
 */
export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  external_urls: {
    spotify: string;
  };
  [key: string]: unknown;
}

/**
 * Spotifyアルバム情報
 */
export interface SpotifyAlbum {
  id: string;
  name: string;
  album_type: string;
  artists: SpotifyArtist[];
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  release_date: string;
  [key: string]: unknown;
}

/**
 * トラック情報（Spotify API形式）
 */
export interface Track {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  popularity: number;
  track_number: number;
  [key: string]: unknown;
}

/**
 * APIエラー
 */
export class SoundLensApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'SoundLensApiError';
  }
}

// ===== API関数 =====

/**
 * トラック情報取得
 * GET /api/soundlens/tracks/{track_id} (Next.js API Route経由)
 */
export async function getTrack(trackId: string): Promise<Track> {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new SoundLensApiError('アクセストークンがありません', 401, 'Unauthorized');
  }

  const response = await fetch(`/api/soundlens/tracks/${trackId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'authorization': accessToken,
    },
  });

  if (!response.ok) {
    let errorDetails = response.statusText;
    try {
      const errorData = (await response.json()) as { error?: string; details?: string };
      if (errorData.details) {
        errorDetails = errorData.details;
      }
    } catch {
      // JSON パースエラーは無視
    }

    throw new SoundLensApiError(
      `トラック情報の取得に失敗しました: ${response.statusText} - ${errorDetails}`,
      response.status,
      response.statusText
    );
  }

  const data = await response.json();
  console.log('Track API response:', data);
  return data as Track;
}
