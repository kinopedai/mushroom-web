/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ["./styles"],
  },
  // ビルド中はESLintエラーで失敗させない（開発中の一時回避）
  eslint: { ignoreDuringBuilds: true }
};

export default nextConfig;
