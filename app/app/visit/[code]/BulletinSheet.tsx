// 주보(순서지)를 웹에서 읽기: 앱 components/bulletin/BulletinJsonParser.tsx · lib/bulletin-paper.ts 와 같은 순서 · 뜻으로.
// 첫 장은 예배 순서(이름표 · 내용), 광고가 있으면 둘째 장(번호 목록)과 그 뒤의 칸들. 설교자는 머리에 따로.
// 칸 이름(설교 · 본문 말씀 · 찬양 · 광고 …)은 관리자가 적는 데이터라 번역하지 않는다.

type Item = Record<string, unknown>;
type Value = string | string[] | Item[];
type Entry = [key: string, value: Value];

const PREACHER_KEY = "설교";
const ADS_KEY = "광고";
const SCRIPTURE_KEY = "본문 말씀";
const PRAISE_KEYS = ["찬양", "말씀 후 찬양"];
const CONFESSION_KEY = "신앙고백";

/** 주보에 적힌 "\n" 글자(역슬래시 + n)를 줄바꿈으로 */
const lines = (text: string) => text.replace(/\\n/g, "\n");

/** 글자 폭 어림 (앱 textUnits 와 같다) */
function textUnits(text: string): number {
  let units = 0;
  for (const ch of text) {
    if (ch === " ") units += 0.3;
    else if (/[ᄀ-ᇿ　-鿿가-힯豈-﫿＀-￯]/.test(ch)) units += 1;
    else if (/[A-Z]/.test(ch)) units += 0.68;
    else if (/[a-z0-9]/.test(ch)) units += 0.55;
    else units += 0.35;
  }
  return units;
}

const fitsRow = (text: string) => {
  const value = lines(text);
  return !value.includes("\n") && textUnits(value) <= 26;
};

const isItem = (value: unknown): value is Item => value != null && typeof value === "object" && !Array.isArray(value);
const isItemList = (value: Value): value is Item[] => Array.isArray(value) && isItem(value[0]);

function entries(data: unknown): Entry[] {
  if (!isItem(data)) return [];
  const out: Entry[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      if (value.trim() !== "") out.push([key, value]);
    } else if (Array.isArray(value) && value.length > 0) {
      const list = typeof value[0] === "string" ? value.filter((v): v is string => typeof v === "string") : value.filter(isItem);
      if (list.length > 0) out.push([key, list]);
    }
  }
  return out;
}

