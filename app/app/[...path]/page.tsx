import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicEventTitle, getPublicPostTitle } from "./lookup";
import { PaperPage } from "../../components/PaperPage";

// HIS 앱 공유 링크가 도착하는 페이지.
//   https://www.inlandhis.com/app/post/<게시글 id>
//   https://www.inlandhis.com/app/event?id=<회차 id>&eventId=<이벤트 id>
//   https://www.inlandhis.com/app/letgo/<초대 번호>  (내려놓기 방 링크 초대 → 앱 /letgo/join?code=…)
//   https://www.inlandhis.com/app/booth/remote?c=<연결 번호>  (인생네컷 부스의 리모컨 QR → 앱 /booth/remote?c=…)
//   https://www.inlandhis.com/app/play/<게임>/<초대 번호>  (같이 놀기 초대 — 말씀 씨름 · 말씀 OX · 양 오목 → 앱 /pet/join?code=…)
// 카카오톡·문자는 앱 전용 주소(inlandhisapp://)를 링크로 만들어 주지 않아서, 앱은 이 https 주소를 공유하고
// 이 페이지의 버튼이 앱을 연다. 앱이 없으면 스토어로 안내한다.
// (다음 앱 스토어 배포에서 유니버설 링크를 붙이면, 앱이 설치된 사람은 이 페이지 없이 바로 앱이 열린다.)

const APP_SCHEME = "inlandhisapp";
const APP_STORE_URL =
  "https://apps.apple.com/us/app/%ED%9E%88%EC%A6%88%EC%95%B1/id6746176604";
// 주소에 들어오는 값은 그대로 앱 주소가 되므로 id 모양(영문·숫자·-)만 받는다
const ID_PATTERN = /^[A-Za-z0-9-]{1,64}$/;
// 내려놓기 방 초대 번호 (앱 lib/app-link.ts 와 같은 모양: 영문 · 숫자만)
const LETGO_CODE_PATTERN = /^[A-Za-z0-9]{1,32}$/;
// 인생네컷 리모컨 연결 번호 (앱 lib/booth/session.ts isPairCode 와 같은 모양: 헷갈리는 0 O 1 I 없이 6자)
const BOOTH_PAIR_PATTERN = /^[A-HJ-NP-Z2-9]{6}$/;
// 같이 놀기 초대 (앱 lib/pet/game-invite.ts · lib/app-link.ts 와 같은 모양: 게임 셋, 번호는 영문 소문자 · 숫자 12자)
const PLAY_CODE_PATTERN = /^[a-z0-9]{12}$/;
const PLAY_GAMES: Record<string, string> = { wrestle: "말씀 씨름", ox: "말씀 OX", omok: "양 오목" };

