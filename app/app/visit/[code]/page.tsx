import type { Metadata } from "next";
import Image from "next/image";
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

/** 수련회 포스터의 망점 과일 일곱 (사용자가 준 '2. 수련회 디자인 Assets' 그대로) — 제목 둘레에 포스터처럼 */
const FRUITS = [
  { key: "grape", w: 723, h: 1043, style: { left: "0%", top: "0%", width: "19%" }, rotate: -8, delay: "0s" },
  { key: "lime", w: 772, h: 722, style: { left: "40%", top: "0%", width: "19%" }, rotate: 4, delay: "-1.2s" },
  { key: "cherry", w: 662, h: 794, style: { right: "3%", top: "5%", width: "15%" }, rotate: 6, delay: "-2.6s" },
  { key: "pome", w: 757, h: 849, style: { left: "-4%", top: "37%", width: "19%" }, rotate: -4, delay: "-3.4s" },
  { key: "fig", w: 716, h: 866, style: { right: "-4%", top: "35%", width: "19%" }, rotate: 8, delay: "-0.7s" },
  { key: "banana", w: 960, h: 839, style: { left: "8%", bottom: "0%", width: "25%" }, rotate: -6, delay: "-4.2s" },
  { key: "olive", w: 1051, h: 769, style: { right: "3%", bottom: "1%", width: "29%" }, rotate: 3, delay: "-1.9s" },
] as const;

/** 함께하는 교회 (포스터 아래 줄 — 교회 이름은 영어 화면에서도 그대로) */
const CHURCHES = ["인랜드교회", "아미쿠스교회", "소망교회", "아름다운교회", "오렌지카운티한인교회", "에브리데이교회"] as const;

