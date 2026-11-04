import { cache } from "react";

// 행사 방문 페이지가 읽는 것: 행사(visit_event)와 그 행사 카테고리의 주보(bulletin_v2.category_id).
// 공개 키(앱에 들어 있는 것과 같은 anon 키)로 읽는다 — 두 표 모두 누구나 읽는 표다.
// 환경 변수가 없거나 서버를 읽지 못해도 페이지는 뜬다: 알려진 행사는 아래 값으로, 주보는 빈 상태로.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export const VISIT_CODE_PATTERN = /^[a-z0-9-]{2,32}$/;

export type VisitEvent = {
  code: string;
  title: string;
  title_en: string | null;
  place: string | null;
  starts_at: string | null;
  ends_at: string | null;
  join_from: string;
  join_until: string;
  bulletin_category_id: string | null;
};

export type VisitBulletin = {
  id: string;
  title: string;
  subtitle: string | null;
  /** 시간대 없는 TIMESTAMP 에 UTC 를 담는다 (앱 lib/bulletin.ts bulletinMs) */
  start_at: string;
  data: unknown;
};

// 서버를 읽지 못했을 때도 QR 로 온 사람이 앱을 받을 수 있게 (서버 visit_event 와 같은 값)
const KNOWN: Record<string, VisitEvent> = {
  reunion: {
    code: "reunion",
    title: "연합수련회 리유니온",
    title_en: "Retreat Reunion",
    place: "인랜드교회",
    starts_at: "2026-11-07T22:00:00Z",
    ends_at: "2026-11-08T02:00:00Z",
    join_from: "2026-11-04T00:00:00Z",
    join_until: "2026-11-10T08:00:00Z",
    bulletin_category_id: "00000000-0000-4000-8000-00000000b002",
  },
};

async function select<T>(query: string): Promise<T[] | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      // QR 로 한꺼번에 열어도 1분에 한 번만 읽는다 (주보를 고치면 1분 안에 보인다)
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T[];
  } catch {
    return null;
  }
}

/** 행사. 모르는 번호면 null, 서버를 못 읽었으면 알려진 행사 값 (없으면 null) */
export const getVisitEvent = cache(async (code: string): Promise<VisitEvent | null> => {
  if (!VISIT_CODE_PATTERN.test(code)) return null;
  const rows = await select<VisitEvent>(
    `visit_event?code=eq.${code}&select=code,title,title_en,place,starts_at,ends_at,join_from,join_until,bulletin_category_id&limit=1`,
  );
  if (rows === null) return KNOWN[code] ?? null;
  return rows[0] ?? null;
});

/** 그 행사 카테고리의 주보 (예배 순서대로). 못 읽으면 빈 목록 */
export const getVisitBulletins = cache(async (categoryId: string | null): Promise<VisitBulletin[]> => {
  if (!categoryId || !/^[0-9a-f-]{36}$/.test(categoryId)) return [];
  const rows = await select<VisitBulletin>(
    `bulletin_v2?category_id=eq.${categoryId}&select=id,title,subtitle,start_at,data&order=start_at.asc&limit=10`,
  );
  return rows ?? [];
});

/** 지금 승인 없이 바로 들어오는 기간인지 (요청 때마다 다시 센다) */
export function isJoinOpen(event: VisitEvent, now = Date.now()): boolean {
  return now >= Date.parse(event.join_from) && now < Date.parse(event.join_until);
}
