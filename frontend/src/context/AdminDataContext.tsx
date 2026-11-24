import { createContext, useContext, useEffect, useState } from "react";
import {
  getBookings,
  getExperiences,
  getReviews,
  getUsers,
  MockBooking,
  MockExperience,
  MockReview,
  MockUser,
  saveBookings,
  saveExperiences,
  saveUsers,
} from "@/lib/mock-auth";

interface AdminData {
  users: MockUser[];
  experiences: MockExperience[];
  bookings: MockBooking[];
  reviews: MockReview[];
  updUsers: (n: MockUser[]) => void;
  updExperiences: (n: MockExperience[]) => void;
  updBookings: (n: MockBooking[]) => void;
}

const AdminDataContext = createContext<AdminData | null>(null);

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<MockUser[]>([]);
  const [experiences, setExperiences] = useState<MockExperience[]>([]);
  const [bookings, setBookings] = useState<MockBooking[]>([]);
  const [reviews, setReviews] = useState<MockReview[]>([]);

  useEffect(() => {
    setUsers(getUsers());
    setExperiences(getExperiences());
    setBookings(getBookings());
    setReviews(getReviews());
  }, []);

  const updUsers = (n: MockUser[]) => {
    setUsers(n);
    saveUsers(n);
  };
  const updExperiences = (n: MockExperience[]) => {
    setExperiences(n);
    saveExperiences(n);
  };
  const updBookings = (n: MockBooking[]) => {
    setBookings(n);
    saveBookings(n);
  };

  return (
    <AdminDataContext.Provider
      value={{
        users,
        experiences,
        bookings,
        reviews,
        updUsers,
        updExperiences,
        updBookings,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export const useAdminData = () => {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used inside AdminDataProvider");
  return ctx;
};
