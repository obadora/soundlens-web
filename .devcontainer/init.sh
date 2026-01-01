#!/bin/bash

# devcontainer初期化スクリプト
# 1. 既存のコンテナを削除
# 2. ポート3000を使用しているコンテナを停止
# 3. メインworktreeから.envをコピー

set -e

WORKSPACE_DIR="$1"

# 引数チェック
if [ -z "$WORKSPACE_DIR" ]; then
    echo "エラー: ワークスペースディレクトリが指定されていません"
    exit 1
fi

# 既存のコンテナを削除
echo "既存のコンテナを削除中..."
docker compose -f "${WORKSPACE_DIR}/docker-compose.yml" down --remove-orphans 2>/dev/null || true

# ポート3000を使用している他のコンテナも停止
echo "ポート3000を使用しているコンテナをチェック中..."
CONTAINERS_USING_3000=$(docker ps --filter "publish=3000" --format "{{.Names}}" 2>/dev/null || echo "")
if [ -n "$CONTAINERS_USING_3000" ]; then
    echo "ポート3000を使用しているコンテナを停止中: $CONTAINERS_USING_3000"
    echo "$CONTAINERS_USING_3000" | xargs -r docker stop
    echo "$CONTAINERS_USING_3000" | xargs -r docker rm
fi

# メインworktreeから.envをコピー
echo ".envファイルをチェック中..."
if [ ! -f "${WORKSPACE_DIR}/.env.local" ]; then
    # メインworktreeのパスを取得
    MAIN_WORKTREE=$(git -C "${WORKSPACE_DIR}" worktree list 2>/dev/null | head -n 1 | awk '{print $1}' || echo "")

    if [ -n "$MAIN_WORKTREE" ] && [ -f "$MAIN_WORKTREE/.env.local" ]; then
        cp "$MAIN_WORKTREE/.env.local" "${WORKSPACE_DIR}/.env.local"
        echo "✓ .env.localをコピーしました: $MAIN_WORKTREE/.env.local -> ${WORKSPACE_DIR}/.env.local"
    else
        echo "⚠ メインworktreeの.env.localが見つかりません"
        echo "  必要に応じて手動で.env.localを作成してください"
    fi
else
    echo "✓ .env.localは既に存在します"
fi

echo "初期化完了"
