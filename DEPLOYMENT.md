# Vercelデプロイ手順書

## 概要
このドキュメントは、Soundlens WebアプリケーションをVercelにデプロイする手順をまとめたものです。

## 前提条件
- GitHubアカウント
- Vercelアカウント（https://vercel.com で無料作成可能）
- バックエンドAPI（Render.com）とSupabaseの準備が完了していること

## デプロイ手順

### 1. Vercelアカウントの作成とログイン

1. https://vercel.com にアクセス
2. "Sign Up"をクリック
3. GitHubアカウントで認証

### 2. プロジェクトのインポート

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. GitHubリポジトリ一覧から `soundlens-web-feaute-17` を選択
3. 「Import」をクリック

### 3. プロジェクト設定

#### Framework Preset
- 自動で「Next.js」が検出されます

#### Root Directory
- `.` (ルートディレクトリ) のまま

#### Build Settings
- **Build Command**: `npm run build` (自動設定済み)
- **Output Directory**: `.next` (自動設定済み)
- **Install Command**: `npm install` (自動設定済み)

### 4. 環境変数の設定

「Environment Variables」セクションで以下の環境変数を追加:

#### 必須の環境変数

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-api.onrender.com` | Render.comのバックエンドAPIのURL |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | SupabaseプロジェクトのURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-supabase-anon-key` | Supabaseの匿名キー |
| `NODE_ENV` | `production` | 本番環境フラグ |

**注意**: `.env.example` ファイルを参考に、実際の値を設定してください。

#### 環境変数の設定方法
1. 「Key」に変数名を入力
2. 「Value」に実際の値を入力
3. Environment: すべて (Production, Preview, Development) にチェック
4. 「Add」をクリック

### 5. デプロイ実行

1. すべての設定を確認
2. 「Deploy」ボタンをクリック
3. デプロイプロセスが開始されます（通常1〜3分程度）

### 6. デプロイ完了後の確認

デプロイが完了すると:
- `https://your-project-name.vercel.app` のようなURLが発行されます
- 「Visit」ボタンでサイトにアクセス可能
- 動作確認を実施

## 自動デプロイの設定

Vercelは自動的に以下の設定を行います:

- **本番デプロイ**: `main` ブランチへのpush/マージで自動デプロイ
- **プレビューデプロイ**: Pull Request作成時に自動でプレビュー環境を作成

### Production Branchの設定確認

1. Vercelダッシュボード → プロジェクト → Settings → Git
2. 「Production Branch」が `main` になっていることを確認
3. 必要に応じて変更して保存

## カスタムドメインの設定（オプション）

1. Vercelダッシュボード → プロジェクト → Settings → Domains
2. 「Add」をクリック
3. ドメイン名を入力
4. DNS設定を指示に従って更新

## トラブルシューティング

### ビルドエラーが発生する場合

1. ローカルで `npm run build` が成功することを確認
2. Vercelのビルドログを確認
3. 環境変数が正しく設定されているか確認

### 環境変数が反映されない場合

1. 変数名が `NEXT_PUBLIC_` で始まっているか確認（クライアント側で使用する場合）
2. Vercelダッシュボードで再デプロイ（Deployments → ... → Redeploy）

### パフォーマンス問題

- Vercelの無料プランでは以下の制限があります:
  - 月100GBの帯域
  - 関数実行時間: 10秒
  - 関数メモリ: 1024MB

## リージョン設定

`vercel.json` でリージョンを東京 (`hnd1`) に設定しています。これにより日本からのアクセスが高速化されます。

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

## 注意事項

- `.env*` ファイルはGitにコミットしないこと（`.gitignore` で除外済み）
- 本番環境の環境変数は必ずVercelダッシュボードで設定すること
- デプロイ前に必ず `npm run build` でローカルビルドが成功することを確認すること
