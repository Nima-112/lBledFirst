import { api } from "@/lib/api";

export type ApiBooking = {
  id: number;
  tourist: { id: number; name?: string };
  experience: { id: number; title?: string; deleted?: boolean };
  date: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  totalPrice: number;
  guests: number;
  createdAt: string;
};

export type ApiBookingPayload = {
  tourist: { id: number };
  experience: { id: number };
  date: string;
  status?: "pending" | "confirmed" | "cancelled" | "completed";
  totalPrice?: number;
  guests?: number;
};

export type FrontBooking = {
  id: string;
  touristId: string;
  touristName?: string;
  experienceId: string;
  experienceTitle?: string;
  experienceDeleted?: boolean;
  date: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  totalPrice: number;
  guests: number;
  createdAt: string;
};

const toFront = (b: ApiBooking): FrontBooking => ({
  id: String(b.id),
  touristId: String(b.tourist.id),
  touristName: b.tourist.name,
  experienceId: String(b.experience.id),
  experienceTitle: b.experience.title,
  experienceDeleted: !!b.experience.deleted,
  date: b.date,
  status: b.status,
  totalPrice: Number(b.totalPrice),
  guests: b.guests ?? 1,
  createdAt: b.createdAt,
});

const toPayload = (b: FrontBooking): ApiBookingPayload => {
  const payload: ApiBookingPayload = {
    tourist: { id: Number(b.touristId) },
    experience: { id: Number(b.experienceId) },
    date: b.date,
    status: b.status,
    totalPrice: b.totalPrice,
    guests: b.guests,
  };
  return payload;
};

export async function getBookingsList(): Promise<FrontBooking[]> {
  const { data } = await api.get<ApiBooking[]>("/bookings");
  return data.map(toFront);
}

export async function createBooking(b: FrontBooking): Promise<FrontBooking> {
  const payload = toPayload(b);
  const { data } = await api.post<ApiBooking>("/bookings", payload);
  return toFront(data);
}

export async function updateBooking(id: string, b: FrontBooking): Promise<FrontBooking> {
  const payload = toPayload(b);
  const { data } = await api.put<ApiBooking>(`/bookings/${id}`, payload);
  return toFront(data);
}

export async function deleteBooking(id: string): Promise<void> {
  await api.delete(`/bookings/${id}`);
}
