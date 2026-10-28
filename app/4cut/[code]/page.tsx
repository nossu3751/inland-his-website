import type { Metadata } from "next";
import Link from "next/link";
import { PaperPage } from "../../components/PaperPage";
import { getBoothShot } from "./lookup";
import { BoothReceive } from "./BoothReceive";

// 인생네컷 사진 받기: https://www.inlandhis.com/4cut/<번호>
// 앱의 부스(태블릿)가 결과 화면에 QR 로 보이는 주소. 앱 링크(/app/…) 밖이라 손님 폰에서는 앱이 아니라 이 페이지가 열린다
// — 앱이 없는 사람도 받는다. 사진은 7일 뒤 서버에서 지워진다.
// 2026-10-22: 사진과 움직이는 네컷(영상)을 한 페이지에서 둘 다 받는다 (부스의 사진 · 영상 탭은 없앴다).

type Props = { params: Promise<{ code: string }> };

export const metadata: Metadata = {
  metadataBase: new URL("https://www.inlandhis.com"),
  title: "인생네컷 · HIS",
  description: "히즈 인생네컷 부스에서 찍은 사진이에요.",
  // 번호마다 다른 주소 · 얼굴 사진이라 검색에 올리지 않고, 링크 미리보기에도 사진을 싣지 않는다
  robots: { index: false, follow: false },
  openGraph: {
    title: "인생네컷 · HIS",
    description: "히즈 인생네컷 부스에서 찍은 사진이에요.",
    siteName: "Inland His Church",
    images: [{ url: "/favicon/web-app-manifest-512x512.png", width: 512, height: 512 }],
  },
};

const day = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { month: locale === "ko-KR" ? "long" : "short", day: "numeric", timeZone: "America/Los_Angeles" }).format(new Date(iso));

export default async function BoothShotPage({ params }: Props) {
  const { code } = await params;
  const lookup = await getBoothShot(code);

  // 서버를 잠깐 읽지 못했다 (행사장 와이파이 · 서버) — 지워졌다고 하지 않고 다시 열게
  if (lookup.kind === "error") {
    return (
      <PaperPage>
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <h1 className="page-title text-[30px]">잠깐 불러오지 못했어요</h1>
          <p className="mt-5 text-[16px] leading-relaxed text-[var(--soft)]">
            사진은 그대로 있어요. 잠시 뒤 다시 열어 주세요.
            <br />
            Couldn’t load your photo just now. Please try again.
          </p>
          {/* 같은 주소를 새로 연다 (서버에서 다시 읽는다) */}
          <a href={`/4cut/${code}`} className="btn mt-8 justify-center bg-[#D9573A] px-8 text-[16px] font-black text-white no-underline hover:bg-[#C2482C]">
            다시 열기
          </a>
        </div>
      </PaperPage>
    );
  }

  if (lookup.kind === "missing") {
    return (
      <PaperPage>
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <h1 className="page-title text-[30px]">사진을 찾을 수 없어요</h1>
          <p className="mt-5 text-[16px] leading-relaxed text-[var(--soft)]">
            7일이 지나 지워졌거나, 주소가 달라요.
            <br />
            This photo has expired or the link is wrong.
          </p>
        </div>
      </PaperPage>
    );
  }

  const { shot } = lookup;
  // 시안(받기 웹페이지): "할렐루야 나잇 인생네컷" + 찍은 날
  const label = shot.eventLabel ?? "히즈";
  return (
    <PaperPage>
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <h1 className="page-title text-[30px]">{label} 인생네컷</h1>
        <p className="mt-2 text-[16px] font-bold text-[var(--soft)]">{day(shot.takenAt, "ko-KR")}</p>
        {/* 사진 · 움직이는 네컷을 나란히, 저장 단추는 각각 (움직이는 네컷이 없는 사진은 사진만) */}
        <BoothReceive
          code={code}
          label={label}
          photoUrl={shot.photoUrl}
          downloadUrl={shot.downloadUrl}
          clipUrls={shot.clipUrls}
          clipFps={shot.clipFps}
          clipPending={shot.clipPending}
          clipWaitUntil={shot.clipWaitUntil}
        />
        <p className="mt-6 text-[14px] leading-relaxed text-[var(--faint)]">
          {day(shot.expiresAt, "ko-KR")}까지 받을 수 있어요. 그 뒤에는 지워져요.
          <br />
          Save it by {day(shot.expiresAt, "en-US")} — it’s deleted after that.
        </p>
        <Link href="/#app" className="mt-10 text-[15px] font-extrabold text-[var(--soft)] no-underline hover:text-[var(--ink)]">
          히즈 앱에서 더 보기 →
        </Link>
      </div>
    </PaperPage>
  );
}
