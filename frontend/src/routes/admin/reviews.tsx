import { createFileRoute } from "@tanstack/react-router";
import { ReviewsPanel } from "@/components/admin/ReviewsPanel";
import { useAdminData } from "@/context/AdminDataContext";

export const Route = createFileRoute("/admin/reviews")({
  component: ReviewsPage,
});

function ReviewsPage() {
  const { experiences, reviews, updExperiences } = useAdminData();
  return <ReviewsPanel experiences={experiences} reviews={reviews} onChange={updExperiences} />;
}
