"use client";

import { motion } from "framer-motion";
import { Quote, Shield, Heart, Lightbulb } from "lucide-react";

const reasons = [
  {
    icon: Heart,
    title: "L'iluy Nishmas",
    description: "Elevate the soul of a departed loved one with the ultimate merit of Torah learning.",
  },
  {
    icon: Shield,
    title: "Refuah Sheleimah",
    description: "Create a powerful spiritual merit for the recovery and health of someone in need.",
  },
  {
    icon: Lightbulb,
    title: "Hatzlacha & Shidduchim",
    description: "Sponsor learning for success in business, finding one's match, or any personal need.",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="relative bg-slate-950 px-6 py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 text-xs uppercase tracking-widest text-slate-500">
            <span className="h-1 w-1 rounded-full bg-amber-500" />
            Our mission
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            About Sponsor Shas
          </h2>
        </motion.div>

        {/* Main content card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01]"
        >
          <div className="p-8 sm:p-10">
            <p className="mb-6 text-lg leading-relaxed text-slate-300">
              Sponsor Shas enables individuals to sponsor the learning of the
              entire Talmud by a group of dedicated Talmidei Chachamim. Each
              scholar is assigned a different tractate, and collectively they
              complete all of Shas on the sponsor&apos;s behalf.
            </p>
            <p className="mb-6 leading-relaxed text-slate-400">
              Whether you wish to create a merit for the elevation of a loved
              one&apos;s neshamah, for health, for success, for shidduchim, or
              for any personal need — sponsoring Torah learning is one of the
              most powerful spiritual acts one can perform.
            </p>
            <p className="leading-relaxed text-slate-400">
              Our Avreichim are experienced, dedicated Torah scholars who learn
              each masechta with depth and devotion. With over 25 scholars in our
              program, the entire Shas is learned with the highest standard of
              Torah study.
            </p>
          </div>
        </motion.div>

        {/* Reasons to sponsor */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-6 transition-all duration-500 hover:border-amber-500/15"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-600/5 ring-1 ring-amber-500/10">
                <reason.icon className="h-5 w-5 text-amber-500/60" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">
                {reason.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-amber-500/10 bg-gradient-to-br from-amber-500/[0.06] via-amber-500/[0.02] to-transparent p-8 sm:p-10"
        >
          {/* Decorative */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-amber-500/[0.05] blur-[60px]" />

          <Quote className="mb-4 h-8 w-8 text-amber-500/20" />
          <blockquote className="relative z-10">
            <p className="mb-5 text-xl leading-relaxed text-slate-200 italic sm:text-2xl">
              &ldquo;One who supports a Torah scholar is regarded as if he
              himself had studied Torah.&rdquo;
            </p>
            <footer className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-amber-500/20 to-transparent" />
              <span className="text-sm font-medium text-amber-500/60">
                Chafetz Chaim
              </span>
            </footer>
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}
