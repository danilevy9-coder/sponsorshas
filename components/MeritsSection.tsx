"use client";

import { motion } from "framer-motion";
import { Scroll } from "lucide-react";

const sources = [
  {
    author: "Chafetz Chaim",
    source: "Torah Or, Parshas Vayigash",
    quote:
      "All the benefit for the soul accomplished by a Talmid Chochom's learning is attributed to the one who facilitated that learning.",
  },
  {
    author: "Vilna Gaon",
    source: "Koheles, Chapter 7, Verse 12",
    quote:
      "Those who are unable to learn themselves but fund others who do, acquire Torah through their resources — as if they had learned it themselves.",
  },
  {
    author: "Sde Chemed",
    source: "Mareches Mem",
    quote:
      "Each person shares reward as if he learned the entire Shas, when part of a collaborative Chaburah arrangement.",
  },
  {
    author: "Rav Chaim Palagi",
    source: "",
    quote:
      "One who supports a Talmid Chochom receives credit as if he himself learned — for one who encourages is greater than the doer.",
  },
  {
    author: "Ohr HaChayim HaKadosh",
    source: "Parshas Balak",
    quote:
      "The supporters of Torah split the reward equally with the learners.",
  },
  {
    author: "Tur & Shulchan Aruch",
    source: "Yoreh De'ah 246",
    quote:
      "Those unable to study due to lack of knowledge or time constraints should support others — it counts as if they learned themselves.",
  },
  {
    author: "Chafetz Chaim",
    source: "Shmirat HaLashon, Sha'ar HaTorah",
    quote:
      "Those who support Torah learners merit future knowledge of Torah themselves, even if unlearned in this world.",
  },
  {
    author: "Yalkut Reuveni",
    source: "Parshas Reah",
    quote:
      "Those who give to Torah scholars in their lifetime will be taught Torah after death.",
  },
];

export function MeritsSection() {
  return (
    <section id="merits" className="relative bg-slate-950 px-6 py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 bg-amber-500/[0.015] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 text-xs uppercase tracking-widest text-slate-500">
            <span className="h-1 w-1 rounded-full bg-amber-500" />
            Words of our sages
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            The Eternal Merit of{" "}
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Sponsoring Torah
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-slate-400">
            Throughout the generations, our greatest sages have taught that
            supporting Torah learning carries immeasurable spiritual reward —
            equal to the learning itself.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2">
          {sources.map((item, i) => (
            <motion.div
              key={`${item.author}-${i}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-6 transition-all duration-500 hover:border-amber-500/15 hover:shadow-[0_8px_40px_-12px_rgba(212,175,55,0.1)]"
            >
              {/* Quote mark watermark */}
              <div className="absolute -top-2 -left-1 text-7xl font-serif text-amber-500/[0.04] transition-colors group-hover:text-amber-500/[0.08]">
                &ldquo;
              </div>

              <Scroll className="mb-3 h-4 w-4 text-amber-500/30" />

              <blockquote className="relative mb-5 text-sm leading-relaxed text-slate-300">
                {item.quote}
              </blockquote>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-amber-500/20 to-transparent" />
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10" />
                  <div className="text-right">
                    <p className="text-xs font-semibold text-amber-500/80">
                      {item.author}
                    </p>
                    {item.source && (
                      <p className="text-[11px] text-slate-500">
                        {item.source}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
