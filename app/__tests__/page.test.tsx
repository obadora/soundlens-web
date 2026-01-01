/**
 * ホームページのテスト
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../page';
import { isAuthenticated, getAccessToken, clearTokens } from '@/lib/auth/token';
import { useRouter } from 'next/navigation';

// モックの設定
jest.mock('@/lib/auth/token');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Home', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('認証済みの場合、ホームページが正しく表示される', async () => {
    (isAuthenticated as jest.Mock).mockReturnValue(true);
    (getAccessToken as jest.Mock).mockReturnValue('test_access_token_1234567890abcdefghijklmnopqrstuvwxyz');

    render(<Home />);

    // コンテンツが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('SoundLens')).toBeInTheDocument();
    });

    expect(screen.getByText('Spotifyログインに成功しました！')).toBeInTheDocument();
    expect(screen.getByText('認証完了')).toBeInTheDocument();
    expect(screen.getByText('アクセストークンが正常に取得されました')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログアウト' })).toBeInTheDocument();
  });

  it('未認証の場合、ログインページにリダイレクトされる', async () => {
    (isAuthenticated as jest.Mock).mockReturnValue(false);

    render(<Home />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('ログアウトボタンをクリックするとトークンがクリアされログインページに遷移する', async () => {
    (isAuthenticated as jest.Mock).mockReturnValue(true);
    (getAccessToken as jest.Mock).mockReturnValue('test_token');

    render(<Home />);

    // コンテンツが表示されるまで待つ
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'ログアウト' })).toBeInTheDocument();
    });

    const logoutButton = screen.getByRole('button', { name: 'ログアウト' });
    fireEvent.click(logoutButton);

    expect(clearTokens).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('アクセストークンの先頭50文字が表示される', async () => {
    (isAuthenticated as jest.Mock).mockReturnValue(true);
    const mockToken = 'a'.repeat(100);
    (getAccessToken as jest.Mock).mockReturnValue(mockToken);

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(`${'a'.repeat(50)}...`)).toBeInTheDocument();
    });
  });

  it('トラック情報表示セクションが表示される', async () => {
    (isAuthenticated as jest.Mock).mockReturnValue(true);
    (getAccessToken as jest.Mock).mockReturnValue('test_token');

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('トラックIDを入力')).toBeInTheDocument();
    });

    // h3見出しとリンクボタンの両方が存在することを確認
    const elements = screen.getAllByText('トラック情報を表示');
    expect(elements).toHaveLength(2);
  });
});
