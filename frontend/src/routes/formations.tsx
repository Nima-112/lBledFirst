import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  BookOpen,
  Clock,
  Search,
  Star,
  Users,
  X,
  Heart,
} from "lucide-react";
import {
  FORMATIONS,
  CATEGORIES,
  LEVELS,
  LANGUAGES,
  formatDuration,
  totalCapsules,
  getFavorites,
  toggleFavorite,
  type Level,
  type Language,
} from "@/lib/formations";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/formations")({
  head: () => ({
    meta: [
      { title: "Formations — L'Bled First" },
      {
        name: "description",
        content:
          "Apprenez les métiers d'art marocains — Tarz Fassi, zellige, poterie, calligraphie — avec des maalems reconnus. Vidéos premium, à votre rythme.",
      },
      { property: "og:title", content: "Formations artisanales marocaines — L'Bled First" },
      {
        property: "og:description",
        content:
          "Préservez le patrimoine marocain grâce à des formations vidéo animées par des experts du terrain.",
      },
    ],
  }),
  component: FormationsPage,
});

type SortKey = "popular" | "top-rated" | "price-asc" | "price-desc" | "shortest";

function FormationsPage() {
  const matches = useMatches();
  const showingDetail = matches.some((match) => match.routeId === "/formations/$slug");
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [language, setLanguage] = useState<Language | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [sort, setSort] = useState<SortKey>("popular");
  const [favTick, setFavTick] = useState(0);
  const favorites = useMemo(() => getFavorites(), [favTick]);

  const filtered = useMemo(() => {
    let list = [...FORMATIONS];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.shortDescription.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          f.instructor.name.toLowerCase().includes(q),
      );
    }
    if (category) list = list.filter((f) => f.category === category);
    if (level) list = list.filter((f) => f.level === level);
    if (language) list = list.filter((f) => f.language === language);
    list = list.filter((f) => f.price <= maxPrice);
    switch (sort) {
      case "top-rated":
        list.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "shortest":
        list.sort((a, b) => a.totalDuration - b.totalDuration);
        break;
      default:
        list.sort((a, b) => b.studentsCount - a.studentsCount);
    }
    return list;
  }, [query, category, level, language, maxPrice, sort]);

  const activeFilters = [category, level, language].filter(Boolean).length;

  if (showingDetail) return <Outlet />;

  return (
    <div className="bg-grain min-h-screen bg-background">
      <Navbar onDiscover={() => {}} />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-background" />
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-saffron/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <span className="font-hand text-base normal-case text-primary">
                {t("formations.kicker")}
              </span>
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-foreground sm:text-6xl">
              Apprenez les métiers d'art{" "}
              <span className="relative inline-block">
                marocains
                <span className="absolute -bottom-2 left-0 right-0 h-2 rounded-full bg-saffron/60" />
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              Formations vidéo premium animées par de véritables maalems — Tarz Fassi,
              zellige, poterie, calligraphie, cuisine et plus. Préservons ensemble le
              patrimoine.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters bar */}
      <section className="sticky top-0 z-30 border-y border-border/60 bg-background/85 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:px-6 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une formation, un maalem, un savoir-faire…"
              className="w-full rounded-full border border-border bg-card py-3 ps-10 pe-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={category ?? ""}
              onChange={(v) => setCategory(v || null)}
              options={[{ value: "", label: "Toutes catégories" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]}
            />
            <Select
              value={level ?? ""}
              onChange={(v) => setLevel((v as Level) || null)}
              options={[{ value: "", label: "Tous niveaux" }, ...LEVELS.map((l) => ({ value: l, label: l }))]}
            />
            <Select
              value={language ?? ""}
              onChange={(v) => setLanguage((v as Language) || null)}
              options={[{ value: "", label: "Langue" }, ...LANGUAGES.map((l) => ({ value: l, label: l }))]}
            />
            <Select
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
              options={[
                { value: "popular", label: "Plus populaires" },
                { value: "top-rated", label: "Meilleures notes" },
                { value: "price-asc", label: "Prix ↑" },
                { value: "price-desc", label: "Prix ↓" },
                { value: "shortest", label: "Plus courtes" },
              ]}
            />
            {activeFilters > 0 && (
              <button
                onClick={() => {
                  setCategory(null);
                  setLevel(null);
                  setLanguage(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
                Effacer ({activeFilters})
              </button>
            )}
          </div>
        </div>
        <div className="mx-auto mt-3 flex max-w-7xl items-center gap-3 px-4 text-xs text-muted-foreground sm:px-6">
          <span className="font-semibold text-foreground">Prix max :</span>
          <input
            type="range"
            min={200}
            max={1500}
            step={50}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="h-1.5 flex-1 max-w-xs cursor-pointer accent-primary"
          />
          <span className="font-mono text-foreground">{maxPrice} MAD</span>
        </div>
      </section>

      {/* Grid */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="mb-8 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            formation{filtered.length > 1 ? "s" : ""} trouvée
            {filtered.length > 1 ? "s" : ""}
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
              <p className="font-display text-xl font-bold">Aucune formation trouvée</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Essayez d'ajuster les filtres ou la recherche.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((f, i) => (
                <motion.article
                  key={f.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-warm"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={f.coverImage}
                      alt={f.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(f.slug);
                        setFavTick((v) => v + 1);
                      }}
                      className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-primary shadow-card backdrop-blur transition hover:scale-110"
                      aria-label="Ajouter aux favoris"
                    >
                      <Heart
                        className={`h-4 w-4 ${favorites.includes(f.slug) ? "fill-primary" : ""}`}
                      />
                    </button>
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                      <Chip>{f.category}</Chip>
                      <Chip tone="saffron">{f.level}</Chip>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-xl font-bold leading-tight text-foreground">
                      {f.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                      {f.shortDescription}
                    </p>

                    <div className="mt-4 flex items-center gap-3 border-t border-border/70 pt-4">
                      <img
                        src={f.instructor.photo}
                        alt={f.instructor.name}
                        className="h-9 w-9 rounded-full object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {f.instructor.name}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {f.instructor.specialty}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                      <MetaCell icon={<Clock className="h-3.5 w-3.5" />}>
                        {formatDuration(f.totalDuration)}
                      </MetaCell>
                      <MetaCell icon={<BookOpen className="h-3.5 w-3.5" />}>
                        {totalCapsules(f)} caps.
                      </MetaCell>
                      <MetaCell icon={<Users className="h-3.5 w-3.5" />}>
                        {f.studentsCount}
                      </MetaCell>
                    </div>

                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-saffron">
                          <Star className="h-4 w-4 fill-saffron" />
                          <span className="text-sm font-bold text-foreground">
                            {f.averageRating.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({f.reviewsCount})
                          </span>
                        </div>
                        <p className="mt-1 font-display text-2xl font-extrabold text-primary">
                          {f.price} <span className="text-sm font-medium text-muted-foreground">MAD</span>
                        </p>
                      </div>
                      <Link
                        to="/formations/$slug"
                        params={{ slug: f.slug }}
                        className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-warm transition hover:scale-105"
                      >
                        Voir la formation
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="cursor-pointer rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Chip({ children, tone = "primary" }: { children: React.ReactNode; tone?: "primary" | "saffron" }) {
  const cls =
    tone === "saffron"
      ? "bg-saffron/90 text-ink"
      : "bg-background/90 text-foreground";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur ${cls}`}>
      {children}
    </span>
  );
}

function MetaCell({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2 py-1.5 font-medium">
      {icon}
      {children}
    </span>
  );
}
