import { motion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
};

export function Reveal({ children, delay = 0, y = 28, className }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type HeadingProps = {
  kicker?: string;
  title: string;
  sub?: string;
  align?: "center" | "start";
  light?: boolean;
};

export function SectionHeading({ kicker, title, sub, align = "center", light }: HeadingProps) {
  return (
    <div
      className={`flex flex-col gap-3 ${align === "center" ? "items-center text-center" : "items-start text-start"}`}
    >
      {kicker && (
        <Reveal>
          <span className="font-hand text-2xl text-primary">{kicker}</span>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2
          className={`max-w-3xl text-balance text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl ${
            light ? "text-card" : "text-foreground"
          }`}
        >
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.1}>
          <p
            className={`max-w-2xl text-balance text-base sm:text-lg ${
              light ? "text-card/80" : "text-muted-foreground"
            }`}
          >
            {sub}
          </p>
        </Reveal>
      )}
    </div>
  );
}
