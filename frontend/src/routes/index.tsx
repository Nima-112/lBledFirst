import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { WhatIs } from "@/components/landing/WhatIs";
import { MoroccoMap } from "@/components/landing/MoroccoMap";
import { Experiences } from "@/components/landing/Experiences";
import { HorizontalGallery } from "@/components/landing/HorizontalGallery";
import { Timeline } from "@/components/landing/Timeline";
import { Activities } from "@/components/landing/Activities";
import { Training } from "@/components/landing/Training";
import { Testimonials } from "@/components/landing/Testimonials";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "L'Bled First — Authentic Rural Tourism in Morocco" },
      {
        name: "description",
        content:
          "Morocco's first platform for authentic rural tourism. Filmed experiences with rural hosts, auto-translated into your language, bookable online.",
      },
      { property: "og:title", content: "L'Bled First — Authentic Rural Tourism in Morocco" },
      {
        property: "og:description",
        content:
          "Discover the real Morocco through filmed experiences with rural hosts. Hiking, crafts, cuisine, homestays and more — in your language.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function scrollTo(id: string) {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Index() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Navbar hero onDiscover={() => scrollTo("map")} />
      <main>
        <Hero onDiscover={() => scrollTo("map")} />
        <WhatIs />
        <MoroccoMap
          onSelectRegion={(regionId) =>
            navigate({ to: "/experiences", search: { region: regionId } })
          }
        />
        <Experiences />
        <HorizontalGallery />
        <Timeline />
        <Activities />
        <Training />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
