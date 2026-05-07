"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "Sponsor", href: "#shas" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Merits", href: "#merits" },
  { label: "Avreichim", href: "#avreichim" },
  { label: "Haskamos", href: "#haskamos" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/[0.06] bg-slate-950/70 shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-2xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-2.5">
          <Logo size={36} />
          <span className="text-lg font-semibold tracking-tight text-white">
            Sponsor<span className="text-amber-500">Shas</span>
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden items-center gap-0.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-1.5 py-1 backdrop-blur-sm lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-full px-4 py-1.5 text-sm text-slate-400 transition-all hover:bg-white/[0.06] hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#shas"
          className="hidden rounded-full bg-gradient-to-r from-amber-600 to-amber-500 px-5 py-2 text-sm font-semibold text-black shadow-[0_0_20px_-5px_rgba(212,175,55,0.3)] transition-all hover:shadow-[0_0_30px_-5px_rgba(212,175,55,0.5)] lg:block"
        >
          Sponsor Now
        </a>

        {/* Mobile menu button */}
        <button
          className="rounded-lg p-2 text-slate-400 hover:text-white lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/[0.06] bg-slate-950/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="px-6 py-4">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  href={link.href}
                  className="block rounded-lg px-4 py-3 text-sm text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}
              <a
                href="#shas"
                className="mt-3 block rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-5 py-3 text-center text-sm font-semibold text-black"
                onClick={() => setMobileOpen(false)}
              >
                Sponsor Now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