function StepBadge({ n }: { n: number }) {
  return (
    <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--r-ink)] text-[14px] font-black text-white">
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

  const place = event.place ? (en && event.place === "인랜드교회" ? "Inland Church" : event.place) : null;
  const isReunion = event.code === "reunion";

  return (
    <PaperPage homeLabel={en ? "HIS Home" : "히즈 홈"}>
      <div lang={en ? "en" : "ko"} className="reunion mx-auto flex w-full max-w-md flex-col">
        <div className="flex justify-end">
          <div className="lang-switch">
            {en ? <Link href={here} hrefLang="ko">한국어</Link> : <span aria-current="true">한국어</span>}
            {en ? <span aria-current="true">English</span> : <Link href={`${here}?lang=en`} hrefLang="en">English</Link>}
          </div>
        </div>

        {/* 포스터 한 장: 분홍 바탕 위 크림 종이, 망점 과일이 제목을 둘러싼다 */}
        <section className="r-pink mt-5 rounded-[32px] p-3">
          <div className="r-cream overflow-hidden rounded-[24px] px-5 pb-6 pt-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                {startMs !== null && (
                  <p className="text-[19px] font-black tracking-[-0.01em]">
                    <span className="r-hl">{en ? dayLabel(startMs, true).toUpperCase() : dayLabel(startMs, false)}</span>
                  </p>
                )}
                <p className="mt-1.5 text-[14px] font-bold leading-snug">{[startMs !== null ? timeRange(startMs, endMs, en) : null, place].filter(Boolean).join(" · ")}</p>
              </div>
              <p className="shrink-0 pt-1 text-[13px] font-black tracking-[0.04em]">{en ? "JOHN 15:5" : "요한복음 15:5"}</p>
            </div>

            {isReunion ? (
              <div className="relative mt-4 aspect-[1/1.2] w-full">
                {FRUITS.map((fruit) => (
                  <Image
                    key={fruit.key}
                    src={`/reunion/fruit-${fruit.key}.png`}
                    width={fruit.w}
                    height={fruit.h}
                    alt=""
                    aria-hidden="true"
                    className="r-fruit"
                    style={{ ...fruit.style, rotate: `${fruit.rotate}deg`, animationDelay: fruit.delay }}
                    priority
                  />
                ))}
                <div className="absolute inset-x-[10%] top-[23%] flex flex-col items-center">
                  <p className="text-[13px] font-extrabold tracking-[0.02em]">{en ? "Retreat Reunion Service" : "연합수련회 리유니온 예배"}</p>
                  <h1 className="mt-1 w-full">
                    <Image src="/reunion/title.png" width={1821} height={879} alt={en ? "Fruitfulness Reunion" : "열매맺음 리유니온"} className="h-auto w-full" priority />
                  </h1>
                  <p className="mt-2 text-center text-[14px] font-semibold leading-relaxed">
                    {en ? (
                      <>
                        Fruit is proof not of effort,
                        <br />
                        but of <b className="font-black">union</b>.
                      </>
                    ) : (
                      <>
                        열매는 노력의 증거가
                        <br />
                        아닌 <b className="font-black">연합</b>의 증거
                      </>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <h1 className="page-title mt-6 text-[34px]">{titleOf(event, en)}</h1>
            )}

            <p className="mt-5 font-serif text-[15px] leading-[1.75]">
              {en
                ? "“I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit; apart from me you can do nothing.”"
                : "나는 포도나무요 너희는 가지니 저가 내 안에, 내가 저 안에 있으면 이 사람은 과실을 많이 맺나니 나를 떠나서는 너희가 아무 것도 할 수 없음이라"}
            </p>

            {isReunion && (
              <div className="mt-6 flex items-end gap-3">
                <p className="flex-1 text-[14px] font-bold leading-[1.9]">
                  {CHURCHES.map((name, index) => (
                    <span key={name}>
                      {index > 0 && <span className="r-soft px-1.5" aria-hidden="true">·</span>}
                      <span className="whitespace-nowrap">{name}</span>
                    </span>
                  ))}
                </p>
                <div className="flex shrink-0 items-end" aria-hidden="true">
                  {(["lamb", "dove"] as const).map((animal, index) => (
                    <Image
                      key={animal}
                      src={`/reunion/pet-${animal}.svg`}
                      width={40}
                      height={52}
                      unoptimized
                      alt=""
                      className="r-pixel r-pet h-auto w-9"
                      style={{ animationDelay: `${index * -1.2}s`, ...(animal === "dove" ? { scale: "-1 1" } : {}) }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 앱으로 함께 */}
        <section className="mt-10">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h2 className="text-[24px] font-black leading-snug tracking-[-0.03em]">
                {en ? "Join us in the HIS app" : (<>HIS 앱으로<br />함께해요</>)}
              </h2>
              <p className="r-soft mt-2 text-[16px] font-semibold leading-relaxed">
                {en ? "The order of worship, today's schedule and the Word — together." : "순서지 · 오늘 일정 · 말씀을 앱에서 함께 봐요."}
              </p>
            </div>
            <span className="r-stamp size-16 shrink-0 text-[14px]" aria-hidden="true">
              {en ? "VISIT" : "방문"}
            </span>
          </div>

          <div className="r-pink mt-5 rounded-[24px] p-5">
            <h3 className="flex items-center gap-3 text-[17px] font-black">
              <StepBadge n={1} />
              {en ? "Get the app" : "앱 받기"}
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="r-btn r-btn-soft px-3 text-[15px]">
                App Store
              </a>
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="r-btn r-btn-soft px-3 text-[15px]">
                Google Play
              </a>
            </div>
          </div>

          <div className="r-pink mt-3 rounded-[24px] p-5">
            <h3 className="flex items-center gap-3 text-[17px] font-black">
              <StepBadge n={2} />
              {en ? "Open in the app" : "앱에서 열기"}
            </h3>
            <a href={deepLink} className="r-btn mt-4 w-full text-[17px]">
              {en ? "Open in HIS app" : "HIS 앱에서 열기"}
            </a>
            <p className="r-soft mt-3 text-[15px] leading-relaxed">
              {joinOpen
                ? en
                  ? "After installing, scan this QR code again or tap the button. You can start right away — no approval wait."
                  : "앱을 받은 뒤 이 QR을 한 번 더 찍거나 이 단추를 눌러 주세요. 승인을 기다리지 않고 바로 시작해요."
                : en
                  ? "After installing, scan this QR code again or tap the button to sign up in the app."
                  : "앱을 받은 뒤 이 QR을 한 번 더 찍거나 이 단추를 눌러 앱에서 가입해 주세요."}
            </p>
          </div>
        </section>

        {/* 앱의 내 방: 펫 다섯과 리유니온 열매 가구 (앱의 도트 그림 그대로) */}
        {isReunion && (
          <section className="mt-10">
            <div className="r-pink overflow-hidden rounded-[24px]">
              <Image
                src="/reunion/room.svg"
                width={528}
                height={388}
                unoptimized
                alt={en ? "Pets relaxing in a room decorated with the reunion fruit furniture" : "리유니온 열매 가구로 꾸민 방에서 쉬는 펫들"}
                className="r-pixel h-auto w-full"
              />
            </div>
            <h2 className="mt-5 text-[20px] font-black leading-snug tracking-[-0.02em]">
              {en ? "Meet your pet in the app" : "앱에서 내 펫을 만나요"}
            </h2>
            <p className="r-soft mt-2 text-[15px] leading-relaxed">
              {en
                ? "Raise your own pet and decorate its room. Tap “I'm going” on the reunion event in the app, and after the service you'll get the fruit furniture as a gift."
                : "나만의 펫을 키우고 방을 꾸며요. 앱의 리유니온 일정에서 '참여해요'를 누르면 예배가 끝난 뒤 열매 가구를 선물로 드려요."}
            </p>
          </section>
        )}

        <section className="mt-12">
          <h2 className="text-[24px] font-black tracking-[-0.03em]">
            <span className="r-hl">{en ? "Order of Worship" : "순서지"}</span>
          </h2>
          {bulletins.length === 0 ? (
            <p className="r-cream r-soft mt-4 rounded-[24px] px-5 py-6 text-[16px] leading-relaxed">
              {en ? "The order of worship will be posted here before the service." : "순서지는 예배 전에 여기 올라와요."}
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-8">
              {bulletins.map((bulletin) => {
                const ms = bulletinMs(bulletin.start_at);
                const preacher = preacherOf(bulletin.data);
                return (
                  <article key={bulletin.id} className="r-cream rounded-[28px] p-3">
                    <header className="px-3 pb-4 pt-3">
                      {Number.isFinite(ms) && (
                        <p className="text-[14px] font-extrabold">
                          {dayLabel(ms, en)} · {timeRange(ms, null, en)}
                        </p>
                      )}
                      {bulletin.title.trim() !== "" && <h3 className="mt-1.5 font-serif text-[24px] leading-[1.4]">{bulletin.title}</h3>}
                      {bulletin.subtitle && <p className="r-soft mt-1 text-[15px]">{bulletin.subtitle}</p>}
                      {preacher !== "" && <p className="r-soft mt-2 text-[15px] font-bold">{en ? `Sermon · ${preacher}` : `설교 · ${preacher}`}</p>}
                    </header>
                    <BulletinSheet data={bulletin.data} en={en} />
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <p className="r-soft mt-12 text-[13px] leading-relaxed">
          {en
            ? "If the button doesn't open the app, update HIS app to the latest version and try again."
            : "단추를 눌러도 열리지 않으면 HIS 앱을 최신 버전으로 업데이트한 뒤 다시 눌러 주세요."}
        </p>
      </div>
    </PaperPage>
  );
}
