"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Quote } from "lucide-react";

interface Haskama {
  id: string;
  name: string;
  title: string;
  quote: string;
  imageUrl: string;
}

const fallbackHaskamos: Haskama[] = [
  {
    id: "1",
    name: "Rabbi M. Goldstein",
    title: "Mara D'asra, Mishkenos Yaakov",
    quote: "I know several people who learn for Sponsor Shas. They are Yirei Shamayim and Talmidei Chachamim.",
    imageUrl: "",
  },
  {
    id: "2",
    name: "Rav Shimon Sofer",
    title: "Rosh Kollel, Executive Director of Kav Halacha",
    quote: "Sponsoring Shas for a loved one is a form of chesed shel emes — true kindness that transcends this world.",
    imageUrl: "",
  },
  {
    id: "3",
    name: "Rav Elimelech Kornfeld",
    title: "Rav, Kehilas HaGra",
    quote: "I know many of these avreichim personally. They are Talmidei Chachamim and exceptional people.",
    imageUrl: "",
  },
  {
    id: "4",
    name: "Rav Dovid Genish",
    title: "Rav, Kehilat Meam Loez",
    quote: "Be part of sponsoring Shas, our greatest shield in difficult times. What better zechut can there be?",
    imageUrl: "",
  },
  {
    id: "5",
    name: "Rav Gershon Meltzer",
    title: "Rabbinical Authority",
    quote: "This sacred initiative brings tremendous merit to all who participate in supporting authentic Torah learning.",
    imageUrl: "",
  },
];

export function HaskamosSection() {
  const [haskamos, setHaskamos] = useState<Haskama[]>(fallbackHaskamos);

  useEffect(() => {
    fetch("/api/haskamos")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setHaskamos(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="haskamos" className="relative bg-slate-950 px-6 py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/15 bg-amber-500/[0.06] px-5 py-2 text-sm text-amber-400 shadow-[0_0_20px_-5px_rgba(212,175,55,0.1)]">
            <Award className="h-4 w-4" />
            Endorsed by Leading Rabbanim
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Haskamos
          </h2>
          <p className="mx-auto max-w-xl text-slate-400">
            Sponsor Shas has received endorsements from distinguished
            rabbinical authorities who personally vouch for our scholars and
            mission.
          </p>
        </motion.div>

        <div className="grid gap-6">
          {haskamos.map((haskama, i) => (
            <motion.div
              key={haskama.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01] transition-all duration-500 hover:border-amber-500/15 hover:shadow-[0_8px_40px_-12px_rgba(212,175,55,0.1)]"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Rabbi image */}
                <div className="relative w-full shrink-0 sm:w-48">
                  {haskama.imageUrl ? (
                    <img
                      src={haskama.imageUrl}
                      alt={haskama.name}
                      className="h-48 w-full object-cover object-top sm:h-full"
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-slate-800/80 to-slate-900 sm:h-full">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/15 to-amber-600/5 ring-1 ring-amber-500/10">
                        <span className="text-xl font-bold text-amber-500/50">
                          {haskama.name
                            .split(" ")
                            .filter((w) => w.length > 1)
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join("")}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Gradient overlay for blending */}
                  <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-transparent to-slate-950/80 sm:block" />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-center p-6 sm:p-8">
                  <Quote className="mb-3 h-5 w-5 text-amber-500/20" />
                  {haskama.quote && (
                    <blockquote className="mb-5 text-base leading-relaxed text-slate-300 italic">
                      &ldquo;{haskama.quote}&rdquo;
                    </blockquote>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-amber-500/20 to-transparent" />
                    <div className="text-right">
                      <p className="text-sm font-semibold text-amber-500">
                        {haskama.name}
                      </p>
                      {haskama.title && (
                        <p className="text-xs text-slate-500">
                          {haskama.title}
                        </p>
                      )}
                    </div>
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
