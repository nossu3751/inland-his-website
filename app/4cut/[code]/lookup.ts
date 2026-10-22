// 인생네컷 부스에서 찍은 사진을 받는 페이지가 읽는 것.
// 앱의 부스가 사진을 올리고 QR(https://www.inlandhis.com/4cut/<번호>)을 보이면, 손님 폰은 이 페이지를 연다.
// 공개 키(anon)로 get_photo_booth_shot(번호)만 부를 수 있다 — 번호를 아는 사람만, 7일 안에만 사진 주소를 돌려준다.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// 번호는 서버(photo_booth_code)가 영문 · 숫자 16자로 만든다
export const CODE_PATTERN = /^[A-Za-z0-9]{16}$/;

export type BoothShot = {
  photoUrl: string;
  downloadUrl: string;
  eventLabel: string | null;
  eventLabelEn: string | null;
  takenAt: string;
  expiresAt: string;
};

type Row = {
  photo_path: string;
  frame_name: string | null;
  event_label: string | null;
  event_label_en: string | null;
  created_at: string;
  expires_at: string;
};

/** 번호로 사진을 찾는다. 없거나 지났거나 읽기에 실패하면 null */
export async function getBoothShot(code: string): Promise<BoothShot | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !CODE_PATTERN.test(code)) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_photo_booth_shot`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_code: code }),
      // 지운 사진이 남아 보이지 않게 늘 새로 읽는다
      cache: "no-store",
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as Row[];
    const row = rows[0];
    if (!row?.photo_path) return null;
    const photoUrl = `${SUPABASE_URL}/storage/v1/object/public/photo-booth/${row.photo_path}`;
    return {
      photoUrl,
      // 저장소가 내려받기로 보내 주는 주소 (안드로이드 · 컴퓨터의 저장 단추)
      downloadUrl: `${photoUrl}?download=his-4cut.jpg`,
      eventLabel: row.event_label,
      eventLabelEn: row.event_label_en,
      takenAt: row.created_at,
      expiresAt: row.expires_at,
    };
  } catch {
    return null;
  }
}
