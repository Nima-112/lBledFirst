import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Star,
  Settings,
  GraduationCap,
  LogOut,
  Pencil,
  Trash2,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  UserCheck,
  Clock,
  MapPin,
  Phone,
  Mail,
  Check,
  Menu,
  Plus,
  X as XIcon,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/landing/Logo";
import { LanguageSelector } from "@/components/landing/LanguageSelector";
import { I18nProvider, useI18n } from "@/lib/i18n";
import {
  getUsers,
  saveUsers,
  getExperiences,
  saveExperiences,
  getBookings,
  saveBookings,
  getReviews,
  userName,
  experienceTitle,
  experienceById,
  emptyExperience,
  type MockUser,
  type MockExperience,
  type MockBooking,
  type MockReview,
  type Role,
  type BookingStatus,
} from "@/lib/mock-auth";
import { useAuth } from "@/context/AuthContext";
import {
  getFormations,
  saveFormations,
  emptyFormation,
  CATEGORIES as FORMATION_CATEGORIES,
  LEVELS,
  LANGUAGES as FORMATION_LANGUAGES,
  formatDuration,
  totalCapsules,
  type Formation,
  type Chapter,
  type Capsule,
} from "@/lib/formations";
import {
  fieldCls,
  PanelHeader,
  IconBtn,
  Field,
  Modal,
  StatCard,
  StatusBadge,
  BarChart,
  Stars,
} from "@/components/dashboard/ui";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Administration — L'Bled First" }] }),
  component: AdminRoute,
});

function AdminRoute() {
  return (
    <I18nProvider>
      <AdminGuard />
    </I18nProvider>
  );
}

function AdminGuard() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && (!user || user.role !== "admin")) navigate({ to: "/auth" });
  }, [ready, user, navigate]);

  if (!ready || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        …
      </div>
    );
  }
  return <AdminDashboard />;
}

type Tab = "dashboard" | "bookings" | "tourists" | "experiences" | "reviews" | "formations" | "settings";

function useNav(): { id: Tab; label: string; icon: React.ReactNode }[] {
  const { t } = useI18n();
  return [
    { id: "dashboard", label: t("admin.nav.dashboard"), icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "bookings", label: t("admin.nav.bookings"), icon: <CalendarCheck className="h-4 w-4" /> },
    { id: "tourists", label: t("admin.nav.tourists"), icon: <Users className="h-4 w-4" /> },
    { id: "experiences", label: t("admin.nav.experiences"), icon: <MapPin className="h-4 w-4" /> },
    { id: "reviews", label: t("admin.nav.reviews"), icon: <Star className="h-4 w-4" /> },
    { id: "formations", label: t("admin.nav.formations"), icon: <GraduationCap className="h-4 w-4" /> },
    { id: "settings", label: t("admin.nav.settings"), icon: <Settings className="h-4 w-4" /> },
  ];
}


function AdminDashboard() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const nav = useNav();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [mobileNav, setMobileNav] = useState(false);

  const [users, setUsers] = useState<MockUser[]>([]);
  const [experiences, setExperiences] = useState<MockExperience[]>([]);
  const [bookings, setBookings] = useState<MockBooking[]>([]);
  const [reviews, setReviews] = useState<MockReview[]>([]);
  const [formations, setFormationsState] = useState<Formation[]>([]);

  useEffect(() => {
    setUsers(getUsers());
    setExperiences(getExperiences());
    setBookings(getBookings());
    setReviews(getReviews());
    setFormationsState(getFormations());
  }, []);

  const updUsers = (n: MockUser[]) => { setUsers(n); saveUsers(n); };
  const updExperiences = (n: MockExperience[]) => { setExperiences(n); saveExperiences(n); };
  const updBookings = (n: MockBooking[]) => { setBookings(n); saveBookings(n); };
  const updFormations = (n: Formation[]) => { setFormationsState(n); saveFormations(n); };

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNav((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border lg:hidden"
              aria-label="menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <Logo />
            <span className="hidden items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <span className="hidden text-sm text-muted-foreground md:inline">{user?.name}</span>
            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">{t("admin.logout")}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[230px_1fr]">
        <aside className={`${mobileNav ? "block" : "hidden"} lg:block lg:sticky lg:top-24 lg:self-start`}>
          <nav className="flex flex-col gap-1.5">
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setMobileNav(false); }}
                className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  tab === item.id
                    ? "bg-primary text-primary-foreground shadow-warm"
                    : "bg-card text-foreground hover:bg-muted"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          {tab === "dashboard" && (
            <DashboardPanel users={users} experiences={experiences} bookings={bookings} reviews={reviews} formations={formations} />
          )}
          {tab === "bookings" && <BookingsPanel bookings={bookings} onChange={updBookings} />}
          {tab === "tourists" && <TouristsPanel users={users} onChange={updUsers} />}
          {tab === "reviews" && <ReviewsPanel experiences={experiences} reviews={reviews} onChange={updExperiences} />}
          {tab === "experiences" && <ExperiencesPanel experiences={experiences} users={users} onChange={updExperiences} />}
          {tab === "formations" && <FormationsPanel formations={formations} onChange={updFormations} />}
          {tab === "settings" && <SettingsPanel />}
        </main>
      </div>
    </div>
  );

}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

