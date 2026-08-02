import { api } from "@/lib/api";

// Un avis porte soit sur une expérience, soit sur une formation (jamais les
// deux) — voir ReviewService#resolveTargetAndValidate côté backend.
export type ApiReview = {
  id: number;
  tourist: { id: number; name?: string };
  experience?: { id: number; title?: string } | null;
  formation?: { id: number; slug?: string; title?: string } | null;
  rating: number;
  comment?: string | null;
  createdAt: string;
};

export type ApiReviewPayload =
  | { experience: { id: number }; rating: number; comment?: string | null }
  | { formation: { id: number }; rating: number; comment?: string | null };

export type FrontReview = {
  id: string;
  touristId: string;
  touristName?: string;
  experienceId?: string;
  experienceTitle?: string;
  formationId?: string;
  formationSlug?: string;
  formationTitle?: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const toFront = (r: ApiReview): FrontReview => ({
  id: String(r.id),
  touristId: String(r.tourist.id),
  touristName: r.tourist.name,
  experienceId: r.experience ? String(r.experience.id) : undefined,
  experienceTitle: r.experience?.title,
  formationId: r.formation ? String(r.formation.id) : undefined,
  formationSlug: r.formation?.slug,
  formationTitle: r.formation?.title,
  rating: r.rating,
  comment: r.comment ?? "",
  createdAt: r.createdAt,
});

export async function getReviewsList(): Promise<FrontReview[]> {
  const { data } = await api.get<ApiReview[]>("/reviews");
  return data.map(toFront);
}

export async function getReviewsForFormation(formationId: string | number): Promise<FrontReview[]> {
  const { data } = await api.get<ApiReview[]>(`/reviews/formation/${formationId}`);
  return data.map(toFront);
}

export async function getReviewsForExperience(experienceId: string | number): Promise<FrontReview[]> {
  const { data } = await api.get<ApiReview[]>(`/reviews/experience/${experienceId}`);
  return data.map(toFront);
}

export async function getMyReviews(): Promise<FrontReview[]> {
  const { data } = await api.get<ApiReview[]>("/reviews/me");
  return data.map(toFront);
}

export async function createFormationReview(
  formationId: string | number,
  rating: number,
  comment: string,
): Promise<FrontReview> {
  const { data } = await api.post<ApiReview>("/reviews", {
    formation: { id: Number(formationId) },
    rating,
    comment: comment || null,
  } satisfies ApiReviewPayload);
  return toFront(data);
}

export async function createExperienceReview(
  experienceId: string | number,
  rating: number,
  comment: string,
): Promise<FrontReview> {
  const { data } = await api.post<ApiReview>("/reviews", {
    experience: { id: Number(experienceId) },
    rating,
    comment: comment || null,
  } satisfies ApiReviewPayload);
  return toFront(data);
}

export async function updateReview(id: string, r: Pick<FrontReview, "rating" | "comment">): Promise<FrontReview> {
  const { data } = await api.put<ApiReview>(`/reviews/${id}`, {
    rating: r.rating,
    comment: r.comment || null,
  });
  return toFront(data);
}

export async function deleteReview(id: string): Promise<void> {
  await api.delete(`/reviews/${id}`);
}
