"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// 인생네컷 받기 (시안 "받기 웹페이지": 사진 띠 + 사진 저장 · 움직이는 띠 + 영상 저장, 2026-10-22 사용자 "스캔해서 이동한 페이지에서 사진 영상 둘 다").
// 사진 저장 — 아이폰: 사파리는 사진 파일을 공유 창으로만 사진첩에 넣을 수 있다 → 공유 창("이미지 저장").
//   공유 창은 누른 순간에 바로 불러야 해서(기다리면 막힌다) 파일을 미리 받아 둔다. 안드로이드 · 컴퓨터: 내려받기.
// 영상 — 부스가 올린 움직이는 네컷 그림(1초에 fps 장)을 캔버스에 넘겨 보이면서, 그 캔버스를 이 폰에서 영상 파일로 녹화해 둔다
//   (MediaRecorder: 아이폰 mp4, 안드로이드 크롬 mp4 나 webm). 저장은 사진과 같은 길(아이폰 공유 창 · 그 밖은 내려받기).

/** 영상 = 움직이는 네컷을 이만큼 되풀이 (2.5초 × 2) */
const VIDEO_LOOPS = 2;
/** 움직이는 네컷이 올라왔나 다시 읽는 간격 */
const POLL_MS = 4000;
const CORAL = "bg-[#D9573A] text-white hover:bg-[#C2482C]";
const BROWN = "bg-[#3B1409] text-white hover:bg-[#2A0E06]";

/**
 * 앱 안 브라우저 (카카오톡 · 네이버 · 인스타그램 · 페이스북 · 라인 — 링크를 그 앱에서 열었을 때): 파일 저장 · 공유가 조용히 안 된다
 * (카카오는 blob 내려받기가 토스트만 뜨고 저장 안 됨). 휴대폰 브라우저로 보낸다 — 카카오는 바로 여는 주소, 라인은 주소 뒤 표시, 나머지는 안내.
 */
