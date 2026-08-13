import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "fr" | "en" | "ar" | "es";

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇲🇦" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

type Dict = Record<string, string>;

/** English source strings — other languages via Google Translate */
const translations: Dict = {
    "nav.regions": "Regions",
    "nav.experiences": "Experiences",
    "nav.how": "How it works",
    "nav.host": "Become a host",
    "nav.cta": "Discover Your Region",
    "nav.login": "Log in",
    "nav.formations": "Trainings",
    "formations.kicker": "L'Bled First Academy",

    "hero.kicker": "Morocco's first authentic rural tourism platform",
    "hero.title1": "Meet the real",
    "hero.title2": "Morocco",
    "hero.sub":
      "Filmed experiences with rural hosts, auto-translated into your language, bookable in two taps. No clichés — just raw beauty and human connection.",
    "hero.cta": "Discover Your Region",
    "hero.secondary": "Watch the stories",
    "hero.scroll": "Scroll to explore",

    "what.kicker": "What is L'Bled First?",
    "what.title": "A bridge between travelers and rural Morocco",
    "what.sub":
      "We film real hosts in their villages, translate everything into your language, and let you book instantly.",
    "what.discover.t": "Discover",
    "what.discover.d":
      "Browse professionally filmed video experiences from the Atlas, the Sahara, the Rif and beyond.",
    "what.book.t": "Book",
    "what.book.d":
      "Reserve homestays, meals and activities online — secure, instant, no middlemen.",
    "what.experience.t": "Experience",
    "what.experience.d":
      "Live a real day with a rural family, understood in your own language thanks to AI translation.",

    "map.kicker": "Interactive map",
    "map.title": "Explore Morocco's rural regions",
    "map.sub": "Hover a region to preview a signature experience. Tap to start your journey.",
    "map.preview": "Featured experience",
    "map.experiences": "experiences",

    "exp.kicker": "Experience categories",
    "exp.title": "What do you want to live?",
    "exp.hiking": "Hiking",
    "exp.crafts": "Crafts",
    "exp.cuisine": "Cuisine",
    "exp.agriculture": "Agriculture",
    "exp.festivals": "Festivals",
    "exp.homestays": "Homestays",

    "story.kicker": "A day in the bled",
    "story.title": "Follow a traveler's journey",
    "story.sunrise.t": "Sunrise in the Atlas",
    "story.sunrise.d":
      "Wake to mint tea and mountain silence, then trek hidden Berber trails with a local guide.",
    "story.souk.t": "Midday at the souk",
    "story.souk.d":
      "Wander a rural market, taste warm bread, learn to bargain and share laughs with artisans.",
    "story.dinner.t": "Dinner in the Sahara",
    "story.dinner.d":
      "Watch the dunes turn gold, then gather around a tagine under a sky thick with stars.",

    "how.kicker": "How it works",
    "how.title": "Three steps to the real thing",
    "how.browse.t": "Browse",
    "how.browse.d": "Explore filmed experiences and regions, auto-translated into your language.",
    "how.book.t": "Book",
    "how.book.d": "Pick your dates and reserve securely online in minutes.",
    "how.live.t": "Live",
    "how.live.d": "Show up, connect, and live an authentic day with your host.",

    "regions.kicker": "Featured regions",
    "regions.title": "Where will you wake up?",
    "regions.cta": "Explore region",
    "regions.page.title": "Explore our regions",
    "regions.page.sub":
      "Discover the Moroccan regions with real experiences to live, filmed with local hosts.",
    "regions.page.empty": "No region with experiences yet.",
    "regions.detail.back": "All regions",
    "regions.detail.empty": "No experience published in this region yet.",
    "regions.detail.notFound": "Region not found.",

    "testi.kicker": "Travelers' words",
    "testi.title": "Stories in their own language",

    "host.kicker": "For rural hosts",
    "host.title": "Share your culture, welcome the world",
    "host.sub":
      "Turn your home, your craft and your table into an income — we film, translate and bring guests to you.",
    "host.cta": "Become a host",

    "foot.tagline": "Authentic rural Morocco, in your language.",
    "foot.language": "Language",
    "foot.newsletter": "Get village stories in your inbox",
    "foot.email": "Your email",
    "foot.subscribe": "Subscribe",
    "foot.subscribed": "Thank you — see you in the bled!",
    "foot.explore": "Explore",
    "foot.company": "Company",
    "foot.about": "About",
    "foot.contact": "Contact",
    "foot.careers": "Careers",
    "foot.rights": "All rights reserved.",

    "admin.logout": "Log out",
    "admin.nav.dashboard": "Dashboard",
    "admin.nav.bookings": "Bookings",
    "admin.nav.tourists": "Tourists",
    "admin.nav.reviews": "Reviews",
    "admin.nav.formations": "Trainings",
    "admin.nav.enrollments": "Enrollments",
    "admin.nav.settings": "Settings",
    "admin.formations.title": "Trainings",
    "admin.formations.subtitle": "Create, edit or remove video training programs.",
    "admin.formations.add": "New training",
    "admin.formations.empty": "No training yet.",
    "admin.formations.view": "View",
    "admin.formations.edit": "Edit",
    "admin.formations.delete": "Delete",
    "admin.formations.confirmDelete": "Delete this training?",
    "admin.formations.editTitle": "Edit training",
    "admin.formations.createTitle": "New training",
    "admin.formations.addItem": "Add",
    "admin.formations.chapter": "Chapter",
    "admin.formations.capsule": "Capsule",
    "admin.formations.f.title": "Title",
    "admin.formations.f.slug": "Slug",
    "admin.formations.f.short": "Short description",
    "admin.formations.f.long": "Full description",
    "admin.formations.f.category": "Category",
    "admin.formations.f.level": "Level",
    "admin.formations.f.language": "Language",
    "admin.formations.f.price": "Price (MAD)",
    "admin.formations.f.students": "Students",
    "admin.formations.f.rating": "Rating",
    "admin.formations.f.cover": "Cover image URL",
    "admin.formations.f.objectives": "Objectives",
    "admin.formations.f.skills": "Skills",
    "admin.formations.f.prerequisites": "Prerequisites",
    "admin.formations.f.instructor": "Instructor",
    "admin.formations.f.iName": "Name",
    "admin.formations.f.iSpecialty": "Specialty",
    "admin.formations.f.iYears": "Years of experience",
    "admin.formations.f.iPhoto": "Photo URL",
    "admin.formations.f.iBio": "Bio",
    "admin.formations.f.chapters": "Chapters & capsules",
    "admin.formations.f.addChapter": "Add chapter",
    "admin.formations.f.addCapsule": "Add capsule",
    "admin.formations.f.noChapters": "No chapters yet.",

    "gallery.kicker": "Discover Rural Morocco",
    "gallery.scrollHint": "Scroll to explore",
    "gallery.outro": "Come be welcomed.",
    "gallery.s1.headline": "Discover",
    "gallery.s1.subline": "Rural Morocco",
    "gallery.s1.body":
      "Beyond the medinas and riads lies a Morocco few travelers ever see — villages where time moves with the sun and hospitality is sacred.",
    "gallery.s2.headline": "Where",
    "gallery.s2.subline": "Doors Stay Open",
    "gallery.s2.body":
      "In these valleys, strangers are welcomed with mint tea and warm bread. Every home is an invitation. Every meal is shared.",
    "gallery.s3.headline": "A Land",
    "gallery.s3.subline": "Of Rituals",
    "gallery.s3.body":
      "From the first pour of tea to the last ember of the evening fire — every gesture carries meaning, every tradition tells a story.",
    "gallery.alt1": "Green terraced hillsides of rural Morocco",
    "gallery.alt2": "Lush green fields with olive trees and rolling hills",
    "gallery.alt3": "Traditional Moroccan tea ceremony overlooking ancient villages",

    "timeline.kicker": "A day with L'Bled First",
    "timeline.title": "From dawn to stars",
    "timeline.d1.time": "Dawn",
    "timeline.d1.title": "Wake in the Atlas",
    "timeline.d1.body":
      "The morning call to prayer echoes across the valley. Mist clings to the peaks. Your host brings fresh bread baked in a clay oven and mint tea — the first of many glasses.",
    "timeline.d2.time": "Morning",
    "timeline.d2.title": "Walk the Terraces",
    "timeline.d2.body":
      "Follow ancient irrigation channels through walnut and almond groves. A farmer invites you to sit under an olive tree. He doesn't speak your language, but his smile needs no translation.",
    "timeline.d3.time": "Midday",
    "timeline.d3.title": "Share the Tagine",
    "timeline.d3.body":
      "The whole family gathers around one dish. Slow-cooked lamb, preserved lemons, saffron from the village garden. You eat with your hands. Nobody is in a hurry.",
    "timeline.d4.time": "Afternoon",
    "timeline.d4.title": "The Souk & the Stories",
    "timeline.d4.body":
      "Wander a weekly market where Berber women trade argan oil and handwoven carpets. Every pattern tells a story — of marriage, of harvest, of protection from the evil eye.",
    "timeline.d5.time": "Sunset",
    "timeline.d5.title": "Tea on the Rooftop",
    "timeline.d5.body":
      "Three glasses of tea on a sunlit terrace overlooking the valley. The light turns gold, then amber, then rose. Your host says: you are not a guest anymore — you are family.",
    "timeline.d6.time": "Night",
    "timeline.d6.title": "Sleep Under the Stars",
    "timeline.d6.body":
      "In the desert, there are no walls between you and the sky. A Berber camp, a wool blanket, a fire dying to embers. The Sahara is silent — but it speaks volumes.",

    "acts.kicker": "What awaits you",
    "acts.title": "Experiences, not excursions",
    "acts.a1.title": "Mountain Treks",
    "acts.a1.desc":
      "Hike through the High Atlas with Berber guides — from day walks to multi-day summit expeditions on Mt Toubkal.",
    "acts.a1.cta": "View treks",
    "acts.a2.title": "Tea Ceremonies",
    "acts.a2.desc":
      "Learn the ritual of Moroccan tea from village elders — the pour, the pour height, the three glasses tradition.",
    "acts.a2.cta": "Learn more",
    "acts.a3.title": "Artisan Workshops",
    "acts.a3.desc":
      "Weave carpets with Berber women, shape pottery in Tamegroute, or press argan oil the ancient way.",
    "acts.a3.cta": "See workshops",
    "acts.a4.title": "Desert Camps",
    "acts.a4.desc":
      "Sleep under the stars in Erg Chebbi. Camel treks at dawn, Gnawa drums at night, silence in between.",
    "acts.a4.cta": "Explore desert",
    "acts.a5.title": "Cooking with Locals",
    "acts.a5.desc":
      "Join a family kitchen. Learn tagine, couscous Friday, msemen on a clay stove — eat what you make together.",
    "acts.a5.cta": "Book a meal",
    "acts.a6.title": "Valley Walks",
    "acts.a6.desc":
      "Wander through Paradise Valley, Aït Bouguemez, or the Drâa oases — palm groves, rivers, and ancient farms.",
    "acts.a6.cta": "Find a walk",
    "acts.empty": "No published experience yet — the admin will add them soon.",
    "acts.dayShort": "d",
    "acts.viewProgram": "View program",
    "acts.viewAll": "View all experiences",

    "training.kicker": "L'Bled First Academy",
    "training.title": "Learn traditional crafts",
    "training.sub":
      "Video training programs filmed with master artisans. Learn at your own pace, from anywhere.",
    "training.empty": "No training published yet — check back soon.",
    "training.free": "Free",
    "training.viewDetail": "View details",
    "training.viewAll": "View all trainings",

    "nav.me.bookings": "My bookings",
    "nav.me.formations": "My trainings",
    "nav.me.reviews": "My reviews",
    "nav.me.profile": "My profile",
    "nav.me.logout": "Log out",

    "me.greeting": "Hello",
    "me.backHome": "Back home",
    "me.bookings.title": "My bookings",
    "me.bookings.empty": "You haven't booked any experience yet.",
    "me.bookings.browse": "Browse experiences",
    "me.bookings.guests": "guest(s)",
    "me.bookings.review": "Leave a review",
    "me.bookings.cancel": "Cancel",
    "me.bookings.cancel.confirm": "Cancel this booking?",
    "me.bookings.reviewTitle": "Leave a review",
    "me.bookings.rating": "Rating",
    "me.bookings.comment": "Your comment",
    "me.formations.title": "My trainings",
    "me.formations.empty": "You aren't enrolled in any training yet.",
    "me.formations.browse": "Browse trainings",
    "me.formations.discoverMore": "Browse more available trainings",
    "me.formations.enrolled": "Enrolled",
    "me.reviews.title": "My reviews",
    "me.reviews.empty": "You haven't written any review yet.",
    "me.profile.title": "My profile",
    "me.profile.personal": "Personal information",
    "me.profile.fullName": "Full name",
    "me.profile.phone": "Phone",
    "me.profile.country": "Country of origin",
    "me.profile.language": "Native language",
    "me.profile.save": "Save changes",
    "me.profile.saved": "Saved",
    "me.profile.changePhoto": "Change photo",
    "me.profile.password": "Change password",
    "me.profile.newPassword": "New password",
    "me.profile.updatePassword": "Update password",

    "exp.detail.back": "Back",
    "exp.detail.days": "days",
    "exp.detail.program": "Full program",
    "exp.detail.day": "Day",
    "exp.book.from": "From",
    "exp.book.perPerson": "per person",
    "exp.book.date": "Start date",
    "exp.book.guests": "Travelers",
    "exp.book.total": "Total",
    "exp.book.cta": "Book this experience",
    "exp.book.confirmed": "Booking confirmed — redirecting…",
    "exp.book.hint": "Free cancellation up to 48h before start.",

    "admin.nav.experiences": "Experiences",
    "admin.exp.title": "Experiences",
    "admin.exp.subtitle": "Create, edit and publish rural experiences.",
    "admin.exp.add": "New experience",
    "admin.exp.empty": "No experience yet.",
    "admin.exp.publish": "Publish",
    "admin.exp.unpublish": "Unpublish",
    "admin.exp.editTitle": "Edit experience",
    "admin.exp.createTitle": "New experience",
    "admin.exp.confirmDelete": "Delete this experience?",
    "admin.exp.f.title": "Title",
    "admin.exp.f.description": "Description",
    "admin.exp.f.price": "Price (MAD)",
    "admin.exp.f.duration": "Duration (days)",
    "admin.exp.f.region": "Region",
    "admin.exp.f.category": "Category",
    "admin.exp.f.lat": "Latitude",
    "admin.exp.f.lng": "Longitude",
    "admin.exp.f.images": "Cover image URLs (one per line)",
    "admin.exp.f.program": "Day-by-day program",
    "admin.exp.f.dayTitle": "Day title",
    "admin.exp.f.dayDescription": "Day description",
    "admin.exp.f.dayImages": "Day images (one URL per line)",
    "admin.exp.f.addDay": "Add day",
    "admin.exp.f.removeDay": "Remove day",
    "admin.exp.f.host": "Host",
};

