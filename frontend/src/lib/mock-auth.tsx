import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// ----------------------------------------------------------------------------
// FRONTEND-ONLY mock data + auth.
// No backend / database yet. Everything is stored in localStorage so the whole
// product (3 roles, experiences, bookings, reviews, videos) can be demoed
// before wiring the real backend. The shapes mirror the UML class diagram so
// the future backend stays coherent with the frontend.
// ----------------------------------------------------------------------------

export type Role = "tourist" | "host" | "admin";

export type MockUser = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  country: string;
  nativeLanguage: string;
  role: Role;
  /** host-only */
  region?: string;
  bio?: string;
  createdAt: string;
};

export type ExperienceStatus = "draft" | "published" | "archived";

export type MockExperience = {
  id: string;
  hostId: string;
  title: string;
  description: string;
  price: number;
  duration: number; // minutes
  region: string;
  category: string;
  latitude: number;
  longitude: number;
  status: ExperienceStatus;
  image?: string;
  createdAt: string;
};

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type MockBooking = {
  id: string;
  touristId: string;
  experienceId: string;
  date: string; // ISO date
  status: BookingStatus;
  totalPrice: number;
  guests: number;
  createdAt: string;
};

export type MockReview = {
  id: string;
  touristId: string;
  experienceId: string;
  rating: number; // 1..5
  comment: string;
  createdAt: string;
};

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
// Storage — versioned so schema changes reset stale demo data.
// ----------------------------------------------------------------------------

const V = "lbf.v2";
const USERS_KEY = `${V}.users`;
const SESSION_KEY = `${V}.session`;
const VIDEOS_KEY = `${V}.videos`;
const EXPERIENCES_KEY = `${V}.experiences`;
const BOOKINGS_KEY = `${V}.bookings`;
const REVIEWS_KEY = `${V}.reviews`;

// ---- seeds ----------------------------------------------------------------

const SEED_USERS: MockUser[] = [
  {
    id: "u-admin",
    fullName: "Admin L'Bled",
    email: "admin@lbledfirst.ma",
    password: "admin123",
    phone: "+212 600-000000",
    country: "Maroc",
    nativeLanguage: "Français",
    role: "admin",
    createdAt: "2026-01-05T09:00:00.000Z",
  },
  {
    id: "u-host-1",
    fullName: "Brahim Aït Toubkal",
    email: "brahim@host.ma",
    password: "host123",
    phone: "+212 661-112233",
    country: "Maroc",
    nativeLanguage: "Amazigh",
    role: "host",
    region: "Imlil — Marrakech-Safi",
    bio: "Guide de montagne depuis 15 ans dans le Haut Atlas.",
    createdAt: "2026-01-20T09:00:00.000Z",
  },
  {
    id: "u-host-2",
    fullName: "Khadija El Merzougi",
    email: "khadija@host.ma",
    password: "host123",
    phone: "+212 662-445566",
    country: "Maroc",
    nativeLanguage: "Arabe",
    role: "host",
    region: "Merzouga — Drâa-Tafilalet",
    bio: "Famille nomade, bivouacs et dîners sous les étoiles.",
    createdAt: "2026-02-01T09:00:00.000Z",
  },
  {
    id: "u-host-3",
    fullName: "Youssef Ouzoud",
    email: "youssef@host.ma",
    password: "host123",
    phone: "+212 663-778899",
    country: "Maroc",
    nativeLanguage: "Amazigh",
    role: "host",
    region: "Ouzoud — Béni Mellal-Khénifra",
    bio: "Passionné des cascades et de la cuisine du terroir.",
    createdAt: "2026-02-10T09:00:00.000Z",
  },
  {
    id: "u-tourist-1",
    fullName: "Sofia Martín",
    email: "sofia@example.com",
    password: "demo123",
    phone: "+34 600-111222",
    country: "España",
    nativeLanguage: "Español",
    role: "tourist",
    createdAt: "2026-02-11T14:20:00.000Z",
  },
  {
    id: "u-tourist-2",
    fullName: "Liam O'Connor",
    email: "liam@example.com",
    password: "demo123",
    phone: "+353 830-333444",
    country: "Ireland",
    nativeLanguage: "English",
    role: "tourist",
    createdAt: "2026-02-18T10:00:00.000Z",
  },
  {
    id: "u-tourist-3",
    fullName: "Camille Dubois",
    email: "camille@example.com",
    password: "demo123",
    phone: "+33 610-555666",
    country: "France",
    nativeLanguage: "Français",
    role: "tourist",
    createdAt: "2026-03-02T16:40:00.000Z",
  },
];

