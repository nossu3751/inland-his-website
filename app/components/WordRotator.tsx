"use client";

import { useState, useEffect, useRef } from "react";

const words = [
  "Ministry",
  "Majesty",
  "Provision",
  "Protection",
  "Creation",
  "Salvation",
  "Wisdom",
  "Love",
  "Strength",
  "Mercy",
  "Grace",
  "People",
  "Truth",
  "Kingdom",
];

export function WordRotator() {
  const [index, setIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const sizerRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);

  const [currentStyle, setCurrentStyle] = useState<React.CSSProperties>({
    transform: "translateY(0)",
    transition: "transform 0.35s ease-in-out",
  });
  const [nextStyle, setNextStyle] = useState<React.CSSProperties>({
    transform: "translateY(120%)",
    transition: "transform 0.35s ease-in-out",
  });

  useEffect(() => {
    if (sizerRef.current) {
      sizerRef.current.textContent = words[index];
      setWidth(sizerRef.current.offsetWidth);
    }
  }, [index]);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (index + 1) % words.length;
      setNextIndex(next);

      setNextStyle({
        transform: "translateY(120%)",
        transition: "none",
      });

      requestAnimationFrame(() => {
        if (sizerRef.current) {
          sizerRef.current.textContent = words[next];
          setWidth(sizerRef.current.offsetWidth);
        }

        requestAnimationFrame(() => {
          setCurrentStyle({
            transform: "translateY(-120%)",
            transition: "transform 0.35s ease-in-out",
          });
          setNextStyle({
            transform: "translateY(0)",
            transition: "transform 0.35s ease-in-out",
          });

          setTimeout(() => {
            setIndex(next);
            setNextIndex(null);
            setCurrentStyle({
              transform: "translateY(0)",
              transition: "none",
            });
          }, 350);
        });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [index]);

  return (
    <>
      <span
        ref={sizerRef}
        aria-hidden
        className="font-bold whitespace-nowrap absolute opacity-0 pointer-events-none"
        style={{ position: "fixed", top: -9999, left: -9999 }}
      >
        {words[index]}
      </span>
      <div
        className="h-[1.15em] overflow-hidden relative inline-block"
        style={{
          width: width ? `${width}px` : "auto",
          transition: "width 0.35s ease-in-out",
        }}
      >
        <span className="font-bold whitespace-nowrap opacity-0 block h-[1.15em]">
          {words[index]}
        </span>

        <span
          className="block h-[1.15em] font-bold absolute left-0 top-0 whitespace-nowrap"
          style={currentStyle}
        >
          {words[index]}
        </span>

        {nextIndex !== null && (
          <span
            className="block h-[1.15em] font-bold absolute left-0 top-0 whitespace-nowrap"
            style={nextStyle}
          >
            {words[nextIndex]}
          </span>
        )}
      </div>
    </>
  );
}
