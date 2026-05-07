"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, Heart, Star } from "lucide-react";

const steps = [
  {
    icon: BookOpen,
    title: "Choose a Masechta",
    description:
      "Browse the complete Shas and select a tractate to sponsor. Each masechta is priced at just $3 per daf.",
    gradient: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-400",
  },
  {
    icon: Users,
    title: "A Scholar is Assigned",
    description:
      "Your sponsored masechta is assigned to one of our 25+ dedicated Avreichim who will learn it in depth.",
    gradient: "from-purple-500/20 to-purple-600/5",
    iconColor: "text-purple-400",
  },
  {
    icon: Heart,
    title: "Dedicate the Merit",
    description:
      "Designate a name — for a loved one's memory, for health, success, or any personal merit.",
    gradient: "from-rose-500/20 to-rose-600/5",
    iconColor: "text-rose-400",
  },
  {
    icon: Star,
    title: "Eternal Impact",
    description:
      "The merit of Torah learning lasts forever. One who supports Torah study shares equally in its reward.",
    gradient: "from-amber-500/20 to-amber-600/5",
    iconColor: "text-amber-400",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-slate-950 px-6 py-28">
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
            Simple process
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-xl text-slate-400">
            Sponsoring Torah learning is simple, meaningful, and creates a
            lasting spiritual legacy.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="group relative"
            >
              {/* Connecting line */}
              {i < steps.length - 1 && (
                <div className="absolute top-10 left-[calc(50%+40px)] hidden h-[2px] w-[calc(100%-40px)] bg-gradient-to-r from-white/[0.06] to-transparent lg:block" />
              )}

              <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.3)]">
                {/* Step number */}
                <div className="absolute top-4 right-4 text-6xl font-bold text-white/[0.02] transition-colors group-hover:text-white/[0.04]">
                  {i + 1}
                </div>

                {/* Icon with gradient bg */}
                <div
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} ring-1 ring-white/[0.06] transition-all group-hover:scale-110 group-hover:shadow-lg`}
                >
                  <step.icon className={`h-6 w-6 ${step.iconColor}`} />
                </div>

                <h3 className="mb-2 text-base font-semibold text-white">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
