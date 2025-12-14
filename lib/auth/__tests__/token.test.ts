/**
 * トークン管理ユーティリティのテスト
 */

import {
  saveToken,
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  isAuthenticated,
  clearTokens,
} from '../token';
import { TokenResponse } from '@/lib/api/spotify';

describe('Token管理ユーティリティ', () => {
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // localStorageのモックを作成
    localStorageMock = {};

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => localStorageMock[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('saveToken', () => {
    it('トークン情報を正しくlocalStorageに保存する', () => {
      const mockNow = 1000000;
      jest.spyOn(Date, 'now').mockImplementation(() => mockNow);

      const tokenResponse: TokenResponse = {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
        expires_in: 3600,
      };

      saveToken(tokenResponse);

      expect(localStorageMock['spotify_access_token']).toBe('test_access_token');
      expect(localStorageMock['spotify_refresh_token']).toBe('test_refresh_token');
      expect(localStorageMock['spotify_expires_at']).toBe('4600000'); // 1000000 + 3600 * 1000
    });

    it('有効期限を正しく計算して保存する', () => {
      const mockNow = 1000000;
      jest.spyOn(Date, 'now').mockImplementation(() => mockNow);

      const tokenResponse: TokenResponse = {
        access_token: 'test_token',
        refresh_token: 'test_refresh',
        expires_in: 7200, // 2時間
      };

      saveToken(tokenResponse);

      const expectedExpiresAt = (mockNow + 7200 * 1000).toString();
      expect(localStorageMock['spotify_expires_at']).toBe(expectedExpiresAt);
    });
  });

  describe('getAccessToken', () => {
    it('保存されたアクセストークンを正しく取得する', () => {
      localStorageMock['spotify_access_token'] = 'stored_access_token';

      const token = getAccessToken();

      expect(token).toBe('stored_access_token');
      expect(localStorage.getItem).toHaveBeenCalledWith('spotify_access_token');
    });

    it('トークンが保存されていない場合はnullを返す', () => {
      const token = getAccessToken();

      expect(token).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('保存されたリフレッシュトークンを正しく取得する', () => {
      localStorageMock['spotify_refresh_token'] = 'stored_refresh_token';

      const token = getRefreshToken();

      expect(token).toBe('stored_refresh_token');
      expect(localStorage.getItem).toHaveBeenCalledWith('spotify_refresh_token');
    });

    it('トークンが保存されていない場合はnullを返す', () => {
      const token = getRefreshToken();

      expect(token).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('有効期限が切れていない場合はfalseを返す', () => {
      const mockNow = 1000000;
      jest.spyOn(Date, 'now').mockImplementation(() => mockNow);

      // 現在時刻: 1000000
      // 有効期限: 2000000（まだ有効）
      localStorageMock['spotify_expires_at'] = '2000000';

      const expired = isTokenExpired();

      expect(expired).toBe(false);
    });

    it('有効期限が切れている場合はtrueを返す', () => {
      const mockNow = 1000000;
      jest.spyOn(Date, 'now').mockImplementation(() => mockNow);

      // 現在時刻: 1000000
      // 有効期限: 500000（期限切れ）
      localStorageMock['spotify_expires_at'] = '500000';

      const expired = isTokenExpired();

      expect(expired).toBe(true);
    });

    it('有効期限がちょうど現在時刻と同じ場合はtrueを返す', () => {
      const mockNow = 1000000;
      jest.spyOn(Date, 'now').mockImplementation(() => mockNow);

      // 現在時刻: 1000000
      // 有効期限: 1000000（期限切れ）
      localStorageMock['spotify_expires_at'] = '1000000';

      const expired = isTokenExpired();

      expect(expired).toBe(true);
    });

    it('有効期限が保存されていない場合はtrueを返す', () => {
      const expired = isTokenExpired();

      expect(expired).toBe(true);
    });
  });

  describe('isAuthenticated', () => {
    it('トークンが存在し有効期限内の場合はtrueを返す', () => {
      const mockNow = 1000000;
      jest.spyOn(Date, 'now').mockImplementation(() => mockNow);

      localStorageMock['spotify_access_token'] = 'valid_token';
      localStorageMock['spotify_expires_at'] = '2000000';

      const authenticated = isAuthenticated();

      expect(authenticated).toBe(true);
    });

    it('トークンが存在するが期限切れの場合はfalseを返す', () => {
      const mockNow = 1000000;
      jest.spyOn(Date, 'now').mockImplementation(() => mockNow);

      localStorageMock['spotify_access_token'] = 'expired_token';
      localStorageMock['spotify_expires_at'] = '500000';

      const authenticated = isAuthenticated();

      expect(authenticated).toBe(false);
    });

    it('トークンが存在しない場合はfalseを返す', () => {
      localStorageMock['spotify_expires_at'] = '2000000';

      const authenticated = isAuthenticated();

      expect(authenticated).toBe(false);
    });

    it('トークンも有効期限も存在しない場合はfalseを返す', () => {
      const authenticated = isAuthenticated();

      expect(authenticated).toBe(false);
    });
  });

  describe('clearTokens', () => {
    it('すべてのトークン情報をlocalStorageから削除する', () => {
      localStorageMock['spotify_access_token'] = 'test_access';
      localStorageMock['spotify_refresh_token'] = 'test_refresh';
      localStorageMock['spotify_expires_at'] = '2000000';

      clearTokens();

      expect(localStorage.removeItem).toHaveBeenCalledWith('spotify_access_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('spotify_refresh_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('spotify_expires_at');
      expect(localStorageMock['spotify_access_token']).toBeUndefined();
      expect(localStorageMock['spotify_refresh_token']).toBeUndefined();
      expect(localStorageMock['spotify_expires_at']).toBeUndefined();
    });

    it('トークンが存在しない場合でもエラーが発生しない', () => {
      expect(() => clearTokens()).not.toThrow();
    });
  });
});
