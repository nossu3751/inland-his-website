# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary (confirmed 2026-10-16):** young adults thinking about visiting for the first time. 19 and older, single or young couples, mostly Korean-speaking, living in LA / OC / the Inland Empire (Pomona, Diamond Bar, Rancho Cucamonga, and nearby schools: Claremont Colleges, CPP, Mt. SAC, U. La Verne, Western). They arrive from search, Instagram, or a friend's link. Their job is to learn when and where worship is, what the community is like, and who to contact, and then decide whether to come.
- **Secondary:** current members looking for shortcuts (YouTube worship, app download, social links).
- **Secondary:** HIS app users, and App Store / Google Play review. They need the privacy policy and the account-deletion page. People tapping app share links land on `/app/post/<id>` and `/app/event`.

## Product Purpose

The website of the 인랜드교회 히즈청년부 (HIS Ministry, Inland Church young adults). It exists so that a first-time visitor can find the Sunday service, get a feel for the community, and come. It is also the public home of the HIS app.

Success means a first-timer leaves knowing the time, the address, what to expect, and who to contact, and members can reach the app and worship links in one tap.

## Positioning

- A young adult community within Inland Church (PCA, https://www.inlandpca.com/) in Pomona.
- Its own language: "다시, 복음으로. Re-", with re:born, re:form, re:store and re:mind.
- Theme verse: Romans 12:1–2.
- Its own app (HIS app: bulletin, daily QT, Bible, events, feed, widgets), which most nearby churches don't have.

## Operating Context

- **Sunday worship:** 1:45 PM, 1101 Glen Ave, Pomona, CA 91768. About 40 min from LA, about 20 min from nearby cities.
- **Online:** YouTube @inland_his (worship streams), Instagram @inlandhisministry, Facebook group.
- **App:** iOS on the App Store (id6746176604). Android is in Google Play closed testing; production is expected after late October 2026, so the Play Store link is not live yet.
- **App-facing routes that must keep working:**
  - `/privacy-policy` and `/delete-account` (required by the stores)
  - `/app/[...path]` (share-link landing, "앱에서 열기")
  - planned `/.well-known` AASA and assetlinks files for universal links
- **Deploy:** Vercel; pushing to `main` deploys. The owner is asked before every push.

## Capabilities and Constraints

- **Stack:** Next.js 16 (breaking changes from older Next; read `node_modules/next/dist/docs/` before writing code), React 19, Tailwind CSS 4.
- **Language:** a Korean / English switch is required (confirmed 2026-10-16). Korean is the default.
- **New content to add (confirmed):** an HIS app introduction, weekly gatherings, and a newcomer guide.
- **Weekly gatherings:** facts known so far, from the app's event data:
  - 월요 배드민턴 클럽: Mondays 7:30 PM, 교회 체육관
  - 제자훈련 (12 weeks): Sundays 6:30 PM, seasonal course
  - Holy Impact 금요예배: exists, time not confirmed
  - 목장 (small groups): meeting times unknown
- **Open, do not invent:**
  - Newcomer guide content: what happens on a first visit and who to contact.
  - Friday service time.
  - 목장 schedule.
  - Play Store link.

## Brand Commitments

- **Names:** 히즈 / HIS, 인랜드교회 히즈청년부, HIS Ministry, 히즈앱.
- **Logo:** the cursive "His" wordmark, shared with the app. Vector is in the app repo at `assets/icons/his.svg`; PNGs are in `public/logo-white.png` and `public/logo-black.png`.
- **The website and the app are one family:** same wordmark, same purple identity (primary #8A2BE2, secondary #DA70D6), and the same fonts (SUITE, RIDIBatang).
  - The app uses the lavender 3D feature icons (bulletin/document, QT/note, calendar, Bible), paper-and-stamp bulletin styling, and seasonal app icons.
  - The owner asked (2026-10-16) that the app's assets be carried over to the site.
- **Owner's standing preferences (from the app work):**
  - Dislikes thick outlines, hairlines, dashed lines and decorative icons.
  - Likes stamps, solid fills and simple motion.
  - Real objects, like the bulletin, should feel like the real object, not a flat card.
- **Voice:** warm, plain Korean (해요체 in the app). Scripture quotes must be exact.

## Evidence on Hand

- **Photos:**
  - Pastor and staff: `public/photos/people/*`, names and roles in `app/data/people.json`.
  - Teams (목자팀, 찬양팀, 미디어팀, 인리치팀): `public/photos/teams/*`.
- **Text:**
  - Pastor's greeting: `people.json`.
  - Re: statements and Romans 12:1–2: current `app/page.tsx`.
- **Video:** church introduction (YouTube `CZtIVp4zMJM`), plus `public/hero_animation.mp4` / `.webm`.
- **Contact:** Tel 510-579-0192, sean.kim@inlandchurch.org.
- **App visuals:**
  - Store screenshots and header images: `~/Downloads/his-app-1.2.0-appstore/`.
  - Widget renders.
  - App icon and seasonal icons, feature icons: app repo `assets/`.
- **Absent, never fabricate:** testimonials, attendance numbers, newcomer process, event photos beyond the team photos.

## Product Principles

1. **A first-timer gets the answers right away:** when, where, what it's like, and who to contact.
2. **One family with the app.** The site and the app should feel made by the same hands.
3. **Real people and real words.** Use the community's own photos, verse and language; no stock imagery or invented claims.
4. **Korean first, English equal.** Every fact exists in both languages.

## Accessibility & Inclusion

- Korean text uses `word-break: keep-all`.
- Most visitors are expected on phones (assumption, not measured). Phone layouts come first.
