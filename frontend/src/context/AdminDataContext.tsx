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
import { Formation, getFormations, saveFormations } from "@/lib/formations";

interface AdminData {
  users: MockUser[];
  experiences: MockExperience[];
  bookings: MockBooking[];
  reviews: MockReview[];
  formations: Formation[];
  updUsers: (n: MockUser[]) => void;
  updExperiences: (n: MockExperience[]) => void;
  updBookings: (n: MockBooking[]) => void;
  updFormations: (n: Formation[]) => void;
}

const AdminDataContext = createContext<AdminData | null>(null);

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<MockUser[]>([]);
  const [experiences, setExperiences] = useState<MockExperience[]>([]);
  const [bookings, setBookings] = useState<MockBooking[]>([]);
  const [reviews, setReviews] = useState<MockReview[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);

  useEffect(() => {
    setUsers(getUsers());
    setExperiences(getExperiences());
    setBookings(getBookings());
    setReviews(getReviews());
    setFormations(getFormations());
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
  const updFormations = (n: Formation[]) => {
    setFormations(n);
    saveFormations(n);
  };

  return (
    <AdminDataContext.Provider
      value={{
        users,
        experiences,
        bookings,
        reviews,
        formations,
        updUsers,
        updExperiences,
        updBookings,
        updFormations,
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
