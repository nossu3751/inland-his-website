import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // 앱 공유 링크를 앱으로 바로 여는 파일 (아이폰 유니버설 링크 · 안드로이드 앱 링크). 확장자가 없어 형식을 직접 알려 준다
  // 행사 짧은 주소 (말로 · 화면에 적기 좋게). QR 은 앱이 바로 열리게 /app/visit/… 를 그대로 담는다
  async redirects() {
    return [{ source: "/reunion", destination: "/app/visit/reunion", permanent: false }];
  },
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
