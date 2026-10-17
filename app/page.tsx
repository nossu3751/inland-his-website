import { Site } from "./components/site/Site";

// 이번 주일 날짜 · 한 주 칸이 시간에 맞게 바뀌도록 한 시간마다 다시 그린다
export const revalidate = 3600;

export default function Home() {
  return <Site lang="ko" />;
}
