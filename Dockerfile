# ベースイメージ（Debian系 - devcontainer features対応）
FROM node:22-slim

# 作業ディレクトリを設定
WORKDIR /src

# Install git
RUN apt-get update && apt-get install -y git

# /src ディレクトリの所有者を node ユーザーに変更
RUN chown -R node:node /src

# nodeユーザーに切り替え
USER node

# Next.jsの開発サーバーのポートを公開
EXPOSE 3000

# DevContainer用: デフォルトではコマンドを実行しない
CMD ["sleep", "infinity"]
