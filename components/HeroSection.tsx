"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { totalDaf, totalMasechtot } from "@/constants/shasData";
import { useEffect, useRef } from "react";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(count, target, { duration: 2, ease: "easeOut" });
    return controls.stop;
  }, [count, target]);

  return (
    <span>
      <motion.span ref={ref}>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6"
    >
      {/* ---- Layered background effects ---- */}
      <div className="pointer-events-none absolute inset-0">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(212,175,55,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.4) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")` }} />
        {/* Radial fade */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgb(2,6,23)_70%)]" />
        {/* Animated orbs */}
        <motion.div
          animate={{ y: [0, -40, 0], x: [0, 20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-amber-500/[0.06] blur-[100px]"
        />
        <motion.div
          animate={{ y: [0, 30, 0], x: [0, -25, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-1/3 bottom-1/3 h-[400px] w-[400px] rounded-full bg-amber-600/[0.05] blur-[100px]"
        />
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-1/4 h-[300px] w-[300px] rounded-full bg-yellow-500/[0.03] blur-[80px]"
        />
        {/* Top beam */}
        <div className="absolute top-0 left-1/2 h-[600px] w-[1px] -translate-x-1/2 bg-gradient-to-b from-amber-500/20 to-transparent" />
        <div className="absolute top-0 left-1/2 h-[400px] w-[200px] -translate-x-1/2 bg-gradient-to-b from-amber-500/[0.03] to-transparent blur-[60px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/[0.08] px-5 py-2 text-sm text-amber-400 shadow-[0_0_20px_-5px_rgba(212,175,55,0.15)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          A new and innovative way to make an impact
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-6 text-5xl font-bold leading-[1.08] tracking-tight sm:text-7xl lg:text-8xl"
        >
          <span className="bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent">
            Eternalize Your
          </span>
          <br />
          <span className="relative">
            <span className="bg-gradient-to-r from-amber-300 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
              Legacy
            </span>
            {/* Underline glow */}
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
              className="absolute -bottom-2 left-0 h-[3px] w-full origin-left bg-gradient-to-r from-amber-500/60 via-amber-400/40 to-transparent"
            />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl"
        >
          Sponsor the learning of Shas by dedicated Torah scholars.
          Each masechta is learned by a talmid chacham, creating an
          eternal merit for you or your loved ones.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-20 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="#shas"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-8 py-4 text-base font-semibold text-black transition-all hover:shadow-[0_0_50px_-5px_rgba(212,175,55,0.5)]"
          >
            <span className="relative z-10">Sponsor a Masechta</span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
          <a
            href="#how-it-works"
            className="group rounded-xl border border-white/10 px-8 py-4 text-base font-medium text-slate-300 transition-all hover:border-white/25 hover:bg-white/[0.03] hover:text-white"
          >
            Learn More
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="grid grid-cols-3 gap-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-8 py-8 backdrop-blur-sm"
        >
          {[
            { value: totalMasechtot, suffix: "", label: "Masechtot" },
            { value: totalDaf, suffix: "+", label: "Total Daf" },
            { value: 3, suffix: "/daf", label: "Starting at", prefix: "$" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-white sm:text-4xl">
                {stat.prefix || ""}
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.a
          href="#shas"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] transition-colors hover:border-amber-500/30"
        >
          <ArrowDown className="h-4 w-4 text-slate-500" />
        </motion.a>
      </motion.div>
    </section>
  );
}
