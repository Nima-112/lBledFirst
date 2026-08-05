import { api } from "@/lib/api";

// ── Backend API type ──────────────────────────────────────────────────
export type ApiActivity = {
  id: number;
  name: string;
  icon: string;
};

// ── Front-end type ────────────────────────────────────────────────────
export type FrontActivity = {
  id: string;
  name: string;
  icon: string;
};

function toFront(a: ApiActivity): FrontActivity {
  return {
    id: String(a.id),
    name: a.name,
    icon: a.icon,
  };
}

export async function getActivitiesList(): Promise<FrontActivity[]> {
  const { data } = await api.get<ApiActivity[]>("/activities");
  return data.map(toFront);
}