type Props = {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// title: 전체공개 글·공개 일정일 때만 (그 밖에는 null → 일반 문구). heading · body · description: 그 링크만의 문구 (없으면 일반 문구)
type Target = { label: string; deepLink: string; title: string | null; heading?: string; body?: string; description?: string };

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

async function resolveTarget(
  path: string[],
  search: { [key: string]: string | string[] | undefined },
): Promise<Target | null> {
  if (path[0] === "post" && path.length === 2 && ID_PATTERN.test(path[1])) {
    return {
      label: "게시글",
      deepLink: `${APP_SCHEME}:///post/${path[1]}`,
      title: await getPublicPostTitle(path[1]),
    };
  }
  if (path[0] === "letgo" && path.length === 2 && LETGO_CODE_PATTERN.test(path[1])) {
    // 방 이름은 미리 보여 주지 않는다 (교인끼리의 방 — 앱에서 로그인한 뒤에 보인다)
    return {
      label: "내려놓기 방",
      deepLink: `${APP_SCHEME}:///letgo/join?code=${path[1]}`,
      title: null,
    };
  }
  if (path[0] === "booth" && path[1] === "remote" && path.length === 2) {
    const code = first(search.c);
    if (!code || !BOOTH_PAIR_PATTERN.test(code)) return null;
    return {
      label: "인생네컷 리모컨",
      deepLink: `${APP_SCHEME}:///booth/remote?c=${code}`,
      title: null,
    };
  }
  if (path[0] === "play" && path.length === 3 && Object.hasOwn(PLAY_GAMES, path[1]) && PLAY_CODE_PATTERN.test(path[2])) {
    // 누가 불렀는지는 보여 주지 않는다 (교인끼리의 놀이 — 앱에서 로그인한 뒤에 보인다). 게임 이름만
    return {
      label: "놀이 초대",
      deepLink: `${APP_SCHEME}:///pet/join?code=${path[2]}`,
      title: `${PLAY_GAMES[path[1]]} 초대`,
      heading: "HIS 앱에서 같이 놀아요",
      body: "아래 단추를 누르면 HIS 앱에서 초대 화면이 바로 열려요. 누가 불렀는지는 앱에서 보여요.",
      description: "교회 친구가 HIS 앱 펫 놀이에 초대했어요. 눌러서 같이 해요.",
    };
  }
  if (path[0] === "event" && path.length === 1) {
    const id = first(search.id);
    const eventId = first(search.eventId);
    if (!id || !ID_PATTERN.test(id)) return null;
    const query = new URLSearchParams({ id });
    const hasEventId = !!eventId && ID_PATTERN.test(eventId);
    if (hasEventId) query.set("eventId", eventId);
    return {
      label: "일정",
      deepLink: `${APP_SCHEME}:///event?${query}`,
      title: hasEventId ? await getPublicEventTitle(eventId) : null,
    };
  }
  return null;
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const target = await resolveTarget((await params).path, await searchParams);
  const title = target
    ? (target.title ?? `HIS 앱에서 ${target.label} 보기`)
    : "HIS 앱";
  const description =
    target?.description ??
    (target?.title ? `HIS 앱에 올라온 ${target.label}이에요. 눌러서 앱에서 열어보세요.` : "인랜드 히즈 청년부 앱에서 열어보세요.");
  return {
    metadataBase: new URL("https://www.inlandhis.com"),
    title,
    description,
    // 공유 링크마다 다른 주소라 검색에는 올리지 않는다
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      siteName: "Inland His Church",
      images: [{ url: "/favicon/web-app-manifest-512x512.png", width: 512, height: 512 }],
    },
  };
}

export default async function OpenInAppPage({ params, searchParams }: Props) {
  const target = await resolveTarget((await params).path, await searchParams);
  if (!target) notFound();

  return (
    <PaperPage>
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <Image src="/app/app-icon.png" alt="HIS 앱" width={96} height={96} className="size-24 rounded-[22px] shadow-[0_12px_24px_-12px_rgb(31_26_41/0.5)]" priority />
        <h1 className="page-title mt-7 text-[30px]">{target.heading ?? `HIS 앱에서 ${target.label} 보기`}</h1>
        {target.title && (
          <p className="mt-5 w-full rounded-2xl bg-[var(--paper)] px-5 py-4 font-serif text-[18px] leading-relaxed">{target.title}</p>
        )}
        <p className="mt-4 text-[16px] leading-relaxed text-[var(--soft)]">
          {target.body ?? `아래 단추를 누르면 HIS 앱에서 이 ${target.label}이 바로 열려요.`}
        </p>
        <a href={target.deepLink} className="btn btn-primary mt-8 w-full justify-center text-[17px]">
          HIS 앱에서 열기
        </a>

        <p className="mt-14 text-[15px] font-extrabold">아직 앱이 없다면</p>
        <div className="mt-4 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ink w-full justify-center sm:w-auto">
            App Store에서 받기
          </a>
          <span className="flex items-center gap-3">
            <span className="btn btn-quiet cursor-default opacity-60" aria-disabled="true">Google Play</span>
            <span className="stamp">곧 열려요</span>
          </span>
        </div>

        <p className="mt-10 text-[13px] leading-relaxed text-[var(--faint)]">
          단추를 눌러도 열리지 않으면 HIS 앱을 최신 버전으로 업데이트한 뒤 다시 눌러 주세요.
        </p>
      </div>
    </PaperPage>
  );
}
