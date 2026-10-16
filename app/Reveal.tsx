"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Loader ported from konpo.studio's own `ed()`:
//   .fromTo(img, {scale:0,opacity:0}, {scale:1,opacity:1,duration:.4,
//                                     stagger:1.4/n, ease:"power4"})
//   .to(img, {scale:.5*e, x:.5*dx, y:.5*dy, duration:.8, ease:"power4.in"}, .08*o)
//   .to(img, {scale:1,    x:dx,    y:dy,    duration:.8, ease:"power4"   }, ">=0")
// The swell is that midpoint scale: half of viewportHeight / cardHeight.
const IMAGES = Array.from({ length: 12 }, (_, i) => `/img/${(i % 10) + 1}.jpg`);

const DURATION = 1.6; // per card, split evenly across the two halves
const ITEM_DELAY = 0.08; // gap between cards setting off
const POP = { duration: 0.4, total: 1.4 }; // the stack building up

// Hero geometry, measured off the live site at 1440x900 and kept proportional.
const CARDS = [0, 1, 2];

export default function Reveal() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (window as unknown as { gsap: typeof gsap }).gsap = gsap;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);

      // each digit column scrolls to its last face; 100 lands as 1 / 0 / 0
      const spin = (sel: string, duration: number, delay = 0) => {
        const col = q(sel)[0] as HTMLElement;
        if (!col) return;
        const step = col.firstElementChild?.getBoundingClientRect().height ?? 0;
        gsap.to(col, {
          y: -(col.childElementCount - 1) * step,
          duration,
          delay,
          ease: "power2.inOut",
        });
      };
      spin(".digit-1", 2, 1);
      spin(".digit-2", 3.2);
      spin(".digit-3", 3.3);

      const imgs = q(".card") as HTMLElement[];
      const wrap = q(".stack")[0] as HTMLElement;
      const target = q(".landing")[0] as HTMLElement;

      gsap.set([".hd-line", ".dots"], { autoAlpha: 0 });
      gsap.set(".header", { autoAlpha: 0 });
      gsap.set(".hd-line span", { yPercent: 108 });
      gsap.set(".client", { scale: 0.42, autoAlpha: 0 });

      // once the stack has landed: loader out, hero in
      const intro = () => {
        gsap.to(".loader", { autoAlpha: 0, duration: 0.5, ease: "power2.out" });
        gsap.to(".header", { autoAlpha: 1, duration: 0.8 });
        gsap.set(".hd-line", { autoAlpha: 1 });
        gsap.to(".hd-line span", {
          yPercent: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.12,
        });
        gsap.to(".dots", { autoAlpha: 1, duration: 0.9, ease: "power2.out" });
        // the three client cards start clustered in the middle and spread out
        gsap.to(".client", {
          scale: 1,
          autoAlpha: 1,
          x: 0,
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.08,
        });
        gsap.fromTo(
          ".rail",
          { scaleY: 0 },
          { scaleY: 1, duration: 1.1, ease: "power2.inOut" },
        );
      };

      const fly = () => {
        gsap.to(".counter", { autoAlpha: 0, duration: 0.4, delay: 0.6 });

        const w = wrap.getBoundingClientRect();
        const t = target.getBoundingClientRect();
        const dx = t.left - w.left;
        const dy = t.top - w.top;
        // blown up to fill the viewport height at the midpoint of the trip
        const e = window.innerHeight / w.height;

        imgs.forEach((el, o) => {
          gsap
            .timeline({ onComplete: o === 0 ? intro : undefined })
            .to(
              el,
              {
                scale: 0.5 * e,
                x: 0.5 * dx,
                y: 0.5 * dy,
                duration: DURATION / 2,
                ease: "power4.in",
              },
              ITEM_DELAY * o,
            )
            .to(
              el,
              { scale: 1, x: dx, y: dy, duration: DURATION / 2, ease: "power4" },
              ">=0",
            );
        });
      };

      // pull each client card toward the centre so the intro can spread them out
      const spread = q(".client") as HTMLElement[];
      const mid = (q(".client-row")[0] as HTMLElement).getBoundingClientRect();
      spread.forEach((el) => {
        const b = el.getBoundingClientRect();
        gsap.set(el, {
          x: (mid.left + mid.width / 2 - (b.left + b.width / 2)) * 0.62,
        });
      });

      const tl = gsap.timeline({ delay: 0.8 });

      // the white cover peels upward, uncovering the hero from the bottom up
      tl.to(".cover", { scaleY: 0, duration: 2 }).fromTo(
        imgs,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: POP.duration,
          stagger: POP.total / imgs.length,
          ease: "power4",
          onComplete: fly,
        },
        0,
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="relative h-full w-full overflow-hidden bg-[var(--page)]">
      {/* ---- hero ---- */}
      <div className="absolute inset-0">
        {/* left rail + header rule */}
        <div className="absolute top-[7.56%] left-0 h-px w-full bg-black/[0.09]" />
        <div className="rail absolute top-[7.56%] left-[4.58%] h-[55%] w-px origin-top bg-black/[0.09]" />
        <div className="absolute top-[43.4%] left-[2.29%] size-[5px] -translate-x-1/2 rounded-full border border-black/30" />

        <header className="header absolute inset-x-0 top-0 flex h-[7.56%] items-center">
          <span className="absolute left-[1.53%] grid grid-cols-2 gap-[3px]">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="size-[8px] rounded-[1.5px] bg-[#1d1d1d]" />
            ))}
          </span>
          <span className="absolute left-[5.76%] text-[2.53vw] leading-none font-normal tracking-[-0.005em]">
            Konpo
          </span>
          <span className="absolute right-[16.5%] text-[0.93vw] text-[#1d1d1d]">
            Good afternoon!
          </span>
          <span className="absolute right-[1.18%] flex items-center gap-[0.4vw] rounded-full bg-[#1d1d1d] px-[0.93vw] py-[0.85vh] text-[0.93vw] text-[#f2f0f8]">
            <span className="text-[0.8vw]">↗</span> Hire us
          </span>
        </header>

        <h1 className="absolute top-[24.55%] left-[4.58%] w-[95.42%] text-center text-[5.787vw] leading-[1] font-normal tracking-[-0.045em]">
          <span className="hd-line block overflow-hidden">
            <span className="block">Full-Stack Design</span>
          </span>
          <span className="hd-line block overflow-hidden">
            <span className="block">
              <span className="text-[#9b9aa2] line-through decoration-[2px]">Agency</span>{" "}
              Studio.
            </span>
          </span>
        </h1>

        <div className="absolute top-[63.3%] left-[4.58%] w-[95.42%] text-center">
          <svg
            className="mx-auto mb-[0.9vh]"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1d1d1d"
            strokeWidth="1.4"
          >
            <circle cx="12" cy="12" r="9.5" />
            <ellipse cx="12" cy="12" rx="4.2" ry="9.5" />
            <path d="M2.5 12h19" />
          </svg>
          <p className="text-[0.79vw] leading-[1.32] tracking-[-0.005em] text-[#1d1d1d]">
            Konpo is a plug-and-play crew of seasoned designers,
            <br />
            for CXOs that know design is an unfair advantage.
          </p>
        </div>

        {/* 2rem dot grid behind the client row */}
        <div
          className="dots absolute top-[73.78%] left-[5.76%] h-[70.3%] w-[93.06%]"
          style={{
            backgroundImage: "radial-gradient(rgba(29,29,29,.20) 1px, transparent 1px)",
            backgroundSize: "1.157vw 1.157vw",
          }}
        />

        <div className="client-row absolute top-[75.67%] left-[5.76%] flex w-[93.06%] gap-[1.18%]">
          {CARDS.map((i) => (
            <div
              key={i}
              className={`client ${i === 1 ? "landing-col" : ""} flex-1 overflow-hidden rounded-[0.58vw] bg-black/5`}
              style={{ aspectRatio: "0.7956" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/img/${i + 4}.jpg`} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>

        {/* where the loader stack comes to rest: top of the middle card */}
        <div
          className="landing pointer-events-none absolute top-[75.67%] left-[39.26%] w-[21.5vw] opacity-0"
          style={{ aspectRatio: "1.809" }}
        />
      </div>

      {/* ---- loader ---- */}
      <div className="loader absolute inset-0">
        <div className="cover absolute inset-0 origin-top bg-white" />

        <div className="counter absolute inset-x-0 bottom-[4.1vh] flex justify-center text-[11.5vw] leading-none font-normal tracking-[-0.02em]">
          {[
            ["digit-1", [0, 1]],
            ["digit-2", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]],
            ["digit-3", [...Array(20)].map((_, i) => i % 10).concat(0)],
          ].map(([cls, digits]) => (
            <span key={cls as string} className="h-[1em] overflow-hidden">
              <span className={`${cls} block`}>
                {(digits as number[]).map((d, i) => (
                  <span
                    key={i}
                    className="block h-[1em] w-[0.63em] text-center leading-[1] tabular-nums"
                  >
                    {d}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </div>

        {/* the stack: every card sits in the same grid cell */}
        <div className="absolute inset-0 flex items-start justify-center p-[2.1vh]">
          <div className="stack grid w-[21.5vw] flex-none" style={{ aspectRatio: "1.809" }}>
            {IMAGES.map((src, i) => (
              <div
                key={i}
                className="card overflow-hidden rounded-[0.58vw] will-change-transform"
                style={{ gridArea: "1 / 1 / 2 / 2" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
