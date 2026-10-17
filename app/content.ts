// 홈 화면의 글과 사실. 한국어 · 영어가 같은 사실을 쓴다 (PRODUCT.md — 사실은 지어내지 않는다).
import people from "./data/people.json";
import teams from "./data/teams.json";
import links from "./data/links.json";

export type Lang = "ko" | "en";

// 모임의 종류 = 색 (탭 · 한 주 칸에서 같은 뜻)
export type Kind = "worship" | "together" | "first" | "app";

export const PLACE = {
  street: "1101 Glen Ave",
  city: "Pomona, CA 91768",
  googleMaps: "https://www.google.com/maps/search/?api=1&query=1101+Glen+Ave+Pomona+CA+91768",
  appleMaps: "https://maps.apple.com/?q=1101+Glen+Ave,+Pomona,+CA+91768",
  // 예전 사이트에서 쓰던 지도 주소 그대로
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.5!2d-117.7498!3d34.0565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c32dc8a1b1f1f1%3A0x0!2s1101+Glen+Ave%2C+Pomona%2C+CA+91768!5e0!3m2!1sen!2sus!4v1",
};

export const LINKS = {
  youtube: "https://www.youtube.com/@inland_his",
  appStore: "https://apps.apple.com/us/app/%ED%9E%88%EC%A6%88%EC%95%B1/id6746176604",
  church: links.external[0].url,
  social: links.social,
  phone: "510-579-0192",
  email: "sean.kim@inlandchurch.org",
  introVideo: "CZtIVp4zMJM",
};

// 한 주의 모임 (앱 일정 자료 기준, 2026-10-16 확인). weekday: 0 = 일요일
export const GATHERINGS: { weekday: number; minutes: number; kind: Kind; ko: string; en: string; placeKo?: string; placeEn?: string }[] = [
  { weekday: 0, minutes: 13 * 60 + 45, kind: "worship", ko: "주일 예배", en: "Sunday worship" },
  { weekday: 1, minutes: 19 * 60 + 30, kind: "together", ko: "월요 배드민턴 클럽", en: "Monday badminton club", placeKo: "교회 체육관", placeEn: "Church gym" },
  { weekday: 5, minutes: 19 * 60 + 25, kind: "worship", ko: "Holy Impact 금요예배", en: "Holy Impact Friday worship" },
];

export const PASTOR = people[0];
export const STAFF = people.slice(1);
export const TEAMS = teams;

const STAFF_EN: Record<string, string> = {
  "담당 교역자": "Pastor",
  개발원장: "Director of Development",
  부장집사: "Head Deacon",
  "예배부 부장": "Head of Worship",
  "사역부 부장": "Head of Ministries",
};
const LABEL_EN: Record<string, string> = { 목사: "Pastor", 장로: "Elder", 집사: "Deacon" };
const TEAM_EN: Record<string, string> = {
  목자팀: "Shepherd team",
  찬양팀: "Worship team",
  미디어팀: "Media team",
  인리치팀: "Enrich team",
};
export const staffRole = (lang: Lang, position: string) => (lang === "ko" ? position : (STAFF_EN[position] ?? position));
export const staffLabel = (lang: Lang, label: string) => (lang === "ko" ? label : (LABEL_EN[label] ?? label));
export const teamName = (lang: Lang, name: string) => (lang === "ko" ? name : (TEAM_EN[name] ?? name));

const PASTOR_GREETING_EN = [
  "Welcome, with all our hearts, to the Inland HIS young adult ministry.",
  "Our goal is to raise up the young adults of LA and OC as disciples of Jesus Christ, so they can change the world as salt and light. We will grow by knowing God's will through Scripture alone, following the way of Jesus Christ, and experiencing the leading of the Holy Spirit.",
  "For His glory alone we will lift Him up, share our faith, encourage one another, and grow together. We are full of hope and expectation to walk this road with you and to see God's plan come true together.",
];

