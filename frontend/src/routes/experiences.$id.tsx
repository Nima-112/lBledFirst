import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, MapPin, Users, Calendar, Check } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ImageCarousel } from "@/components/experiences/ImageCarousel";
import { useI18n } from "@/lib/i18n";
import {
  getExperiences,
  getBookings,
  saveBookings,
  useAuth,
  type MockExperience,
  type MockBooking,
} from "@/lib/mock-auth";

export const Route = createFileRoute("/experiences/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Expérience — L'Bled First` },
      { name: "description", content: `Découvrez le programme complet et réservez cette expérience rurale marocaine.` },
    ],
  }),
  component: ExperienceDetailRoute,
});

function ExperienceDetailRoute() {
  const { id } = Route.useParams();
  const [exp, setExp] = useState<MockExperience | null>(null);

  useEffect(() => {
    const found = getExperiences().find((e) => e.id === id) ?? null;
    setExp(found);
  }, [id]);

  if (!exp) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onDiscover={() => window.scrollTo({ top: 600, behavior: "smooth" })} />
        <div className="flex min-h-[70vh] items-center justify-center px-4 text-center">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Expérience introuvable</h1>
            <Link to="/" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return <ExperienceDetail exp={exp} />;
}

function ExperienceDetail({ exp }: { exp: MockExperience }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeDay, setActiveDay] = useState(1);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [guests, setGuests] = useState(2);
  const [confirmed, setConfirmed] = useState(false);

  const total = useMemo(() => exp.price * guests, [exp.price, guests]);
  const program = exp.program.length ? exp.program : [{ day: 1, title: exp.title, description: exp.description, images: exp.images }];
  const active = program.find((p) => p.day === activeDay) ?? program[0];

  const book = () => {
    if (!user) {
      if (typeof window !== "undefined") window.localStorage.setItem("lbf.auth.redirect", `/experiences/${exp.id}`);
      navigate({ to: "/auth" });
      return;
    }
    const booking: MockBooking = {
      id: `b-${Date.now()}`,
      touristId: user.id,
      experienceId: exp.id,
      date: startDate,
      status: "pending",
      totalPrice: total,
      guests,
      createdAt: new Date().toISOString(),
    };
    saveBookings([...getBookings(), booking]);
    setConfirmed(true);
    setTimeout(() => navigate({ to: "/me/bookings" }), 1400);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onDiscover={() => window.scrollTo({ top: 600, behavior: "smooth" })} />

      <div className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {t("exp.detail.back")}
        </Link>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ImageCarousel images={exp.images} alt={exp.title} className="aspect-[16/8] w-full" autoplayMs={5000} />
        </motion.div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                {exp.category}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" /> {exp.region}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" /> {exp.durationDays} {t("exp.detail.days")}
              </span>
            </div>

            <h1 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
              {exp.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {exp.description}
            </p>

            {/* Day-by-day program */}
            <h2 className="mt-10 font-display text-xl font-bold text-foreground">
              {t("exp.detail.program")}
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {program.map((p) => (
                <button
                  key={p.day}
                  onClick={() => setActiveDay(p.day)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeDay === p.day
                      ? "bg-primary text-primary-foreground shadow-warm"
                      : "border border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {t("exp.detail.day")} {p.day}
                </button>
              ))}
            </div>

            <motion.div
              key={active.day}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-lg font-bold text-foreground">
                  {t("exp.detail.day")} {active.day} — {active.title || `${exp.title} (${t("exp.detail.day")} ${active.day})`}
                </h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {active.description || exp.description}
              </p>
              {active.images.length > 0 && (
                <div className="mt-4">
                  <ImageCarousel images={active.images} alt={active.title || exp.title} className="aspect-[16/9] w-full" />
                </div>
              )}
            </motion.div>
          </div>

          {/* Booking box */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("exp.book.from")}
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-foreground">
                {exp.price} <span className="text-base font-medium text-muted-foreground">MAD / {t("exp.book.perPerson")}</span>
              </p>

              <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("exp.book.date")}
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
                <Calendar className="h-4 w-4 text-primary" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>

              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("exp.book.guests")}
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
                <Users className="h-4 w-4 text-primary" />
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={guests}
                  onChange={(e) => setGuests(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
                <span className="text-muted-foreground">{t("exp.book.total")}</span>
                <span className="font-display text-lg font-bold text-foreground">{total} MAD</span>
              </div>

              <button
                onClick={book}
                disabled={confirmed}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-warm transition hover:scale-[1.01] disabled:opacity-70"
              >
                {confirmed ? (<><Check className="h-4 w-4" /> {t("exp.book.confirmed")}</>) : t("exp.book.cta")}
              </button>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                {t("exp.book.hint")}
              </p>
            </div>
          </aside>
        </div>
      </div>

      <div className="mt-24">
        <Footer />
      </div>
    </div>
  );
}
