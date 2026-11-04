import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaperPage } from "../../../components/PaperPage";
import { BulletinSheet, hasContent, preacherOf } from "./BulletinSheet";
import { getVisitBulletins, getVisitEvent, isJoinOpen, type VisitEvent } from "./lookup";

// 행사 방문 페이지: https://www.inlandhis.com/app/visit/<code> (짧은 주소 /reunion → /app/visit/reunion)
// 2026-11-04 사용자 "리유니온 같은 경우 다른 교회에서도 방문해서 히즈앱에 가입 · 리유니온 쪽에 그 주보들만 노출".
// 앱이 깔린 폰은 유니버설 링크(/app/*)로 이 페이지 없이 앱의 방문 가입(/visit?code=…)이 열린다.
// 앱이 없으면 여기서 받고 → 다시 QR 을 찍거나 '앱에서 열기'. 행사 카테고리의 주보(순서지)는 앱 없이도 여기서 읽는다.
// 서버: visit_event (join_from ~ join_until 이면 인리치 승인 없이 손님으로 바로), bulletin_v2.category_id.

const APP_SCHEME = "inlandhisapp";
const APP_STORE_URL = "https://apps.apple.com/us/app/%ED%9E%88%EC%A6%88%EC%95%B1/id6746176604";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.inlandhisapp";
const ZONE = "America/Los_Angeles";

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const isEnglish = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) === "en";

/** 그 순간의 LA 날짜 · 시각 조각 */
function laParts(ms: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(ms));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { month: Number(get("month")), day: Number(get("day")), weekday: get("weekday"), hour: Number(get("hour")) % 24, minute: Number(get("minute")) };
}

const KO_WEEKDAY: Record<string, string> = { Sun: "일", Mon: "월", Tue: "화", Wed: "수", Thu: "목", Fri: "금", Sat: "토" };
const EN_MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function koClock(hour: number, minute: number, withHalf = true) {
  const half = hour < 12 ? "오전" : "오후";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${withHalf ? `${half} ` : ""}${h}시${minute ? ` ${minute}분` : ""}`;
}

function enClock(hour: number, minute: number, withHalf = true) {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}${minute ? `:${String(minute).padStart(2, "0")}` : ""}${withHalf ? (hour < 12 ? " AM" : " PM") : ""}`;
}

/** "11월 7일 (토)" · "Sat, Nov 7" */
function dayLabel(ms: number, en: boolean) {
  const p = laParts(ms);
  return en ? `${p.weekday}, ${EN_MONTH[p.month - 1]} ${p.day}` : `${p.month}월 ${p.day}일 (${KO_WEEKDAY[p.weekday] ?? ""})`;
}

/** "오후 2시 ~ 6시" · "2 – 6 PM" (같은 오전/오후면 한 번만) */
function timeRange(startMs: number, endMs: number | null, en: boolean) {
  const s = laParts(startMs);
  if (endMs === null) return en ? enClock(s.hour, s.minute) : koClock(s.hour, s.minute);
  const e = laParts(endMs);
  const sameHalf = (s.hour < 12) === (e.hour < 12);
  if (en) return `${enClock(s.hour, s.minute, !sameHalf)} – ${enClock(e.hour, e.minute)}`;
  return `${koClock(s.hour, s.minute)} ~ ${koClock(e.hour, e.minute, !sameHalf)}`;
}