function inAppBrowser(): "kakao" | "line" | "other" | null {
  const ua = navigator.userAgent;
  if (/KAKAOTALK/i.test(ua)) return "kakao";
  if (/\bLine\//i.test(ua)) return "line";
  if (/NAVER\(inapp|Instagram|FBAN|FBAV|FB_IAB|DaumApps|everytimeApp/i.test(ua)) return "other";
  return null;
}

/** 브라우저 이름은 바뀌지 않는다 (서버에서 그릴 때는 없음) */
const noSubscribe = () => () => {};

function OpenInBrowser() {
  const kind = useSyncExternalStore(noSubscribe, inAppBrowser, () => null);
  const [copied, setCopied] = useState(false);
  if (!kind) return null;
  const open = () => {
    const here = window.location.href;
    if (kind === "kakao") window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(here)}`;
    else if (kind === "line") window.location.href = `${here}${here.includes("?") ? "&" : "?"}openExternalBrowser=1`;
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="mt-6 w-full rounded-2xl bg-[#3B1409] px-4 py-3.5 text-left text-white">
      <p className="break-keep text-[15px] font-extrabold leading-snug">이 화면에서는 저장이 안 될 수 있어요</p>
      <p className="mt-1 break-keep text-[14px] font-semibold leading-snug text-white/80">
        {kind === "other" ? "오른쪽 위 ⋯ 를 눌러 'Safari 로 열기' · '브라우저로 열기'를 골라 주세요" : "휴대폰 브라우저에서 열면 사진 · 영상을 저장할 수 있어요"}
      </p>
      <div className="mt-3 flex gap-2">
        {kind !== "other" && (
          <button type="button" onClick={open} className="btn justify-center bg-white px-4 text-[15px] font-black text-[#3B1409]">
            브라우저에서 열기
          </button>
        )}
        <button type="button" onClick={copy} className="btn justify-center bg-white/15 px-4 text-[15px] font-black text-white">
          {copied ? "주소를 복사했어요" : "주소 복사"}
        </button>
      </div>
    </div>
  );
}

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const canShareFile = (file: File | null): file is File =>
  !!file && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

/**
 * 이 브라우저가 캔버스를 녹화할 수 있는 영상 형식 (H.264 mp4 먼저 — 아이폰 사진 앱 · 메시지가 잘 받는다).
 * 레벨 4.0(42E028) 먼저: 레벨 3.0(42E01E)은 480×1440 이 한도를 넘어 안드로이드 하드웨어 인코더가 거부할 수 있고,
 * 'video/mp4' 만 주면 크롬은 VP9 를 담아 아이폰에서 못 연다 (2026-10-22 점검 · 크롬 · WKWebView 로 확인). 앱의 lib/booth/clip-video.ts 와 같은 차례.
 */
type VideoType = { mime: string; type: string; ext: string };
const VIDEO_MIMES = ["video/mp4;codecs=avc1.42E028", "video/mp4;codecs=avc1.4D0028", "video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp8", "video/webm;codecs=vp9", "video/webm"];
/**
 * 녹화해 볼 형식 차례: 되는 mp4 하나, 안 되면 webm 하나 — 안드로이드 크롬은 H.264 를 하드웨어 인코더로만 녹화해
 * 그 크기를 못 받는 폰이 있다. 그때는 webm(VP8, 소프트웨어라 늘 된다)으로 한 번 더.
 */
function videoTypes(): VideoType[] {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") return [];
  const supported = VIDEO_MIMES.filter((mime) => MediaRecorder.isTypeSupported(mime));
  const isMp4 = (mime: string) => mime.startsWith("video/mp4");
  return [supported.find(isMp4), supported.find((mime) => !isMp4(mime))]
    .filter((mime): mime is string => !!mime)
    .map((mime) => ({ mime, type: isMp4(mime) ? "video/mp4" : "video/webm", ext: isMp4(mime) ? "mp4" : "webm" }));
}

/** 파일 저장: 아이폰은 공유 창, 그 밖은 내려받기 (주소가 있으면 그 주소, 없으면 파일 그대로) */
async function saveFile(file: File | null, downloadUrl: string | null, iosHint: string): Promise<string | null> {
  if (isIOS()) {
    if (!canShareFile(file)) return iosHint;
    try {
      await navigator.share({ files: [file] });
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") return iosHint;
    }
    return null;
  }
  if (downloadUrl) {
    window.location.href = downloadUrl;
    return null;
  }
  if (!file) return null;
  const href = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = href;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 30_000);
  return null;
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v11" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function SaveButton({ label, onClick, disabled, tone }: { label: string; onClick: () => void; disabled?: boolean; tone: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`btn w-full justify-center gap-2 px-3 text-[16px] font-black disabled:cursor-default disabled:opacity-55 disabled:hover:translate-y-0 ${tone}`}
    >
      {!disabled && <DownloadIcon />}
      {label}
    </button>
  );
}

type ClipState = "loading" | "encoding" | "ready" | "unsupported" | "failed";

/**
 * 움직이는 네컷: 그림을 다 받으면 캔버스에 넘겨 보이고, 처음 VIDEO_LOOPS 바퀴를 녹화해 영상 파일로 (onFile).
 * 녹화가 안 되는 브라우저는 보이기만 한다.
 */
function ClipCanvas({ urls, fps, label, onFile, onState }: { urls: string[]; fps: number; label: string; onFile: (file: File) => void; onState: (state: ClipState) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const key = urls.join("|");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let timer: number | undefined;
    let recorder: MediaRecorder | null = null;
    onState("loading");
    const images = key.split("|").map((url) => {
      const image = new Image();
      // 캔버스를 녹화하려면 다른 곳(저장소) 그림도 허락받고 그려야 한다 (안 그러면 캔버스가 막힌다)
      image.crossOrigin = "anonymous";
      image.src = url;
      return image;
    });
    Promise.all(images.map((image) => image.decode()))
      .then(() => {
        if (cancelled) return;
        canvas.width = images[0].naturalWidth;
        canvas.height = images[0].naturalHeight;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("canvas");
        let drawn = 0;
        const draw = () => {
          context.drawImage(images[drawn % images.length], 0, 0, canvas.width, canvas.height);
          drawn += 1;
        };
        draw();
        const types = typeof canvas.captureStream === "function" ? videoTypes() : [];
        /** 지금 녹화를 시작한 때의 장 수 (다시 녹화하면 거기부터 VIDEO_LOOPS 바퀴) */
        let startDrawn = 0;
        // 형식 하나로 녹화 — 실패하면(만들기 · 시작이 거부되거나 · 도중 오류 · 빈 파일) 다음 형식으로, 다 안 되면 보이기만
        const record = (index: number) => {
          const type = types[index];
          if (!type) {
            recorder = null;
            onState("unsupported");
            return;
          }
          const stream = canvas.captureStream(fps);
          const chunks: Blob[] = [];
          let failed = false;
          const stopTracks = () => stream.getTracks().forEach((track) => track.stop());
          const next = () => {
            if (failed || cancelled) return;
            failed = true;
            stopTracks();
            record(index + 1);
          };
          let current: MediaRecorder;
          try {
            current = new MediaRecorder(stream, { mimeType: type.mime, videoBitsPerSecond: 6_000_000 });
          } catch {
            next();
            return;
          }
          recorder = current;
          startDrawn = drawn;
          current.ondataavailable = (event) => {
            if (event.data.size > 0) chunks.push(event.data);
          };
          current.onerror = next;
          current.onstop = () => {
            stopTracks();
            if (cancelled || failed) return;
            const blob = new Blob(chunks, { type: type.type });
            if (blob.size === 0) {
              next();
              return;
            }
            onFile(new File([blob], `his-4cut.${type.ext}`, { type: type.type }));
            onState("ready");
          };
          try {
            current.start();
          } catch {
            next();
            return;
          }
          onState("encoding");
        };
        record(0);
        // 바퀴를 다 그리면 녹화를 멈추고, 화면에서는 계속 돈다
        const total = images.length * VIDEO_LOOPS;
        timer = window.setInterval(() => {
          draw();
          if (recorder?.state === "recording" && drawn - startDrawn > total) recorder.stop();
        }, 1000 / fps);
      })
      .catch(() => {
        if (!cancelled) onState("failed");
      });
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      if (recorder?.state === "recording") recorder.stop();
    };
    // onFile · onState 는 부모의 setState (바뀌지 않는다)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, fps]);

  return <canvas ref={canvasRef} role="img" aria-label={`${label} 움직이는 인생네컷`} className="block h-auto w-full" />;
}

const FRAME_SHADOW = "shadow-[0_18px_36px_-18px_rgb(31_26_41/0.55)]";

export function BoothReceive({
  code,
  label,
  photoUrl,
  downloadUrl,
  clipUrls: firstClipUrls,
  clipFps: firstClipFps,
  clipPending: firstClipPending,
  clipWaitUntil,
}: {
  /** 사진 번호 — 움직이는 네컷을 기다리는 동안 /4cut/<번호>/clip 을 읽는다 */
  code: string;
  label: string;
  photoUrl: string;
  downloadUrl: string;
  clipUrls: string[] | null;
  clipFps: number;
  /** 움직이는 네컷이 아직 올라오는 중 (찍은 지 얼마 안 됐다) — 잠깐씩 다시 읽는다 */
  clipPending: boolean;
  /** 움직이는 네컷을 기다리는 끝 (ms) */
  clipWaitUntil: number;
}) {
  // 움직이는 네컷 (처음엔 서버가 그린 값, 기다리는 동안 /clip 으로 읽은 값)
  const [clip, setClip] = useState({ urls: firstClipUrls, fps: firstClipFps, pending: firstClipPending });
  const { urls: clipUrls, fps: clipFps, pending: clipPending } = clip;
  const photoFile = useRef<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [clipState, setClipState] = useState<ClipState>("loading");
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(photoUrl)
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (alive && blob) photoFile.current = new File([blob], "his-4cut.jpg", { type: "image/jpeg" });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [photoUrl]);

  useEffect(() => {
    if (!clipPending) return;
    // 읽힌 때만 바꾼다 (잠깐 못 읽으면 그대로 두고 다음 차례에) · 탭이 숨어 있으면 쉰다
    let alive = true;
    const read = async () => {
      // 손님 폰이 계속 못 읽어도 서버가 기다리는 때가 지나면 사진만으로
      if (Date.now() > clipWaitUntil) {
        setClip((current) => ({ ...current, pending: false }));
        return;
      }
      if (document.hidden) return;
      try {
        const res = await fetch(`/4cut/${code}/clip`, { cache: "no-store" });
        if (!res.ok) return;
        const next = (await res.json()) as { kind: string; clipUrls?: string[] | null; clipFps?: number; clipPending?: boolean };
        if (alive && next.kind === "found") setClip({ urls: next.clipUrls ?? null, fps: next.clipFps ?? 10, pending: !!next.clipPending });
      } catch {
        // 손님 폰의 네트워크가 잠깐 끊겼다 — 다음 차례에
      }
    };
    const id = window.setInterval(() => void read(), POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [clipPending, clipWaitUntil, code]);

  const savePhoto = async () => {
    setNote(null);
    setNote(await saveFile(photoFile.current, downloadUrl, "사진을 길게 눌러 '사진 앱에 저장'을 골라 주세요"));
  };
  const saveVideo = async () => {
    setNote(null);
    // 아이폰에서 파일 공유가 안 되는 곳은 대개 앱 안 브라우저 — 다시 눌러도 안 된다
    setNote(await saveFile(videoFile, null, "영상을 저장하지 못했어요. Safari 에서 열어 주세요"));
  };

  const photo = (className: string) => (
    // 저장소의 사진을 그대로 (크기를 바꾸면 화질이 떨어진다)
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photoUrl} alt={`${label} 인생네컷`} className={className} />
  );
  const noteLine = (
    <p aria-live="polite" className="mt-3 min-h-[22px] text-center text-[14px] font-bold text-[var(--soft)]">
      {note}
    </p>
  );

  // 움직이는 네컷이 없는 사진 (만들지 못했거나 예전 사진): 사진만
  if (!clipUrls && !clipPending) {
    return (
      <div className="mt-7 flex w-full flex-col items-center">
        <OpenInBrowser />
        {photo(`max-h-[68vh] w-auto max-w-full ${FRAME_SHADOW}`)}
        <div className="mt-8 w-full">
          <SaveButton label="사진 저장" onClick={savePhoto} tone={CORAL} />
        </div>
        {noteLine}
      </div>
    );
  }

  const videoLabel = !clipUrls
    ? "영상 만드는 중"
    : clipState === "ready"
      ? "영상 저장"
      : clipState === "unsupported" || clipState === "failed"
        ? "영상 저장 안 됨"
        : "영상 준비 중";
  const videoNote =
    clipState === "unsupported"
      ? "이 브라우저에서는 영상을 만들 수 없어요. 사파리나 크롬으로 열어 주세요"
      : clipState === "failed"
        ? "영상을 불러오지 못했어요. 페이지를 새로 열어 주세요"
        : null;

  return (
    <div className="mt-7 w-full">
      <OpenInBrowser />
      <div className="mt-1 grid w-full grid-cols-2 items-end gap-4">
        <div className="flex flex-col items-center gap-3.5">
          {photo(`block h-auto w-full ${FRAME_SHADOW}`)}
          <SaveButton label="사진 저장" onClick={savePhoto} tone={CORAL} />
        </div>
        <div className="flex flex-col items-center gap-3.5">
          <div className={`relative w-full ${FRAME_SHADOW}`}>
            {clipUrls ? (
              <ClipCanvas urls={clipUrls} fps={clipFps} label={label} onFile={setVideoFile} onState={setClipState} />
            ) : (
              <>
                {photo("block h-auto w-full opacity-45")}
                {/* 부스가 움직이는 네컷을 만들어 올리는 중 (보통 10~20초) */}
                <span className="absolute inset-x-3 top-1/2 -translate-y-1/2 animate-pulse break-keep rounded-full bg-[#3B1409]/85 px-3 py-2 text-center text-[14px] font-extrabold text-white">
                  만드는 중
                </span>
              </>
            )}
          </div>
          <SaveButton label={videoLabel} onClick={saveVideo} disabled={!videoFile} tone={BROWN} />
        </div>
      </div>
      {videoNote && !note ? (
        <p aria-live="polite" className="mt-3 min-h-[22px] text-center text-[14px] font-bold text-[var(--soft)]">
          {videoNote}
        </p>
      ) : (
        noteLine
      )}
    </div>
  );
}
