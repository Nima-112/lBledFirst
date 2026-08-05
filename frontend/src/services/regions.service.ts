import { api } from "@/lib/api";

import regionCrafts from "@/assets/region-crafts.jpg";
import regionSahara from "@/assets/region-sahara.jpg";
import regionSouk from "@/assets/region-souk.jpg";
import regionOasis from "@/assets/region-oasis.jpg";
import regionRif from "@/assets/region-rif.jpg";
import heroAtlas from "@/assets/hero-atlas.jpg";

// ── Backend API type ──────────────────────────────────────────────────
export type ApiRegion = {
  id: number;
  name: string; // RegionName enum value, e.g. "MARRAKECH_SAFI"
  latitude: number;
  longitude: number;
  experienceCount: number;
};

// ── Presentation metadata per RegionName enum ─────────────────────────
// These are display-only values (map SVG coords, translations, images)
// that belong in the frontend because they are design/layout concerns.
type RegionMeta = {
  /** Position on the Morocco SVG map silhouette (% of viewBox) */
  x: number;
  y: number;
  image: string;
  jiha: Record<string, string>;
  name: Record<string, string>;
  activity: Record<string, string>;
};

export const REGION_META: Record<string, RegionMeta> = {
  TANGER_TETOUAN_AL_HOCEIMA: {
    x: 72, y: 6.3,
    image: regionRif,
    jiha: { en: "Tanger-Tétouan-Al Hoceïma", fr: "Tanger-Tétouan-Al Hoceïma", es: "Tánger-Tetuán-Alhucemas", ar: "طنجة تطوان الحسيمة" },
    name: { en: "Tanger-Tétouan-Al Hoceïma", fr: "Tanger-Tétouan-Al Hoceïma", es: "Tánger-Tetuán-Alhucemas", ar: "طنجة تطوان الحسيمة" },
    activity: { en: "Blue-village trails & waterfall hikes", fr: "Sentiers des villages bleus & cascades", es: "Senderos de pueblos azules y cascadas", ar: "مسالك القرى الزرقاء والشلالات" },
  },
  LORIENTAL: {
    x: 89, y: 9.3,
    image: regionOasis,
    jiha: { en: "L'Oriental", fr: "L'Oriental", es: "Oriental", ar: "الشرق" },
    name: { en: "L'Oriental", fr: "L'Oriental", es: "Oriental", ar: "الشرق" },
    activity: { en: "Citrus orchards & cliff-road drives", fr: "Vergers d'agrumes & routes de falaise", es: "Huertos de cítricos y rutas de acantilado", ar: "بساتين الحمضيات ودروب الجبال" },
  },
  FES_MEKNES: {
    x: 74, y: 15.8,
    image: regionCrafts,
    jiha: { en: "Fès-Meknès", fr: "Fès-Meknès", es: "Fez-Mequinez", ar: "فاس مكناس" },
    name: { en: "Fès-Meknès", fr: "Fès-Meknès", es: "Fez-Mequinez", ar: "فاس مكناس" },
    activity: { en: "Craft workshops & mountain treks", fr: "Ateliers d'artisanat & randonnées", es: "Talleres de artesanía y senderismo", ar: "ورشات الصناعة التقليدية والمشي الجبلي" },
  },
  RABAT_SALE_KENITRA: {
    x: 66, y: 13,
    image: regionOasis,
    jiha: { en: "Rabat-Salé-Kénitra", fr: "Rabat-Salé-Kénitra", es: "Rabat-Salé-Kenitra", ar: "الرباط سلا القنيطرة" },
    name: { en: "Rabat-Salé-Kénitra", fr: "Rabat-Salé-Kénitra", es: "Rabat-Salé-Kenitra", ar: "الرباط سلا القنيطرة" },
    activity: { en: "Thermal springs & plateau hikes", fr: "Sources thermales & balades sur le plateau", es: "Aguas termales y rutas de meseta", ar: "ينابيع حارّة ونزهات الهضبة" },
  },
  BENI_MELLAL_KHENIFRA: {
    x: 66, y: 27,
    image: heroAtlas,
    jiha: { en: "Béni Mellal-Khénifra", fr: "Béni Mellal-Khénifra", es: "Beni Melal-Jenifra", ar: "بني ملال خنيفرة" },
    name: { en: "Béni Mellal-Khénifra", fr: "Béni Mellal-Khénifra", es: "Beni Melal-Jenifra", ar: "بني ملال خنيفرة" },
    activity: { en: "Picnic by Morocco's tallest waterfalls", fr: "Pique-nique près des plus hautes cascades", es: "Picnic junto a las cascadas más altas", ar: "نزهة قرب أعلى شلالات المغرب" },
  },
  CASABLANCA_SETTAT: {
    x: 60, y: 20,
    image: regionSouk,
    jiha: { en: "Casablanca-Settat", fr: "Casablanca-Settat", es: "Casablanca-Settat", ar: "الدار البيضاء سطات" },
    name: { en: "Casablanca-Settat", fr: "Casablanca-Settat", es: "Casablanca-Settat", ar: "الدار البيضاء سطات" },
    activity: { en: "Coastal heritage & medina walks", fr: "Patrimoine côtier & balades en médina", es: "Patrimonio costero y paseos por la medina", ar: "التراث الساحلي وجولات المدينة القديمة" },
  },
  MARRAKECH_SAFI: {
    x: 54, y: 30,
    image: heroAtlas,
    jiha: { en: "Marrakech-Safi", fr: "Marrakech-Safi", es: "Marrakech-Safi", ar: "مراكش آسفي" },
    name: { en: "Marrakech-Safi", fr: "Marrakech-Safi", es: "Marrakech-Safi", ar: "مراكش آسفي" },
    activity: { en: "Sunrise trek on hidden Berber trails", fr: "Trek au lever du soleil sur sentiers berbères", es: "Trekking al amanecer por senderos bereberes", ar: "تنزّه عند الشروق في مسالك أمازيغية" },
  },
  DRAA_TAFILALET: {
    x: 70, y: 33,
    image: regionSahara,
    jiha: { en: "Drâa-Tafilalet", fr: "Drâa-Tafilalet", es: "Draa-Tafilalet", ar: "درعة تافيلالت" },
    name: { en: "Drâa-Tafilalet", fr: "Drâa-Tafilalet", es: "Draa-Tafilalet", ar: "درعة تافيلالت" },
    activity: { en: "Camel trek & camp under the dunes", fr: "Méharée & bivouac sous les dunes", es: "Ruta en camello y campamento en las dunas", ar: "رحلة الجِمال والمبيت بين الكثبان" },
  },
  SOUSS_MASSA: {
    x: 48, y: 37,
    image: regionCrafts,
    jiha: { en: "Souss-Massa", fr: "Souss-Massa", es: "Sus-Masa", ar: "سوس ماسة" },
    name: { en: "Souss-Massa", fr: "Souss-Massa", es: "Sus-Masa", ar: "سوس ماسة" },
    activity: { en: "Harvest saffron with local cooperatives", fr: "Récoltez le safran avec les coopératives", es: "Cosecha azafrán con cooperativas locales", ar: "اجمع الزعفران مع التعاونيات المحلية" },
  },
  GUELMIM_OUED_NOUN: {
    x: 43, y: 44,
    image: regionSahara,
    jiha: { en: "Guelmim-Oued Noun", fr: "Guelmim-Oued Noun", es: "Guelmim-Río Nun", ar: "كلميم واد نون" },
    name: { en: "Guelmim-Oued Noun", fr: "Guelmim-Oued Noun", es: "Guelmim-Río Nun", ar: "كلميم واد نون" },
    activity: { en: "Red sandstone arches at sunset", fr: "Arches de grès rouge au coucher du soleil", es: "Arcos de arenisca roja al atardecer", ar: "أقواس الحجر الرملي الأحمر عند الغروب" },
  },
  LAAYOUNE_SAKIA_EL_HAMRA: {
    x: 24, y: 58,
    image: regionSahara,
    jiha: { en: "Laâyoune-Sakia El Hamra", fr: "Laâyoune-Sakia El Hamra", es: "El Aaiún-Saguía el Hamra", ar: "العيون الساقية الحمراء" },
    name: { en: "Laâyoune-Sakia El Hamra", fr: "Laâyoune-Sakia El Hamra", es: "El Aaiún-Saguía el Hamra", ar: "العيون الساقية الحمراء" },
    activity: { en: "Desert-meets-ocean dunes & kitesurf", fr: "Dunes océan-désert & kitesurf", es: "Dunas entre desierto y océano y kitesurf", ar: "كثبان تلتقي بالمحيط وركوب الطائرة الشراعية" },
  },
  DAKHLA_OUED_ED_DAHAB: {
    x: 9.2, y: 79.5,
    image: regionSahara,
    jiha: { en: "Dakhla-Oued Ed-Dahab", fr: "Dakhla-Oued Ed-Dahab", es: "Dajla-Río de Oro", ar: "الداخلة وادي الذهب" },
    name: { en: "Dakhla-Oued Ed-Dahab", fr: "Dakhla-Oued Ed-Dahab", es: "Dajla-Río de Oro", ar: "الداخلة وادي الذهب" },
    activity: { en: "World-class kitesurf on a flat lagoon", fr: "Kitesurf de classe mondiale sur lagune plate", es: "Kitesurf de élite en una laguna plana", ar: "ركوب الطائرة الشراعية على بحيرة هادئة" },
  },
};

// ── Merged front-end type ─────────────────────────────────────────────
export type FrontRegion = {
  id: string;
  enumName: string; // raw RegionName enum value
  x: number;
  y: number;
  image: string;
  experienceCount: number;
  jiha: Record<string, string>;
  name: Record<string, string>;
  activity: Record<string, string>;
};

function toFront(api: ApiRegion): FrontRegion | null {
  const meta = REGION_META[api.name];
  if (!meta) return null; // unknown region — skip
  return {
    id: String(api.id),
    enumName: api.name,
    x: meta.x,
    y: meta.y,
    image: meta.image,
    experienceCount: api.experienceCount,
    jiha: meta.jiha,
    name: meta.name,
    activity: meta.activity,
  };
}

export async function getRegionsList(): Promise<FrontRegion[]> {
  const { data } = await api.get<ApiRegion[]>("/regions");
  return data.map(toFront).filter((r): r is FrontRegion => r !== null);
}

export async function getRegionById(id: string): Promise<FrontRegion | null> {
  const { data } = await api.get<ApiRegion>(`/regions/${id}`);
  return toFront(data);
}
