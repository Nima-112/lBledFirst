import { api, API_ORIGIN } from "@/lib/api";
import type { Formation, Chapter, Capsule, Instructor } from "@/lib/formations";

export type ApiFormationSummary = {
  id: number;
  slug: string;
  title: string;
  shortDescription: string;
  category: string;
  level: string;
  language: string;
  price: number;
  coverImage: string;
  totalDuration: number;
  chaptersCount: number;
  capsulesCount: number;
  studentsCount: number;
  averageRating: number;
  reviewsCount: number;
  instructor?: {
    name: string;
    specialty?: string | null;
    experienceYears?: number | null;
    bio?: string | null;
    photo?: string | null;
    totalFormations?: number | null;
    averageRating?: number | null;
    studentsTrained?: number | null;
  } | null;
};

export type ApiFormationDetail = ApiFormationSummary & {
  previewVideo?: string | null;
  longDescription: string;
  objectives: string[];
  skills: string[];
  prerequisites: string[];
  purchased: boolean;
  instructor: {
    name: string;
    specialty?: string | null;
    experienceYears?: number | null;
    bio?: string | null;
    photo?: string | null;
    totalFormations?: number | null;
    averageRating?: number | null;
    studentsTrained?: number | null;
  };
  chapters: {
    id: number;
    order: number;
    title: string;
    capsules: {
      id: number;
      order: number;
      title: string;
      description?: string | null;
      duration: number;
      thumbnail?: string | null;
      videoUrl?: string | null;
    }[];
  }[];
};

export type ApiFormationPayload = {
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  level: string;
  language: string;
  price: number;
  coverImage: string;
  previewVideo?: string | null;
  studentsCount?: number | null;
  averageRating?: number | null;
  reviewsCount?: number | null;
  objectives: string[];
  skills: string[];
  prerequisites: string[];
  chapters: {
    id?: number | null;
    order: number;
    title: string;
    capsules: {
      id?: number | null;
      order: number;
      title: string;
      description?: string | null;
      duration: number;
      thumbnail?: string | null;
      videoUrl?: string | null;
    }[];
  }[];
  instructor: {
    name: string;
    specialty?: string | null;
    experienceYears?: number | null;
    bio?: string | null;
    photo?: string | null;
    totalFormations?: number | null;
    averageRating?: number | null;
    studentsTrained?: number | null;
  };
};

type UploadResult = { url: string; name: string; size: number; contentType: string };

const strip = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const LEVEL_MAP: Record<string, Formation["level"]> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

const LANG_MAP: Record<string, Formation["language"]> = {
  francais: "Français",
  arabe: "Arabe",
  anglais: "Anglais",
  espagnol: "Espagnol",
};

const toFrontLevel = (raw: string): Formation["level"] => {
  const k = strip(raw).replace(/[^a-z]/g, "");
  return LEVEL_MAP[k] ?? "Débutant";
};

const toFrontLang = (raw: string): Formation["language"] => {
  const k = strip(raw).replace(/[^a-z]/g, "");
  return LANG_MAP[k] ?? "Français";
};

const toApiLevel = (v: Formation["level"]) => strip(v).replace(/[^a-z]/g, "");
const toApiLang = (v: Formation["language"]) => strip(v).replace(/[^a-z]/g, "");

const detailInstructorToFront = (i: ApiFormationDetail["instructor"]): Instructor => ({
  id: `i-${i.name}-${Date.now()}`,
  name: i.name,
  specialty: i.specialty ?? "",
  experienceYears: i.experienceYears ?? 0,
  bio: i.bio ?? "",
  photo: i.photo ?? "",
  totalFormations: i.totalFormations ?? 0,
  averageRating: i.averageRating ?? 0,
  studentsTrained: i.studentsTrained ?? 0,
});

const detailChapterToFront = (ch: ApiFormationDetail["chapters"][number]): Chapter => ({
  id: String(ch.id),
  order: ch.order,
  title: ch.title,
  capsules: ch.capsules.map((c) => ({
    id: String(c.id),
    order: c.order,
    title: c.title,
    description: c.description ?? "",
    duration: c.duration,
    thumbnail: c.thumbnail ?? "",
    videoUrl: c.videoUrl ?? undefined,
  })),
});

const summaryToFront = (s: ApiFormationSummary): Formation => ({
  id: s.id,
  slug: s.slug,
  title: s.title,
  shortDescription: s.shortDescription,
  category: s.category,
  level: toFrontLevel(s.level),
  language: toFrontLang(s.language),
  price: Number(s.price),
  coverImage: s.coverImage,
  totalDuration: s.totalDuration,
  studentsCount: s.studentsCount,
  averageRating: s.averageRating,
  reviewsCount: s.reviewsCount,
  longDescription: "",
  objectives: [],
  skills: [],
  prerequisites: [],
  chapters: [],
  instructor: {
    id: s.instructor ? `i-${s.instructor.name}-${s.id}` : "",
    name: s.instructor?.name ?? "",
    specialty: s.instructor?.specialty ?? "",
    experienceYears: s.instructor?.experienceYears ?? 0,
    bio: s.instructor?.bio ?? "",
    photo: s.instructor?.photo ?? "",
    totalFormations: s.instructor?.totalFormations ?? 0,
    averageRating: s.instructor?.averageRating ?? 0,
    studentsTrained: s.instructor?.studentsTrained ?? 0,
  },
  createdAt: new Date().toISOString(),
});

