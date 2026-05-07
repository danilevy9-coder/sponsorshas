import { Logo } from "./Logo";

const links = {
  site: [
    { label: "Home", href: "#hero" },
    { label: "Sponsor", href: "#shas" },
    { label: "Avreichim", href: "#avreichim" },
    { label: "Haskamos", href: "#haskamos" },
  ],
  info: [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Merits", href: "#merits" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-slate-950 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Main footer */}
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#hero" className="mb-4 flex items-center gap-2.5">
              <Logo size={32} />
              <span className="text-lg font-semibold tracking-tight text-white">
                Sponsor<span className="text-amber-500">Shas</span>
              </span>
            </a>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
              Sponsor the learning of the entire Talmud by dedicated Torah
              scholars. Create an eternal merit for yourself or your loved ones.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {links.site.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-500 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400">
              Information
            </h4>
            <ul className="space-y-2.5">
              {links.info.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-500 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] py-6 sm:flex-row">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Sponsor Shas. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-600">
            <a href="#" className="transition-colors hover:text-slate-400">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-slate-400">
              Terms of Use
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