export const COPY = {
  ko: {
    htmlLang: "ko",
    switchTo: { href: "/en", label: "English" },
    current: "한국어",
    community: "인랜드교회 히즈청년부",
    hero: {
      community: "인랜드교회 히즈청년부",
      when: "매주 주일 오후 1:45, Pomona",
      directions: "길찾기",
      first: "처음 오셨나요?",
      stampTop: "이번 주일",
    },
    nav: { week: "모임", first: "처음이라면", word: "말씀", people: "사람들", app: "히즈앱", way: "오시는 길" },
    tabs: { today: "이번 주일", week: "한 주", first: "처음이라면", word: "말씀", people: "사람들", app: "히즈앱", way: "오시는 길" },
    today: {
      monthDay: (m: number) => `${m}월`,
      weekday: "주일",
      title: "이번 주일, 오후 1시 45분",
      fromLA: "LA에서 40분, Diamond Bar와 Rancho Cucamonga에서 20분",
      directions: "길찾기",
      youtube: "유튜브로 예배 보기",
      ribbon: "처음 오셨나요?",
      ribbonSub: "한 장만 읽고 오세요",
    },
    week: {
      title: "한 주의 모임",
      days: ["일", "월", "화", "수", "목", "금", "토"],
      time: (m: number) => {
        const h = Math.floor(m / 60), mm = m % 60;
        return `${h < 12 ? "오전" : "오후"} ${h % 12 === 0 ? 12 : h % 12}:${String(mm).padStart(2, "0")}`;
      },
      legend: { worship: "예배", together: "함께" },
      today: "오늘",
      next: "다음 모임",
      note: "모임은 히즈앱 일정에서 먼저 알려요.",
    },
    first: {
      title: "처음이라면, 이것만 알고 오세요",
      statement: ["처음이라면,", "주일 오후 1시 45분", "Pomona로 오세요."],
      rows: [
        { label: "언제", value: "매주 주일 오후 1:45", detail: "예배는 유튜브에서도 볼 수 있어요." },
        { label: "어디", value: "1101 Glen Ave, Pomona", detail: "LA에서 40분, Diamond Bar와 Rancho Cucamonga에서 20분" },
        { label: "누구", value: "만 19세부터", detail: "싱글 형제, 자매, 젊은 부부가 함께하는 청년 공동체예요." },
        { label: "미리 연락", value: "510-579-0192", detail: "sean.kim@inlandchurch.org" },
      ],
      call: "전화하기",
      mail: "메일 보내기",
    },
    word: {
      title: "다시, 복음으로. Re-",
      verse: [
        "그러므로 형제들아 내가 하나님의 모든 자비하심으로 너희를 권하노니 너희 몸을 하나님이 기뻐하시는 거룩한 산 제물로 드리라 이는 너희가 드릴 영적 예배니라",
        "너희는 이 세대를 본받지 말고 오직 마음을 새롭게 함으로 변화를 받아 하나님의 선하시고 기뻐하시고 온전하신 뜻이 무엇인지 분별하도록 하라",
      ],
      reference: "로마서 12:1-2 (개역개정)",
      lead: "히즈 청년부는,",
      re: [
        { tag: "re:born", text: "복음으로 거듭나며 하나님의 자녀로서 이미 세상에서 승리케 하셨고," },
        { tag: "re:form", text: "복음으로 변화되어 모든 일에 마음을 다하여 주께 하듯 하고," },
        { tag: "re:store", text: "복음으로 회복되어 더 이상 죄의 종이 아닌 의의 자녀로 살아가고," },
        { tag: "re:mind", text: "복음으로 일깨워져 영혼에 매일 매일 예수의 행하심을 기억하는" },
      ],
      close: "만 19세부터 싱글 형제, 자매, 젊은 부부들과 함께 서로의 삶을 통해 신앙의 본과 도전을 주고받는 청년 공동체입니다.",
    },
    people: {
      title: "섬기는 사람들",
      greeting: (PASTOR.greeting ?? "").split("\n\n"),
      teams: "사역팀",
      video: "히즈 소개 영상",
      play: "영상 재생",
    },
    app: {
      title: "교회 생활을 손안에, 히즈앱",
      body: "주보, 일일 QT, 성경, 일정, 교회 소식을 한 앱에서 봐요. 홈 화면 위젯으로 오늘의 말씀도 바로 꺼내요.",
      appStore: "App Store에서 받기",
      play: "Google Play",
      soon: "곧 열려요",
      shots: ["홈 화면", "주보", "성경"],
      widget: "홈 화면 위젯",
    },
    way: {
      title: "오시는 길",
      lines: [
        "LA에서 약 40분, Diamond Bar와 Rancho Cucamonga 같은 이웃 도시에서 20분 거리예요.",
        "Claremont Colleges, CPP, Mt. SAC, University of La Verne, Western University에서 가까워요.",
      ],
      google: "Google 지도",
      apple: "Apple 지도",
      church: "인랜드교회 홈페이지",
      mapTitle: "인랜드교회 위치 지도",
    },
    back: {
      follow: "소식",
      legal: "안내",
      privacy: "개인정보처리방침",
      deleteAccount: "계정 삭제",
      contact: "연락처",
      rights: "Inland His Church",
    },
    meta: {
      title: "히즈 | 인랜드교회 청년부",
      description: "주일 오후 1:45, Pomona 1101 Glen Ave. 인랜드교회 히즈청년부에 처음 오시는 분을 위한 안내와 한 주의 모임, 히즈앱.",
    },
  },
  en: {
    htmlLang: "en",
    switchTo: { href: "/", label: "한국어" },
    current: "English",
    community: "Inland Church HIS young adults",
    hero: {
      community: "Inland Church HIS young adults",
      when: "Sundays at 1:45 PM, Pomona",
      directions: "Get directions",
      first: "First time here?",
      stampTop: "This Sunday",
    },
    nav: { week: "Gatherings", first: "First time", word: "The Word", people: "People", app: "HIS app", way: "Getting here" },
    tabs: { today: "This Sunday", week: "The week", first: "First time", word: "The Word", people: "People", app: "HIS app", way: "Getting here" },
    today: {
      monthDay: (m: number) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1],
      weekday: "Sunday",
      title: "This Sunday at 1:45 PM",
      fromLA: "40 minutes from LA, 20 from Diamond Bar and Rancho Cucamonga",
      directions: "Get directions",
      youtube: "Watch worship on YouTube",
      ribbon: "First time here?",
      ribbonSub: "Read one page before you come",
    },
    week: {
      title: "Through the week",
      days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      time: (m: number) => {
        const h = Math.floor(m / 60), mm = m % 60;
        return `${h % 12 === 0 ? 12 : h % 12}:${String(mm).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
      },
      legend: { worship: "Worship", together: "Together" },
      today: "Today",
      next: "Up next",
      note: "Gatherings are announced first in the HIS app calendar.",
    },
    first: {
      title: "Coming for the first time",
      statement: ["First time?", "Sundays at 1:45 PM,", "come to Pomona."],
      rows: [
        { label: "When", value: "Sundays at 1:45 PM", detail: "You can also watch the service on YouTube." },
        { label: "Where", value: "1101 Glen Ave, Pomona", detail: "40 minutes from LA, 20 from Diamond Bar and Rancho Cucamonga" },
        { label: "Who", value: "19 and up", detail: "A young adult community of singles and young couples." },
        { label: "Reach us", value: "510-579-0192", detail: "sean.kim@inlandchurch.org" },
      ],
      call: "Call",
      mail: "Email",
    },
    word: {
      title: "Back to the gospel. Re-",
      verse: [
        "I appeal to you therefore, brothers, by the mercies of God, to present your bodies as a living sacrifice, holy and acceptable to God, which is your spiritual worship.",
        "Do not be conformed to this world, but be transformed by the renewal of your mind, that by testing you may discern what is the will of God, what is good and acceptable and perfect.",
      ],
      reference: "Romans 12:1-2 (ESV)",
      lead: "HIS young adults are",
      re: [
        { tag: "re:born", text: "born again through the gospel, children of God who have already been given victory in the world," },
        { tag: "re:form", text: "changed by the gospel, doing everything wholeheartedly as for the Lord," },
        { tag: "re:store", text: "restored by the gospel, living no longer as slaves of sin but as children of righteousness," },
        { tag: "re:mind", text: "and awakened by the gospel, remembering every day what Jesus has done." },
      ],
      close: "A young adult community of single brothers and sisters and young couples, 19 and up, who model and challenge one another in faith through shared life.",
    },
    people: {
      title: "The people who serve",
      greeting: PASTOR_GREETING_EN,
      teams: "Ministry teams",
      video: "About HIS",
      play: "Play video",
    },
    app: {
      title: "Church life in your pocket: the HIS app",
      body: "The bulletin, daily QT, the Bible, the calendar and church news in one app. A home screen widget brings up today's verse.",
      appStore: "Download on the App Store",
      play: "Google Play",
      soon: "Coming soon",
      shots: ["Home", "Bulletin", "Bible"],
      widget: "Home screen widget",
    },
    way: {
      title: "Getting here",
      lines: [
        "About 40 minutes from LA, and 20 minutes from nearby cities like Diamond Bar and Rancho Cucamonga.",
        "Close to the Claremont Colleges, Cal Poly Pomona, Mt. SAC, the University of La Verne and Western University.",
      ],
      google: "Google Maps",
      apple: "Apple Maps",
      church: "Inland Church website",
      mapTitle: "Map of Inland Church",
    },
    back: {
      follow: "Follow",
      legal: "Info",
      privacy: "Privacy Policy",
      deleteAccount: "Delete account",
      contact: "Contact",
      rights: "Inland His Church",
    },
    meta: {
      title: "HIS | Inland Church Young Adults",
      description: "Sundays at 1:45 PM, 1101 Glen Ave, Pomona. A first-visit guide, the week's gatherings, and the HIS app from the Inland Church young adult ministry.",
    },
  },
};

export type Copy = (typeof COPY)["ko"];
