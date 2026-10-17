import Image from "next/image";
import Link from "next/link";
import { COPY, LINKS, PASTOR, PLACE, STAFF, TEAMS, staffLabel, staffRole, teamName, type Lang } from "../../content";
import { laToday, thisSunday, weekView } from "../../lib/week";
import { HeroMark } from "./HeroMark";
import { HisMark } from "./HisMark";
import { LiteYouTube } from "./LiteYouTube";
import { WordRoller } from "./WordRoller";

function LangSwitch({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  return (
    <div className="lang-switch">
      <span aria-current="true">{t.current}</span>
      <Link href={t.switchTo.href} hrefLang={lang === "ko" ? "en" : "ko"}>{t.switchTo.label}</Link>
    </div>
  );
}

const Arrow = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

// 말씀: 낱말마다 나눠 두면, 스크롤하며 읽는 자리까지 회색에서 검정으로 차오른다
function FillText({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={i} className="fill-word">{word} </span>
      ))}
    </>
  );
}

export function Site({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const today = laToday();
  const sunday = thisSunday(today);
  const events = weekView(today).flatMap((day) => day.gatherings.map((g) => ({ ...g, day: day.day, past: day.past || g.done })));
  const home = lang === "ko" ? "/" : "/en";
  const nav = [
    { id: "first", label: t.nav.first },
    { id: "week", label: t.nav.week },
    { id: "word", label: t.nav.word },
    { id: "people", label: t.nav.people },
    { id: "app", label: t.nav.app },
    { id: "way", label: t.nav.way },
  ];
  const [greetingLead, ...greetingRest] = t.people.greeting;

  return (
    <div lang={t.htmlLang}>
      <header className="topbar">
        <div className="wrap flex h-[68px] items-center gap-8">
          <Link href={home} aria-label="His" className="shrink-0 text-[var(--brand)]">
            <HisMark id="his-top" className="h-8 w-auto" />
          </Link>
          <nav className="hidden flex-1 lg:block" aria-label={lang === "ko" ? "쪽 바로가기" : "Sections"}>
            <ul className="flex gap-1">
              {nav.map((n) => (
                <li key={n.id}><a className="navlink" href={`#${n.id}`}>{n.label}</a></li>
              ))}
            </ul>
          </nav>
          <div className="ml-auto"><LangSwitch lang={lang} /></div>
        </div>
      </header>

      <main>
        {/* 첫 화면: 사진이 비치는 큰 His + 바뀌는 단어 */}
        <section className="hero">
          <div className="wrap">
            <h1 className="hero-lockup">
              <span className="sr-only">His. {t.hero.community}</span>
              <HeroMark className="hero-his" />
              <WordRoller />
            </h1>
            <div className="hero-foot">
              <div>
                <p className="text-[clamp(18px,1.6vw,21px)] font-extrabold tracking-[-0.01em]">{t.hero.community}</p>
                <p className="mt-1 text-[clamp(16px,1.4vw,18px)] font-semibold text-[var(--soft)]">{t.hero.when}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a className="btn btn-ink" href="#first">{t.hero.first}<Arrow /></a>
                <a className="btn btn-quiet" href={PLACE.googleMaps} target="_blank" rel="noopener noreferrer">{t.hero.directions}</a>
              </div>
            </div>
          </div>
        </section>

        {/* 처음이라면: 한 문장 + 네 가지 */}
        <section id="first" className="section band">
          <div className="wrap">
            <div className="flex items-start justify-between gap-10">
              <h2 className="statement">
                {t.first.statement.map((line, i) => (
                  <span key={line} className={`statement-line ${i === 1 ? "text-[var(--brand)]" : ""}`}>{line}</span>
                ))}
              </h2>
              <div className="stamp-sunday reveal" role="img" aria-label={`${t.hero.stampTop} ${sunday.month}.${sunday.day} 1:45 PM`}>
                <span className="text-[13px] font-extrabold">{t.hero.stampTop}</span>
                <span className="text-[36px] font-black leading-none tabular-nums">{sunday.month}.{sunday.day}</span>
                <span className="text-[13px] font-extrabold">1:45 PM</span>
              </div>
            </div>
            <dl className="facts">
              {t.first.rows.map((row, i) => (
                <div key={row.label} className="fact reveal">
                  <dt>{row.label}</dt>
                  <dd>
                    {i === 3 ? (
                      <>
                        <a className="fact-value fact-link" href={`tel:${LINKS.phone}`}>{LINKS.phone}</a>
                        <a className="fact-detail fact-link" href={`mailto:${LINKS.email}`}>{LINKS.email}</a>
                      </>
                    ) : (
                      <>
                        <span className="fact-value">{row.value}</span>
                        <span className="fact-detail">{row.detail}</span>
                      </>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="reveal mt-12 flex flex-wrap gap-3">
              <a className="btn btn-ink" href={PLACE.googleMaps} target="_blank" rel="noopener noreferrer">{t.today.directions}<Arrow /></a>
              <a className="btn btn-white" href={LINKS.youtube} target="_blank" rel="noopener noreferrer">{t.today.youtube}</a>
            </div>
          </div>
        </section>

        {/* 한 주의 모임 */}
        <section id="week" className="section">
          <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
            <div className="reveal">
              <h2 className="title">{t.week.title}</h2>
              <p className="mt-5 max-w-[28ch] text-[17px] leading-[1.7] text-[var(--soft)]">{t.week.note}</p>
            </div>
            <ol className="events">
              {events.map((e) => (
                <li key={e.ko} className="event reveal" data-kind={e.kind} data-next={e.next ? "true" : undefined} data-past={e.past ? "true" : undefined}>
                  <span className="event-date">
                    <span className="text-[13px] font-extrabold">{t.week.days[e.weekday]}</span>
                    <span className="text-[26px] font-black tabular-nums">{e.day}</span>
                  </span>
                  <span>
                    <span className="block text-[clamp(18px,1.6vw,21px)] font-extrabold tracking-[-0.015em]">{lang === "ko" ? e.ko : e.en}</span>
                    <span className="event-meta mt-1 block text-[15px] font-semibold">
                      {t.week.time(e.minutes)}
                      {e.placeKo ? `, ${lang === "ko" ? e.placeKo : e.placeEn}` : ""}
                    </span>
                  </span>
                  {e.next ? <span className="next-tag">{t.week.next}</span> : <span />}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 말씀 */}
        <section id="word" className="section band-lav">
          <div className="wrap">
            <p className="reveal text-[15px] font-extrabold text-[var(--accent-text)]">{t.word.reference}</p>
            <blockquote className="verse mt-8">
              {t.word.verse.map((v, i) => (
                <p key={i} className={i ? "mt-6" : undefined}><FillText text={v} /></p>
              ))}
            </blockquote>
          </div>
          <div className="wrap mt-[clamp(80px,10vw,140px)]">
            <h2 className="title reveal">{t.word.title}</h2>
            <p className="reveal mt-4 text-[18px] font-bold text-[var(--soft)]">{t.word.lead}</p>
            <ul className="re-list">
              {t.word.re.map((r) => (
                <li key={r.tag} className="reveal">
                  <span className="re-tag">{r.tag}</span>
                  <span className="re-text">{r.text}</span>
                </li>
              ))}
            </ul>
            <p className="reveal mt-14 max-w-[58ch] text-[17px] leading-[1.75] text-[var(--soft)]">{t.word.close}</p>
          </div>
        </section>

        {/* 사람들 */}
        <section id="people" className="section">
          <div className="wrap">
            <h2 className="title reveal">{t.people.title}</h2>
            <div className="mt-12 grid items-start gap-10 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:gap-16">
              <figure className="reveal">
                <Image src={PASTOR.photo} alt={PASTOR.name} width={500} height={584} sizes="320px" className="block h-auto w-full max-w-[20rem] rounded-[28px]" />
                <figcaption className="mt-4 text-[17px] font-extrabold">
                  {PASTOR.name} <span className="font-semibold text-[var(--soft)]">{staffLabel(lang, PASTOR.label)}</span>
                </figcaption>
              </figure>
              <div className="reveal">
                <p className="text-[clamp(24px,2.4vw,32px)] font-extrabold leading-[1.4] tracking-[-0.025em]">{greetingLead}</p>
                <div className="mt-8 max-w-[60ch] space-y-4 text-[17px] leading-[1.85] text-[var(--soft)]">
                  {greetingRest.map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </div>
            </div>
            <ul className="mt-16 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
              {STAFF.map((person) => (
                <li key={person.position} className="reveal flex items-center gap-4">
                  <Image src={person.photo} alt={person.name} width={160} height={160} sizes="72px" className="size-[72px] shrink-0 rounded-full object-cover" />
                  <span>
                    <span className="block text-[16px] font-extrabold">
                      {person.name} <span className="font-semibold text-[var(--soft)]">{staffLabel(lang, person.label)}</span>
                    </span>
                    <span className="block text-[14px] text-[var(--soft)]">{staffRole(lang, person.position)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <h3 className="reveal mt-24 text-[clamp(22px,2vw,28px)] font-extrabold tracking-[-0.02em]">{t.people.teams}</h3>
            <ul className="teams mt-6">
              {TEAMS.map((team) => (
                <li key={team.name} className="team reveal">
                  <Image src={team.photo} alt={teamName(lang, team.name)} width={600} height={400} sizes="(min-width: 768px) 560px, 92vw" className="block aspect-[3/2] h-auto w-full object-cover" />
                  <span className="team-name">{teamName(lang, team.name)}</span>
                </li>
              ))}
            </ul>
            <div className="reveal mt-6 overflow-hidden rounded-[28px]">
              <LiteYouTube id={LINKS.introVideo} title={t.people.video} playLabel={t.people.play} />
            </div>
          </div>
        </section>

        {/* 히즈앱 */}
        <section id="app" className="section band overflow-hidden">
          <div className="wrap text-center">
            <h2 className="reveal mx-auto max-w-[16ch] text-[clamp(34px,4.4vw,60px)] font-black leading-[1.12] tracking-[-0.04em]">{t.app.title}</h2>
            <p className="reveal mx-auto mt-5 max-w-[46ch] text-[18px] leading-[1.75] text-[var(--soft)]">{t.app.body}</p>
            <div className="reveal mt-8 flex flex-wrap items-center justify-center gap-4">
              <a className="btn btn-ink" href={LINKS.appStore} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 384 512" className="size-5" fill="currentColor" aria-hidden="true"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>
                {t.app.appStore}
              </a>
              <span className="flex items-center gap-3">
                <span className="btn btn-white cursor-default opacity-60" aria-disabled="true">{t.app.play}</span>
                <span className="stamp">{t.app.soon}</span>
              </span>
            </div>
            <div className="app-stage">
              <div className="phones">
                {(["home", "bulletin", "bible"] as const).map((name, i) => (
                  <figure key={name} className={`phone phone-${i}`}>
                    <Image src={`/app/screens/raw-${name}.png`} alt={t.app.shots[i]} width={1179} height={2556} sizes="(min-width: 1024px) 270px, 30vw" className="block h-auto w-full" />
                  </figure>
                ))}
              </div>
              <figure className="widget">
                <div className="relative overflow-hidden rounded-[22px]" style={{ aspectRatio: "1014 / 474" }}>
                  <Image src="/app/widgets/ko-his-medium.png" alt={t.app.widget} width={1122} height={582} sizes="380px" className="absolute max-w-none" style={{ width: "110.65%", left: "-5.33%", top: "-11.39%" }} />
                </div>
              </figure>
            </div>
          </div>
        </section>

        {/* 오시는 길 */}
        <section id="way" className="section">
          <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
            <div className="reveal">
              <h2 className="title">{t.way.title}</h2>
              <p className="mt-8 text-[clamp(30px,3.4vw,46px)] font-black leading-[1.1] tracking-[-0.035em]">
                {PLACE.street}
                <span className="block text-[var(--soft)]">{PLACE.city}</span>
              </p>
              <div className="mt-6 space-y-2 text-[17px] leading-[1.75] text-[var(--soft)]">
                {t.way.lines.map((line) => <p key={line}>{line}</p>)}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <a className="btn btn-ink" href={PLACE.googleMaps} target="_blank" rel="noopener noreferrer">{t.way.google}</a>
                <a className="btn btn-quiet" href={PLACE.appleMaps} target="_blank" rel="noopener noreferrer">{t.way.apple}</a>
              </div>
              <a className="text-link mt-8 inline-block text-[16px]" href={LINKS.church} target="_blank" rel="noopener noreferrer">{t.way.church}</a>
            </div>
            <div className="reveal overflow-hidden rounded-[28px] bg-[var(--paper)]">
              <iframe className="block aspect-[4/3] w-full" src={PLACE.mapEmbed} title={t.way.mapTitle} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap flex flex-col gap-12 py-16 md:flex-row md:justify-between">
          <div>
            <HisMark id="his-foot" className="h-12 w-auto text-[var(--brand)]" />
            <p className="mt-4 text-[15px] font-bold">{t.community}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-[15px] sm:grid-cols-[auto_auto_auto]">
            <div>
              <p className="font-extrabold">{t.back.follow}</p>
              <ul className="mt-3 space-y-2">
                {LINKS.social.map((s) => (
                  <li key={s.name}><a className="footlink" href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-extrabold">{t.back.legal}</p>
              <ul className="mt-3 space-y-2">
                <li><Link className="footlink" href="/privacy-policy">{t.back.privacy}</Link></li>
                <li><Link className="footlink" href="/delete-account">{t.back.deleteAccount}</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-extrabold">{t.back.contact}</p>
              <ul className="mt-3 space-y-2">
                <li><a className="footlink" href={`tel:${LINKS.phone}`}>{LINKS.phone}</a></li>
                <li><a className="footlink whitespace-nowrap" href={`mailto:${LINKS.email}`}>{LINKS.email}</a></li>
              </ul>
            </div>
          </div>
        </div>
        <p className="wrap pb-10 text-[13px] font-semibold text-[var(--faint)]">© {new Date().getFullYear()} {t.back.rights}</p>
      </footer>
    </div>
  );
}
