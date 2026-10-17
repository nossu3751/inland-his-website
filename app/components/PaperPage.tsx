import Link from "next/link";
import { HisMark } from "./site/HisMark";

// 책 밖의 한 장: 위에 천 표지 띠 (His → 홈), 아래에 종이 한 장
export function PaperPage({ children, light = false, homeLabel = "히즈 홈" }: { children: React.ReactNode; light?: boolean; homeLabel?: string }) {
  return (
    <div className={`flex min-h-screen flex-col ${light ? "paper-light" : ""}`}>
      <header className="cloth">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" aria-label={homeLabel}>
            <HisMark id="his-sheet" className="h-9 w-auto text-[var(--brand)]" />
          </Link>
          <Link href="/" className="text-[14px] font-bold text-[var(--soft)] no-underline hover:text-[var(--ink)]">
            {homeLabel}
          </Link>
        </div>
      </header>
      <main className="sheet mx-auto w-full max-w-4xl flex-1">{children}</main>
    </div>
  );
}
