# ベースイメージ（Debian系 - devcontainer features対応）
FROM node:22-slim

# 作業ディレクトリを設定
WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci

# アプリケーションのソースコードをコピー
COPY . .

# Next.jsの開発サーバーのポートを公開
EXPOSE 3000

# 開発サーバーを起動
CMD ["npm", "run", "dev"]
