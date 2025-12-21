/**
 * コールバックページのテスト
 */

import { render, screen, waitFor } from '@testing-library/react';
import CallbackPage from '../page';
import { exchangeToken } from '@/lib/api/spotify';
import { saveToken } from '@/lib/auth/token';
import { useSearchParams, useRouter } from 'next/navigation';

// モックの設定
jest.mock('@/lib/api/spotify');
jest.mock('@/lib/auth/token');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('CallbackPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('認証コードがある場合、トークン交換処理が実行される', async () => {
    const mockCode = 'test_auth_code';
    const mockTokenResponse = {
      access_token: 'test_access_token',
      refresh_token: 'test_refresh_token',
      expires_in: 3600,
    };

    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key: string) => {
        if (key === 'code') return mockCode;
        return null;
      }),
    });

    (exchangeToken as jest.Mock).mockResolvedValue(mockTokenResponse);

    render(<CallbackPage />);

    // 認証中の表示を確認
    expect(screen.getByText('認証中...')).toBeInTheDocument();
    expect(screen.getByText('少々お待ちください')).toBeInTheDocument();

    // トークン交換が実行されることを確認
    await waitFor(() => {
      expect(exchangeToken).toHaveBeenCalledWith(mockCode);
    });

    // トークン保存が実行されることを確認
    await waitFor(() => {
      expect(saveToken).toHaveBeenCalledWith(mockTokenResponse);
    });

    // ホームページにリダイレクトされることを確認
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('errorパラメータがある場合、エラーメッセージを表示しログインページに戻る', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key: string) => {
        if (key === 'error') return 'access_denied';
        return null;
      }),
    });

    render(<CallbackPage />);

    // エラーメッセージの表示を確認
    await waitFor(() => {
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
      expect(screen.getByText('認証がキャンセルされました')).toBeInTheDocument();
      expect(screen.getByText('ログインページに戻ります...')).toBeInTheDocument();
    });

    // 3秒後にリダイレクト
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('codeパラメータがない場合、エラーメッセージを表示しログインページに戻る', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => null),
    });

    render(<CallbackPage />);

    // エラーメッセージの表示を確認
    await waitFor(() => {
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
      expect(screen.getByText('認証コードが見つかりません')).toBeInTheDocument();
    });

    // 3秒後にリダイレクト
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('トークン交換がエラーになった場合、エラーメッセージを表示しログインページに戻る', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key: string) => {
        if (key === 'code') return 'test_code';
        return null;
      }),
    });

    (exchangeToken as jest.Mock).mockRejectedValue(new Error('Token exchange failed'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<CallbackPage />);

    // エラーメッセージの表示を確認
    await waitFor(() => {
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
      expect(screen.getByText('認証に失敗しました。もう一度お試しください。')).toBeInTheDocument();
    });

    // 3秒後にリダイレクト
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    consoleErrorSpy.mockRestore();
  });

  it('初期表示でコンテンツが表示される', async () => {
    const mockCode = 'test_code';
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key: string) => {
        if (key === 'code') return mockCode;
        return null;
      }),
    });

    (exchangeToken as jest.Mock).mockResolvedValue({
      access_token: 'test_token',
      refresh_token: 'test_refresh',
      expires_in: 3600,
    });

    render(<CallbackPage />);

    // 何らかのコンテンツが表示されることを確認
    await waitFor(() => {
      expect(document.body.textContent).toBeTruthy();
    });
  });
});