/** bulletin_v2.start_at(시간대 없는 TIMESTAMP · UTC) → ms */
function bulletinMs(startAt: string): number {
  const iso = startAt.includes("T") ? startAt : startAt.replace(" ", "T");
  return Date.parse(iso.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`);
}

const titleOf = (event: VisitEvent, en: boolean) => (en && event.title_en ? event.title_en : event.title);

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { code } = await params;
  const en = isEnglish((await searchParams).lang);
  const event = await getVisitEvent(code);
  if (!event) return { title: "HIS" };
  const title = `${titleOf(event, en)} · HIS`;
  const description = en
    ? "Get the HIS app and join us — the order of worship, today's schedule and the Word, together."
    : "HIS 앱을 받고 함께해요 — 순서지 · 오늘 일정 · 말씀을 앱에서 함께 봐요.";
  return {
    metadataBase: new URL("https://www.inlandhis.com"),
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      siteName: "Inland His Church",
      images: [{ url: "/favicon/web-app-manifest-512x512.png", width: 512, height: 512 }],
    },
  };
}

function StepBadge({ n }: { n: number }) {
  return (
    <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--ink)] text-[14px] font-black text-white">
      {n}
    </span>
  );
}

export default async function VisitPage({ params, searchParams }: Props) {
  const { code } = await params;
  const en = isEnglish((await searchParams).lang);
  const event = await getVisitEvent(code);
  if (!event) notFound();
  const bulletins = (await getVisitBulletins(event.bulletin_category_id)).filter((b) => hasContent(b.data) || b.title.trim() !== "");

  const joinOpen = isJoinOpen(event);
  const startMs = event.starts_at ? Date.parse(event.starts_at) : null;
  const endMs = event.ends_at ? Date.parse(event.ends_at) : null;
  const deepLink = `${APP_SCHEME}:///visit?code=${event.code}`;
  const here = `/app/visit/${event.code}`;

  return (
    <PaperPage homeLabel={en ? "HIS Home" : "히즈 홈"}>
      <div lang={en ? "en" : "ko"} className="mx-auto flex w-full max-w-md flex-col">
        <div className="flex justify-end">
          <div className="lang-switch">
            {en ? <Link href={here} hrefLang="ko">한국어</Link> : <span aria-current="true">한국어</span>}
            {en ? <span aria-current="true">English</span> : <Link href={`${here}?lang=en`} hrefLang="en">English</Link>}
          </div>
        </div>

        <section className="relative mt-5 rounded-[28px] bg-[var(--paper)] px-6 pb-7 pt-6">
          {/* 도장: 단색 면만 (안쪽 가는 선 없이) */}
          <span
            className="absolute right-5 top-5 grid size-16 rotate-[-12deg] place-items-center rounded-full bg-[var(--brand)] text-[14px] font-black tracking-[0.02em] text-white"
            aria-hidden="true"
          >
            {en ? "VISIT" : "방문"}
          </span>
          {startMs !== null && <p className="pr-20 text-[15px] font-extrabold text-[var(--accent-text)]">{dayLabel(startMs, en)}</p>}
          <h1 className="page-title mt-2 pr-16 text-[34px]">{titleOf(event, en)}</h1>
          <p className="mt-3 text-[16px] font-semibold leading-relaxed text-[var(--soft)]">
            {[startMs !== null ? timeRange(startMs, endMs, en) : null, event.place ? (en && event.place === "인랜드교회" ? "Inland Church" : event.place) : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </section>

        <p className="mt-7 text-[17px] font-semibold leading-relaxed">
          {en ? "See the order of worship, today's schedule and the Word together in the HIS app." : "순서지 · 오늘 일정 · 말씀을 HIS 앱에서 함께 봐요."}
        </p>

        <section className="mt-5 rounded-[24px] bg-[var(--paper)] p-5">
          <h2 className="flex items-center gap-3 text-[18px] font-black">
            <StepBadge n={1} />
            {en ? "Get the app" : "앱 받기"}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ink justify-center px-3 text-[15px]">
              App Store
            </a>
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ink justify-center px-3 text-[15px]">
              Google Play
            </a>
          </div>
        </section>

        <section className="mt-3 rounded-[24px] bg-[var(--paper)] p-5">
          <h2 className="flex items-center gap-3 text-[18px] font-black">
            <StepBadge n={2} />
            {en ? "Open in the app" : "앱에서 열기"}
          </h2>
          <a href={deepLink} className="btn btn-primary mt-4 w-full justify-center text-[17px]">
            {en ? "Open in HIS app" : "HIS 앱에서 열기"}
          </a>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--soft)]">
            {joinOpen
              ? en
                ? "After installing, scan this QR code again or tap the button. You can start right away — no approval wait."
                : "앱을 받은 뒤 이 QR을 한 번 더 찍거나 이 단추를 눌러 주세요. 승인을 기다리지 않고 바로 시작해요."
              : en
                ? "After installing, scan this QR code again or tap the button to sign up in the app."
                : "앱을 받은 뒤 이 QR을 한 번 더 찍거나 이 단추를 눌러 앱에서 가입해 주세요."}
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-[24px] font-black tracking-[-0.03em]">{en ? "Order of Worship" : "순서지"}</h2>
          {bulletins.length === 0 ? (
            <p className="mt-4 rounded-[24px] bg-[var(--paper)] px-5 py-6 text-[16px] leading-relaxed text-[var(--soft)]">
              {en ? "The order of worship will be posted here before the service." : "순서지는 예배 전에 여기 올라와요."}
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-8">
              {bulletins.map((bulletin) => {
                const ms = bulletinMs(bulletin.start_at);
                const preacher = preacherOf(bulletin.data);
                return (
                  <article key={bulletin.id} className="rounded-[28px] bg-[var(--paper)] p-3">
                    <header className="px-3 pb-4 pt-3">
                      {Number.isFinite(ms) && (
                        <p className="text-[14px] font-extrabold text-[var(--accent-text)]">
                          {dayLabel(ms, en)} · {timeRange(ms, null, en)}
                        </p>
                      )}
                      {bulletin.title.trim() !== "" && <h3 className="mt-1.5 font-serif text-[24px] leading-[1.4]">{bulletin.title}</h3>}
                      {bulletin.subtitle && <p className="mt-1 text-[15px] text-[var(--soft)]">{bulletin.subtitle}</p>}
                      {preacher !== "" && <p className="mt-2 text-[15px] font-bold text-[var(--soft)]">{en ? `Sermon · ${preacher}` : `설교 · ${preacher}`}</p>}
                    </header>
                    <BulletinSheet data={bulletin.data} en={en} />
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <p className="mt-12 text-[13px] leading-relaxed text-[var(--soft)]">
          {en
            ? "If the button doesn't open the app, update HIS app to the latest version and try again."
            : "단추를 눌러도 열리지 않으면 HIS 앱을 최신 버전으로 업데이트한 뒤 다시 눌러 주세요."}
        </p>
      </div>
    </PaperPage>
  );
}
