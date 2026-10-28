// 인생네컷 부스에서 찍은 사진을 받는 페이지가 읽는 것.
// 앱의 부스가 사진을 올리고 QR(https://www.inlandhis.com/4cut/<번호>)을 보이면, 손님 폰은 이 페이지를 연다.
// 공개 키(anon)로 get_photo_booth_shot_v2(번호)만 부를 수 있다 — 번호를 아는 사람만, 7일 안에만 사진 주소를 돌려준다.
// 움직이는 네컷 (2026-10-22): 부스가 사진을 올린 뒤 10~20초 안에 같은 폴더에 그림 25장(clip-00.jpg …)을 올리고 장수를 적는다.
// 장수가 적히기 전에는 clipUrls 가 null — 페이지가 잠깐씩 다시 읽는다.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// 번호는 서버(photo_booth_code)가 영문 · 숫자 16자로 만든다
export const CODE_PATTERN = /^[A-Za-z0-9]{16}$/;

/**
 * 부스가 움직이는 네컷을 다 올리기까지 기다리는 시간 — 이 뒤에도 없으면 사진만 (만들지 못했거나 예전 사진).
 * 번호를 만든 때부터 센다: 부스는 합친 사진(2~3MB)을 먼저 올리고 그림 25장을 이어 올리며, 장마다 세 번까지 다시 올린다.
 * 3분이던 때는 행사장 와이파이가 느리면 영상이 올라오기 전에 페이지가 '사진만'으로 바뀌어 영상 단추가 사라졌다 (2026-10-28 점검)
 */
export const CLIP_WAIT_MS = 10 * 60 * 1000;

export type BoothShot = {
  photoUrl: string;
  downloadUrl: string;
  eventLabel: string | null;
  eventLabelEn: string | null;
  takenAt: string;
  expiresAt: string;
  /** 움직이는 네컷 그림 주소 (차례대로). 아직 없으면 null */
  clipUrls: string[] | null;
  /** 1초에 몇 장 */
  clipFps: number;
  /** 움직이는 네컷이 아직 올라오는 중 (찍은 지 CLIP_WAIT_MS 안) — 페이지가 잠깐씩 다시 읽는다 */
  clipPending: boolean;
};

type Row = {
  photo_path: string;
  frame_name: string | null;
  event_label: string | null;
  event_label_en: string | null;
  created_at: string;
  expires_at: string;
  clip_frames?: number | null;
  clip_fps?: number | null;
};

const rpc = (name: string, code: string) =>
  fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_code: code }),
    // 지운 사진이 남아 보이지 않게 · 움직이는 네컷이 올라오면 바로 보이게 늘 새로 읽는다
    cache: "no-store",
  });

/** 앱의 lib/booth/session.ts clipFileName 과 같은 이름 */
const clipFileName = (index: number) => `clip-${String(index).padStart(2, "0")}.jpg`;

/**
 * 번호로 사진을 찾는 결과: 찾음 · 없음(지났거나 번호가 다름) · 읽지 못함(서버가 잠깐 안 됨 — 행사장에서 "지워졌어요"로 보이면
 * 손님이 그냥 떠난다, 2026-10-22 점검)
 */
export type BoothLookup = { kind: "found"; shot: BoothShot } | { kind: "missing" } | { kind: "error" };

/** 한 번 읽기 (실패는 던진다) */
async function readShot(code: string): Promise<BoothShot | null> {
  let res = await rpc("get_photo_booth_shot_v2", code);
  // 새 함수가 없는 서버(되돌린 때)면 예전 함수로 — 사진만
  if (res.status === 404) res = await rpc("get_photo_booth_shot", code);
  if (!res.ok) throw new Error(`rpc ${res.status}`);
  const rows = (await res.json()) as Row[];
  const row = rows[0];
  if (!row?.photo_path) return null;
  return shotOf(row);
}

/** 번호로 사진을 찾는다 — 읽지 못하면 한 번 더 */
export async function getBoothShot(code: string): Promise<BoothLookup> {
  if (!CODE_PATTERN.test(code)) return { kind: "missing" };
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { kind: "error" };
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const shot = await readShot(code);
      return shot ? { kind: "found", shot } : { kind: "missing" };
    } catch {
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }
  return { kind: "error" };
}

function shotOf(row: Row): BoothShot {
  const base = `${SUPABASE_URL}/storage/v1/object/public/photo-booth/`;
  const photoUrl = `${base}${row.photo_path}`;
  const folder = row.photo_path.slice(0, row.photo_path.lastIndexOf("/") + 1);
  const frames = row.clip_frames ?? 0;
  const clipUrls = frames > 1 && folder ? Array.from({ length: frames }, (_, index) => `${base}${folder}${clipFileName(index)}`) : null;
  return {
    photoUrl,
    // 저장소가 내려받기로 보내 주는 주소 (안드로이드 · 컴퓨터의 저장 단추)
    downloadUrl: `${photoUrl}?download=his-4cut.jpg`,
    eventLabel: row.event_label,
    eventLabelEn: row.event_label_en,
    takenAt: row.created_at,
    expiresAt: row.expires_at,
    clipUrls,
    clipFps: row.clip_fps && row.clip_fps > 0 ? row.clip_fps : 10,
    clipPending: !clipUrls && Date.now() - Date.parse(row.created_at) < CLIP_WAIT_MS,
  };
}
