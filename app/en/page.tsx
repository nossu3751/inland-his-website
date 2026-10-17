import type { Metadata } from "next";
import { Site } from "../components/site/Site";
import { COPY } from "../content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: COPY.en.meta.title,
  description: COPY.en.meta.description,
  alternates: { canonical: "/en", languages: { ko: "/", en: "/en" } },
};

export default function HomeEnglish() {
  return <Site lang="en" />;
}