function DashboardPanel({
  users,
  experiences,
  bookings,
  reviews,
  formations,
}: {
  users: MockUser[];
  experiences: MockExperience[];
  bookings: MockBooking[];
  reviews: MockReview[];
  formations: Formation[];
}) {
  void formations;

  const revenue = bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((s, b) => s + b.totalPrice, 0);
  const totalTourists = users.filter((u) => u.role === "tourist").length;
  const publishedVideos = experiences.filter((e) => e.status === "published").length;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "—";

  const bookingsByStatus: { label: string; value: number }[] = (
    ["pending", "confirmed", "completed", "cancelled"] as BookingStatus[]
  ).map((s) => ({
    label: s === "pending" ? "Attente" : s === "confirmed" ? "Confirmé" : s === "completed" ? "Terminé" : "Annulé",
    value: bookings.filter((b) => b.status === s).length,
  }));

  const topRegions = useMemo(() => {
    const map = new Map<string, number>();
    bookings.forEach((b) => {
      const region = experienceById(b.experienceId)?.region ?? "—";
      map.set(region, (map.get(region) ?? 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [bookings]);

  return (
    <section>
      <PanelHeader title="Tableau de bord" subtitle="Vue d'ensemble de la plateforme en temps réel." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={<CalendarCheck className="h-5 w-5" />} label="Réservations totales" value={String(bookings.length)} hint="+ ce mois" tone="primary" />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Revenus générés" value={`${revenue.toLocaleString()} MAD`} tone="emerald" />
        <StatCard icon={<UserCheck className="h-5 w-5" />} label="Touristes inscrits" value={String(totalTourists)} tone="saffron" />
        <StatCard icon={<Users className="h-5 w-5" />} label="Expériences publiées" value={String(publishedVideos)} tone="sky" />

        <StatCard icon={<Star className="h-5 w-5" />} label="Note moyenne" value={`${avgRating} / 5`} hint={`${reviews.length} avis`} tone="saffron" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Expériences publiées" value={String(experiences.filter((e) => e.status === "published").length)} tone="primary" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-4 font-display text-base font-bold text-foreground">Réservations par statut</h3>
          <BarChart data={bookingsByStatus} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-4 font-display text-base font-bold text-foreground">Top régions réservées</h3>
          <div className="space-y-3">
            {topRegions.length === 0 && <p className="text-sm text-muted-foreground">Aucune donnée.</p>}
            {topRegions.map(([region, count], i) => {
              const max = topRegions[0][1];
              return (
                <div key={region}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> {region}
                    </span>
                    <span className="font-semibold text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-saffron"
                      style={{ width: `${(count / max) * 100}%`, opacity: 1 - i * 0.12 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card">
        <h3 className="mb-4 font-display text-base font-bold text-foreground">Dernières réservations</h3>
        <div className="space-y-2">
          {bookings.slice(-4).reverse().map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{experienceTitle(b.experienceId)}</p>
                <p className="truncate text-muted-foreground">{userName(b.touristId)} · {b.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-foreground">{b.totalPrice} MAD</span>
                <StatusBadge status={b.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Réservations
// ---------------------------------------------------------------------------

const BOOKING_STATUSES: BookingStatus[] = ["pending", "confirmed", "cancelled", "completed"];

function BookingsPanel({
  bookings,
  onChange,
}: {
  bookings: MockBooking[];
  onChange: (b: MockBooking[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (filter !== "all" && b.status !== filter) return false;
      if (!q) return true;
      return (
        userName(b.touristId).toLowerCase().includes(q) ||
        experienceTitle(b.experienceId).toLowerCase().includes(q)
      );
    });
  }, [bookings, query, filter]);

  const setStatus = (id: string, status: BookingStatus) =>
    onChange(bookings.map((b) => (b.id === id ? { ...b, status } : b)));

  const remove = (id: string) => {
    if (confirm("Supprimer cette réservation ?")) onChange(bookings.filter((b) => b.id !== id));
  };

  return (
    <section>
      <PanelHeader title="Réservations" subtitle="Gérez et suivez l'ensemble des réservations." query={query} setQuery={setQuery} />

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", ...BOOKING_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition ${
              filter === s ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {s === "all" ? "Toutes" : s}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="hidden grid-cols-[1.4fr_1fr_0.8fr_0.7fr_0.9fr_auto] gap-4 border-b border-border bg-muted/50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
          <span>Expérience</span><span>Touriste</span><span>Date</span><span>Montant</span><span>Statut</span><span className="text-end">Actions</span>
        </div>
        {filtered.length === 0 && <p className="px-5 py-10 text-center text-sm text-muted-foreground">Aucune réservation.</p>}
        {filtered.map((b) => (
          <div key={b.id} className="grid grid-cols-1 gap-2 border-b border-border px-5 py-4 last:border-0 md:grid-cols-[1.4fr_1fr_0.8fr_0.7fr_0.9fr_auto] md:items-center md:gap-4">
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{experienceTitle(b.experienceId)}</p>
              <p className="truncate text-xs text-muted-foreground">{b.guests} voyageur(s)</p>
            </div>
            <span className="text-sm text-foreground">{userName(b.touristId)}</span>
            <span className="text-sm text-foreground">{b.date}</span>
            <span className="text-sm font-semibold text-foreground">{b.totalPrice} MAD</span>
            <select
              value={b.status}
              onChange={(e) => setStatus(b.id, e.target.value as BookingStatus)}
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-semibold capitalize outline-none"
            >
              {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex items-center gap-1.5 md:justify-end">
              <IconBtn onClick={() => remove(b.id)} label="Supprimer" danger><Trash2 className="h-4 w-4" /></IconBtn>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Touristes
// ---------------------------------------------------------------------------

const EMPTY_TOURIST = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  country: "",
  nativeLanguage: "",
  role: "tourist" as Role,
};

function TouristsPanel({
  users,
  onChange,
}: {
  users: MockUser[];
  onChange: (u: MockUser[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<MockUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(EMPTY_TOURIST);

  const tourists = useMemo(() => users.filter((u) => u.role === "tourist"), [users]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tourists;
    return tourists.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.country ?? "").toLowerCase().includes(q),
    );
  }, [tourists, query]);

  const startCreate = () => { setDraft(EMPTY_TOURIST); setCreating(true); };
  const startEdit = (u: MockUser) => {
    setDraft({
      fullName: u.fullName, email: u.email, password: u.password, phone: u.phone ?? "",
      country: u.country, nativeLanguage: u.nativeLanguage, role: "tourist",
    });
    setEditing(u);
  };

  const save = () => {
    if (!draft.fullName || !draft.email) return;
    if (editing) {
      onChange(users.map((u) => (u.id === editing.id ? { ...u, ...draft, role: "tourist" } : u)));
      setEditing(null);
    } else {
      onChange([
        ...users,
        { ...draft, role: "tourist", id: `u-${Date.now()}`, password: draft.password || "tourist123", createdAt: new Date().toISOString() },
      ]);
      setCreating(false);
    }
  };

  const remove = (id: string) => {
    if (confirm("Supprimer ce touriste ?")) onChange(users.filter((u) => u.id !== id));
  };

  return (
    <section>
      <PanelHeader title="Touristes" subtitle="Consultez et gérez les utilisateurs inscrits sur la plateforme." query={query} setQuery={setQuery} onAdd={startCreate} addLabel="Nouveau touriste" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 && (
          <p className="col-span-full rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">Aucun touriste.</p>
        )}
        {filtered.map((u) => (
          <article key={u.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary">
                  {u.fullName.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{u.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.country || "—"}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {u.email}</p>
              <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {u.phone || "—"}</p>
              <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {u.nativeLanguage || "—"}</p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-3">
              <IconBtn onClick={() => startEdit(u)} label="Modifier"><Pencil className="h-4 w-4" /></IconBtn>
              <IconBtn onClick={() => remove(u.id)} label="Supprimer" danger><Trash2 className="h-4 w-4" /></IconBtn>
            </div>
          </article>
        ))}
      </div>

      <Modal open={creating || !!editing} title={editing ? "Modifier le touriste" : "Nouveau touriste"} onClose={() => { setCreating(false); setEditing(null); }} onSave={save}>
        <Field label="Nom complet"><input className={fieldCls} value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="E-mail"><input className={fieldCls} type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></Field>
          <Field label="Téléphone"><input className={fieldCls} value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Pays d'origine"><input className={fieldCls} value={draft.country} onChange={(e) => setDraft({ ...draft, country: e.target.value })} /></Field>
          <Field label="Langue maternelle"><input className={fieldCls} value={draft.nativeLanguage} onChange={(e) => setDraft({ ...draft, nativeLanguage: e.target.value })} /></Field>
        </div>
        <Field label="Mot de passe"><input className={fieldCls} value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} /></Field>
      </Modal>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Expériences & avis
// ---------------------------------------------------------------------------

function ReviewsPanel({
  experiences,
  reviews,
  onChange,
}: {
  experiences: MockExperience[];
  reviews: MockReview[];
  onChange: (e: MockExperience[]) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter(
      (r) => experienceTitle(r.experienceId).toLowerCase().includes(q) || r.comment.toLowerCase().includes(q),
    );
  }, [reviews, query]);

  const toggleStatus = (e: MockExperience) =>
    onChange(experiences.map((x) => (x.id === e.id ? { ...x, status: x.status === "published" ? "archived" : "published" } : x)));

  return (
    <section>
      <PanelHeader title="Expériences & avis" subtitle="Consultez les retours des touristes et modérez les expériences." query={query} setQuery={setQuery} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {experiences.map((e) => (
          <article key={e.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{e.category}</p>
                <h3 className="mt-0.5 truncate font-display text-base font-bold text-foreground">{e.title}</h3>
                <p className="text-sm text-muted-foreground">{e.region} · {e.price} MAD</p>
              </div>
              <StatusBadge status={e.status} />
            </div>
            <button
              onClick={() => toggleStatus(e)}
              className="mt-3 w-full rounded-full border border-border py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
            >
              {e.status === "published" ? "Archiver" : "Publier"}
            </button>
          </article>
        ))}
      </div>

      <h3 className="mb-3 font-display text-lg font-bold text-foreground">Avis des utilisateurs</h3>
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">Aucun avis.</p>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">{userName(r.touristId)}</p>
              <Stars rating={r.rating} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{experienceTitle(r.experienceId)} · {new Date(r.createdAt).toLocaleDateString("fr-FR")}</p>
            <p className="mt-2 text-sm text-foreground">{r.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Formations (replaces the old Videos section) — full CRUD
// ---------------------------------------------------------------------------

function FormationsPanel({
  formations,
  onChange,
}: {
  formations: Formation[];
  onChange: (f: Formation[]) => void;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Formation | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Formation>(emptyFormation());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return formations;
    return formations.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.instructor.name.toLowerCase().includes(q),
    );
  }, [formations, query]);

  const startCreate = () => { setDraft(emptyFormation()); setCreating(true); };
  const startEdit = (f: Formation) => { setDraft(structuredClone(f)); setEditing(f); };

  const slugify = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const save = () => {
    if (!draft.title.trim()) return;
    const total = draft.chapters.reduce(
      (s, ch) => s + ch.capsules.reduce((cs, c) => cs + c.duration, 0),
      0,
    );
    const next: Formation = {
      ...draft,
      totalDuration: total || draft.totalDuration,
      slug: draft.slug || slugify(draft.title) || `formation-${Date.now()}`,
    };
    if (editing) {
      onChange(formations.map((f) => (f.slug === editing.slug ? next : f)));
      setEditing(null);
    } else {
      const uniqueSlug = formations.some((f) => f.slug === next.slug)
        ? `${next.slug}-${Date.now()}`
        : next.slug;
      onChange([...formations, { ...next, slug: uniqueSlug }]);
      setCreating(false);
    }
  };

  const remove = (slug: string) => {
    if (confirm(t("admin.formations.confirmDelete"))) {
      onChange(formations.filter((f) => f.slug !== slug));
    }
  };

  return (
    <section>
      <PanelHeader
        title={t("admin.formations.title")}
        subtitle={t("admin.formations.subtitle")}
        query={query}
        setQuery={setQuery}
        onAdd={startCreate}
        addLabel={t("admin.formations.add")}
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 && (
          <p className="col-span-full rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
            {t("admin.formations.empty")}
          </p>
        )}
        {filtered.map((f) => (
          <article key={f.slug} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div className="relative aspect-video overflow-hidden">
              <img src={f.coverImage} alt={f.title} className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground backdrop-blur">
                  {f.category}
                </span>
                <span className="rounded-full bg-saffron/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink backdrop-blur">
                  {f.level}
                </span>
              </div>
              <span className="absolute bottom-3 right-3 rounded-full bg-primary/95 px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-warm">
                {f.price} MAD
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-display text-base font-bold leading-tight text-foreground">{f.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{f.shortDescription}</p>

              <div className="mt-3 flex items-center gap-2 border-t border-border/70 pt-3">
                <img src={f.instructor.photo} alt="" className="h-7 w-7 rounded-full object-cover" />
                <span className="truncate text-xs font-semibold text-foreground">{f.instructor.name}</span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px] font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1">
                  <Clock className="h-3 w-3" /> {formatDuration(f.totalDuration || 0)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1">
                  <GraduationCap className="h-3 w-3" /> {totalCapsules(f)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1">
                  <Users className="h-3 w-3" /> {f.studentsCount}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-1.5 border-t border-border pt-3">
                <Link
                  to="/formations/$slug"
                  params={{ slug: f.slug }}
                  target="_blank"
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted"
                >
                  <ExternalLink className="h-3 w-3" /> {t("admin.formations.view")}
                </Link>
                <div className="flex items-center gap-1.5">
                  <IconBtn onClick={() => startEdit(f)} label={t("admin.formations.edit")}>
                    <Pencil className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn onClick={() => remove(f.slug)} label={t("admin.formations.delete")} danger>
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <FormationEditor
        open={creating || !!editing}
        title={editing ? t("admin.formations.editTitle") : t("admin.formations.createTitle")}
        draft={draft}
        setDraft={setDraft}
        onClose={() => { setCreating(false); setEditing(null); }}
        onSave={save}
      />
    </section>
  );
}

// ---------------------------------------------------------------------------
// FormationEditor — dedicated editor with chapters/capsules/objectives/skills
// ---------------------------------------------------------------------------

function FormationEditor({
  open,
  title,
  draft,
  setDraft,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;
  draft: Formation;
  setDraft: (f: Formation) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const { t } = useI18n();
  const patch = (p: Partial<Formation>) => setDraft({ ...draft, ...p });
  const patchInstructor = (p: Partial<Formation["instructor"]>) =>
    setDraft({ ...draft, instructor: { ...draft.instructor, ...p } });

  const addChapter = () => {
    const order = draft.chapters.length + 1;
    setDraft({
      ...draft,
      chapters: [
        ...draft.chapters,
        { id: `ch-${Date.now()}`, order, title: `${t("admin.formations.chapter")} ${order}`, capsules: [] },
      ],
    });
  };
  const updateChapter = (i: number, patchCh: Partial<Chapter>) => {
    const next = draft.chapters.map((c, idx) => (idx === i ? { ...c, ...patchCh } : c));
    setDraft({ ...draft, chapters: next });
  };
  const removeChapter = (i: number) => {
    const next = draft.chapters.filter((_, idx) => idx !== i).map((c, idx) => ({ ...c, order: idx + 1 }));
    setDraft({ ...draft, chapters: next });
  };
  const addCapsule = (chIdx: number) => {
    const ch = draft.chapters[chIdx];
    const order = ch.capsules.length + 1;
    updateChapter(chIdx, {
      capsules: [
        ...ch.capsules,
        {
          id: `c-${Date.now()}-${order}`,
          order,
          title: `${t("admin.formations.capsule")} ${order}`,
          description: "",
          duration: 10,
          thumbnail: ch.capsules[0]?.thumbnail ?? draft.coverImage,
        },
      ],
    });
  };
  const updateCapsule = (chIdx: number, capIdx: number, p: Partial<Capsule>) => {
    const ch = draft.chapters[chIdx];
    const next = ch.capsules.map((c, i) => (i === capIdx ? { ...c, ...p } : c));
    updateChapter(chIdx, { capsules: next });
  };
  const removeCapsule = (chIdx: number, capIdx: number) => {
    const ch = draft.chapters[chIdx];
    const next = ch.capsules
      .filter((_, i) => i !== capIdx)
      .map((c, i) => ({ ...c, order: i + 1 }));
    updateChapter(chIdx, { capsules: next });
  };

  const listField = (
    label: string,
    values: string[],
    key: "objectives" | "skills" | "prerequisites",
  ) => (
    <Field label={label}>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={fieldCls}
              value={v}
              onChange={(e) => {
                const next = [...values];
                next[i] = e.target.value;
                patch({ [key]: next } as Partial<Formation>);
              }}
            />
            <IconBtn
              onClick={() => patch({ [key]: values.filter((_, idx) => idx !== i) } as Partial<Formation>)}
              label="—"
              danger
            >
              <XIcon className="h-4 w-4" />
            </IconBtn>
          </div>
        ))}
        <button
          type="button"
          onClick={() => patch({ [key]: [...values, ""] } as Partial<Formation>)}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted"
        >
          <Plus className="h-3.5 w-3.5" /> {t("admin.formations.addItem")}
        </button>
      </div>
    </Field>
  );

  return (
    <Modal open={open} title={title} onClose={onClose} onSave={onSave}>
      <div className="space-y-5">
        {/* Core info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("admin.formations.f.title")}>
            <input className={fieldCls} value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label={t("admin.formations.f.slug")}>
            <input className={fieldCls} value={draft.slug} onChange={(e) => patch({ slug: e.target.value })} />
          </Field>
        </div>
        <Field label={t("admin.formations.f.short")}>
          <textarea rows={2} className={fieldCls} value={draft.shortDescription} onChange={(e) => patch({ shortDescription: e.target.value })} />
        </Field>
        <Field label={t("admin.formations.f.long")}>
          <textarea rows={4} className={fieldCls} value={draft.longDescription} onChange={(e) => patch({ longDescription: e.target.value })} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t("admin.formations.f.category")}>
            <select className={fieldCls} value={draft.category} onChange={(e) => patch({ category: e.target.value })}>
              {[...FORMATION_CATEGORIES, "Broderie", "Zellige", "Tissage", "Poterie", "Calligraphie", "Cuisine", "Cuir", "Couture"]
                .filter((v, i, a) => a.indexOf(v) === i)
                .map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
            </select>
          </Field>
          <Field label={t("admin.formations.f.level")}>
            <select className={fieldCls} value={draft.level} onChange={(e) => patch({ level: e.target.value as Formation["level"] })}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <Field label={t("admin.formations.f.language")}>
            <select className={fieldCls} value={draft.language} onChange={(e) => patch({ language: e.target.value as Formation["language"] })}>
              {FORMATION_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t("admin.formations.f.price")}>
            <input type="number" className={fieldCls} value={draft.price} onChange={(e) => patch({ price: Number(e.target.value) })} />
          </Field>
          <Field label={t("admin.formations.f.students")}>
            <input type="number" className={fieldCls} value={draft.studentsCount} onChange={(e) => patch({ studentsCount: Number(e.target.value) })} />
          </Field>
          <Field label={t("admin.formations.f.rating")}>
            <input type="number" step="0.1" min="0" max="5" className={fieldCls} value={draft.averageRating} onChange={(e) => patch({ averageRating: Number(e.target.value) })} />
          </Field>
        </div>

        <Field label={t("admin.formations.f.cover")}>
          <input className={fieldCls} value={draft.coverImage} onChange={(e) => patch({ coverImage: e.target.value })} />
        </Field>

        {/* Lists */}
        {listField(t("admin.formations.f.objectives"), draft.objectives, "objectives")}
        {listField(t("admin.formations.f.skills"), draft.skills, "skills")}
        {listField(t("admin.formations.f.prerequisites"), draft.prerequisites, "prerequisites")}

        {/* Instructor */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4">
          <p className="mb-3 font-display text-sm font-bold text-foreground">
            {t("admin.formations.f.instructor")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("admin.formations.f.iName")}>
              <input className={fieldCls} value={draft.instructor.name} onChange={(e) => patchInstructor({ name: e.target.value })} />
            </Field>
            <Field label={t("admin.formations.f.iSpecialty")}>
              <input className={fieldCls} value={draft.instructor.specialty} onChange={(e) => patchInstructor({ specialty: e.target.value })} />
            </Field>
            <Field label={t("admin.formations.f.iYears")}>
              <input type="number" className={fieldCls} value={draft.instructor.experienceYears} onChange={(e) => patchInstructor({ experienceYears: Number(e.target.value) })} />
            </Field>
            <Field label={t("admin.formations.f.iPhoto")}>
              <input className={fieldCls} value={draft.instructor.photo} onChange={(e) => patchInstructor({ photo: e.target.value })} />
            </Field>
          </div>
          <Field label={t("admin.formations.f.iBio")}>
            <textarea rows={2} className={fieldCls} value={draft.instructor.bio} onChange={(e) => patchInstructor({ bio: e.target.value })} />
          </Field>
        </div>

        {/* Chapters + capsules */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-sm font-bold text-foreground">
              {t("admin.formations.f.chapters")}
            </p>
            <button
              type="button"
              onClick={addChapter}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20"
            >
              <Plus className="h-3.5 w-3.5" /> {t("admin.formations.f.addChapter")}
            </button>
          </div>

          <div className="space-y-3">
            {draft.chapters.length === 0 && (
              <p className="rounded-xl border border-dashed border-border bg-background px-3 py-4 text-center text-xs text-muted-foreground">
                {t("admin.formations.f.noChapters")}
              </p>
            )}
            {draft.chapters.map((ch, i) => (
              <div key={ch.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {ch.order}
                  </span>
                  <input
                    className={fieldCls}
                    value={ch.title}
                    onChange={(e) => updateChapter(i, { title: e.target.value })}
                    placeholder={t("admin.formations.chapter")}
                  />
                  <IconBtn onClick={() => removeChapter(i)} label="—" danger>
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
                <div className="mt-3 space-y-2 ps-9">
                  {ch.capsules.map((c, j) => (
                    <div key={c.id} className="grid gap-2 rounded-lg bg-muted/50 p-2 sm:grid-cols-[auto_1fr_90px_auto]">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-background text-[11px] font-bold text-foreground">
                        {c.order}
                      </span>
                      <input
                        className={fieldCls}
                        value={c.title}
                        onChange={(e) => updateCapsule(i, j, { title: e.target.value })}
                        placeholder={t("admin.formations.capsule")}
                      />
                      <input
                        type="number"
                        className={fieldCls}
                        value={c.duration}
                        onChange={(e) => updateCapsule(i, j, { duration: Number(e.target.value) })}
                        placeholder="min"
                      />
                      <IconBtn onClick={() => removeCapsule(i, j)} label="—" danger>
                        <Trash2 className="h-4 w-4" />
                      </IconBtn>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addCapsule(i)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:bg-muted"
                  >
                    <Plus className="h-3 w-3" /> {t("admin.formations.f.addCapsule")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}




// ---------------------------------------------------------------------------
// Experiences (CRUD + programme jour par jour)
// ---------------------------------------------------------------------------

function ExperiencesPanel({
  experiences,
  users,
  onChange,
}: {
  experiences: MockExperience[];
  users: MockUser[];
  onChange: (n: MockExperience[]) => void;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<MockExperience | null>(null);
  const [isNew, setIsNew] = useState(false);

  const hosts = users.filter((u) => u.role === "admin" || u.role === "tourist");
  const list = useMemo(() => {
    const q = query.toLowerCase();
    return experiences.filter(
      (e) =>
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.region.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q),
    );
  }, [experiences, query]);

  const startCreate = () => {
    const first = hosts[0]?.id ?? "u-host-1";
    setEditing({ ...emptyExperience(first), status: "draft" });
    setIsNew(true);
  };
  const startEdit = (e: MockExperience) => { setEditing({ ...e }); setIsNew(false); };
  const remove = (id: string) => {
    if (!confirm(t("admin.exp.confirmDelete"))) return;
    onChange(experiences.filter((e) => e.id !== id));
  };
  const togglePublish = (e: MockExperience) => {
    onChange(experiences.map((x) => (x.id === e.id ? { ...x, status: x.status === "published" ? "draft" : "published" } : x)));
  };
  const save = () => {
    if (!editing) return;
    // Enforce draft on creation (business rule)
    const clean: MockExperience = {
      ...editing,
      status: isNew ? "draft" : editing.status,
      program: (editing.program ?? []).map((d, i) => ({ ...d, day: i + 1 })).slice(0, editing.durationDays),
    };
    // Ensure program length == durationDays
    while (clean.program.length < clean.durationDays) {
      clean.program.push({ day: clean.program.length + 1, title: "", description: "", images: [] });
    }
    onChange(isNew ? [clean, ...experiences] : experiences.map((e) => (e.id === clean.id ? clean : e)));
    setEditing(null);
    setIsNew(false);
  };

  return (
    <div className="space-y-4">
      <PanelHeader
        title={t("admin.exp.title")}
        subtitle={t("admin.exp.subtitle")}
        query={query}
        setQuery={setQuery}
        onAdd={startCreate}
        addLabel={t("admin.exp.add")}
      />

      {list.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center text-sm text-muted-foreground">
          {t("admin.exp.empty")}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((e) => (
          <div key={e.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div className="relative aspect-video overflow-hidden bg-muted">
              {e.images[0] && <img src={e.images[0]} alt={e.title} className="h-full w-full object-cover" loading="lazy" />}
              <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                e.status === "published" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
              }`}>
                {e.status}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h4 className="line-clamp-1 font-display text-base font-bold text-foreground">{e.title || "—"}</h4>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{e.description || "—"}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1"><MapPin className="h-3 w-3" /> {e.region || "—"}</span>
                <span className="rounded-md bg-muted/60 px-2 py-1">{e.category}</span>
                <span className="rounded-md bg-muted/60 px-2 py-1">{e.durationDays} {t("acts.dayShort")}</span>
                <span className="rounded-md bg-muted/60 px-2 py-1">{e.price} MAD</span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => togglePublish(e)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    e.status === "published"
                      ? "border border-border bg-card text-foreground hover:bg-muted"
                      : "bg-emerald-500 text-white hover:brightness-110"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {e.status === "published" ? t("admin.exp.unpublish") : t("admin.exp.publish")}
                </button>
                <div className="flex items-center gap-1">
                  <IconBtn label="edit" onClick={() => startEdit(e)}><Pencil className="h-4 w-4" /></IconBtn>
                  <IconBtn label="delete" danger onClick={() => remove(e.id)}><Trash2 className="h-4 w-4" /></IconBtn>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!editing}
        onClose={() => { setEditing(null); setIsNew(false); }}
        onSave={save}
        title={isNew ? t("admin.exp.createTitle") : t("admin.exp.editTitle")}
      >
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("admin.exp.f.title")}>
                <input className={fieldCls} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </Field>
              <Field label={t("admin.exp.f.category")}>
                <input className={fieldCls} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
              </Field>
              <Field label={t("admin.exp.f.region")}>
                <input className={fieldCls} value={editing.region} onChange={(e) => setEditing({ ...editing, region: e.target.value })} />
              </Field>
              <Field label={t("admin.exp.f.host")}>
                <select className={fieldCls} value={editing.hostId} onChange={(e) => setEditing({ ...editing, hostId: e.target.value })}>
                  {hosts.map((h) => <option key={h.id} value={h.id}>{h.fullName}</option>)}
                </select>
              </Field>
              <Field label={t("admin.exp.f.price")}>
                <input type="number" className={fieldCls} value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
              </Field>
              <Field label={t("admin.exp.f.duration")}>
                <input type="number" min={1} className={fieldCls} value={editing.durationDays} onChange={(e) => setEditing({ ...editing, durationDays: Math.max(1, Number(e.target.value)) })} />
              </Field>
              <Field label={t("admin.exp.f.lat")}>
                <input type="number" step="0.0001" className={fieldCls} value={editing.latitude} onChange={(e) => setEditing({ ...editing, latitude: Number(e.target.value) })} />
              </Field>
              <Field label={t("admin.exp.f.lng")}>
                <input type="number" step="0.0001" className={fieldCls} value={editing.longitude} onChange={(e) => setEditing({ ...editing, longitude: Number(e.target.value) })} />
              </Field>
            </div>
            <Field label={t("admin.exp.f.description")}>
              <textarea rows={4} className={fieldCls} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </Field>
            <Field label={t("admin.exp.f.images")}>
              <textarea rows={3} className={fieldCls} value={editing.images.join("\n")} onChange={(e) => setEditing({ ...editing, images: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} />
            </Field>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-display text-sm font-bold text-foreground">{t("admin.exp.f.program")}</h4>
                <button
                  type="button"
                  onClick={() => setEditing({
                    ...editing,
                    durationDays: editing.durationDays + 1,
                    program: [...editing.program, { day: editing.program.length + 1, title: "", description: "", images: [] }],
                  })}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                >
                  <Plus className="h-3.5 w-3.5" /> {t("admin.exp.f.addDay")}
                </button>
              </div>
              <div className="space-y-3">
                {editing.program.map((d, i) => (
                  <div key={i} className="rounded-xl border border-border bg-muted/30 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">{t("exp.detail.day")} {i + 1}</span>
                      {editing.program.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setEditing({
                            ...editing,
                            durationDays: Math.max(1, editing.durationDays - 1),
                            program: editing.program.filter((_, j) => j !== i),
                          })}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-destructive hover:underline"
                        >
                          <Trash2 className="h-3 w-3" /> {t("admin.exp.f.removeDay")}
                        </button>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <input
                        className={fieldCls}
                        placeholder={t("admin.exp.f.dayTitle")}
                        value={d.title}
                        onChange={(e) => {
                          const p = [...editing.program];
                          p[i] = { ...p[i], title: e.target.value };
                          setEditing({ ...editing, program: p });
                        }}
                      />
                      <textarea
                        rows={2}
                        className={fieldCls}
                        placeholder={t("admin.exp.f.dayDescription")}
                        value={d.description}
                        onChange={(e) => {
                          const p = [...editing.program];
                          p[i] = { ...p[i], description: e.target.value };
                          setEditing({ ...editing, program: p });
                        }}
                      />
                      <textarea
                        rows={2}
                        className={fieldCls}
                        placeholder={t("admin.exp.f.dayImages")}
                        value={d.images.join("\n")}
                        onChange={(e) => {
                          const p = [...editing.program];
                          p[i] = { ...p[i], images: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) };
                          setEditing({ ...editing, program: p });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


// ---------------------------------------------------------------------------
// Paramètres
// ---------------------------------------------------------------------------

function SettingsPanel() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);

  const [platform, setPlatform] = useState({
    autoConfirm: false,
    allowSignups: true,
    maintenance: false,
    twoFactor: true,
  });

  // Pas encore d'endpoint backend pour mettre à jour le profil (PUT /api/users/me) :
  // ce formulaire est local uniquement pour l'instant.
  const saveProfile = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <section>
      <PanelHeader title="Paramètres d'administration" subtitle="Gérez votre profil et la configuration de la plateforme." />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-4 font-display text-base font-bold text-foreground">Mon profil</h3>
          <div className="space-y-4">
            <Field label="Nom complet"><input className={fieldCls} value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="E-mail"><input className={fieldCls} value={user?.email ?? ""} disabled /></Field>
            <Field label="Téléphone"><input className={fieldCls} value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            <button onClick={saveProfile} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-warm transition hover:scale-105">
              {saved ? <Check className="h-4 w-4" /> : null} {saved ? "Enregistré" : "Enregistrer"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-4 font-display text-base font-bold text-foreground">Paramètres généraux</h3>
          <div className="space-y-1">
            <Toggle label="Confirmation automatique des réservations" hint="Confirmer sans validation manuelle" value={platform.autoConfirm} onChange={(v) => setPlatform({ ...platform, autoConfirm: v })} />
            <Toggle label="Autoriser les inscriptions" hint="Nouveaux comptes touristes / hôtes" value={platform.allowSignups} onChange={(v) => setPlatform({ ...platform, allowSignups: v })} />
            <Toggle label="Authentification à deux facteurs" hint="Sécurité renforcée des comptes admin" value={platform.twoFactor} onChange={(v) => setPlatform({ ...platform, twoFactor: v })} />
            <Toggle label="Mode maintenance" hint="Rendre la plateforme inaccessible" value={platform.maintenance} onChange={(v) => setPlatform({ ...platform, maintenance: v })} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${value ? "bg-primary" : "bg-muted"}`}
        aria-pressed={value}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition ${value ? "start-[22px]" : "start-0.5"}`} />
      </button>
    </div>
  );
}
