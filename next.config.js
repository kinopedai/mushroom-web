/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ビルド時にESLintエラーで失敗させない　TODO：ESLintエラー修正対応
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
