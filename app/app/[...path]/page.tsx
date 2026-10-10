import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

// HIS 앱 공유 링크가 도착하는 페이지.
//   https://www.inlandhis.com/app/post/<게시글 id>
//   https://www.inlandhis.com/app/event?id=<회차 id>&eventId=<이벤트 id>
// 카카오톡·문자는 앱 전용 주소(inlandhisapp://)를 링크로 만들어 주지 않아서, 앱은 이 https 주소를 공유하고
// 이 페이지의 버튼이 앱을 연다. 앱이 없으면 스토어로 안내한다.
// (다음 앱 스토어 배포에서 유니버설 링크를 붙이면, 앱이 설치된 사람은 이 페이지 없이 바로 앱이 열린다.)

const APP_SCHEME = "inlandhisapp";
const APP_STORE_URL =
  "https://apps.apple.com/us/app/%ED%9E%88%EC%A6%88%EC%95%B1/id6746176604";
// 주소에 들어오는 값은 그대로 앱 주소가 되므로 id 모양(영문·숫자·-)만 받는다
const ID_PATTERN = /^[A-Za-z0-9-]{1,64}$/;

type Props = {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type Target = { label: string; deepLink: string };

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function resolveTarget(
  path: string[],
  search: { [key: string]: string | string[] | undefined },
): Target | null {
  if (path[0] === "post" && path.length === 2 && ID_PATTERN.test(path[1])) {
    return { label: "게시글", deepLink: `${APP_SCHEME}:///post/${path[1]}` };
  }
  if (path[0] === "event" && path.length === 1) {
    const id = first(search.id);
    const eventId = first(search.eventId);
    if (!id || !ID_PATTERN.test(id)) return null;
    const query = new URLSearchParams({ id });
    if (eventId && ID_PATTERN.test(eventId)) query.set("eventId", eventId);
    return { label: "일정", deepLink: `${APP_SCHEME}:///event?${query}` };
  }
  return null;
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const target = resolveTarget((await params).path, await searchParams);
  const title = target ? `HIS 앱에서 ${target.label} 보기` : "HIS 앱";
  const description = "인랜드 히즈 청년부 앱에서 열어보세요.";
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
  const target = resolveTarget((await params).path, await searchParams);
  if (!target) notFound();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#2d1054] via-[#1a0a2e] to-[#0d0518] text-white">
      <div className="max-w-md mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center">
        <Image
          src="/favicon/web-app-manifest-192x192.png"
          alt="HIS 앱"
          width={80}
          height={80}
          className="w-20 h-20 rounded-2xl"
          priority
        />
        <h1 className="mt-6 text-2xl font-bold tracking-tight">
          HIS 앱에서 {target.label} 보기
        </h1>
        <p className="mt-3 text-white/60 leading-relaxed">
          아래 버튼을 누르면 HIS 앱에서 이 {target.label}이 바로 열려요.
        </p>

        <a
          href={target.deepLink}
          className="mt-8 w-full inline-flex items-center justify-center rounded-xl bg-primary px-6 py-4 text-base font-bold text-white hover:bg-primary/90 transition-colors"
        >
          HIS 앱에서 열기
        </a>

        <div className="mt-10 w-full border-t border-white/10 pt-8">
          <p className="text-sm text-white/50">아직 앱이 없다면</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white text-sm px-4 py-3 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Image
                src="/apple-logo.png"
                alt=""
                width={18}
                height={18}
                className="w-[18px] h-[18px]"
              />
              App Store에서 받기
            </a>
            <span className="relative inline-flex items-center justify-center gap-2 bg-white/5 text-white/30 text-sm px-4 py-3 rounded-lg cursor-not-allowed select-none">
              <Image
                src="/play-logo.png"
                alt=""
                width={18}
                height={18}
                className="w-[18px] h-[18px] opacity-30"
              />
              Play Store
              <span className="absolute -top-2 -right-2 text-[10px] font-semibold bg-primary/80 text-white px-1.5 py-0.5 rounded-full leading-none">
                Soon
              </span>
            </span>
          </div>
        </div>

        <p className="mt-8 text-xs text-white/40 leading-relaxed">
          버튼을 눌러도 열리지 않으면 HIS 앱을 최신 버전으로 업데이트한 뒤 다시
          눌러주세요.
        </p>
      </div>
    </section>
  );
}
