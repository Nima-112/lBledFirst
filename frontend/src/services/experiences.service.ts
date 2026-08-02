import { api } from "@/lib/api";

export type DayProgram = {
  day: number;
  title: string;
  description: string;
  images: string[];
};

export type ExperienceStatus = "draft" | "published" | "archived";

export type ApiExperience = {
  id: number;
  host: { id: number; name?: string };
  title: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  status: ExperienceStatus;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  coverImages?: string[];
  dayPrograms?: Array<{
    dayNumber: number;
    title: string;
    description?: string | null;
    imagesCsv?: string | null;
  }>;
  createdAt: string;
};

export type ApiExperiencePayload = {
  host: { id: number };
  title: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  status?: ExperienceStatus;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  coverImages?: string[];
  dayPrograms?: Array<{
    dayNumber: number;
    title: string;
    description?: string | null;
    imagesCsv?: string | null;
  }>;
};

export type FrontExperience = {
  id: string;
  hostId: string;
  hostName?: string;
  title: string;
  description: string;
  price: number;
  durationDays: number;
  region: string;
  category: string;
  latitude: number;
  longitude: number;
  status: ExperienceStatus;
  images: string[];
  program: DayProgram[];
  createdAt: string;
};

const toFront = (e: ApiExperience): FrontExperience => ({
  id: String(e.id),
  hostId: String(e.host.id),
  hostName: e.host.name,
  title: e.title,
  description: e.description,
  price: Number(e.price),
  durationDays: e.duration,
  region: e.city,
  category: e.category,
  latitude: Number(e.latitude ?? 0),
  longitude: Number(e.longitude ?? 0),
  status: e.status,
  images: e.coverImages ?? [],
  program: (e.dayPrograms ?? []).map((d) => ({
    day: d.dayNumber,
    title: d.title,
    description: d.description ?? "",
    images: d.imagesCsv ? d.imagesCsv.split(",").filter(Boolean) : [],
  })),
  createdAt: e.createdAt,
});

const toPayload = (e: FrontExperience): ApiExperiencePayload => ({
  host: { id: Number(e.hostId) },
  title: e.title,
  description: e.description,
  price: Number(e.price),
  duration: Number(e.durationDays),
  category: e.category,
  status: e.status,
  city: e.region,
  latitude: e.latitude ?? 0,
  longitude: e.longitude ?? 0,
  coverImages: e.images ?? [],
  dayPrograms: (e.program ?? []).map((d, idx) => ({
    dayNumber: idx + 1,
    title: d.title,
    description: d.description || null,
    imagesCsv: (d.images ?? []).join(","),
  })),
});

export async function getExperiencesList(): Promise<FrontExperience[]> {
  const { data } = await api.get<ApiExperience[]>("/experiences");
  return data.map(toFront);
}

export async function createExperience(e: FrontExperience): Promise<FrontExperience> {
  const payload = toPayload(e);
  const { data } = await api.post<ApiExperience>("/experiences", payload);
  return toFront(data);
}

export async function updateExperience(id: string, e: FrontExperience): Promise<FrontExperience> {
  const payload = toPayload(e);
  const { data } = await api.put<ApiExperience>(`/experiences/${id}`, payload);
  return toFront(data);
}

export async function deleteExperience(id: string): Promise<void> {
  await api.delete(`/experiences/${id}`);
}

export async function publishExperience(id: string): Promise<FrontExperience> {
  const { data } = await api.put<ApiExperience>(`/experiences/${id}/publish`);
  return toFront(data);
}
