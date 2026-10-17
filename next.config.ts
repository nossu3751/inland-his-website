import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // 앱 공유 링크를 앱으로 바로 여는 파일 (아이폰 유니버설 링크 · 안드로이드 앱 링크). 확장자가 없어 형식을 직접 알려 준다
  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ];
  },
};

export default nextConfig;
