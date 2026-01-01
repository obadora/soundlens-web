import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Devcontainer環境でのホットリロード対応（Turbopack用）
  experimental: {
    // Turbopackでのファイルウォッチはデフォルトでポーリングモードをサポート
    // Dockerボリュームマウント越しでも動作する
    turbo: {
      useSwcLoader: true,
    },
  },
};

export default nextConfig;
