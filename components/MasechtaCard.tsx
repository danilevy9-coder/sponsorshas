"use client";

import { motion } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";
import type { Masechta } from "@/constants/shasData";

interface MasechtaCardProps {
  masechta: Masechta;
  index: number;
}

export function MasechtaCard({ masechta, index }: MasechtaCardProps) {
  const isSponsored = masechta.status === "sponsored";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: "easeOut" }}
      className="group relative"
    >
      {/* Animated border gradient for available cards */}
      {!isSponsored && (
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/0 opacity-0 transition-all duration-500 group-hover:from-amber-500/30 group-hover:via-amber-500/10 group-hover:to-amber-400/20 group-hover:opacity-100" />
      )}

      <div
        className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
          isSponsored
            ? "border-amber-500/15 bg-gradient-to-br from-amber-950/20 to-slate-900/50 opacity-70"
            : "border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] hover:bg-gradient-to-br hover:from-white/[0.07] hover:to-white/[0.02] hover:shadow-[0_8px_40px_-12px_rgba(212,175,55,0.2)]"
        } backdrop-blur-md`}
      >
        {/* Sponsored ribbon */}
        {isSponsored && (
          <div className="absolute top-0 right-0 z-10">
            <div className="flex items-center gap-1.5 rounded-bl-xl bg-gradient-to-r from-amber-600 to-amber-500 px-3 py-1.5 text-xs font-semibold text-black shadow-[0_2px_10px_-2px_rgba(212,175,55,0.4)]">
              <Sparkles className="h-3 w-3" />
              Sponsored
            </div>
          </div>
        )}

        {/* Shine effect on hover */}
        {!isSponsored && (
          <div className="pointer-events-none absolute -inset-full top-0 z-10 block -translate-x-full rotate-12 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        )}

        <div className="relative p-5">
          {/* Hebrew name as watermark */}
          <div className="absolute top-3 right-4 font-serif text-3xl leading-none text-white/[0.04] select-none transition-colors group-hover:text-amber-500/[0.06]">
            {masechta.hebrewName}
          </div>

          {/* English name */}
          <h3 className="mb-3 text-lg font-semibold tracking-tight text-white">
            {masechta.name}
          </h3>

          {/* Stats row */}
          <div className="mb-4 flex items-center gap-3 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-slate-500" />
              {masechta.pages} daf
            </span>
            <span className="h-3 w-px bg-white/10" />
            <span className="font-medium text-amber-500/70">
              ${masechta.price}
            </span>
          </div>

          {/* Bottom section */}
          {isSponsored ? (
            <div className="rounded-lg border border-amber-500/10 bg-amber-500/[0.04] px-3 py-2.5">
              <p className="text-xs text-amber-500/50 italic">
                {masechta.sponsor}
              </p>
            </div>
          ) : (
            <button className="relative w-full cursor-pointer overflow-hidden rounded-lg border border-amber-500/20 bg-amber-500/[0.08] px-4 py-2.5 text-sm font-medium text-amber-400 transition-all duration-300 hover:border-amber-500/40 hover:bg-amber-500/15 hover:text-amber-300 hover:shadow-[0_0_20px_-5px_rgba(212,175,55,0.15)]">
              Sponsor This Masechta
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