type I18nContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
};

const I18nContext = createContext<I18nContextValue | null>(null);

function applyGoogleTranslate(targetLang: Lang) {
  if (typeof window === "undefined") return;

  const cookieVal = targetLang === "en" ? "/en/en" : `/en/${targetLang}`;

  // Set google translate cookies
  document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname}`;
  document.cookie = `googtrans=${cookieVal}; path=/;`;

  // Try to set select element if GT element exists
  const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
  if (combo) {
    if (combo.value !== targetLang) {
      combo.value = targetLang;
      combo.dispatchEvent(new Event("change"));
    }
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lbled_lang") as Lang | null;
      if (saved && ["fr", "en", "ar", "es"].includes(saved)) return saved;
    }
    return "en";
  });

  const dir = lang === "ar" ? "rtl" : "ltr";

  const changeLang = (newLang: Lang) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("lbled_lang", newLang);
      applyGoogleTranslate(newLang);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Global callback for Google Translate Init
    (window as any).googleTranslateElementInit = () => {
      if ((window as any).google?.translate?.TranslateElement) {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "fr,en,ar,es",
            autoDisplay: false,
          },
          "google_translate_element",
        );
        setTimeout(() => applyGoogleTranslate(lang), 300);
      }
    };

    // Inject Google Translate script if not present
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      applyGoogleTranslate(lang);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = dir;
      applyGoogleTranslate(lang);
    }
  }, [lang, dir]);

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang: changeLang,
      dir,
      t: (key: string) => translations[key] ?? key,
    }),
    [lang, dir],
  );

  return (
    <I18nContext.Provider value={value}>
      <div id="google_translate_element" style={{ display: "none" }} />
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
