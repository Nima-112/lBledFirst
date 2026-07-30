import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cdnAssetUrl } from "@/lib/asset-url";

import r6 from "@/assets/rural/rural-6.jpg.asset.json";
import r7 from "@/assets/rural/rural-7.jpg.asset.json";
import r8 from "@/assets/rural/rural-8.jpg.asset.json";
import r9 from "@/assets/rural/rural-9.jpg.asset.json";
import r10 from "@/assets/rural/rural-10.jpg.asset.json";
import r11 from "@/assets/rural/rural-11.jpg.asset.json";
import r12 from "@/assets/rural/rural-12.jpg.asset.json";
import r13 from "@/assets/rural/rural-13.jpg.asset.json";
import r14 from "@/assets/rural/rural-14.jpg.asset.json";
import r15 from "@/assets/rural/rural-15.jpg.asset.json";
import u16 from "@/assets/rural/up-16.jpg.asset.json";
import u17 from "@/assets/rural/up-17.jpg.asset.json";
import u18 from "@/assets/rural/up-18.jpg.asset.json";
import u19 from "@/assets/rural/up-19.jpg.asset.json";
import u20 from "@/assets/rural/up-20.jpg.asset.json";
import u21 from "@/assets/rural/up-21.jpg.asset.json";
import u22 from "@/assets/rural/up-22.jpg.asset.json";
import u23 from "@/assets/rural/up-23.jpg.asset.json";
import u24 from "@/assets/rural/up-24.jpg.asset.json";

const IMG = {
  r6: cdnAssetUrl(r6.url), r7: cdnAssetUrl(r7.url), r8: cdnAssetUrl(r8.url),
  r9: cdnAssetUrl(r9.url), r10: cdnAssetUrl(r10.url), r11: cdnAssetUrl(r11.url),
  r12: cdnAssetUrl(r12.url), r13: cdnAssetUrl(r13.url), r14: cdnAssetUrl(r14.url),
  r15: cdnAssetUrl(r15.url),
  u16: cdnAssetUrl(u16.url), u17: cdnAssetUrl(u17.url), u18: cdnAssetUrl(u18.url),
  u19: cdnAssetUrl(u19.url), u20: cdnAssetUrl(u20.url), u21: cdnAssetUrl(u21.url),
  u22: cdnAssetUrl(u22.url), u23: cdnAssetUrl(u23.url), u24: cdnAssetUrl(u24.url),
};

// ----------------------------------------------------------------------------
// FRONTEND-ONLY mock data + auth. Everything is persisted in localStorage.
// ----------------------------------------------------------------------------

export type Role = "tourist" | "host" | "admin";

export type MockUser = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string; // base64 data URL
  country: string;
  nativeLanguage: string;
  role: Role;
  region?: string;
  bio?: string;
  createdAt: string;
};

export type ExperienceStatus = "draft" | "published" | "archived";

export type DayProgram = {
  day: number;
  title: string;
  description: string;
  images: string[];
};

export type MockExperience = {
  id: string;
  hostId: string;
  title: string;
  description: string;
  price: number;
  /** Duration in days (1, 2, 3…). */
  durationDays: number;
  region: string;
  category: string;
  latitude: number;
  longitude: number;
  status: ExperienceStatus;
  /** Cover carousel images (landing + hero). */
  images: string[];
  /** Day-by-day program (length ≥ durationDays). */
  program: DayProgram[];
  createdAt: string;
};

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type MockBooking = {
  id: string;
  touristId: string;
  experienceId: string;
  date: string;
  status: BookingStatus;
  totalPrice: number;
  guests: number;
  createdAt: string;
};

