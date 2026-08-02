import { api } from "@/lib/api";

export type ApiReview = {
  id: number;
  tourist: { id: number; name?: string };
  experience: { id: number; title?: string };
  rating: number;
  comment?: string | null;
  createdAt: string;
};

export type ApiReviewPayload = {
  tourist: { id: number };
  experience: { id: number };
  rating: number;
  comment?: string | null;
};

export type FrontReview = {
  id: string;
  touristId: string;
  touristName?: string;
  experienceId: string;
  experienceTitle?: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const toFront = (r: ApiReview): FrontReview => ({
  id: String(r.id),
  touristId: String(r.tourist.id),
  touristName: r.tourist.name,
  experienceId: String(r.experience.id),
  experienceTitle: r.experience.title,
  rating: r.rating,
  comment: r.comment ?? "",
  createdAt: r.createdAt,
});

const toPayload = (r: FrontReview): ApiReviewPayload => ({
  tourist: { id: Number(r.touristId) },
  experience: { id: Number(r.experienceId) },
  rating: r.rating,
  comment: r.comment || null,
});

export async function getReviewsList(): Promise<FrontReview[]> {
  const { data } = await api.get<ApiReview[]>("/reviews");
  return data.map(toFront);
}

export async function createReview(r: FrontReview): Promise<FrontReview> {
  const payload = toPayload(r);
  const { data } = await api.post<ApiReview>("/reviews", payload);
  return toFront(data);
}

export async function updateReview(id: string, r: FrontReview): Promise<FrontReview> {
  const payload = toPayload(r);
  const { data } = await api.put<ApiReview>(`/reviews/${id}`, payload);
  return toFront(data);
}

export async function deleteReview(id: string): Promise<void> {
  await api.delete(`/reviews/${id}`);
}
