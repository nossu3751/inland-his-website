import { cache } from "react";

// 공유 링크 미리보기에 쓸 제목을 HIS 앱 서버(Supabase)에서 읽는다.
// 공개 키(앱에 들어 있는 것과 같은 anon 키)로 읽고, **전체공개 글·공개 일정만** 돌려준다.
// 대상지정 글이나 초대된 사람만 보는 일정은 제목이 링크 미리보기로 새지 않게 null.
// 환경 변수(SUPABASE_URL, SUPABASE_ANON_KEY)가 없거나 읽기에 실패하면 null → 일반 문구로 보여준다.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function select<T>(query: string): Promise<T | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      // 같은 링크를 여러 사람이 열어도 1분에 한 번만 읽는다
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as T[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

// id는 호출하는 쪽에서 모양(영문·숫자·-)을 확인한 값만 넘긴다.

/** 전체공개 게시글 제목. 대상지정 글이거나 없으면 null */
export const getPublicPostTitle = cache(async (id: string) => {
  const row = await select<{ title: string }>(
    `post?id=eq.${id}&visibility_scope=eq.all&select=title&limit=1`,
  );
  return row?.title ?? null;
});

/** 공개 일정 제목. 특정 사람만 보는 일정이거나 없으면 null */
export const getPublicEventTitle = cache(async (eventId: string) => {
  const row = await select<{ title: string }>(
    `event?id=eq.${eventId}&target_user_ids=is.null&select=title&limit=1`,
  );
  return row?.title ?? null;
});