export type MockReview = {
  id: string;
  touristId: string;
  experienceId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

// Legacy — still referenced by a couple of files, kept as a no-op type.
export type VideoStatus = "draft" | "published" | "processing";
export type MockVideo = {
  id: string;
  hostId: string;
  experienceId?: string;
  title: string;
  region: string;
  category: string;
  tags?: string;
  status: VideoStatus;
  languageOriginal: string;
  createdAt: string;
};

// ----------------------------------------------------------------------------
// Storage — bump version whenever the seed schema changes.
// ----------------------------------------------------------------------------

const V = "lbf.v3";
const USERS_KEY = `${V}.users`;
const SESSION_KEY = `${V}.session`;
const VIDEOS_KEY = `${V}.videos`;
const EXPERIENCES_KEY = `${V}.experiences`;
const BOOKINGS_KEY = `${V}.bookings`;
const REVIEWS_KEY = `${V}.reviews`;

// ---- seeds ----------------------------------------------------------------

const SEED_USERS: MockUser[] = [
  { id: "u-admin", fullName: "Admin L'Bled", email: "admin@lbledfirst.ma", password: "admin123", phone: "+212 600-000000", country: "Maroc", nativeLanguage: "Français", role: "admin", createdAt: "2026-01-05T09:00:00.000Z" },
  { id: "u-host-1", fullName: "Brahim Aït Toubkal", email: "brahim@host.ma", password: "host123", phone: "+212 661-112233", country: "Maroc", nativeLanguage: "Amazigh", role: "host", region: "Imlil — Marrakech-Safi", bio: "Guide de montagne depuis 15 ans dans le Haut Atlas.", createdAt: "2026-01-20T09:00:00.000Z" },
  { id: "u-host-2", fullName: "Khadija El Merzougi", email: "khadija@host.ma", password: "host123", phone: "+212 662-445566", country: "Maroc", nativeLanguage: "Arabe", role: "host", region: "Merzouga — Drâa-Tafilalet", bio: "Famille nomade, bivouacs et dîners sous les étoiles.", createdAt: "2026-02-01T09:00:00.000Z" },
  { id: "u-host-3", fullName: "Youssef Ouzoud", email: "youssef@host.ma", password: "host123", phone: "+212 663-778899", country: "Maroc", nativeLanguage: "Amazigh", role: "host", region: "Ouzoud — Béni Mellal-Khénifra", bio: "Passionné des cascades et de la cuisine du terroir.", createdAt: "2026-02-10T09:00:00.000Z" },
  { id: "u-tourist-1", fullName: "Sofia Martín", email: "sofia@example.com", password: "demo123", phone: "+34 600-111222", country: "España", nativeLanguage: "Español", role: "tourist", createdAt: "2026-02-11T14:20:00.000Z" },
  { id: "u-tourist-2", fullName: "Liam O'Connor", email: "liam@example.com", password: "demo123", phone: "+353 830-333444", country: "Ireland", nativeLanguage: "English", role: "tourist", createdAt: "2026-02-18T10:00:00.000Z" },
  { id: "u-tourist-3", fullName: "Camille Dubois", email: "camille@example.com", password: "demo123", phone: "+33 610-555666", country: "France", nativeLanguage: "Français", role: "tourist", createdAt: "2026-03-02T16:40:00.000Z" },
];

const SEED_EXPERIENCES: MockExperience[] = [
  {
    id: "e-mountain-treks",
    hostId: "u-host-1",
    title: "Mountain Treks — High Atlas",
    description:
      "Trois jours de randonnée dans le Haut Atlas avec un guide berbère. Sentiers cachés, villages accrochés à la montagne, nuits chez l'habitant et petits-déjeuners face aux sommets.",
    price: 1200,
    durationDays: 3,
    region: "Imlil",
    category: "Hiking",
    latitude: 31.14,
    longitude: -7.92,
    status: "published",
    images: [IMG.r15, IMG.u16, IMG.r7, IMG.u17],
    program: [
      { day: 1, title: "Arrivée à Imlil & montée douce", description: "Accueil au village, thé à la menthe, mise en jambes vers Aroumd et nuit dans un gîte familial.", images: [IMG.r15, IMG.u16] },
      { day: 2, title: "Ascension vers le refuge du Toubkal", description: "Marche d'altitude entre pierriers et cascades. Repas berbère au refuge, ciel étoilé.", images: [IMG.u17, IMG.r7] },
      { day: 3, title: "Retour par la vallée d'Imenane", description: "Descente panoramique par un vallon secret, déjeuner chez une famille, retour à Marrakech.", images: [IMG.r10, IMG.r13] },
    ],
    createdAt: "2026-03-01T08:00:00.000Z",
  },
  {
    id: "e-tea-ceremonies",
    hostId: "u-host-3",
    title: "Tea Ceremonies with Village Elders",
    description:
      "Une journée d'immersion dans le rituel du thé à la menthe : cueillette, gestes du service, hauteur du versé, tradition des trois verres.",
    price: 220,
    durationDays: 1,
    region: "Chefchaouen",
    category: "Cuisine",
    latitude: 35.17,
    longitude: -5.27,
    status: "published",
    images: [IMG.u21, IMG.r6, IMG.u18],
    program: [
      { day: 1, title: "Rituel du thé, du jardin à la tasse", description: "Cueillette de la menthe, préparation traditionnelle, apprentissage des trois verres (amer, doux, tendre) chez un ancien.", images: [IMG.u21, IMG.r6, IMG.u18] },
    ],
    createdAt: "2026-03-04T08:00:00.000Z",
  },
  {
    id: "e-artisan-workshops",
    hostId: "u-host-3",
    title: "Artisan Workshops — Argan Cooperative",
    description:
      "Deux jours dans une coopérative de femmes berbères : concassage, torréfaction et pressage de l'huile d'argan, atelier de tissage.",
    price: 640,
    durationDays: 2,
    region: "Ouzoud",
    category: "Crafts",
    latitude: 32.02,
    longitude: -6.72,
    status: "published",
    images: [IMG.u20, IMG.r9, IMG.r11],
    program: [
      { day: 1, title: "Fabrication de l'huile d'argan", description: "Découverte du fruit, ateliers pratiques, dégustations.", images: [IMG.u20, IMG.r9] },
      { day: 2, title: "Tissage berbère", description: "Motifs, symboles, un petit tissage à emporter.", images: [IMG.r11, IMG.r12] },
    ],
    createdAt: "2026-03-06T08:00:00.000Z",
  },
  {
    id: "e-desert-camps",
    hostId: "u-host-2",
    title: "Desert Camps under the Stars",
    description:
      "Deux nuits à Erg Chebbi : méharée au coucher du soleil, dîner nomade sous les étoiles, tambours Gnawa et lever de soleil sur les dunes.",
    price: 1400,
    durationDays: 2,
    region: "Merzouga",
    category: "Homestays",
    latitude: 31.10,
    longitude: -4.01,
    status: "published",
    images: [IMG.u22, IMG.r8, IMG.r14],
    program: [
      { day: 1, title: "Arrivée & coucher de soleil à dos de dromadaire", description: "Méharée dans les dunes, dîner et musique Gnawa autour du feu.", images: [IMG.u22, IMG.r8] },
      { day: 2, title: "Lever de soleil & retour", description: "Silence du désert, petit-déjeuner à l'ombre du bivouac, retour au village.", images: [IMG.r14, IMG.u22] },
    ],
    createdAt: "2026-03-09T08:00:00.000Z",
  },
  {
    id: "e-cooking-locals",
    hostId: "u-host-1",
    title: "Cooking with Locals — Tagine & Msemen",
    description:
      "Une journée en cuisine familiale : marché du matin, préparation d'un tagine lent, msemen à la plancha berbère et repas partagé.",
    price: 280,
    durationDays: 1,
    region: "Aït Bouguemez",
    category: "Cuisine",
    latitude: 31.63,
    longitude: -6.40,
    status: "published",
    images: [IMG.u23, IMG.r13, IMG.r10],
    program: [
      { day: 1, title: "Du souk à la table", description: "Marché, cuisine à quatre mains, dégustation autour d'un grand plat commun.", images: [IMG.u23, IMG.r13, IMG.r10] },
    ],
    createdAt: "2026-03-12T08:00:00.000Z",
  },
  {
    id: "e-valley-walks",
    hostId: "u-host-3",
    title: "Valley Walks — Aït Bouguemez",
    description:
      "Deux jours de balades douces dans la Vallée Heureuse : palmeraies, greniers collectifs et déjeuner chez une famille.",
    price: 520,
    durationDays: 2,
    region: "Aït Bouguemez",
    category: "Hiking",
    latitude: 31.66,
    longitude: -6.44,
    status: "published",
    images: [IMG.u24, IMG.r12, IMG.r7],
    program: [
      { day: 1, title: "Boucle des villages", description: "Traversée de hameaux perchés, terrasses cultivées, repas berbère.", images: [IMG.u24, IMG.r12] },
      { day: 2, title: "Grenier collectif & source sacrée", description: "Marche vers un agadir millénaire, temps de partage avec les habitants.", images: [IMG.r7, IMG.u24] },
    ],
    createdAt: "2026-03-15T08:00:00.000Z",
  },
];

const SEED_BOOKINGS: MockBooking[] = [
  { id: "b-1", touristId: "u-tourist-1", experienceId: "e-mountain-treks", date: "2026-04-12", status: "confirmed", totalPrice: 2400, guests: 2, createdAt: "2026-03-20T10:00:00.000Z" },
  { id: "b-2", touristId: "u-tourist-2", experienceId: "e-desert-camps", date: "2026-04-18", status: "pending", totalPrice: 1400, guests: 1, createdAt: "2026-03-22T10:00:00.000Z" },
  { id: "b-3", touristId: "u-tourist-3", experienceId: "e-artisan-workshops", date: "2026-03-28", status: "completed", totalPrice: 1280, guests: 2, createdAt: "2026-03-10T10:00:00.000Z" },
  { id: "b-4", touristId: "u-tourist-1", experienceId: "e-tea-ceremonies", date: "2026-04-02", status: "completed", totalPrice: 440, guests: 2, createdAt: "2026-03-15T10:00:00.000Z" },
  { id: "b-5", touristId: "u-tourist-2", experienceId: "e-cooking-locals", date: "2026-04-25", status: "cancelled", totalPrice: 280, guests: 1, createdAt: "2026-03-24T10:00:00.000Z" },
  { id: "b-6", touristId: "u-tourist-3", experienceId: "e-valley-walks", date: "2026-05-01", status: "confirmed", totalPrice: 1040, guests: 2, createdAt: "2026-03-27T10:00:00.000Z" },
];

const SEED_REVIEWS: MockReview[] = [
  { id: "r-1", touristId: "u-tourist-3", experienceId: "e-artisan-workshops", rating: 5, comment: "Une expérience inoubliable, l'accueil était incroyable !", createdAt: "2026-03-29T12:00:00.000Z" },
  { id: "r-2", touristId: "u-tourist-1", experienceId: "e-tea-ceremonies", rating: 4, comment: "Le rituel est apaisant et l'ancien est adorable.", createdAt: "2026-04-03T12:00:00.000Z" },
  { id: "r-3", touristId: "u-tourist-2", experienceId: "e-mountain-treks", rating: 5, comment: "Le lever du soleil sur l'Atlas vaut chaque minute de marche.", createdAt: "2026-04-14T12:00:00.000Z" },
];

const SEED_VIDEOS: MockVideo[] = [];

// ---- helpers --------------------------------------------------------------

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

function seededGetter<T>(key: string, seed: T[]): T[] {
  const data = safeRead<T[]>(key, []);
  if (data.length === 0) {
    safeWrite(key, seed);
    return seed;
  }
  return data;
}

export const getUsers = () => seededGetter(USERS_KEY, SEED_USERS);
export const saveUsers = (u: MockUser[]) => safeWrite(USERS_KEY, u);
export const getExperiences = () => seededGetter(EXPERIENCES_KEY, SEED_EXPERIENCES);
export const saveExperiences = (e: MockExperience[]) => safeWrite(EXPERIENCES_KEY, e);
export const getBookings = () => seededGetter(BOOKINGS_KEY, SEED_BOOKINGS);
export const saveBookings = (b: MockBooking[]) => safeWrite(BOOKINGS_KEY, b);
export const getReviews = () => seededGetter(REVIEWS_KEY, SEED_REVIEWS);
export const saveReviews = (r: MockReview[]) => safeWrite(REVIEWS_KEY, r);
export const getVideos = () => seededGetter(VIDEOS_KEY, SEED_VIDEOS);
export const saveVideos = (v: MockVideo[]) => safeWrite(VIDEOS_KEY, v);

export const adminGetUsers = getUsers;
export const adminSaveUsers = saveUsers;

// ---- factories ------------------------------------------------------------

export function emptyExperience(hostId = "u-host-1"): MockExperience {
  return {
    id: `e-${Date.now()}`,
    hostId,
    title: "",
    description: "",
    price: 0,
    durationDays: 1,
    region: "",
    category: "Hiking",
    latitude: 31.7,
    longitude: -7.09,
    status: "draft",
    images: [],
    program: [{ day: 1, title: "", description: "", images: [] }],
    createdAt: new Date().toISOString(),
  };
}

// ----------------------------------------------------------------------------
// Auth context
// ----------------------------------------------------------------------------

type SignupData = {
  fullName: string;
  email: string;
  password: string;
  country: string;
  nativeLanguage: string;
  role?: Role;
};

type AuthContextValue = {
  user: MockUser | null;
  ready: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string; user?: MockUser };
  signup: (data: SignupData) => { ok: boolean; error?: string; user?: MockUser };
  updateProfile: (patch: Partial<MockUser>) => void;
  resetPassword: (email: string, newPassword: string) => { ok: boolean; error?: string };
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getUsers(); getExperiences(); getBookings(); getReviews(); getVideos();
    const session = safeRead<{ id: string } | null>(SESSION_KEY, null);
    if (session) setUser(getUsers().find((u) => u.id === session.id) ?? null);
    setReady(true);
  }, []);

  const login = useCallback<AuthContextValue["login"]>((email, password) => {
    const found = getUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) return { ok: false, error: "no-account" };
    if (found.password !== password) return { ok: false, error: "bad-password" };
    safeWrite(SESSION_KEY, { id: found.id });
    setUser(found);
    return { ok: true, user: found };
  }, []);

  const signup = useCallback<AuthContextValue["signup"]>((data) => {
    const users = getUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
      return { ok: false, error: "exists" };
    }
    const newUser: MockUser = {
      id: `u-${Date.now()}`,
      fullName: data.fullName,
      email: data.email.trim(),
      password: data.password,
      country: data.country,
      nativeLanguage: data.nativeLanguage,
      role: data.role ?? "tourist",
      createdAt: new Date().toISOString(),
    };
    const next = [...users, newUser];
    saveUsers(next);
    safeWrite(SESSION_KEY, { id: newUser.id });
    setUser(newUser);
    return { ok: true, user: newUser };
  }, []);

  const updateProfile = useCallback<AuthContextValue["updateProfile"]>((patch) => {
    setUser((current) => {
      if (!current) return current;
      const updated = { ...current, ...patch };
      saveUsers(getUsers().map((u) => (u.id === current.id ? updated : u)));
      return updated;
    });
  }, []);

  const resetPassword = useCallback<AuthContextValue["resetPassword"]>((email, newPassword) => {
    const users = getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) return { ok: false, error: "no-account" };
    saveUsers(users.map((u) => (u.id === found.id ? { ...u, password: newPassword } : u)));
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    safeWrite(SESSION_KEY, null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, ready, login, signup, updateProfile, resetPassword, logout }),
    [user, ready, login, signup, updateProfile, resetPassword, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// ----------------------------------------------------------------------------
// Convenience selectors
// ----------------------------------------------------------------------------

export const userName = (id: string) => getUsers().find((u) => u.id === id)?.fullName ?? "—";
export const experienceTitle = (id: string) => getExperiences().find((e) => e.id === id)?.title ?? "—";
export const experienceById = (id: string) => getExperiences().find((e) => e.id === id);
