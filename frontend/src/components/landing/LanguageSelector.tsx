import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check, ChevronDown } from "lucide-react";
import { LANGUAGES, useI18n, type Lang } from "@/lib/i18n";

type Props = {
  variant?: "light" | "dark";
  align?: "start" | "end";
};

export function LanguageSelector({ variant = "dark", align = "end" }: Props) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang)!;

  const triggerClass =
    variant === "light"
      ? "border-card/30 bg-card/10 text-card-foreground backdrop-blur-md hover:bg-card/20"
      : "border-border bg-card text-foreground hover:bg-muted";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${triggerClass}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="h-4 w-4" />
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.code.toUpperCase()}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className={`absolute z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-border bg-popover p-1.5 text-popover-foreground shadow-card ${
              align === "end" ? "end-0" : "start-0"
            }`}
            role="listbox"
          >
            {LANGUAGES.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setLang(l.code as Lang);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-muted"
                  role="option"
                  aria-selected={l.code === lang}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">{l.flag}</span>
                    <span>{l.label}</span>
                  </span>
                  {l.code === lang && <Check className="h-4 w-4 text-primary" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
