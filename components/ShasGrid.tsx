"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sedorim } from "@/constants/shasData";
import { MasechtaCard } from "./MasechtaCard";

export function ShasGrid() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSeder = sedorim[activeIndex];

  const sponsored = activeSeder.masechtot.filter(
    (m) => m.status === "sponsored"
  ).length;
  const total = activeSeder.masechtot.length;

  return (
    <section id="shas" className="relative bg-slate-950 px-6 py-28">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2 bg-gradient-to-b from-amber-500/[0.02] to-transparent blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 text-xs uppercase tracking-widest text-slate-500"
          >
            <span className="h-1 w-1 rounded-full bg-amber-500" />
            Browse the complete Talmud
          </motion.div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Sponsor a{" "}
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Masechta
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-slate-400">
            Choose from {sedorim.length} Sedorim and their Masechtot. Each
            sponsorship supports a dedicated scholar learning on your behalf.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-10 flex justify-center">
          <div className="inline-flex flex-wrap justify-center gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.3)] backdrop-blur-sm">
            {sedorim.map((seder, i) => (
              <button
                key={seder.name}
                onClick={() => setActiveIndex(i)}
                className={`relative rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                  activeIndex === i
                    ? "text-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {activeIndex === i && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_20px_-3px_rgba(212,175,55,0.4)]"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span className="hidden sm:inline">{seder.hebrewName}</span>
                  {seder.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Seder info bar */}
        <motion.div
          key={activeSeder.name + "-info"}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-gradient-to-r from-white/[0.03] to-white/[0.01] px-6 py-5 backdrop-blur-sm sm:flex-row"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">{activeSeder.hebrewName}</span>
            <div>
              <span className="text-sm font-medium text-white">
                {activeSeder.name}
              </span>
              <span className="block text-xs text-slate-500">
                {activeSeder.description}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <span className="text-sm font-semibold text-white">
                {sponsored}
              </span>
              <span className="text-sm text-slate-500">/{total} sponsored</span>
            </div>
            <div className="h-3 w-40 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(sponsored / total) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(212,175,55,0.4)]"
              />
            </div>
          </div>
        </motion.div>

        {/* Cards grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSeder.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {activeSeder.masechtot.map((masechta, i) => (
              <MasechtaCard key={masechta.name} masechta={masechta} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