const detailToFront = (d: ApiFormationDetail): Formation => ({
  ...summaryToFront(d),
  longDescription: d.longDescription,
  previewVideo: d.previewVideo ?? undefined,
  objectives: d.objectives,
  skills: d.skills,
  prerequisites: d.prerequisites,
  chapters: d.chapters.map(detailChapterToFront),
  instructor: detailInstructorToFront(d.instructor),
  purchased: d.purchased,
});

const formationToPayload = (f: Formation): ApiFormationPayload => ({
  slug: f.slug,
  title: f.title,
  shortDescription: f.shortDescription,
  longDescription: f.longDescription,
  category: f.category,
  level: toApiLevel(f.level),
  language: toApiLang(f.language),
  price: Number(f.price),
  coverImage: f.coverImage,
  previewVideo: f.previewVideo ?? null,
  studentsCount: f.studentsCount ?? 0,
  averageRating: f.averageRating ?? 0,
  reviewsCount: f.reviewsCount ?? 0,
  objectives: f.objectives,
  skills: f.skills,
  prerequisites: f.prerequisites,
  chapters: f.chapters.map((ch) => ({
    id: typeof ch.id === "number" || /^\d+$/.test(String(ch.id)) ? Number(ch.id) : null,
    order: ch.order,
    title: ch.title,
    capsules: ch.capsules.map((c) => ({
      id: typeof c.id === "number" || /^\d+$/.test(String(c.id)) ? Number(c.id) : null,
      order: c.order,
      title: c.title,
      description: c.description ?? null,
      duration: Number(c.duration),
      thumbnail: c.thumbnail ?? null,
      videoUrl: c.videoUrl ?? null,
    })),
  })),
  instructor: {
    name: f.instructor.name,
    specialty: f.instructor.specialty ?? null,
    experienceYears: f.instructor.experienceYears ?? null,
    bio: f.instructor.bio ?? null,
    photo: f.instructor.photo ?? null,
    totalFormations: f.instructor.totalFormations ?? null,
    averageRating: f.instructor.averageRating ?? null,
    studentsTrained: f.instructor.studentsTrained ?? null,
  },
});

export async function getFormationsList(): Promise<Formation[]> {
  const { data } = await api.get<ApiFormationSummary[]>("/formations");
  return data.map(summaryToFront);
}

export async function getFormationDetail(slug: string): Promise<Formation> {
  const { data } = await api.get<ApiFormationDetail>(`/formations/${slug}`);
  return detailToFront(data);
}

export async function createFormation(f: Formation): Promise<Formation> {
  const payload = formationToPayload(f);
  const { data } = await api.post<ApiFormationDetail>("/formations", payload);
  return detailToFront(data);
}

export async function updateFormation(slug: string, f: Formation): Promise<Formation> {
  const payload = formationToPayload(f);
  const { data } = await api.put<ApiFormationDetail>(`/formations/${slug}`, payload);
  return detailToFront(data);
}

export async function deleteFormation(slug: string): Promise<void> {
  await api.delete(`/formations/${slug}`);
}

export async function uploadVideo(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<UploadResult>("/upload/video", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 10 * 60 * 1000,
  });
  if (!data.url.startsWith("http")) {
    data.url = `${API_ORIGIN}${data.url}`;
  }
  return data;
}

// ---- Achat, progression, favoris (utilisateur courant) --------------------

export async function purchaseFormationApi(slug: string): Promise<void> {
  await api.post(`/formations/${slug}/purchase`);
}

export async function getMyPurchasedFormations(): Promise<Formation[]> {
  const { data } = await api.get<ApiFormationSummary[]>("/formations/me/purchased");
  return data.map(summaryToFront);
}

export async function getFormationProgressApi(slug: string): Promise<string[]> {
  const { data } = await api.get<number[]>(`/formations/${slug}/progress`);
  return data.map(String);
}

export async function toggleCapsuleCompletionApi(slug: string, capsuleId: string): Promise<boolean> {
  const { data } = await api.post<{ completed: boolean }>(`/formations/${slug}/capsules/${capsuleId}/toggle`);
  return data.completed;
}

export async function toggleFormationFavoriteApi(slug: string): Promise<boolean> {
  const { data } = await api.post<{ favorited: boolean }>(`/formations/${slug}/favorite`);
  return data.favorited;
}

export async function getMyFavoriteFormations(): Promise<Formation[]> {
  const { data } = await api.get<ApiFormationSummary[]>("/formations/me/favorites");
  return data.map(summaryToFront);
}