function itemParts(item: Item): { title: string; content: string; link: string; images: string[] } {
  const text = (value: unknown) => (typeof value === "string" ? value : "");
  if ("title" in item && "content" in item) {
    const images = Array.isArray(item.images) ? item.images.filter((uri): uri is string => typeof uri === "string" && /^https:\/\//.test(uri)) : [];
    return { title: text(item.title), content: text(item.content), link: text(item.link).trim(), images };
  }
  const [title, body] = Object.entries(item)[0] ?? ["", ""];
  return { title, content: text(body), link: "", images: [] };
}

/** 링크는 http(s) 만 (주보에 적힌 글이 그대로 주소가 된다) */
function safeUrl(link: string): string | null {
  const url = /^https?:\/\//i.test(link) ? link : `https://${link}`;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function preacherOf(data: unknown): string {
  if (!isItem(data)) return "";
  const value = data[PREACHER_KEY];
  return typeof value === "string" ? value.trim() : "";
}

export function hasContent(data: unknown): boolean {
  return entries(data).some(([key]) => key !== PREACHER_KEY);
}

function Label({ children }: { children: string }) {
  return <span className="text-[13px] font-extrabold tracking-[0.12em] text-[var(--soft)]">{children}</span>;
}

/** 이름표 옆 한 줄 */
function Row({ label, value, highlight = false }: { label?: string; value: string; highlight?: boolean }) {
  return (
    <div className="grid grid-cols-[88px_minmax(0,1fr)] items-baseline gap-x-4">
      <span className="pt-[2px]">{label ? <Label>{label}</Label> : null}</span>
      <span className={`whitespace-pre-line font-serif text-[17px] leading-[1.6] ${highlight ? "font-bold text-[var(--accent-text)]" : ""}`}>{lines(value)}</span>
    </div>
  );
}

/** 건 목록 (신앙고백 등): 이름표 아래 문단. 신앙고백은 문/답 */
function Items({ label, items, en }: { label: string; items: Item[]; en: boolean }) {
  const confession = label === CONFESSION_KEY;
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-3 flex flex-col gap-4">
        {items.map((item, index) => {
          const { title, content, link, images } = itemParts(item);
          const href = link ? safeUrl(link) : null;
          return (
            <div key={index} className="flex flex-col gap-1.5">
              {title !== "" && (
                <p className="flex gap-2 whitespace-pre-line font-serif text-[16px] leading-[1.7]">
                  {confession && <span className="min-w-5 font-sans text-[12px] font-extrabold leading-[27px] text-[var(--soft)]">{en ? "Q" : "문"}</span>}
                  <span className="min-w-0 flex-1">{lines(title)}</span>
                </p>
              )}
              {content !== "" && (
                <p className="flex gap-2 whitespace-pre-line font-serif text-[16px] leading-[1.7] text-[var(--soft)]">
                  {confession && <span className="min-w-5 font-sans text-[12px] font-extrabold leading-[27px]">{en ? "A" : "답"}</span>}
                  <span className="min-w-0 flex-1">{lines(content)}</span>
                </p>
              )}
              <Extras images={images} href={href} en={en} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Extras({ images, href, en }: { images: string[]; href: string | null; en: boolean }) {
  return (
    <>
      {images.length > 0 && (
        <div className="mt-2 flex flex-col gap-3">
          {images.map((uri, i) => (
            // 주보 사진은 앱 저장소의 공개 주소 (크기를 모르는 바깥 사진이라 img 로)
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={uri} alt="" loading="lazy" className="w-full rounded-2xl bg-white object-cover" />
          ))}
        </div>
      )}
      {href && (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-link mt-1 self-start text-[14px]">
          {en ? "More" : "자세히 보기"}
        </a>
      )}
    </>
  );
}

function Entries({ list, en }: { list: Entry[]; en: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      {list.map(([key, value]) => {
        if (typeof value === "string") {
          if (key === SCRIPTURE_KEY) return <Row key={key} label={key} value={value} highlight />;
          if (PRAISE_KEYS.includes(key) || fitsRow(value)) return <Row key={key} label={key} value={value} />;
          return (
            <div key={key}>
              <Label>{key}</Label>
              <p className="mt-2 whitespace-pre-line font-serif text-[16px] leading-[1.7]">{lines(value)}</p>
            </div>
          );
        }
        if (isItemList(value)) return <Items key={key} label={key} items={value} en={en} />;
        return (
          <div key={key} className="flex flex-col gap-2">
            {(value as string[]).map((item, i) => (
              <Row key={i} label={i === 0 ? key : undefined} value={item} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

/** 주보 한 부: 순서(첫 장) + 광고(둘째 장) */
export function BulletinSheet({ data, en }: { data: unknown; en: boolean }) {
  const list = entries(data).filter(([key]) => key !== PREACHER_KEY);
  const adsAt = list.findIndex(([key, value]) => key === ADS_KEY && isItemList(value));
  const order = adsAt < 0 ? list : list.slice(0, adsAt);
  const ads = adsAt < 0 ? null : { label: list[adsAt][0], items: list[adsAt][1] as Item[] };
  const after = adsAt < 0 ? [] : list.slice(adsAt + 1);

  return (
    <div className="flex flex-col gap-4">
      {order.length > 0 && (
        <div className="rounded-[26px] bg-white px-5 py-6 sm:px-7">
          <Entries list={order} en={en} />
        </div>
      )}
      {ads && (
        <div className="rounded-[26px] bg-white px-5 py-6 sm:px-7">
          <p className="text-center text-[14px] font-extrabold tracking-[0.6em] text-[var(--ink)]">{ads.label}</p>
          <ol className="mt-5 flex flex-col gap-5">
            {ads.items.map((item, index) => {
              const { title, content, link, images } = itemParts(item);
              const href = link ? safeUrl(link) : null;
              return (
                <li key={index} className="flex gap-2">
                  <span className="min-w-6 font-serif text-[16px] leading-[1.6]">{index + 1}.</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="whitespace-pre-line text-[16px] font-extrabold leading-[1.6]">{lines(title)}</p>
                    {content !== "" && <p className="whitespace-pre-line font-serif text-[15px] leading-[1.7] text-[var(--soft)]">{lines(content)}</p>}
                    <Extras images={images} href={href} en={en} />
                  </div>
                </li>
              );
            })}
          </ol>
          {after.length > 0 && (
            <div className="mt-7">
              <Entries list={after} en={en} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
