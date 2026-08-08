import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "./Reveal";
import { useI18n } from "@/lib/i18n";
import { getReviewsList, type FrontReview } from "@/services/reviews.service";
import { Star } from "lucide-react";

export function Testimonials() {
  const { t } = useI18n();
  const [reviews, setReviews] = useState<FrontReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getReviewsList();
        if (cancelled) return;

        // Filter valid reviews (non-empty comment) and sort by rating desc, then date desc
        const filtered = data
          .filter((r) => r.comment && r.comment.trim().length > 0 && r.rating >= 4)
          .sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });

        // Keep 3 to 5 best reviews
        setReviews(filtered.slice(0, 5));
      } catch {
        if (!cancelled) setReviews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // If loading or no reviews exist in DB, hide section completely
  if (loading || reviews.length === 0) {
    return null;
  }

  const rotations = [-3, 2, -2, 3, -1];

  return (
    <section id="testimonials" className="bg-secondary/5 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading kicker={t("testi.kicker")} title={t("testi.title")} />

        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((rev, i) => {
            const rotate = rotations[i % rotations.length];
            const targetTitle = rev.experienceTitle || rev.formationTitle;

            return (
              <Reveal key={rev.id} delay={i * 0.12}>
                <motion.figure
                  initial={{ rotate }}
                  whileHover={{ rotate: 0, y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  className="mx-auto max-w-sm rounded-2xl bg-card p-6 shadow-card ring-1 ring-border"
                  dir="ltr"
                >
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {Array.from({ length: 5 }).map((_, starIdx) => (
                      <Star
                        key={starIdx}
                        className={`h-4 w-4 ${
                          starIdx < rev.rating ? "fill-amber-500 text-amber-500" : "text-muted opacity-30"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-xs font-bold text-foreground">
                      {rev.rating}.0
                    </span>
                  </div>

                  <blockquote className="text-sm font-medium leading-relaxed text-foreground italic">
                    “{rev.comment}”
                  </blockquote>

                  {targetTitle && (
                    <p className="mt-3 text-xs font-semibold text-primary truncate">
                      {rev.experienceTitle ? "Expérience" : "Formation"} : {targetTitle}
                    </p>
                  )}

                  <figcaption className="mt-4 flex items-center gap-3 border-t border-border/60 pt-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold uppercase text-primary">
                      {(rev.touristName || "V").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {rev.touristName || "Voyageur"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(rev.createdAt).toLocaleDateString("fr-FR", {
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </figcaption>
                </motion.figure>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
