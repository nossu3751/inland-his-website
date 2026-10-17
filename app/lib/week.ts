// 교회가 있는 곳(LA) 기준의 오늘 · 이번 주일 · 한 주의 모임
import { GATHERINGS } from "../content";

const TZ = "America/Los_Angeles";
const DAY_MS = 24 * 60 * 60 * 1000;

export function laToday(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hourCycle: "h23", weekday: "short" })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return {
    date: Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)),
    weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday),
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}
export type Today = ReturnType<typeof laToday>;

const ymd = (utc: number) => {
  const d = new Date(utc);
  return { month: d.getUTCMonth() + 1, day: d.getUTCDate() };
};

// 주일 예배가 끝나기 전(오후 3:30)이면 오늘, 아니면 다가오는 일요일
export function thisSunday(today: Today) {
  const ahead = today.weekday === 0 ? (today.minutes < 15 * 60 + 30 ? 0 : 7) : 7 - today.weekday;
  return ymd(today.date + ahead * DAY_MS);
}

// 한 주(일~토). 이번 주 모임이 다 지났으면 다음 주를 보여 준다. 가장 가까운 모임이 next
export function weekView(today: Today) {
  const later = GATHERINGS.filter((g) => g.weekday > today.weekday || (g.weekday === today.weekday && g.minutes > today.minutes));
  const rolled = later.length === 0;
  const start = today.date - today.weekday * DAY_MS + (rolled ? 7 * DAY_MS : 0);
  const next = rolled ? GATHERINGS[0] : later[0];
  return Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    ...ymd(start + weekday * DAY_MS),
    isToday: !rolled && weekday === today.weekday,
    past: !rolled && weekday < today.weekday,
    gatherings: GATHERINGS.filter((g) => g.weekday === weekday).map((g) => ({ ...g, next: g === next, done: !rolled && weekday === today.weekday && g.minutes <= today.minutes })),
  }));
}
