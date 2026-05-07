"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, GraduationCap, Clock } from "lucide-react";

interface Avreich {
  id: string;
  name: string;
  imageUrl: string;
}

const stats = [
  { icon: Users, value: "25+", label: "Dedicated Avreichim" },
  { icon: BookOpen, value: "63", label: "Masechtot Covered" },
  { icon: GraduationCap, value: "100%", label: "Talmidei Chachamim" },
  { icon: Clock, value: "Daily", label: "Consistent Learning" },
];

export function AvreichimSection() {
  const [avreichim, setAvreichim] = useState<Avreich[]>([]);

  useEffect(() => {
    fetch("/api/avreichim")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAvreichim(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="avreichim" className="relative bg-slate-950 px-6 py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 text-xs uppercase tracking-widest text-slate-500">
            <span className="h-1 w-1 rounded-full bg-amber-500" />
            Our team
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Our Avreichim
          </h2>
          <p className="mx-auto max-w-2xl text-slate-400">
            Our scholars are Yirei Shamayim and Talmidei Chachamim — God-fearing
            and deeply learned. Each is assigned a different masechta, and
            together they complete the entire Shas on your behalf.
          </p>
        </motion.div>

        {/* Stats row */}
        <div className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 text-center transition-all duration-500 hover:border-amber-500/15 hover:shadow-[0_8px_40px_-12px_rgba(212,175,55,0.1)]"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-600/5 ring-1 ring-amber-500/10 transition-all group-hover:scale-110 group-hover:ring-amber-500/20">
                <stat.icon className="h-5 w-5 text-amber-500/60" />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="mt-1 text-xs text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Scholar gallery */}
        {avreichim.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01]"
          >
            <div className="border-b border-white/[0.06] px-8 py-6">
              <h3 className="text-lg font-semibold text-white">
                Meet Our Avreichim
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Dedicated scholars learning Torah daily on behalf of our sponsors
              </p>
            </div>

            <div className="grid grid-cols-2 gap-px bg-white/[0.04] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {avreichim.map((scholar, i) => (
                <motion.div
                  key={scholar.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="group relative bg-slate-950 transition-colors hover:bg-slate-900/80"
                >
                  <div className="relative aspect-square overflow-hidden">
                    {scholar.imageUrl ? (
                      <img
                        src={scholar.imageUrl}
                        alt={scholar.name || "Avreich"}
                        className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800/80 to-slate-900">
                        <span className="text-4xl font-bold text-amber-500/15 transition-colors group-hover:text-amber-500/25">
                          {(scholar.name || "?")
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-emerald-400">Active</span>
                    </div>
                  </div>

                  <div className="absolute bottom-0 w-full px-3 pb-3">
                    {scholar.name && (
                      <p className="text-sm font-medium leading-tight text-white">
                        {scholar.name}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400">Avreich</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {avreichim.length < 25 && (
              <div className="flex items-center justify-center border-t border-white/[0.06] px-8 py-5">
                <p className="text-sm text-slate-500">
                  ...and more dedicated scholars learning daily
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
