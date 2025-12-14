/**
 * Spotify認証APIクライアントのテスト
 */

import { getLoginUrl, exchangeToken } from '../spotify';

describe('Spotify認証APIクライアント', () => {
  beforeEach(() => {
    // fetchのモックをリセット
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getLoginUrl', () => {
    it('正常にログインURLを取得する', async () => {
      const mockResponse = {
        auth_url: 'https://accounts.spotify.com/authorize?client_id=test&...',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getLoginUrl();

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('APIエラー時にエラーをスローする', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(getLoginUrl()).rejects.toThrow(
        'Failed to get login URL: Internal Server Error'
      );
    });

    it('ネットワークエラー時にエラーをスローする', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(getLoginUrl()).rejects.toThrow('Network error');
    });
  });

  describe('exchangeToken', () => {
    it('正常に認証コードをトークンに交換する', async () => {
      const mockCode = 'test_auth_code_12345';
      const mockResponse = {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
        expires_in: 3600,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await exchangeToken(mockCode);

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: mockCode }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('APIエラー時にエラーをスローする', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      await expect(exchangeToken('invalid_code')).rejects.toThrow(
        'Failed to exchange token: Unauthorized'
      );
    });

    it('ネットワークエラー時にエラーをスローする', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network timeout')
      );

      await expect(exchangeToken('test_code')).rejects.toThrow('Network timeout');
    });

    it('空のコードでも正しくリクエストを送信する', async () => {
      const mockResponse = {
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await exchangeToken('');

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: '' }),
      });
    });
  });
});
