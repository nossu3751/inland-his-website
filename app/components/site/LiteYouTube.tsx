"use client";

import { useState } from "react";
import { HisMark } from "./HisMark";

// 누르기 전에는 얇은 띠만, 누르면 그 자리에서 영상이 열린다 (유튜브는 그때 불러온다)
export function LiteYouTube({ id, title, playLabel }: { id: string; title: string; playLabel: string }) {
  const [playing, setPlaying] = useState(false);
  if (playing) {
    return (
      <iframe
        className="block aspect-video w-full"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return (
    <button type="button" onClick={() => setPlaying(true)} className="video-bar group" aria-label={`${playLabel}: ${title}`}>
      <HisMark id="his-video" className="h-12 w-auto shrink-0 text-[var(--brand)] sm:h-14" />
      <span className="flex-1 text-left text-[clamp(18px,1.8vw,22px)] font-extrabold tracking-[-0.02em] text-[var(--ink)]">{title}</span>
      <span className="video-play" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="ml-0.5 size-6" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z" /></svg>
      </span>
    </button>
  );
}
