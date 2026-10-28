import { getBoothShot } from "../lookup";

// 받기 페이지가 움직이는 네컷을 기다리는 동안 4초마다 읽는 작은 답 (/4cut/<번호>/clip).
// 예전에는 페이지 전체를 다시 그렸는데(router.refresh), 서버에서 한 번 못 읽으면 보고 있던 사진 화면이 '잠깐 불러오지 못했어요'로
// 바뀌었다 — 10분을 기다리게 되면서 더 자주 걸릴 수 있어 이 길로 (2026-10-28 점검). 페이지는 읽힌 때만 바꾼다.
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const lookup = await getBoothShot(code);
  const headers = { "Cache-Control": "no-store" };
  if (lookup.kind !== "found") return Response.json({ kind: lookup.kind }, { status: lookup.kind === "missing" ? 404 : 503, headers });
  const { clipUrls, clipFps, clipPending } = lookup.shot;
  return Response.json({ kind: "found", clipUrls, clipFps, clipPending }, { headers });
}
