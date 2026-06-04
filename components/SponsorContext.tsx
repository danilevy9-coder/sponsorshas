"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, ShoppingCart, Sparkles, X } from "lucide-react";
import type { Masechta } from "@/constants/shasData";

interface SponsorContextValue {
  selected: Masechta[];
  total: number;
  loading: boolean;
  error: string | null;
  isSelected: (name: string) => boolean;
  toggle: (masechta: Masechta) => void;
  remove: (name: string) => void;
  clear: () => void;
  checkoutSelected: () => Promise<void>;
  checkoutEntireShas: () => Promise<void>;
}

const SponsorContext = createContext<SponsorContextValue | null>(null);

export function useSponsor() {
  const ctx = useContext(SponsorContext);
  if (!ctx) {
    throw new Error("useSponsor must be used within a SponsorProvider");
  }
  return ctx;
}

async function startCheckout(
  body: { items?: string[]; entireShas?: boolean }
): Promise<string> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) {
    throw new Error(data.error || "Could not start checkout.");
  }
  return data.url as string;
}

export function SponsorProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<Masechta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelected = useCallback(
    (name: string) => selected.some((m) => m.name === name),
    [selected]
  );

  const toggle = useCallback((masechta: Masechta) => {
    setError(null);
    setSelected((prev) =>
      prev.some((m) => m.name === masechta.name)
        ? prev.filter((m) => m.name !== masechta.name)
        : [...prev, masechta]
    );
  }, []);

  const remove = useCallback((name: string) => {
    setSelected((prev) => prev.filter((m) => m.name !== name));
  }, []);

  const clear = useCallback(() => setSelected([]), []);

  const total = useMemo(
    () => selected.reduce((sum, m) => sum + m.price, 0),
    [selected]
  );

  const checkoutSelected = useCallback(async () => {
    if (selected.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const url = await startCheckout({ items: selected.map((m) => m.name) });
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }, [selected]);

  const checkoutEntireShas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await startCheckout({ entireShas: true });
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }, []);

  const value: SponsorContextValue = {
    selected,
    total,
    loading,
    error,
    isSelected,
    toggle,
    remove,
    clear,
    checkoutSelected,
    checkoutEntireShas,
  };

  return (
    <SponsorContext.Provider value={value}>
      {children}
      <CheckoutBar />
    </SponsorContext.Provider>
  );
}

/** Floating cart bar — appears once at least one masechta is selected. */
function CheckoutBar() {
  const { selected, total, loading, error, clear, checkoutSelected } =
    useSponsor();

  return (
    <AnimatePresence>
      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-amber-500/20 bg-slate-900/90 p-4 shadow-[0_8px_50px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 ring-1 ring-amber-500/20">
                <ShoppingCart className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {selected.length}{" "}
                  {selected.length === 1 ? "masechta" : "masechtot"} selected
                </p>
                <p className="text-xs text-slate-400">
                  Total:{" "}
                  <span className="font-medium text-amber-400">
                    ${total.toLocaleString()}
                  </span>
                </p>
                {error && (
                  <p className="mt-0.5 text-xs text-rose-400">{error}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clear}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2.5 text-xs font-medium text-slate-400 transition-colors hover:border-white/20 hover:text-white disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
              <button
                onClick={checkoutSelected}
                disabled={loading}
                className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_30px_-6px_rgba(212,175,55,0.5)] disabled:opacity-70 sm:flex-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <span className="relative z-10">→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** The "Sponsor the Entire Shas" CTA — checks out directly. */
export function EntireShasButton() {
  const { loading, checkoutEntireShas } = useSponsor();

  return (
    <button
      onClick={checkoutEntireShas}
      disabled={loading}
      className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-8 py-3.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_40px_-8px_rgba(212,175,55,0.5)] disabled:opacity-70"
    >
      <span className="relative z-10 flex items-center gap-2">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting…
          </>
        ) : (
          "Sponsor the Entire Shas"
        )}
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

/** Brief success banner shown after returning from a completed Stripe checkout. */
export function SponsorSuccessToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("sponsored") === "success") {
      setShow(true);
      // Clean the query param so a refresh doesn't show it again.
      window.history.replaceState({}, "", window.location.pathname + "#shas");
      const t = setTimeout(() => setShow(false), 8000);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-x-0 top-4 z-[60] flex justify-center px-4"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-slate-900/95 px-5 py-3.5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
              <Check className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Thank you for sponsoring Torah learning!
              </p>
              <p className="text-xs text-slate-400">
                Your sponsorship was received. May it be a tremendous zechus.
              </p>
            </div>
            <button
              onClick={() => setShow(false)}
              className="ml-2 text-slate-500 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
