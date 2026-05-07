"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, Phone, MapPin, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type FormStatus = "idle" | "sending" | "success" | "error";

export function ContactSection() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <section id="contact" className="relative bg-slate-950 px-6 py-28">
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
            Reach out
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Get in Touch
          </h2>
          <p className="mx-auto max-w-lg text-slate-400">
            Have questions about sponsoring a masechta? We&apos;d love to hear
            from you.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01]"
          >
            <div className="p-8">
              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    Message Sent!
                  </h3>
                  <p className="mb-6 text-sm text-slate-400">
                    Thank you for reaching out. We&apos;ll get back to you
                    shortly.
                  </p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="rounded-lg border border-white/10 px-5 py-2 text-sm text-slate-300 transition-colors hover:border-white/20 hover:text-white"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={update("name")}
                        placeholder="Your name"
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/10"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={update("email")}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={update("phone")}
                      placeholder="Your phone number"
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/10"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Message
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={form.message}
                      onChange={update("message")}
                      placeholder="Tell us about the sponsorship you're interested in..."
                      className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/10"
                    />
                  </div>

                  {status === "error" && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      Something went wrong. Please try again or email us
                      directly.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-3.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_40px_-8px_rgba(212,175,55,0.4)] disabled:opacity-70"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {status === "sending" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Contact info cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 transition-all hover:border-amber-500/15">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-600/5 ring-1 ring-amber-500/10">
                <Mail className="h-4 w-4 text-amber-500/60" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-white">Email</h3>
              <a
                href="mailto:sponsorshas@gmail.com"
                className="text-sm text-amber-500/70 hover:text-amber-400"
              >
                sponsorshas@gmail.com
              </a>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 transition-all hover:border-amber-500/15">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-600/5 ring-1 ring-amber-500/10">
                <Phone className="h-4 w-4 text-amber-500/60" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-white">Phone</h3>
              <p className="text-sm text-slate-400">Contact us for details</p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 transition-all hover:border-amber-500/15">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-600/5 ring-1 ring-amber-500/10">
                <MapPin className="h-4 w-4 text-amber-500/60" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-white">
                Location
              </h3>
              <p className="text-sm text-slate-400">Eretz Yisrael</p>
            </div>

            <div className="rounded-2xl border border-amber-500/10 bg-gradient-to-br from-amber-500/[0.05] to-transparent p-6">
              <p className="text-sm leading-relaxed text-slate-400">
                <span className="font-medium text-amber-500/70">
                  Quick response:
                </span>{" "}
                We typically respond within 24 hours. For urgent inquiries,
                please mention it in your message.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
