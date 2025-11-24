# ベースイメージ（Debian系 - devcontainer features対応）
FROM node:22-slim

# Claude Code CLIをグローバルにインストール（rootユーザーで実行）
RUN npm install -g @anthropic-ai/claude-code

# 作業ディレクトリを設定
WORKDIR /src

# /src ディレクトリの所有者を node ユーザーに変更
RUN chown -R node:node /src

# nodeユーザーに切り替え
USER node

# Next.jsの開発サーバーのポートを公開
EXPOSE 3000

# DevContainer用: デフォルトではコマンドを実行しない
CMD ["sleep", "infinity"]
