"use client";

import { useEffect, useRef, useState } from "react";

// 사진 저장 · 보내기.
// 아이폰: 사파리는 사진 파일을 공유 창으로만 사진첩에 넣을 수 있다 → 공유 창("이미지 저장").
//   공유 창은 누른 순간에 바로 불러야 해서(기다리면 막힌다) 사진 파일을 미리 받아 둔다.
// 안드로이드 · 컴퓨터: 내려받기 주소로 바로 저장.
// 보내기: 파일을 보낼 수 있으면 사진으로, 아니면 이 페이지 주소로, 그것도 안 되면 주소 복사.

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export function SaveButtons({ photoUrl, downloadUrl, pageUrl }: { photoUrl: string; downloadUrl: string; pageUrl: string }) {
  const file = useRef<File | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(photoUrl)
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (alive && blob) file.current = new File([blob], "his-4cut.jpg", { type: "image/jpeg" });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [photoUrl]);

  const canShareFile = () => !!file.current && typeof navigator.canShare === "function" && navigator.canShare({ files: [file.current] });

  const save = async () => {
    setNote(null);
    if (isIOS() && canShareFile() && file.current) {
      try {
        await navigator.share({ files: [file.current] });
      } catch (error) {
        if ((error as Error)?.name !== "AbortError") setNote("사진을 길게 눌러 '사진 앱에 저장'을 골라 주세요");
      }
      return;
    }
    if (isIOS()) {
      setNote("사진을 길게 눌러 '사진 앱에 저장'을 골라 주세요");
      return;
    }
    window.location.href = downloadUrl;
  };

  const send = async () => {
    setNote(null);
    try {
      if (canShareFile() && file.current) await navigator.share({ files: [file.current] });
      else if (typeof navigator.share === "function") await navigator.share({ url: pageUrl });
      else {
        await navigator.clipboard.writeText(pageUrl);
        setNote("주소를 복사했어요");
      }
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") setNote("보내지 못했어요. 사진을 저장해서 보내 주세요");
    }
  };

  return (
    <div className="w-full">
      <div className="flex w-full gap-3">
        <button type="button" onClick={save} className="btn btn-primary flex-1 justify-center text-[17px]">
          사진 저장
        </button>
        <button type="button" onClick={send} className="btn btn-quiet justify-center px-7 text-[17px]">
          보내기
        </button>
      </div>
      <p aria-live="polite" className="mt-3 min-h-[22px] text-center text-[14px] font-bold text-[var(--soft)]">
        {note}
      </p>
    </div>
  );
}
