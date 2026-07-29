import regionCrafts from "@/assets/region-crafts.jpg";
import regionSahara from "@/assets/region-sahara.jpg";
import regionSouk from "@/assets/region-souk.jpg";
import regionOasis from "@/assets/region-oasis.jpg";
import regionRif from "@/assets/region-rif.jpg";
import heroAtlas from "@/assets/hero-atlas.jpg";

export type RegionContent = {
  name: Record<string, string>;
  activity: Record<string, string>;
};

export type Region = {
  id: string;
  image: string;
  /** administrative region (jiha) of Morocco */
  jiha: Record<string, string>;
  /** position on the map silhouette, in percentages of the viewBox */
  x: number;
  y: number;
  /** number of filmed experiences available in this area */
  experiences: number;
} & RegionContent;

export const regions: Region[] = [
  // ── Tanger-Tétouan-Al Hoceïma ──────────────────────────────
  {
    id: "chefchaouen",
    experiences: 14,
    image: regionRif,
    x: 71.6,
    y: 7,
    jiha: { en: "Tanger-Tétouan-Al Hoceïma", fr: "Tanger-Tétouan-Al Hoceïma", es: "Tánger-Tetuán-Alhucemas", ar: "طنجة تطوان الحسيمة" },
    name: { en: "Akchour & the Rif", fr: "Akchour & le Rif", es: "Akchour y el Rif", ar: "أكشور والريف" },
    activity: {
      en: "Blue-village trails & waterfall hikes",
      fr: "Sentiers des villages bleus & cascades",
      es: "Senderos de pueblos azules y cascadas",
      ar: "مسالك القرى الزرقاء والشلالات",
    },
  },
  {
    id: "jajouka",
    experiences: 8,
    image: regionSouk,
    x: 73.2,
    y: 5.6,
    jiha: { en: "Tanger-Tétouan-Al Hoceïma", fr: "Tanger-Tétouan-Al Hoceïma", es: "Tánger-Tetuán-Alhucemas", ar: "طنجة تطوان الحسيمة" },
    name: { en: "Jajouka", fr: "Jajouka", es: "Jajouka", ar: "جاجوكة" },
    activity: {
      en: "Ancestral Master Musicians sessions",
      fr: "Sessions des maîtres musiciens ancestraux",
      es: "Sesiones de músicos maestros ancestrales",
      ar: "جلسات موسيقى المعلمين التقليديين",
    },
  },
  // ── L'Oriental ─────────────────────────────────────────────
  {
    id: "zegzel",
    experiences: 7,
    image: regionOasis,
    x: 89,
    y: 9.3,
    jiha: { en: "L'Oriental", fr: "L'Oriental", es: "Oriental", ar: "الشرق" },
    name: { en: "Zegzel Gorges", fr: "Gorges de Zegzel", es: "Gargantas de Zegzel", ar: "مضايق زڭزل" },
    activity: {
      en: "Citrus orchards & cliff-road drives",
      fr: "Vergers d'agrumes & routes de falaise",
      es: "Huertos de cítricos y rutas de acantilado",
      ar: "بساتين الحمضيات ودروب الجبال",
    },
  },
  // ── Fès-Meknès ─────────────────────────────────────────────
  {
    id: "darhamra",
    experiences: 9,
    image: regionCrafts,
    x: 76.9,
    y: 16.3,
    jiha: { en: "Fès-Meknès", fr: "Fès-Meknès", es: "Fez-Mequinez", ar: "فاس مكناس" },
    name: { en: "Dar El Hamra", fr: "Dar El Hamra", es: "Dar El Hamra", ar: "دار الحمراء" },
    activity: {
      en: "Craft workshops & mountain treks",
      fr: "Ateliers d'artisanat & randonnées",
      es: "Talleres de artesanía y senderismo",
      ar: "ورشات الصناعة التقليدية والمشي الجبلي",
    },
  },
  {
    id: "ainleuh",
    experiences: 10,
    image: heroAtlas,
    x: 72.4,
    y: 17.4,
    jiha: { en: "Fès-Meknès", fr: "Fès-Meknès", es: "Fez-Mequinez", ar: "فاس مكناس" },
    name: { en: "Aïn Leuh", fr: "Aïn Leuh", es: "Ain Leuh", ar: "عين اللوح" },
    activity: {
      en: "Cedar-forest trekking & Amazigh festivals",
      fr: "Trek en cédraie & festivals amazighs",
      es: "Trekking en cedros y festivales amazigh",
      ar: "تنزّه في غابة الأرز ومهرجانات أمازيغية",
    },
  },
  {
    id: "bhalil",
    experiences: 6,
    image: regionSouk,
    x: 73.4,
    y: 15.4,
    jiha: { en: "Fès-Meknès", fr: "Fès-Meknès", es: "Fez-Mequinez", ar: "فاس مكناس" },
    name: { en: "Bhalil", fr: "Bhalil", es: "Bhalil", ar: "البهاليل" },
    activity: {
      en: "Visit troglodyte cave homes",
      fr: "Visite des maisons troglodytes",
      es: "Visita casas-cueva trogloditas",
      ar: "زيارة البيوت الكهفية",
    },
  },
  // ── Rabat-Salé-Kénitra ─────────────────────────────────────
  {
    id: "oulmes",
    experiences: 7,
    image: regionOasis,
    x: 67.3,
    y: 18,
    jiha: { en: "Rabat-Salé-Kénitra", fr: "Rabat-Salé-Kénitra", es: "Rabat-Salé-Kenitra", ar: "الرباط سلا القنيطرة" },
    name: { en: "Oulmès", fr: "Oulmès", es: "Oulmès", ar: "أولماس" },
    activity: {
      en: "Thermal springs & plateau hikes",
      fr: "Sources thermales & balades sur le plateau",
      es: "Aguas termales y rutas de meseta",
      ar: "ينابيع حارّة ونزهات الهضبة",
    },
  },
  {
    id: "moulaybousselham",
    experiences: 8,
    image: regionRif,
    x: 65.6,
    y: 8.8,
    jiha: { en: "Rabat-Salé-Kénitra", fr: "Rabat-Salé-Kénitra", es: "Rabat-Salé-Kenitra", ar: "الرباط سلا القنيطرة" },
    name: { en: "Moulay Bousselham", fr: "Moulay Bousselham", es: "Moulay Bousselham", ar: "مولاي بوسلهام" },
    activity: {
      en: "Merja Zerga lagoon & birdwatching",
      fr: "Lagune de Merja Zerga & ornithologie",
      es: "Laguna de Merja Zerga y avistamiento de aves",
      ar: "بحيرة مرجة الزرقاء ومراقبة الطيور",
    },
  },
  // ── Béni Mellal-Khénifra ───────────────────────────────────
  {
    id: "ouzoud",
    experiences: 13,
    image: regionOasis,
    x: 66.8,
    y: 26.1,
    jiha: { en: "Béni Mellal-Khénifra", fr: "Béni Mellal-Khénifra", es: "Beni Melal-Jenifra", ar: "بني ملال خنيفرة" },
    name: { en: "Ouzoud Falls", fr: "Cascades d'Ouzoud", es: "Cascadas de Ouzoud", ar: "شلالات أوزود" },
    activity: {
      en: "Picnic by Morocco's tallest waterfalls",
      fr: "Pique-nique près des plus hautes cascades",
      es: "Picnic junto a las cascadas más altas",
      ar: "نزهة قرب أعلى شلالات المغرب",
    },
  },
  {
    id: "aitbouguemez",
    experiences: 11,
    image: heroAtlas,
    x: 65,
    y: 29.2,
    jiha: { en: "Béni Mellal-Khénifra", fr: "Béni Mellal-Khénifra", es: "Beni Melal-Jenifra", ar: "بني ملال خنيفرة" },
    name: { en: "Aït Bouguemez", fr: "Aït Bouguemez", es: "Ait Bouguemez", ar: "آيت بوݣماز" },
    activity: {
      en: "The Happy Valley: harvests & homestays",
      fr: "La Vallée Heureuse : récoltes & gîtes",
      es: "El Valle Feliz: cosechas y casas rurales",
      ar: "الوادي السعيد: الحصاد والإقامة المنزلية",
    },
  },
  // ── Marrakech-Safi ─────────────────────────────────────────
  {
    id: "imlil",
    experiences: 18,
    image: heroAtlas,
    x: 53.2,
    y: 29.2,
    jiha: { en: "Marrakech-Safi", fr: "Marrakech-Safi", es: "Marrakech-Safi", ar: "مراكش آسفي" },
    name: { en: "Imlil — Mt Toubkal", fr: "Imlil — Mont Toubkal", es: "Imlil — Monte Toubkal", ar: "إمليل — جبل توبقال" },
    activity: {
      en: "Sunrise trek on hidden Berber trails",
      fr: "Trek au lever du soleil sur sentiers berbères",
      es: "Trekking al amanecer por senderos bereberes",
      ar: "تنزّه عند الشروق في مسالك أمازيغية",
    },
  },
  {
    id: "oukaimeden",
    experiences: 9,
    image: heroAtlas,
    x: 56.5,
    y: 27.5,
    jiha: { en: "Marrakech-Safi", fr: "Marrakech-Safi", es: "Marrakech-Safi", ar: "مراكش آسفي" },
    name: { en: "Oukaïmeden", fr: "Oukaïmeden", es: "Oukaïmeden", ar: "أوكايمدن" },
    activity: {
      en: "Highland skiing & rock-engraving trails",
      fr: "Ski d'altitude & gravures rupestres",
      es: "Esquí de altura y grabados rupestres",
      ar: "التزلج الجبلي والنقوش الصخرية",
    },
  },
  {
    id: "ouirgane",
    experiences: 7,
    image: regionOasis,
    x: 55.2,
    y: 32.2,
    jiha: { en: "Marrakech-Safi", fr: "Marrakech-Safi", es: "Marrakech-Safi", ar: "مراكش آسفي" },
    name: { en: "Ouirgane", fr: "Ouirgane", es: "Ouirgane", ar: "ويرݣان" },
    activity: {
      en: "Salt-mine valleys & lakeside rides",
      fr: "Vallées des salines & balades au lac",
      es: "Valles de salinas y paseos junto al lago",
      ar: "وديان الملاحات ونزهات البحيرة",
    },
  },
  // ── Drâa-Tafilalet ─────────────────────────────────────────
  {
    id: "benhaddou",
    experiences: 16,
    image: regionCrafts,
    x: 60.7,
    y: 33,
    jiha: { en: "Drâa-Tafilalet", fr: "Drâa-Tafilalet", es: "Draa-Tafilalet", ar: "درعة تافيلالت" },
    name: { en: "Aït Benhaddou", fr: "Aït Benhaddou", es: "Ait Benhaddou", ar: "آيت بنحدو" },
    activity: {
      en: "Explore the UNESCO earthen ksar",
      fr: "Explorez le ksar de terre (UNESCO)",
      es: "Explora el ksar de tierra (UNESCO)",
      ar: "اكتشف القصر الطيني (اليونسكو)",
    },
  },
  {
    id: "merzouga",
    experiences: 15,
    image: regionSahara,
    x: 79,
    y: 32.7,
    jiha: { en: "Drâa-Tafilalet", fr: "Drâa-Tafilalet", es: "Draa-Tafilalet", ar: "درعة تافيلالت" },
    name: { en: "Merzouga — Erg Chebbi", fr: "Merzouga — Erg Chebbi", es: "Merzouga — Erg Chebbi", ar: "مرزوكة — عرق الشبي" },
    activity: {
      en: "Camel trek & camp under the dunes",
      fr: "Méharée & bivouac sous les dunes",
      es: "Ruta en camello y campamento en las dunas",
      ar: "رحلة الجِمال والمبيت بين الكثبان",
    },
  },
  {
    id: "mhamid",
    experiences: 11,
    image: regionSahara,
    x: 69,
    y: 40.7,
    jiha: { en: "Drâa-Tafilalet", fr: "Drâa-Tafilalet", es: "Draa-Tafilalet", ar: "درعة تافيلالت" },
    name: { en: "M'hamid El Ghizlane", fr: "M'hamid El Ghizlane", es: "M'hamid El Ghizlane", ar: "امحاميد الغزلان" },
    activity: {
      en: "Harvest dates in the Draa palm oasis",
      fr: "Récoltez des dattes dans l'oasis du Draa",
      es: "Cosecha dátiles en el oasis del Draa",
      ar: "احصد التمر في واحة درعة",
    },
  },
  {
    id: "imilchil",
    experiences: 9,
    image: regionOasis,
    x: 69.5,
    y: 26,
    jiha: { en: "Drâa-Tafilalet", fr: "Drâa-Tafilalet", es: "Draa-Tafilalet", ar: "درعة تافيلالت" },
    name: { en: "Imilchil", fr: "Imilchil", es: "Imilchil", ar: "إميلشيل" },
    activity: {
      en: "Mountain lakes & the Marriage Moussem",
      fr: "Lacs de montagne & moussem des fiançailles",
      es: "Lagos de montaña y moussem de bodas",
      ar: "بحيرات الجبال وموسم الخطوبة",
    },
  },
  // ── Souss-Massa ────────────────────────────────────────────
  {
    id: "imiouaddar",
    experiences: 8,
    image: regionRif,
    x: 45.4,
    y: 36.2,
    jiha: { en: "Souss-Massa", fr: "Souss-Massa", es: "Sus-Masa", ar: "سوس ماسة" },
    name: { en: "Imi Ouaddar", fr: "Imi Ouaddar", es: "Imi Ouaddar", ar: "إيمي وادار" },
    activity: {
      en: "Beginner surf & quiet beach coves",
      fr: "Surf débutant & criques tranquilles",
      es: "Surf para principiantes y calas tranquilas",
      ar: "ركوب الأمواج للمبتدئين وخلجان هادئة",
    },
  },
  {
    id: "imessouane",
    experiences: 9,
    image: regionRif,
    x: 45.1,
    y: 36.7,
    jiha: { en: "Souss-Massa", fr: "Souss-Massa", es: "Sus-Masa", ar: "سوس ماسة" },
    name: { en: "Imsouane", fr: "Imsouane", es: "Imsouane", ar: "إمسوان" },
    activity: {
      en: "Longest right-hand wave & fresh seafood",
      fr: "La plus longue vague droite & fruits de mer",
      es: "La ola derecha más larga y mariscos frescos",
      ar: "أطول موجة يمنى ومأكولات بحرية طازجة",
    },
  },
  {
    id: "taliouine",
    experiences: 7,
    image: regionCrafts,
    x: 56.1,
    y: 36.3,
    jiha: { en: "Souss-Massa", fr: "Souss-Massa", es: "Sus-Masa", ar: "سوس ماسة" },
    name: { en: "Taliouine", fr: "Taliouine", es: "Taliouine", ar: "تالوين" },
    activity: {
      en: "Harvest saffron with local cooperatives",
      fr: "Récoltez le safran avec les coopératives",
      es: "Cosecha azafrán con cooperativas locales",
      ar: "اجمع الزعفران مع التعاونيات المحلية",
    },
  },
  {
    id: "tafraoute",
    experiences: 8,
    image: regionCrafts,
    x: 50,
    y: 41.4,
    jiha: { en: "Souss-Massa", fr: "Souss-Massa", es: "Sus-Masa", ar: "سوس ماسة" },
    name: { en: "Tafraoute", fr: "Tafraoute", es: "Tafraout", ar: "تافراوت" },
    activity: {
      en: "Pink granite, painted rocks & almond blossom",
      fr: "Granit rose, rochers peints & amandiers",
      es: "Granito rosa, rocas pintadas y almendros",
      ar: "الصخور الوردية المرسومة وأزهار اللوز",
    },
  },
  // ── Guelmim-Oued Noun ──────────────────────────────────────
  {
    id: "legzira",
    experiences: 6,
    image: regionSahara,
    x: 42.9,
    y: 43.6,
    jiha: { en: "Guelmim-Oued Noun", fr: "Guelmim-Oued Noun", es: "Guelmim-Río Nun", ar: "كلميم واد نون" },
    name: { en: "Legzira", fr: "Legzira", es: "Legzira", ar: "لكزيرة" },
    activity: {
      en: "Red sandstone arches at sunset",
      fr: "Arches de grès rouge au coucher du soleil",
      es: "Arcos de arenisca roja al atardecer",
      ar: "أقواس الحجر الرملي الأحمر عند الغروب",
    },
  },
  // ── Laâyoune-Sakia El Hamra ────────────────────────────────
  {
    id: "foumeloued",
    experiences: 5,
    image: regionSahara,
    x: 24,
    y: 58,
    jiha: { en: "Laâyoune-Sakia El Hamra", fr: "Laâyoune-Sakia El Hamra", es: "El Aaiún-Saguía el Hamra", ar: "العيون الساقية الحمراء" },
    name: { en: "Foum El Oued", fr: "Foum El Oued", es: "Foum El Oued", ar: "فم الواد" },
    activity: {
      en: "Desert-meets-ocean dunes & kitesurf",
      fr: "Dunes océan-désert & kitesurf",
      es: "Dunas entre desierto y océano y kitesurf",
      ar: "كثبان تلتقي بالمحيط وركوب الطائرة الشراعية",
    },
  },
  // ── Dakhla-Oued Ed-Dahab ───────────────────────────────────
  {
    id: "dakhla",
    experiences: 10,
    image: regionSahara,
    x: 9.2,
    y: 79.5,
    jiha: { en: "Dakhla-Oued Ed-Dahab", fr: "Dakhla-Oued Ed-Dahab", es: "Dajla-Río de Oro", ar: "الداخلة وادي الذهب" },
    name: { en: "Dakhla Lagoon", fr: "Lagune de Dakhla", es: "Laguna de Dajla", ar: "بحيرة الداخلة" },
    activity: {
      en: "World-class kitesurf on a flat lagoon",
      fr: "Kitesurf de classe mondiale sur lagune plate",
      es: "Kitesurf de élite en una laguna plana",
      ar: "ركوب الطائرة الشراعية على بحيرة هادئة",
    },
  },
];
