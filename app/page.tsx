'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getAccessToken, clearTokens } from '@/lib/auth/token';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [trackId, setTrackId] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      setIsLoading(false);

      if (!authenticated) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    clearTokens();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
      <main className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            SoundLens
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Spotifyログインに成功しました！
          </p>
        </div>

        <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">
              認証完了
            </h2>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            アクセストークンが正常に取得されました
          </p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            アクセストークン
          </h3>
          <code className="text-xs text-gray-600 dark:text-gray-400 break-all block">
            {getAccessToken()?.substring(0, 50)}...
          </code>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            トラック情報を表示
          </h3>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={trackId}
              onChange={(e) => {
                setTrackId(e.target.value);
              }}
              placeholder="トラックIDを入力"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <Link
              href={`/track/${trackId}`}
              className={`w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                !trackId ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              トラック情報を表示
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            ログアウト
          </button>
        </div>
      </main>
    </div>
  );
}
