import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  images: string[];
  alt: string;
  autoplayMs?: number;
  className?: string;
  rounded?: string;
};

export function ImageCarousel({ images, alt, autoplayMs = 4200, className, rounded = "rounded-2xl" }: Props) {
  const [i, setI] = useState(0);
  const safe = images.length > 0 ? images : ["/placeholder.svg"];

  useEffect(() => {
    if (safe.length < 2 || !autoplayMs) return;
    const t = setInterval(() => setI((x) => (x + 1) % safe.length), autoplayMs);
    return () => clearInterval(t);
  }, [safe.length, autoplayMs]);

  const prev = (e?: React.MouseEvent) => { e?.preventDefault(); e?.stopPropagation(); setI((x) => (x - 1 + safe.length) % safe.length); };
  const next = (e?: React.MouseEvent) => { e?.preventDefault(); e?.stopPropagation(); setI((x) => (x + 1) % safe.length); };

  return (
    <div className={`relative overflow-hidden bg-muted ${rounded} ${className ?? ""}`}>
      {safe.map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt={alt}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            idx === i ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {/* spacer for aspect */}
      <div className="invisible">
        <img src={safe[0]} alt="" className="h-full w-full object-cover" />
      </div>
      {safe.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="prev"
            className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-background/70 text-foreground backdrop-blur transition hover:bg-background"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="next"
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-background/70 text-foreground backdrop-blur transition hover:bg-background"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {safe.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`slide ${idx + 1}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setI(idx); }}
                className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-primary" : "w-1.5 bg-background/70"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
