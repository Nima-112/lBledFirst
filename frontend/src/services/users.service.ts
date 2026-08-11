import { api, API_ORIGIN } from "@/lib/api";
import type { Role } from "@/types/auth";

export type ApiUser = {
  id: number;
  name: string;
  email: string;
  password?: string | null;
  role: Role;
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
  role?: Role;
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
  role: Role;
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
  _id: number | string,
  patch: Partial<Pick<ApiUser, "name" | "phone" | "country" | "language" | "avatar" | "role">>,
): Promise<FrontUser> {
  // Use the self-update endpoint (PATCH /users/me) — works for any authenticated user
  const { data } = await api.patch<ApiUser>("/users/me", {
    name: patch.name,
    phone: patch.phone,
    country: patch.country,
    language: patch.language,
    avatar: patch.avatar,
  });
  return toFront(data);
}

export async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<{ url: string }>("/upload/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
}

export async function changePassword(newPassword: string): Promise<void> {
  await api.patch("/users/me/password", { newPassword });
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
