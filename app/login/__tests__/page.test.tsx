/**
 * ログインページのテスト
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../page';
import { getLoginUrl } from '@/lib/api/spotify';

// モックの設定
jest.mock('@/lib/api/spotify');

describe('LoginPage', () => {
  beforeEach(() => {
    // console.errorをモックしてエラーログを抑制
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('初期表示時に正しくレンダリングされる', () => {
    render(<LoginPage />);

    expect(screen.getByText('SoundLens')).toBeInTheDocument();
    expect(screen.getByText('Spotifyでログインして始めましょう')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Spotifyでログイン/i })).toBeInTheDocument();
  });

  it('ログインボタンをクリックするとログイン処理が実行される', async () => {
    const mockAuthUrl = 'https://accounts.spotify.com/authorize?client_id=test';
    (getLoginUrl as jest.Mock).mockResolvedValue({ auth_url: mockAuthUrl });

    render(<LoginPage />);

    const loginButton = screen.getByRole('button', { name: /Spotifyでログイン/i });
    fireEvent.click(loginButton);

    // ローディング状態の確認
    await waitFor(() => {
      expect(screen.getByText('ログイン中...')).toBeInTheDocument();
    });

    // APIが呼ばれることを確認
    await waitFor(() => {
      expect(getLoginUrl).toHaveBeenCalledTimes(1);
    });
  });

  it('ログインAPIがエラーを返した場合、エラーメッセージが表示される', async () => {
    (getLoginUrl as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<LoginPage />);

    const loginButton = screen.getByRole('button', { name: /Spotifyでログイン/i });
    fireEvent.click(loginButton);

    // エラーメッセージの表示を確認
    await waitFor(() => {
      expect(screen.getByText('ログインURLの取得に失敗しました')).toBeInTheDocument();
    });

    // ボタンが再度有効になることを確認
    expect(loginButton).not.toBeDisabled();
  });

  it('ローディング中はボタンが無効になる', async () => {
    (getLoginUrl as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(<LoginPage />);

    const loginButton = screen.getByRole('button', { name: /Spotifyでログイン/i });
    fireEvent.click(loginButton);

    // ボタンが無効になることを確認
    await waitFor(() => {
      expect(loginButton).toBeDisabled();
    });
  });

  it('利用規約とプライバシーポリシーのテキストが表示される', () => {
    render(<LoginPage />);

    expect(
      screen.getByText(/Spotifyアカウントでログインすることで/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/利用規約とプライバシーポリシーに同意したことになります/i)
    ).toBeInTheDocument();
  });
});
