"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getTrack, Track, SoundLensApiError } from "@/lib/api/soundlens";
import { isAuthenticated } from "@/lib/auth/token";

export default function TrackPage() {
  const router = useRouter();
  const params = useParams();
  const trackId = params.trackId as string;

  const [track, setTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const fetchTrack = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const trackData = await getTrack(trackId);
        setTrack(trackData);
      } catch (err) {
        if (err instanceof SoundLensApiError) {
          setError(`エラー: ${err.message} (${String(err.status)})`);
        } else {
          setError("トラック情報の取得に失敗しました");
        }
        console.error("Failed to fetch track:", err);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTrack();
  }, [trackId, router]);

  const handleBack = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              エラーが発生しました
            </h1>
            <p className="text-gray-700 dark:text-gray-300">{error}</p>
          </div>
          <button
            onClick={handleBack}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
        <div className="text-white text-xl">トラック情報が見つかりません</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 p-4">
      <main className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-2 mb-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            戻る
          </button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            トラック情報
          </h1>
        </div>

        {track.album.images.length > 0 && (
          <div className="mb-6 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={track.album.images[0].url}
              alt={`${track.name}のアルバムアート`}
              className="rounded-lg shadow-lg max-w-sm w-full"
            />
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
              曲名
            </h2>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {track.name}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
              アーティスト
            </h2>
            <p className="text-lg text-gray-900 dark:text-white">
              {track.artists.map((artist) => artist.name).join(", ")}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
              アルバム
            </h2>
            <p className="text-lg text-gray-900 dark:text-white">
              {track.album.name}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
              再生時間
            </h2>
            <p className="text-lg text-gray-900 dark:text-white">
              {Math.floor(track.duration_ms / 60000)}:
              {String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(
                2,
                "0"
              )}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
              トラックID
            </h2>
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
              {track.id}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {track.preview_url && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                プレビュー
              </h2>
              <audio controls className="w-full">
                <source src={track.preview_url} type="audio/mpeg" />
                お使いのブラウザはオーディオ要素をサポートしていません。
              </audio>
            </div>
          )}

          {track.external_urls.spotify && (
            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-center"
            >
              Spotifyで開く
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
