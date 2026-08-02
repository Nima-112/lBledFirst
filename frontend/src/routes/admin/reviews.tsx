import { createFileRoute } from "@tanstack/react-router";
import { ReviewsPanel } from "@/components/admin/ReviewsPanel";

export const Route = createFileRoute("/admin/reviews")({
  component: ReviewsPage,
});

function ReviewsPage() {
  return <ReviewsPanel />;
}
