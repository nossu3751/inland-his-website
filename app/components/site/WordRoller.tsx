"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// "His ___": 한 번에 한 단어만. 앞 단어가 위로 흐려지며 다 사라진 뒤에 다음 단어가 아래에서 또렷해진다 (겹치지 않는다)
const WORDS = ["Ministry", "Majesty", "Provision", "Protection", "Creation", "Salvation", "Wisdom", "Love", "Strength", "Mercy", "Grace", "People", "Truth", "Kingdom"];
const HOLD = 2600;
const LEAVE = 300;

export function WordRoller() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"rest" | "leave" | "enter">("rest");
  const [width, setWidth] = useState<number>();
  const sizer = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (sizer.current) setWidth(sizer.current.offsetWidth);
  }, [index]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let swap: ReturnType<typeof setTimeout>;
    const timer = setInterval(() => {
      setPhase("leave");
      swap = setTimeout(() => {
        setIndex((i) => (i + 1) % WORDS.length);
        setPhase("enter");
      }, LEAVE);
    }, HOLD + LEAVE);
    return () => {
      clearInterval(timer);
      clearTimeout(swap);
    };
  }, []);

  return (
    <span className="roller" style={{ width }} aria-hidden="true">
      <span ref={sizer} className="roller-sizer">{WORDS[index]}</span>
      <span key={index} className="roller-word" data-phase={phase}>{WORDS[index]}</span>
    </span>
  );
}
