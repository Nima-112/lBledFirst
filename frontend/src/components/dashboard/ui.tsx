import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X } from "lucide-react";
import type { ReactNode } from "react";

export const fieldCls =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export function PanelHeader({
  title,
  subtitle,
  query,
  setQuery,
  onAdd,
  addLabel,
}: {
  title: string;
  subtitle: string;
  query?: string;
  setQuery?: (v: string) => void;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        {setQuery && (
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
              className="w-44 rounded-full border border-border bg-card py-2.5 ps-9 pe-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-56"
            />
          </div>
        )}
        {onAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-warm transition hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{addLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function IconBtn({
  children,
  onClick,
  label,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border transition ${
        danger ? "text-destructive hover:bg-destructive/10" : "text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

export function Modal({
  open,
  title,
  onClose,
  onSave,
  children,
  size = "lg",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onSave?: () => void;
  children: ReactNode;
  size?: "lg" | "xl" | "2xl" | "3xl";
}) {
  const sizeCls =
    size === "3xl"
      ? "max-w-7xl"
      : size === "2xl"
        ? "max-w-5xl"
        : size === "xl"
          ? "max-w-3xl"
          : "max-w-lg";
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className={`max-h-[90vh] w-full ${sizeCls} overflow-y-auto rounded-t-3xl border border-border bg-card p-6 shadow-warm sm:rounded-3xl`}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
              <button
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">{children}</div>
            {onSave && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  Annuler
                </button>
                <button
                  onClick={onSave}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-warm transition hover:scale-105"
                >
                  Enregistrer
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---- dashboard widgets -----------------------------------------------------

export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = "primary",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: "primary" | "saffron" | "emerald" | "sky";
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    saffron: "bg-saffron/20 text-saffron-foreground",
    emerald: "bg-emerald-500/10 text-emerald-600",
    sky: "bg-sky-500/10 text-sky-600",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          {icon}
        </span>
        {hint && <span className="text-xs font-medium text-muted-foreground">{hint}</span>}
      </div>
      <p className="mt-4 font-display text-3xl font-extrabold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "bg-emerald-500/10 text-emerald-600",
    confirmed: "bg-emerald-500/10 text-emerald-600",
    completed: "bg-sky-500/10 text-sky-600",
    succeeded: "bg-emerald-500/10 text-emerald-600",
    pending: "bg-saffron/20 text-saffron-foreground",
    processing: "bg-saffron/20 text-saffron-foreground",
    draft: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/10 text-destructive",
    archived: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        map[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

export function BarChart({ data, unit }: { data: { label: string; value: number }[]; unit?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-52 items-end gap-3">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-semibold text-foreground">
            {d.value}
            {unit}
          </span>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.value / max) * 100}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full rounded-t-lg bg-gradient-to-t from-primary to-saffron"
            style={{ minHeight: 4 }}
          />
          <span className="text-xs text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex text-saffron" aria-label={`${rating}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "text-saffron" : "text-border"}>
          ★
        </span>
      ))}
    </span>
  );
}
