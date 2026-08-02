import { api } from "@/lib/api";

export type ApiUser = {
  id: number;
  name: string;
  email: string;
  password?: string | null;
  role: "tourist" | "admin";
  phone?: string | null;
  avatar?: string | null;
  country?: string | null;
  language?: string | null;
  createdAt: string;
};

export type ApiUserPayload = {
  name: string;
  email: string;
  password?: string | null;
  role?: "tourist" | "admin";
  phone?: string | null;
  avatar?: string | null;
  country?: string | null;
  language?: string | null;
};

export type FrontUser = {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  phone: string;
  avatar?: string;
  country: string;
  nativeLanguage: string;
  role: "tourist" | "admin";
  createdAt: string;
};

const toFront = (u: ApiUser): FrontUser => ({
  id: String(u.id),
  fullName: u.name,
  email: u.email,
  phone: u.phone ?? "",
  avatar: u.avatar ?? undefined,
  country: u.country ?? "",
  nativeLanguage: u.language ?? "",
  role: u.role,
  createdAt: u.createdAt,
});

const toPayload = (u: FrontUser): ApiUserPayload => ({
  name: u.fullName,
  email: u.email,
  password: u.password || null,
  role: u.role,
  phone: u.phone || null,
  avatar: u.avatar || null,
  country: u.country || null,
  language: u.nativeLanguage || null,
});

export async function getUsersList(): Promise<FrontUser[]> {
  const { data } = await api.get<ApiUser[]>("/users");
  return data.map(toFront);
}

export async function patchUser(
  id: number | string,
  patch: Partial<Pick<ApiUser, "name" | "phone" | "country" | "language" | "avatar" | "role">>,
): Promise<FrontUser> {
  const current = (await api.get<ApiUser>(`/users/${id}`)).data;
  const payload: ApiUserPayload = {
    name: patch.name ?? current.name,
    email: current.email,
    role: patch.role ?? current.role,
    phone: patch.phone ?? current.phone ?? null,
    avatar: patch.avatar ?? current.avatar ?? null,
    country: patch.country ?? current.country ?? null,
    language: patch.language ?? current.language ?? null,
  };
  const { data } = await api.put<ApiUser>(`/users/${id}`, payload);
  return toFront(data);
}

export async function createUser(u: FrontUser): Promise<FrontUser> {
  const payload = toPayload(u);
  if (!payload.password) payload.password = "tourist123";
  const { data } = await api.post<ApiUser>("/users", payload);
  return toFront(data);
}

export async function updateUser(id: string, u: FrontUser): Promise<FrontUser> {
  const payload = toPayload(u);
  if (!payload.password) delete payload.password;
  const { data } = await api.put<ApiUser>(`/users/${id}`, payload);
  return toFront(data);
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}
