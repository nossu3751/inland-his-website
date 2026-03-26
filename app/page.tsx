import Image from "next/image";
import people from "./data/people.json";
import teams from "./data/teams.json";
import { WordRotator } from "./components/WordRotator";

export default function Home() {
  const pastor = people[0];
  const staff = people.slice(1);
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#2d1054] via-[#1a0a2e] to-[#0d0518] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto px-6 py-32 md:py-44 flex flex-col items-center">
          <div className="text-center leading-none">
            <div className="flex items-baseline justify-center gap-3 md:gap-5 text-5xl md:text-7xl lg:text-8xl">
              <span className="font-display font-bold text-white">His</span>
              <WordRotator />
            </div>
            <p className="text-white/50 tracking-[0.25em] text-sm md:text-base mt-6">
              인랜드 히즈 청년부 · 오후 1:45 예배
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-10">
            <a
              href="https://www.youtube.com/@inland_his"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 text-white text-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                <path fill="#EF4444" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                <path fill="#ffffff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              예배드리러가기
            </a>
            <a
              href="https://apps.apple.com/us/app/%ED%9E%88%EC%A6%88%EC%95%B1/id6746176604"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 text-white text-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Image src="/apple-logo.png" alt="Apple" width={18} height={18} className="w-[18px] h-[18px]" />
              App Store
            </a>
            <span className="relative inline-flex items-center gap-2 bg-white/5 text-white/30 text-sm px-4 py-2 rounded-lg cursor-not-allowed select-none">
              <Image src="/play-logo.png" alt="Google Play" width={18} height={18} className="w-[18px] h-[18px] opacity-30" />
              Play Store
              <span className="absolute -top-2 -right-2 text-[10px] font-semibold bg-primary/80 text-white px-1.5 py-0.5 rounded-full leading-none">
                Soon
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Scripture — Romans 12:1-2 */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-3xl mx-auto bg-white/[0.08] border border-white/15 rounded-3xl px-8 py-14 md:px-14 md:py-20 text-center">
          <p className="text-sm font-semibold tracking-widest uppercase text-white/50 mb-8">
            로마서 12:1-2
          </p>
          <blockquote className="font-serif space-y-6 text-white/70 text-base md:text-lg leading-relaxed italic">
            <p>
              그러므로 형제들아 내가 하나님의 모든 자비하심으로 너희를 권하노니
              너희 몸을 하나님이 기뻐하시는 거룩한 산 제물로 드리라.
              이는 너희가 드릴 영적 예배니라.
            </p>
            <p>
              너희는 이 세대를 본받지 말고 오직 마음을 새롭게 함으로 변화를 받아
              하나님의 선하시고 기뻐하시고 온전하신 뜻이 무엇인지 분별하도록 하라.
            </p>
          </blockquote>
        </div>
      </section>

      {/* Who We Are */}
      <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase text-white/60 mb-3">
            Who We Are
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            다시, 복음으로. Re-
          </h2>
          <p className="mt-4 text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            히즈 청년부는,
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {[
            {
              tag: "re:born",
              text: "복음으로 거듭나며 하나님의 자녀로서 이미 세상에서 승리케 하셨고,",
            },
            {
              tag: "re:form",
              text: "복음으로 변화되어 모든 일에 마음을 다하여 주께 하듯하고,",
            },
            {
              tag: "re:store",
              text: "복음으로 회복되어 더이상 죄의 종이 아닌 의의 자녀로 살아가고,",
            },
            {
              tag: "re:mind",
              text: "복음으로 일깨워져 영혼에 매일 매일 예수의 행하심을 기억하는",
            },
          ].map((item) => (
            <div
              key={item.tag}
              className="group rounded-2xl bg-white/[0.08] border border-white/15 p-8 hover:border-primary-muted/40 hover:bg-white/[0.12] transition-all duration-300"
            >
              <span className="inline-block text-sm font-bold tracking-wider text-primary-muted bg-primary/15 px-3 py-1 rounded-full mb-4">
                {item.tag}
              </span>
              <p className="text-white/70 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed text-center md:text-left [word-break:keep-all]">
            만 19세부터 싱글 형제, 자매, 젊은부부들과 함께 서로의 삶을 통해
            신앙의 본과 도전을 주고 받는 <strong className="text-white/80">청년공동체</strong> 입니다.
          </p>
        </div>
      </section>

      {/* People */}
      <section className="px-6 py-20 md:py-28 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-white/60 mb-3">
              People
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              섬기는 사람들
            </h2>
          </div>

          {/* Pastor — featured */}
          <div className="bg-white/[0.08] border border-white/15 rounded-3xl px-8 py-14 md:px-14 md:py-16 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden flex-shrink-0">
                <Image
                  src={pastor.photo}
                  alt={pastor.name}
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-sm font-semibold tracking-widest uppercase text-white/50 mb-2">
                  {pastor.position}
                </p>
                <h3 className="text-2xl md:text-3xl font-bold mb-6">
                  {pastor.name} <span className="text-white/60 font-medium">{pastor.label}</span>
                </h3>
                <div className="space-y-4 text-white/70 text-base leading-relaxed [word-break:keep-all]">
                  {pastor.greeting?.split("\n\n").map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Staff */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {staff.map((person) => (
              <div
                key={person.position}
                className="bg-white/[0.08] border border-white/15 rounded-2xl p-5 text-center"
              >
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden mx-auto mb-4">
                  <Image
                    src={person.photo}
                    alt={person.position}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                </div>
                {person.name && (
                  <p className="text-white font-semibold text-sm">
                    {person.name} <span className="text-white/50 font-normal">{person.label}</span>
                  </p>
                )}
                <p className="text-white/50 text-xs mt-1">{person.position}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teams */}
      <section className="px-6 py-20 md:py-28 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-white/60 mb-3">
              Teams
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              사역팀
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {teams.map((team) => (
              <div
                key={team.name}
                className="bg-white/[0.08] border border-white/15 rounded-2xl overflow-hidden"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <Image
                    src={team.photo}
                    alt={team.name}
                    width={640}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="px-6 py-4">
                  <h3 className="text-white font-semibold text-lg">
                    {team.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Church Introduction Video */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-4xl mx-auto bg-white/[0.08] border border-white/15 rounded-3xl px-8 py-14 md:px-14 md:py-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              교회 소개
            </h2>
          </div>
          <div className="w-full overflow-hidden rounded-2xl aspect-video">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/CZtIVp4zMJM"
              title="인랜드 히즈교회 소개"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-4xl mx-auto bg-white/[0.08] border border-white/15 rounded-3xl px-8 py-14 md:px-14 md:py-20">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold tracking-widest uppercase text-white/60 mb-3">
              Location
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              오시는 길
            </h2>
            <p className="mt-3 text-white/50 text-base">
              1101 Glen Ave, Pomona CA, 91768
            </p>
          </div>
          <div className="max-w-2xl mx-auto space-y-4 text-white/70 text-base leading-relaxed [word-break:keep-all]">
            <p>
              히즈 공동체가 있는 인랜드 교회는 Pomona 라는 도시에 위치해있습니다.
            </p>
            <p>
              LA 에서 약 40분 거리, Diamond Bar, Rancho Cucamonga 등 주변 도시들에서 20분 거리입니다.
            </p>
            <p>
              Claremont Colleges, CPP, Mount Sac, U.Lavern, Western 등 여러 대학들 근처에서 오시기 편합니다.
            </p>
          </div>
          <div className="mt-10 w-full overflow-hidden rounded-2xl aspect-video">
            <iframe
              className="w-full h-full"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.5!2d-117.7498!3d34.0565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c32dc8a1b1f1f1%3A0x0!2s1101+Glen+Ave%2C+Pomona%2C+CA+91768!5e0!3m2!1sen!2sus!4v1"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="text-center mt-6">
            <a
              href="https://www.google.com/maps/search/?api=1&query=1101+Glen+Ave+Pomona+CA+91768"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              Google Maps에서 보기
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