const SEED_EXPERIENCES: MockExperience[] = [
  {
    id: "e-1",
    hostId: "u-host-1",
    title: "Sunrise trek — High Atlas",
    description: "Randonnée au lever du soleil sur les sentiers berbères cachés, thé à la menthe chez l'habitant.",
    price: 380,
    duration: 300,
    region: "Imlil",
    category: "Hiking",
    latitude: 31.14,
    longitude: -7.92,
    status: "published",
    createdAt: "2026-03-01T08:00:00.000Z",
  },
  {
    id: "e-2",
    hostId: "u-host-2",
    title: "Sahara dinner under the stars",
    description: "Méharée au coucher du soleil, bivouac et dîner nomade sous les dunes d'Erg Chebbi.",
    price: 650,
    duration: 720,
    region: "Merzouga",
    category: "Cuisine",
    latitude: 31.1,
    longitude: -4.01,
    status: "published",
    createdAt: "2026-03-04T08:00:00.000Z",
  },
  {
    id: "e-3",
    hostId: "u-host-3",
    title: "Argan oil workshop",
    description: "Atelier de fabrication d'huile d'argan avec une coopérative de femmes.",
    price: 220,
    duration: 180,
    region: "Ouzoud",
    category: "Crafts",
    latitude: 32.02,
    longitude: -6.72,
    status: "published",
    createdAt: "2026-03-06T08:00:00.000Z",
  },
  {
    id: "e-4",
    hostId: "u-host-1",
    title: "Berber homestay & harvest",
    description: "Immersion d'une journée dans la Vallée Heureuse : récoltes, pain maison et gîte.",
    price: 300,
    duration: 480,
    region: "Aït Bouguemez",
    category: "Homestays",
    latitude: 31.63,
    longitude: -6.4,
    status: "draft",
    createdAt: "2026-03-09T08:00:00.000Z",
  },
  {
    id: "e-5",
    hostId: "u-host-3",
    title: "Ouzoud waterfalls picnic",
    description: "Pique-nique près des plus hautes cascades du Maroc et observation des singes.",
    price: 180,
    duration: 240,
    region: "Ouzoud",
    category: "Hiking",
    latitude: 32.01,
    longitude: -6.72,
    status: "published",
    createdAt: "2026-03-12T08:00:00.000Z",
  },
];

const SEED_BOOKINGS: MockBooking[] = [
  { id: "b-1", touristId: "u-tourist-1", experienceId: "e-1", date: "2026-04-12", status: "confirmed", totalPrice: 760, guests: 2, createdAt: "2026-03-20T10:00:00.000Z" },
  { id: "b-2", touristId: "u-tourist-2", experienceId: "e-2", date: "2026-04-18", status: "pending", totalPrice: 650, guests: 1, createdAt: "2026-03-22T10:00:00.000Z" },
  { id: "b-3", touristId: "u-tourist-3", experienceId: "e-3", date: "2026-03-28", status: "completed", totalPrice: 440, guests: 2, createdAt: "2026-03-10T10:00:00.000Z" },
  { id: "b-4", touristId: "u-tourist-1", experienceId: "e-5", date: "2026-04-02", status: "completed", totalPrice: 360, guests: 2, createdAt: "2026-03-15T10:00:00.000Z" },
  { id: "b-5", touristId: "u-tourist-2", experienceId: "e-1", date: "2026-04-25", status: "cancelled", totalPrice: 380, guests: 1, createdAt: "2026-03-24T10:00:00.000Z" },
  { id: "b-6", touristId: "u-tourist-3", experienceId: "e-2", date: "2026-05-01", status: "confirmed", totalPrice: 1300, guests: 2, createdAt: "2026-03-27T10:00:00.000Z" },
];

const SEED_REVIEWS: MockReview[] = [
  { id: "r-1", touristId: "u-tourist-3", experienceId: "e-3", rating: 5, comment: "Une expérience inoubliable, l'accueil était incroyable !", createdAt: "2026-03-29T12:00:00.000Z" },
  { id: "r-2", touristId: "u-tourist-1", experienceId: "e-5", rating: 4, comment: "Cascades magnifiques, un peu de monde mais super guide.", createdAt: "2026-04-03T12:00:00.000Z" },
  { id: "r-3", touristId: "u-tourist-2", experienceId: "e-1", rating: 5, comment: "Le lever du soleil sur l'Atlas vaut chaque minute de marche.", createdAt: "2026-04-14T12:00:00.000Z" },
];

const SEED_VIDEOS: MockVideo[] = [
  { id: "v-1", hostId: "u-host-1", experienceId: "e-1", title: "Sunrise trek — High Atlas", region: "Imlil", category: "Hiking", tags: "#Berber #Atlas", status: "published", languageOriginal: "ar", createdAt: "2026-03-01T08:00:00.000Z" },
  { id: "v-2", hostId: "u-host-3", experienceId: "e-3", title: "Argan oil workshop", region: "Ouzoud", category: "Crafts", tags: "#Argan #Women", status: "published", languageOriginal: "ar", createdAt: "2026-03-06T08:00:00.000Z" },
  { id: "v-3", hostId: "u-host-2", experienceId: "e-2", title: "Sahara dinner under the stars", region: "Merzouga", category: "Cuisine", tags: "#Sahara #Nomad", status: "draft", languageOriginal: "ar", createdAt: "2026-03-09T08:00:00.000Z" },
];

// ---- low-level helpers ----------------------------------------------------

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function seededGetter<T>(key: string, seed: T[]): T[] {
  const data = safeRead<T[]>(key, []);
  if (data.length === 0) {
    safeWrite(key, seed);
    return seed;
  }
  return data;
}

// ---- public collection accessors ------------------------------------------

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

// Back-compat aliases used across the admin panels.
export const adminGetUsers = getUsers;
export const adminSaveUsers = saveUsers;


// ----------------------------------------------------------------------------
// Convenience selectors
// ----------------------------------------------------------------------------

export const userName = (id: string) => getUsers().find((u) => u.id === id)?.fullName ?? "—";
export const experienceTitle = (id: string) =>
  getExperiences().find((e) => e.id === id)?.title ?? "—";
export const experienceById = (id: string) => getExperiences().find((e) => e.id === id);
