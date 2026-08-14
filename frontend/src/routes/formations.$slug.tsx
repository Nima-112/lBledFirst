import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { resolveUploadUrl } from "@/lib/asset-url";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  Download,
  Lock,
  MessageSquare,
  Play,
  ShieldCheck,
  Star,
  Users,
  X,
  Heart,
} from "lucide-react";
import { BookingCheckoutModal } from "@/components/booking/BookingCheckoutModal";
import { formatDuration, totalCapsules, type Formation, type Capsule } from "@/lib/formations";
import {
  getFormationDetail,
  purchaseFormationApi,
  getFormationProgressApi,
  toggleCapsuleCompletionApi,
  getCapsuleCaptionsApi,
  toggleFormationFavoriteApi,
  getMyFavoriteFormations,
} from "@/services/formations.service";
import { CaptionedVideoPlayer } from "@/components/formations/CaptionedVideoPlayer";
import {
  getReviewsForFormation,
  createFormationReview,
  type FrontReview,
} from "@/services/reviews.service";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/formations/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Formation — L'Bled First` },
      { name: "description", content: "Formation vidéo premium animée par un maalem marocain." },
      { property: "og:title", content: `Formation — L'Bled First` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      // params referenced so head() is a function of the URL
      { property: "og:url", content: `/formations/${params.slug}` },
    ],
  }),
  component: FormationDetail,
});

function FormationDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user, ready: authReady } = useAuth();
  const queryClient = useQueryClient();
  const [checkoutTrigger, setCheckoutTrigger] = useState(false);

  const { data: f, isLoading } = useQuery({
    queryKey: ["formations", slug],
    queryFn: () => getFormationDetail(slug),
    retry: false,
  });
  const ready = !isLoading;

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [slug]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const checkoutParam = new URLSearchParams(window.location.search).get("checkout");
      if (checkoutParam === "1") {
        setCheckoutTrigger(true);
      }
    } catch {
      // ignore
    }
  }, [slug]);

  const [openChapter, setOpenChapter] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [certificateOpen, setCertificateOpen] = useState(false);
  const [activeCapsule, setActiveCapsule] = useState<Capsule | null>(null);

  useEffect(() => {
    if (f && !openChapter) setOpenChapter(f.chapters[0]?.id ?? null);
  }, [f, openChapter]);

  const purchased = f?.purchased ?? false;

  const { data: progress = [] } = useQuery({
    queryKey: ["formations", slug, "progress"],
    queryFn: () => getFormationProgressApi(slug),
    enabled: !!user && purchased,
  });

  const purchaseMutation = useMutation({
    mutationFn: () => purchaseFormationApi(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formations", slug] });
    },
  });

  const { data: favoriteFormations = [] } = useQuery({
    queryKey: ["formations", "favorites"],
    queryFn: getMyFavoriteFormations,
    enabled: !!user,
  });
  const isFavorited = favoriteFormations.some((fav) => fav.slug === slug);

  const toggleFavoriteMutation = useMutation({
    mutationFn: () => toggleFormationFavoriteApi(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formations", "favorites"] });
    },
  });

  const handleToggleFavorite = () => {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  const toggleCapsuleMutation = useMutation({
    mutationFn: (capsuleId: string) => toggleCapsuleCompletionApi(slug, capsuleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formations", slug, "progress"] });
    },
  });

  useEffect(() => {
    if (!f || !authReady || !user || purchased) return;
    if (checkoutTrigger) {
      setCheckoutOpen(true);
      setCheckoutTrigger(false);
      if (typeof window !== "undefined") {
        try {
          window.history.replaceState(null, "", window.location.pathname);
        } catch {
          /* ignore */
        }
      }
    }
  }, [authReady, f, purchased, user, checkoutTrigger, navigate]);

  const capsuleCount = f ? totalCapsules(f) : 0;
  const progressPct = capsuleCount === 0 ? 0 : Math.round((progress.length / capsuleCount) * 100);
  const completed = progressPct === 100;

  const handleUnlock = () => {
    if (!f || !authReady) return;
    if (!user) {
      window.localStorage.setItem("lbf.auth.redirect", `/formations/${f.slug}?checkout=1`);
      navigate({ to: "/auth" });
      return;
    }
    setCheckoutOpen(true);
  };

  if (ready && !f) {
    return (
      <div className="bg-grain min-h-screen bg-background">
        <Navbar onDiscover={() => {}} />
        <div className="mx-auto max-w-2xl px-4 pt-40 pb-24 text-center">
          <p className="font-hand text-2xl text-primary">Formation introuvable</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-foreground">
            Cette formation n'existe pas ou a été retirée.
          </h1>
          <button
            onClick={() => navigate({ to: "/formations" })}
            className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-warm"
          >
            ← Toutes les formations
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!f) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        …
      </div>
    );
  }

  return (
    <div className="bg-grain min-h-screen bg-background">
      <Navbar onDiscover={() => {}} />

      {/* Banner */}
      <section className="relative isolate overflow-hidden pt-24 pb-14 sm:pt-32 sm:pb-20">
        <div className="absolute inset-0 -z-10">
          <img
            src={resolveUploadUrl(f.coverImage) || f.coverImage}
            alt=""
            className="h-full w-full object-cover"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/70 to-ink/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Link
            to="/formations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-card/80 transition hover:text-card"
          >
            ← Toutes les formations
          </Link>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-card"
            >
              <div className="flex flex-wrap gap-2">
                <BannerChip>{f.category}</BannerChip>
                <BannerChip tone="saffron">{f.level}</BannerChip>
                <BannerChip>{f.language}</BannerChip>
              </div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight sm:text-5xl">
                  {f.title}
                </h1>
                {(!user || user.role === "tourist") && (
                  <button
                    onClick={handleToggleFavorite}
                    className="mt-5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white shadow backdrop-blur transition hover:scale-110"
                    aria-label="Ajouter aux favoris"
                  >
                    <Heart
                      className={`h-5 w-5 ${isFavorited ? "fill-white text-white" : "text-white"}`}
                    />
                  </button>
                )}
              </div>
              <p className="mt-4 max-w-2xl text-base text-card/85 sm:text-lg">
                {f.shortDescription}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-card/90">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-saffron text-saffron" />
                  <span className="font-bold text-card">{f.averageRating.toFixed(1)}</span>
                  <span className="text-card/70">({f.reviewsCount} avis)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> {f.studentsCount} étudiants
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {formatDuration(f.totalDuration)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" /> {capsuleCount} capsules · {f.chapters.length}{" "}
                  chapitres
                </span>
              </div>
            </motion.div>

            {/* Buy card */}
            <motion.aside
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-3xl border border-border bg-card p-6 shadow-warm backdrop-blur-lg"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display text-4xl font-extrabold text-primary">
                  {f.price} <span className="text-base font-medium text-muted-foreground">MAD</span>
                </span>
                {purchased && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600">
                    <Check className="h-3 w-3" /> Achetée
                  </span>
                )}
              </div>

              {purchased ? (
                <div className="mt-5 space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Ma progression</span>
                      <span className="text-foreground">{progressPct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-saffron"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveCapsule(f.chapters[0].capsules[0])}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-warm transition hover:scale-[1.02]"
                  >
                    <Play className="h-4 w-4" /> Reprendre la formation
                  </button>
                  {completed && (
                    <button
                      onClick={() => setCertificateOpen(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-saffron bg-saffron/10 px-5 py-3 text-sm font-bold text-foreground transition hover:bg-saffron/20"
                    >
                      <Award className="h-4 w-4 text-saffron" /> Voir mon certificat
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleUnlock}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-warm transition hover:scale-[1.02]"
                >
                  <CreditCard className="h-4 w-4" /> Acheter maintenant
                </button>
              )}

              <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Accès à vie
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Certificat de réussite
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Support du maalem
                </li>
              </ul>
            </motion.aside>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-14">
            {/* Presentation */}
            <div>
              <SectionKicker>Présentation</SectionKicker>
              <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-foreground/90">
                {f.longDescription}
              </p>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <InfoBlock title="Objectifs pédagogiques" items={f.objectives} tone="primary" />
                <InfoBlock title="Compétences acquises" items={f.skills} tone="saffron" />
              </div>
              {f.prerequisites.length > 0 && (
                <div className="mt-6">
                  <InfoBlock title="Prérequis" items={f.prerequisites} tone="muted" />
                </div>
              )}
            </div>

            {/* Program */}
            <div>
              <SectionKicker>Programme</SectionKicker>
              <p className="mt-2 text-sm text-muted-foreground">
                {f.chapters.length} chapitres · {capsuleCount} capsules vidéo
              </p>

              <div className="mt-6 space-y-3">
                {f.chapters.map((ch: import("@/lib/formations").Chapter) => {
                  const open = openChapter === ch.id;
                  const chapterDone = ch.capsules.every((c: Capsule) => progress.includes(c.id));
                  return (
                    <div
                      key={ch.id}
                      className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
                    >
                      <button
                        onClick={() => setOpenChapter(open ? null : ch.id)}
                        className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-muted/40"
                      >
                        <span
                          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-extrabold ${
                            chapterDone
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {chapterDone ? <Check className="h-4 w-4" /> : ch.order}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-base font-bold text-foreground">
                            Chapitre {ch.order} · {ch.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ch.capsules.length} capsules ·{" "}
                            {formatDuration(
                              ch.capsules.reduce((s: number, c: Capsule) => s + c.duration, 0),
                            )}
                          </p>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 text-muted-foreground transition-transform ${
                            open ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="border-t border-border/70"
                          >
                            {ch.capsules.map((c: Capsule) => {
                              const done = progress.includes(c.id);
                              return (
                                <li
                                  key={c.id}
                                  className="flex items-center gap-4 border-b border-border/40 px-5 py-3 last:border-b-0"
                                >
                                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                                    <img
                                      src={resolveUploadUrl(c.thumbnail) || c.thumbnail}
                                      alt=""
                                      className="h-full w-full object-cover"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-ink/30">
                                      {purchased ? (
                                        <Play className="h-5 w-5 fill-card text-card" />
                                      ) : (
                                        <Lock className="h-4 w-4 text-card" />
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="truncate text-sm font-semibold text-foreground">
                                      {c.order}. {c.title}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                      {c.description}
                                    </p>
                                  </div>
                                  <span className="hidden text-xs font-mono text-muted-foreground sm:inline">
                                    {c.duration} min
                                  </span>
                                  {purchased ? (
                                    <button
                                      onClick={() => setActiveCapsule(c)}
                                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20"
                                    >
                                      <Play className="h-3 w-3" />
                                      {done ? "Revoir" : "Regarder"}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={handleUnlock}
                                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-muted"
                                    >
                                      <Lock className="h-3 w-3" />
                                      Débloquer
                                    </button>
                                  )}
                                </li>
                              );
                            })}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {!purchased && (
                <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center">
                  <Lock className="h-6 w-6 text-primary" />
                  <p className="font-display text-lg font-bold text-foreground">
                    Toutes les capsules sont verrouillées
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Débloquez la formation complète pour un accès à vie.
                  </p>
                  <button
                    onClick={handleUnlock}
                    className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-warm transition hover:scale-105"
                  >
                    Débloquer la formation — {f.price} MAD
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Instructor sidebar */}
          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
                <SectionKicker small>Votre formateur</SectionKicker>
                <div className="mt-4 flex items-center gap-4">
                  <img
                    src={f.instructor.photo}
                    alt={f.instructor.name}
                    className="h-16 w-16 rounded-2xl object-cover ring-2 ring-primary/20"
                  />
                  <div>
                    <p className="font-display text-lg font-extrabold text-foreground">
                      {f.instructor.name}
                    </p>
                    <p className="text-sm text-primary">{f.instructor.specialty}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {f.instructor.bio}
                </p>

                <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border/70 pt-5 text-center">
                  <InstructorStat label="Années" value={`${f.instructor.experienceYears}+`} />
                  <InstructorStat label="Formations" value={f.instructor.totalFormations} />
                  <InstructorStat
                    label="Note"
                    value={
                      <span className="inline-flex items-center gap-0.5">
                        {f.instructor.averageRating.toFixed(1)}
                        <Star className="h-3.5 w-3.5 fill-saffron text-saffron" />
                      </span>
                    }
                  />
                </dl>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  <Users className="mr-1 inline h-3 w-3" />
                  {f.instructor.studentsTrained} étudiants formés
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <FormationReviews formation={f} completed={completed} isLoggedIn={!!user} />

      <Footer />

      <BookingCheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        variant="formation"
        item={{
          id: String(f.id ?? slug),
          title: f.title,
          hostName: f.instructor.name,
          region: f.category,
          guests: 1,
          unitPrice: f.price,
          coverImage: resolveUploadUrl(f.coverImage) || f.coverImage,
        }}
        defaultEmail={user?.email}
        defaultName={user?.name}
        onConfirm={async () => {
          await purchaseMutation.mutateAsync();
          setTimeout(() => setCheckoutOpen(false), 1200);
        }}
      />

      {/* Video player modal */}
      <VideoModal
        slug={slug}
        capsule={activeCapsule}
        onClose={() => setActiveCapsule(null)}
        onComplete={(id) => {
          toggleCapsuleMutation.mutate(id);
        }}
        isDone={(id) => progress.includes(id)}
      />

      {/* Certificate modal */}
      <CertificateModal
        open={certificateOpen}
        onClose={() => setCertificateOpen(false)}
        formation={f}
      />
    </div>
  );
}

function SectionKicker({ children, small }: { children: React.ReactNode; small?: boolean }) {
  return (
    <div>
      <span className="font-hand text-primary" style={{ fontSize: small ? "1.25rem" : "1.75rem" }}>
        {children}
      </span>
      <div
        className={`mt-1 h-1 rounded-full bg-gradient-to-r from-primary to-saffron ${small ? "w-10" : "w-16"}`}
      />
    </div>
  );
}

function BannerChip({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "saffron";
}) {
  const cls =
    tone === "saffron"
      ? "bg-saffron text-ink"
      : "bg-card/20 text-card border border-card/30 backdrop-blur";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${cls}`}>
      {children}
    </span>
  );
}

function InfoBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "primary" | "saffron" | "muted";
}) {
  const toneCls: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    saffron: "bg-saffron/20 text-saffron-foreground",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <h3 className="font-display text-base font-extrabold text-foreground">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-foreground/90">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2.5">
            <span
              className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${toneCls[tone]}`}
            >
              <Check className="h-3 w-3" />
            </span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function InstructorStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dd className="font-display text-lg font-extrabold text-foreground">{value}</dd>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
    </div>
  );
}

function VideoModal({
  slug,
  capsule,
  onClose,
  onComplete,
  isDone,
}: {
  slug: string;
  capsule: Capsule | null;
  onClose: () => void;
  onComplete: (id: string) => void;
  isDone: (id: string) => boolean;
}) {
  // Captions are only available once the AI pipeline has finished processing
  // this capsule's video (processingStatus === "DONE"). Fetching earlier
  // would 404 or return an empty translation_json.
  const captionsQuery = useQuery({
    queryKey: ["formations", slug, "capsules", capsule?.id, "captions"],
    queryFn: () => getCapsuleCaptionsApi(slug, capsule!.id),
    enabled: !!capsule && capsule.processingStatus === "DONE",
  });

  return (
    <AnimatePresence>
      {capsule && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-card shadow-warm"
          >
            <div className="relative aspect-video bg-ink">
              {capsule.videoUrl ? (
                <CaptionedVideoPlayer
                  src={resolveUploadUrl(capsule.videoUrl) || capsule.videoUrl}
                  poster={resolveUploadUrl(capsule.thumbnail) || undefined}
                  captions={captionsQuery.data}
                />
              ) : (
                <>
                  <img
                    src={resolveUploadUrl(capsule.thumbnail) || capsule.thumbnail}
                    alt=""
                    className="h-full w-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-warm">
                      <Play className="h-8 w-8 fill-current" />
                    </span>
                  </div>
                </>
              )}
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink/60 text-card backdrop-blur transition hover:bg-ink/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="font-display text-lg font-extrabold text-foreground">
                {capsule.order}. {capsule.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{capsule.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  <Clock className="mr-1 inline h-3 w-3" /> {capsule.duration} min
                </span>
                <button
                  onClick={() => {
                    onComplete(capsule.id);
                    onClose();
                  }}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    isDone(capsule.id)
                      ? "border border-border text-muted-foreground hover:bg-muted"
                      : "bg-emerald-500 text-white hover:bg-emerald-600"
                  }`}
                >
                  {isDone(capsule.id) ? "Marquer comme non vue" : "Marquer comme terminée"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CertificateModal({
  open,
  onClose,
  formation,
}: {
  open: boolean;
  onClose: () => void;
  formation: Formation;
}) {
  const code = useMemo(
    () =>
      `LBF-${formation.slug.slice(0, 4).toUpperCase()}-${Date.now().toString(36).slice(-6).toUpperCase()}`,
    [formation.slug, open],
  );
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, rotateX: -10 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border-4 border-saffron/60 bg-gradient-to-br from-card to-background p-8 shadow-warm sm:p-12"
          >
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>

            <div
              className="absolute inset-0 -z-10 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 30%, currentColor 0, transparent 40%), radial-gradient(circle at 80% 70%, currentColor 0, transparent 40%)",
              }}
            />

            <div className="text-center">
              <Award className="mx-auto h-12 w-12 text-saffron" />
              <p className="mt-3 font-hand text-3xl text-primary">Certificat de réussite</p>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                L'Bled First Academy
              </p>

              <div className="my-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              <p className="text-sm text-muted-foreground">Ce certificat est décerné à</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-foreground">
                {typeof window !== "undefined"
                  ? (JSON.parse(window.localStorage.getItem("lbf.v2.session") ?? "null")?.name ??
                    "Étudiant L'Bled First")
                  : "Étudiant L'Bled First"}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                pour avoir complété avec succès la formation
              </p>
              <p className="mt-1 font-display text-xl font-bold text-primary">
                « {formation.title} »
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                animée par{" "}
                <span className="font-semibold text-foreground">{formation.instructor.name}</span>
              </p>

              <div className="mt-8 flex items-end justify-between gap-4 border-t border-border/60 pt-6 text-left">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Délivré le
                  </p>
                  <p className="font-display text-sm font-bold">{today}</p>
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Code de vérification
                  </p>
                  <p className="font-mono text-xs">{code}</p>
                </div>
                <div
                  className="grid h-20 w-20 grid-cols-6 gap-[2px] rounded bg-foreground p-1"
                  aria-label="QR code de vérification (démo)"
                  title={code}
                >
                  {Array.from({ length: 36 }).map((_, i) => (
                    <span
                      key={i}
                      className={`block ${(i * 7 + code.charCodeAt(i % code.length)) % 3 === 0 ? "bg-background" : "bg-foreground"}`}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-warm transition hover:scale-105"
              >
                <Download className="h-4 w-4" /> Télécharger (PDF)
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ----------------------------------------------------------------------------
// Section avis — visible par tout le monde. Le formulaire est toujours
// affiché, mais ne peut être soumis (côté serveur ET côté client) que si
// l'utilisateur a acheté ET terminé toutes les capsules de la formation.
// ----------------------------------------------------------------------------
function FormationReviews({
  formation,
  completed,
  isLoggedIn,
}: {
  formation: Formation;
  completed: boolean;
  isLoggedIn: boolean;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const reviewsQuery = useQuery({
    queryKey: ["formations", formation.slug, "reviews"],
    queryFn: () => getReviewsForFormation(formation.id!),
    enabled: !!formation.id,
  });

  const reviews = reviewsQuery.data ?? [];
  const alreadyReviewed = formation.reviewed ?? false;
  const canSubmit = isLoggedIn && completed && !alreadyReviewed;

  const submitMutation = useMutation({
    mutationFn: () => createFormationReview(formation.id!, rating, comment),
    onSuccess: () => {
      setRating(0);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["formations", formation.slug, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["formations", formation.slug] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || rating === 0) return;
    submitMutation.mutate();
  };

  return (
    <section className="border-t border-border py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionKicker>Avis des étudiants</SectionKicker>
        <div className="mt-3 flex items-center gap-3">
          <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
            {formation.reviewsCount > 0
              ? `${formation.averageRating.toFixed(1)} / 5 · ${formation.reviewsCount} avis`
              : "Aucun avis pour le moment"}
          </h2>
        </div>

        {/* Formulaire — toujours visible, activé seulement si éligible */}
        <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-card">
          <p className="font-display text-lg font-bold text-foreground">Laisser un avis</p>

          {!isLoggedIn && (
            <p className="mt-2 text-sm text-muted-foreground">
              Connectez-vous pour laisser un avis sur cette formation.
            </p>
          )}
          {isLoggedIn && !completed && (
            <p className="mt-2 text-sm text-muted-foreground">
              Vous pourrez publier un avis une fois que vous aurez terminé toutes les capsules de la
              formation.
            </p>
          )}
          {isLoggedIn && completed && alreadyReviewed && (
            <p className="mt-2 text-sm text-muted-foreground">
              Vous avez déjà laissé un avis pour cette formation — merci !
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={!canSubmit}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-6 w-6 transition ${
                      n <= (hoverRating || rating) ? "fill-saffron text-saffron" : "text-muted"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={!canSubmit}
              placeholder="Qu'avez-vous pensé de cette formation ?"
              rows={3}
              className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
            />

            {submitMutation.isError && (
              <p className="mt-2 text-sm text-red-500">
                Une erreur est survenue lors de l'envoi de votre avis. Réessayez.
              </p>
            )}

            <div className="mt-3 flex items-center gap-3">
              {isLoggedIn ? (
                <button
                  type="submit"
                  disabled={!canSubmit || rating === 0 || submitMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-warm transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                >
                  {submitMutation.isPending ? "Envoi…" : "Publier mon avis"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate({ to: "/auth" })}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-warm transition hover:scale-105"
                >
                  Se connecter
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Liste des avis */}
        <div className="mt-8 space-y-4">
          {reviews.length === 0 && !reviewsQuery.isLoading && (
            <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
              Cette formation n'a pas encore reçu d'avis.
            </p>
          )}
          {reviews.map((r: FrontReview) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary">
                    {(r.touristName ?? "?").charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {r.touristName ?? "Étudiant"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-3.5 w-3.5 ${
                        n <= r.rating ? "fill-saffron text-saffron" : "text-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {r.comment && (
                <div className="mt-3 flex items-start gap-2">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="text-sm leading-relaxed text-foreground/80">{r.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
