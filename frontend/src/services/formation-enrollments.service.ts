import { api } from "@/lib/api";

export type ApiFormationEnrollment = {
  id: number;
  user: {
    id: number;
    fullName?: string;
    name?: string;
    email?: string;
  };
  formation: {
    id: number;
    slug?: string;
    title?: string;
    price?: number;
    instructor?: {
      id?: number;
      name?: string;
    };
  };
  purchasedAt: string;
};

export type FrontFormationEnrollment = {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  formationId: string;
  formationTitle: string;
  formationSlug?: string;
  formationPrice?: number;
  instructorName?: string;
  purchasedAt: string;
};

const toFront = (p: ApiFormationEnrollment): FrontFormationEnrollment => ({
  id: String(p.id),
  userId: String(p.user.id),
  userName: p.user.fullName ?? p.user.name ?? `Utilisateur #${p.user.id}`,
  userEmail: p.user.email,
  formationId: String(p.formation.id),
  formationTitle: p.formation.title ?? `Formation #${p.formation.id}`,
  formationSlug: p.formation.slug,
  formationPrice: Number(p.formation.price ?? 0),
  instructorName: p.formation.instructor?.name,
  purchasedAt: p.purchasedAt,
});

export async function getFormationEnrollments(): Promise<FrontFormationEnrollment[]> {
  const { data } = await api.get<ApiFormationEnrollment[]>("/admin/formation-purchases");
  return data.map(toFront);
}

export async function createEnrollment(payload: { userId: number; formationId: number }): Promise<FrontFormationEnrollment> {
  const { data } = await api.post<ApiFormationEnrollment>("/admin/formation-purchases", payload);
  return toFront(data);
}
