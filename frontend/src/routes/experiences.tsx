import { createFileRoute, Outlet, useMatches, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  MapPin,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  AlertTriangle,
  RefreshCw,
  X,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ImageCarousel } from "@/components/experiences/ImageCarousel";
import { useI18n } from "@/lib/i18n";
import {
  getExperiencesByRegion,
  getExperiencesList,
  getExperiencesPaged,
  type FrontExperience,
} from "@/services/experiences.service";
import { getRegionsList, type FrontRegion } from "@/services/regions.service";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type ExperiencesSearch = { region?: string; category?: string };

export const Route = createFileRoute("/experiences")({
  validateSearch: (search: Record<string, unknown>): ExperiencesSearch => ({
    region: typeof search.region === "string" ? search.region : undefined,
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Expériences — L'Bled First" },
      {
        name: "description",
        content:
          "Découvrez toutes nos expériences rurales marocaines : randonnées, artisanat, cuisine, bivouacs, chez l'habitant et plus.",
      },
      { property: "og:title", content: "Expériences rurales authentiques — L'Bled First" },
      {
        property: "og:description",
        content:
          "Explorez les expériences filmées avec des hôtes ruraux marocains. Réservez en ligne, dans votre langue.",
      },
    ],
  }),
  component: ExperiencesPage,
});

const PAGE_SIZE = 30;

const CATEGORIES = [
  "Hiking",
  "Cuisine",
  "Crafts",
  "Homestays",
  "Culture",
  "Atelier",
  "Nature",
  "Visite",
  "Détente",
];

function ExperiencesPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const matches = useMatches();
  const { region: regionId, category: categoryParam } = Route.useSearch();
  const showingDetail = matches.some((match) => match.routeId === "/experiences/$id");

  const openExperience = (id: string) => {
    try {
      navigate({ to: "/experiences/$id", params: { id } });
    } catch {
      window.location.href = `/experiences/${encodeURIComponent(id)}`;
    }
  };

  const clearRegionFilter = () => {
    navigate({ to: "/experiences", search: (prev) => ({ ...prev, region: undefined }) });
  };

  const clearCategoryFilter = () => {
    setCategory(null);
    navigate({ to: "/experiences", search: (prev) => ({ ...prev, category: undefined }) });
  };

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(categoryParam ?? null);

  useEffect(() => {
    setCategory(categoryParam ?? null);
  }, [categoryParam]);

  const changeCategory = (cat: string | null) => {
    setCategory(cat);
    navigate({
      to: "/experiences",
      search: (prev) => ({ ...prev, category: cat ?? undefined }),
    });
  };

  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [sort, setSort] = useState<string>("popular");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [experiences, setExperiences] = useState<FrontExperience[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [regions, setRegions] = useState<FrontRegion[]>([]);

  useEffect(() => {
    getRegionsList()
      .then(setRegions)
      .catch(() => setRegions([]));
  }, []);

  const activeRegion = regions.find((r) => r.id === regionId);

  // Reset to page 0 whenever the region or category filter changes.
  useEffect(() => {
    setPage(0);
  }, [regionId, category]);

  useEffect(() => {
    if (showingDetail) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (regionId) {
          const list = await getExperiencesByRegion(regionId);
          if (cancelled) return;
          setExperiences(list);
          setTotalElements(list.length);
          setTotalPages(1);
        } else if (category) {
          const list = await getExperiencesList();
          if (cancelled) return;
          setExperiences(list);
          setTotalElements(list.length);
          setTotalPages(1);
        } else {
          const paged = await getExperiencesPaged(page, PAGE_SIZE);
          if (cancelled) return;
          setExperiences(paged.content);
          setTotalElements(paged.totalElements);
          setTotalPages(paged.totalPages);
        }
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Erreur de chargement";
        setError(msg);
        setExperiences([]);
        setTotalElements(0);
        setTotalPages(1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, reloadKey, showingDetail, regionId, category]);

  const filtered = useMemo(() => {
    let list = [...experiences];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (e) =>
          (e.title || "").toLowerCase().includes(q) ||
          (e.description || "").toLowerCase().includes(q) ||
          (e.region || "").toLowerCase().includes(q) ||
          (e.category || "").toLowerCase().includes(q),
      );
    }
    if (category) {
      const catLower = category.toLowerCase().trim();
      list = list.filter((e) => (e.category || "").toLowerCase().trim() === catLower);
    }
    list = list.filter((e) => (e.price ?? 0) <= maxPrice);

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "shortest":
        list.sort((a, b) => a.durationDays - b.durationDays);
        break;
      default:
        break;
    }
    return list;
  }, [experiences, query, category, maxPrice, sort]);

  const count = totalElements;

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
                {t("exp.kicker")}
              </span>
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-foreground sm:text-6xl">
              {activeRegion ? (
                <>
                  Expériences en{" "}
                  <span className="relative inline-block">
                    {activeRegion.name[lang]}
                    <span className="absolute -bottom-2 left-0 right-0 h-2 rounded-full bg-saffron/60" />
                  </span>
                </>
              ) : (
                <>
                  Toutes nos{" "}
                  <span className="relative inline-block">
                    expériences
                    <span className="absolute -bottom-2 left-0 right-0 h-2 rounded-full bg-saffron/60" />
                  </span>
                </>
              )}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              {activeRegion
                ? activeRegion.activity[lang]
                : "Randonnées dans l'Atlas, artisanat berbère, cuisine familiale, bivouacs dans le désert, séjours chez l'habitant… Vivez le Maroc authentique avec des hôtes du territoire."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {regionId && (
                <button
                  onClick={clearRegionFilter}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-3.5 py-1.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {activeRegion ? activeRegion.name[lang] : "Région filtrée"}
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              {category && (
                <button
                  onClick={clearCategoryFilter}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-3.5 py-1.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
                >
                  Catégorie : {category}
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search bar */}
      <section className="sticky top-0 z-30 border-y border-border/60 bg-background/85 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:px-6 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une expérience, une région, une catégorie…"
              className="w-full rounded-full border border-border bg-card py-3 ps-10 pe-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={category ?? ""}
              onChange={(v) => changeCategory(v || null)}
              options={[{ value: "", label: "Toutes catégories" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]}
            />
            <Select
              value={sort}
              onChange={(v) => setSort(v)}
              options={[
                { value: "popular", label: "Plus populaires" },
                { value: "price-asc", label: "Prix ↑" },
                { value: "price-desc", label: "Prix ↓" },
                { value: "shortest", label: "Plus courtes" },
              ]}
            />
            {category && (
              <button
                onClick={clearCategoryFilter}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" /> Effacer
              </button>
            )}
          </div>
        </div>
        <div className="mx-auto mt-3 flex max-w-7xl items-center gap-3 px-4 text-xs text-muted-foreground sm:px-6">
          <span className="font-semibold text-foreground">Prix max :</span>
          <input
            type="range"
            min={200}
            max={3000}
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
            <span className="font-semibold text-foreground">{filtered.length}</span> expérience
            {filtered.length > 1 ? "s" : ""} affichée
            {filtered.length > 1 ? "s" : ""}
            {query.trim() ? " — filtres actifs" : ""}
          </p>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card animate-pulse"
                >
                  <div className="h-60 w-full bg-muted" />
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <div className="h-3 w-2/3 rounded bg-muted" />
                    <div className="h-6 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-5/6 rounded bg-muted" />
                    <div className="h-3 w-2/3 rounded bg-muted" />
                    <div className="h-10 w-1/2 rounded-full bg-muted mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-destructive/40 bg-destructive/5 p-16 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <p className="font-display text-xl font-bold text-destructive">
                Impossible de charger les expériences
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <button
                onClick={() => setReloadKey((k) => k + 1)}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
              >
                <RefreshCw className="h-4 w-4" /> Réessayer
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
              <p className="font-display text-xl font-bold">Aucune expérience trouvée</p>
              <p className="mt-2 text-sm text-muted-foreground">Essayez d'ajuster la recherche.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((e, i) => (
                <ExperienceCard key={e.id} exp={e} index={i} onOpen={openExperience} />
              ))}
            </div>
          )}

          {/* Pagination — shown only if more than one page */}
          {!loading && totalPages > 1 && !query.trim() && (
            <nav
              role="navigation"
              aria-label="pagination"
              className="mx-auto mt-16 flex w-full justify-center"
            >
              <ul className="flex flex-row items-center gap-1">
                <li>
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    aria-label="Page précédente"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "default" }),
                      "gap-1 pl-2.5 disabled:opacity-40 disabled:cursor-not-allowed",
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Précédent</span>
                  </button>
                </li>

                {buildPageList(page, totalPages).map((item, idx) =>
                  item === "ellipsis" ? (
                    <li key={`e-${idx}`} aria-hidden>
                      <span className="flex h-9 w-9 items-center justify-center">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Plus de pages</span>
                      </span>
                    </li>
                  ) : (
                    <li key={`p-${item}`}>
                      <button
                        onClick={() => setPage(item as number)}
                        aria-current={item === page ? "page" : undefined}
                        className={cn(
                          buttonVariants({
                            variant: item === page ? "outline" : "ghost",
                            size: "icon",
                          }),
                        )}
                      >
                        {(item as number) + 1}
                      </button>
                    </li>
                  ),
                )}

                <li>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    aria-label="Page suivante"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "default" }),
                      "gap-1 pr-2.5 disabled:opacity-40 disabled:cursor-not-allowed",
                    )}
                  >
                    <span>Suivant</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function buildPageList(current: number, total: number): (number | "ellipsis")[] {
  const pages: (number | "ellipsis")[] = [];
  if (total <= 7) {
    for (let i = 0; i < total; i++) pages.push(i);
    return pages;
  }
  pages.push(0);
  if (current > 2) pages.push("ellipsis");
  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 3) pages.push("ellipsis");
  pages.push(total - 1);
  return pages;
}

function ExperienceCard({
  exp,
  index,
  onOpen,
}: {
  exp: FrontExperience;
  index: number;
  onOpen: (id: string) => void;
}) {
  const { t } = useI18n();
  const expId = String(exp.id);
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.05 }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-warm"
    >
      <div className="relative">
        <ImageCarousel
          images={exp.images}
          alt={exp.title}
          rounded="rounded-none"
          className="h-60 w-full"
          autoplayMs={0}
        />
        <span className="absolute end-3 top-3 rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground shadow-warm">
          {exp.price} MAD
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-4 text-sm font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" /> {exp.region}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" /> {exp.durationDays}
            {t("acts.dayShort")}
          </span>
        </div>

        <h3 className="mt-4 font-display text-3xl font-bold leading-tight text-foreground">
          {exp.title}
        </h3>

        <p className="mt-4 line-clamp-3 flex-1 text-base leading-relaxed text-muted-foreground">
          {exp.description}
        </p>

        <button
          type="button"
          onClick={() => onOpen(expId)}
          className="mt-6 inline-flex w-fit items-center justify-center gap-2 rounded-full border-2 border-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-primary transition-all hover:bg-primary hover:text-primary-foreground"
        >
          {t("acts.viewProgram")}
          <span className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
            →
          </span>
        </button>
      </div>
    </motion.article>
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
