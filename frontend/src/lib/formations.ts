// ----------------------------------------------------------------------------
// FRONTEND-ONLY formations catalogue + purchase / progress tracking.
// All state persists in localStorage — no backend yet. Shapes mirror what a
// future backend would expose so the UI stays coherent.
// ----------------------------------------------------------------------------

export type Level = "Débutant" | "Intermédiaire" | "Avancé";
export type Language = "Français" | "Arabe" | "Anglais" | "Espagnol";

export type Capsule = {
  id: string;
  order: number;
  title: string;
  description: string;
  duration: number; // minutes
  thumbnail: string;
  videoUrl?: string; // real content — only served after purchase in a real backend
};

export type Chapter = {
  id: string;
  order: number;
  title: string;
  capsules: Capsule[];
};

export type Instructor = {
  id: string;
  name: string;
  specialty: string;
  experienceYears: number;
  bio: string;
  photo: string;
  totalFormations: number;
  averageRating: number;
  studentsTrained: number;
};

export type Formation = {
  id?: string | number;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  level: Level;
  language: Language;
  price: number; // MAD
  coverImage: string;
  previewVideo?: string;
  totalDuration: number; // minutes
  studentsCount: number;
  averageRating: number;
  reviewsCount: number;
  objectives: string[];
  skills: string[];
  prerequisites: string[];
  chapters: Chapter[];
  instructor: Instructor;
  createdAt: string;
  // renseigné uniquement par l'API (le détail d'une formation) : true si
  // l'utilisateur courant a acheté cette formation
  purchased?: boolean;
};

// ---- Instructors ----------------------------------------------------------

const INSTRUCTORS: Record<string, Instructor> = {
  fatima: {
    id: "i-fatima",
    name: "Lalla Fatima Zahra Bennani",
    specialty: "Maalema — Tarz Fassi",
    experienceYears: 32,
    bio: "Héritière d'une lignée de brodeuses de la médina de Fès, Lalla Fatima transmet depuis trois décennies l'art du Tarz Fassi à de nouvelles générations. Ses œuvres ont été exposées à Paris, Marrakech et Dubaï.",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    totalFormations: 3,
    averageRating: 4.9,
    studentsTrained: 1240,
  },
  hicham: {
    id: "i-hicham",
    name: "Maalem Hicham El Fassi",
    specialty: "Maître Zelligeur",
    experienceYears: 25,
    bio: "Maalem zelligeur de la médina de Fès, formé à l'école traditionnelle depuis l'âge de 12 ans. Il a participé à la restauration de plusieurs riads classés patrimoine.",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    totalFormations: 2,
    averageRating: 4.8,
    studentsTrained: 860,
  },
  aicha: {
    id: "i-aicha",
    name: "Aïcha Ait Ouyahia",
    specialty: "Tisseuse de tapis berbères",
    experienceYears: 28,
    bio: "Membre d'une coopérative féminine du Moyen Atlas, Aïcha maîtrise les motifs Beni Ourain et Boucherouite transmis par ses aïeules.",
    photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80",
    totalFormations: 2,
    averageRating: 4.9,
    studentsTrained: 920,
  },
  brahim: {
    id: "i-brahim",
    name: "Maalem Brahim Tazi",
    specialty: "Potier de Safi",
    experienceYears: 30,
    bio: "Potier de la colline des potiers de Safi, spécialiste des émaux polychromes traditionnels marocains.",
    photo: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80",
    totalFormations: 2,
    averageRating: 4.7,
    studentsTrained: 610,
  },
  youssef: {
    id: "i-youssef",
    name: "Youssef Skalli",
    specialty: "Maître calligraphe",
    experienceYears: 22,
    bio: "Calligraphe diplômé de l'Académie de calligraphie arabe d'Istanbul. Il enseigne les styles Maghrébi, Thuluth et Diwani.",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    totalFormations: 4,
    averageRating: 4.9,
    studentsTrained: 1580,
  },
  nadia: {
    id: "i-nadia",
    name: "Chef Nadia Bouchentouf",
    specialty: "Cuisine traditionnelle marocaine",
    experienceYears: 18,
    bio: "Ancienne cheffe d'un riad étoilé à Marrakech, Nadia partage les recettes de sa grand-mère de Chefchaouen.",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    totalFormations: 5,
    averageRating: 4.8,
    studentsTrained: 2340,
  },
  omar: {
    id: "i-omar",
    name: "Maalem Omar Chaouni",
    specialty: "Maroquinier de Fès",
    experienceYears: 27,
    bio: "Artisan des tanneries Chouara, il perpétue le tannage végétal traditionnel et la couture main du cuir marocain.",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    totalFormations: 2,
    averageRating: 4.7,
    studentsTrained: 540,
  },
  saida: {
    id: "i-saida",
    name: "Saida El Alaoui",
    specialty: "Couturière de caftans",
    experienceYears: 24,
    bio: "Styliste-couturière basée à Rabat, Saida a habillé plusieurs stars pour la Semaine du Caftan.",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    totalFormations: 3,
    averageRating: 4.9,
    studentsTrained: 1120,
  },
};

// ---- Helper builders ------------------------------------------------------

const cap = (
  order: number,
  title: string,
  duration: number,
  description: string,
  thumbnail: string,
): Capsule => ({
  // Deterministic ID so SSR + client render match and progress persists.
  id: `c-${order}`,
  order,
  title,
  description,
  duration,
  thumbnail,
});

// ---- Seed formations ------------------------------------------------------

export const FORMATIONS: Formation[] = [
  {
    slug: "tarz-fassi",
    title: "Tarz Fassi — l'art de la broderie de Fès",
    shortDescription:
      "Maîtrisez les points, motifs et symboles du célèbre Tarz Fassi transmis depuis le XIVᵉ siècle.",
    longDescription:
      "Le Tarz Fassi est l'un des plus prestigieux savoir-faire de la médina de Fès. Cette formation vous guide pas à pas dans la maîtrise du point de croix marocain, des motifs géométriques inspirés de l'architecture andalouse et de la composition d'une pièce complète — nappe, coussin ou caftan brodé.",
    category: "Broderie",
    level: "Intermédiaire",
    language: "Français",
    price: 890,
    coverImage:
      "https://images.unsplash.com/photo-1610030006870-cbc4d1cca3c6?auto=format&fit=crop&w=1200&q=80",
    totalDuration: 480,
    studentsCount: 342,
    averageRating: 4.9,
    reviewsCount: 128,
    objectives: [
      "Comprendre l'histoire et les symboles du Tarz Fassi",
      "Maîtriser les 5 points de base de la broderie fassie",
      "Réaliser une composition complète et harmonieuse",
      "Choisir les fils, tissus et couleurs traditionnels",
    ],
    skills: [
      "Points fondamentaux du Tarz Fassi",
      "Lecture et création de motifs géométriques",
      "Assortiment de couleurs traditionnelles",
      "Finitions professionnelles",
    ],
    prerequisites: ["Notions de couture main", "Patience et minutie"],
    chapters: [
      {
        id: "ch-1",
        order: 1,
        title: "Introduction & histoire",
        capsules: [
          cap(1, "Bienvenue et présentation de la formation", 8, "Découverte du parcours et du matériel.", "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=600&q=80"),
          cap(2, "Histoire du Tarz Fassi", 14, "Des palais andalous à la médina de Fès.", "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-2",
        order: 2,
        title: "Matériaux & outils",
        capsules: [
          cap(3, "Choisir son tissu et ses fils", 18, "Toile, coton égyptien et soie naturelle.", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80"),
          cap(4, "Préparer le tambour et l'aiguille", 12, "Tension parfaite pour un point régulier.", "https://images.unsplash.com/photo-1610030006870-cbc4d1cca3c6?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-3",
        order: 3,
        title: "Les 5 points fondamentaux",
        capsules: [
          cap(5, "Le point de croix marocain", 22, "La base de toutes les compositions.", "https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=600&q=80"),
          cap(6, "Le point de tige", 16, "Contours nets et courbes fluides.", "https://images.unsplash.com/photo-1610030006870-cbc4d1cca3c6?auto=format&fit=crop&w=600&q=80"),
          cap(7, "Le remplissage plat", 20, "Aplats colorés et surfaces régulières.", "https://images.unsplash.com/photo-1591129841117-3adfd313e34f?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-4",
        order: 4,
        title: "Démonstration guidée",
        capsules: [
          cap(8, "Réaliser un motif étoile complet", 32, "Suivez la maalema pas à pas.", "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=600&q=80"),
          cap(9, "Composition d'une bordure", 28, "Assembler plusieurs motifs.", "https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-5",
        order: 5,
        title: "Projet final",
        capsules: [
          cap(10, "Concevoir votre pièce personnelle", 24, "Croquis, palette et plan de broderie.", "https://images.unsplash.com/photo-1610030006870-cbc4d1cca3c6?auto=format&fit=crop&w=600&q=80"),
          cap(11, "Finitions et présentation", 20, "Repassage, doublure, encadrement.", "https://images.unsplash.com/photo-1594736797933-d0a501ba2fe6?auto=format&fit=crop&w=600&q=80"),
        ],
      },
    ],
    instructor: INSTRUCTORS.fatima,
    createdAt: "2026-01-15T09:00:00.000Z",
  },
  {
    slug: "zellige-de-fes",
    title: "Zellige de Fès — mosaïque traditionnelle",
    shortDescription:
      "Apprenez à tailler, poser et composer les mosaïques en zellige qui ornent les riads.",
    longDescription:
      "Le zellige est l'âme géométrique de l'architecture marocaine. Cette formation couvre la taille des tesselles, la lecture des motifs classiques (khatem, safifa, zouwaqa) et la composition d'un panneau complet.",
    category: "Zellige",
    level: "Avancé",
    language: "Français",
    price: 1290,
    coverImage:
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
    totalDuration: 540,
    studentsCount: 218,
    averageRating: 4.8,
    reviewsCount: 87,
    objectives: [
      "Reconnaître les motifs classiques du zellige",
      "Tailler les tesselles à la main",
      "Composer un panneau complet",
      "Poser le zellige sur un support",
    ],
    skills: ["Taille manuelle", "Lecture des motifs", "Pose et jointoiement"],
    prerequisites: ["Aucun — accessible aux débutants motivés"],
    chapters: [
      {
        id: "ch-1",
        order: 1,
        title: "Introduction au zellige",
        capsules: [
          cap(1, "Histoire et symbolique", 12, "Des Mérinides à aujourd'hui.", "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-2",
        order: 2,
        title: "Matériaux et outils",
        capsules: [
          cap(2, "Argile, émaux et menqach", 20, "Le matériel du maalem.", "https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-3",
        order: 3,
        title: "Taille des tesselles",
        capsules: [
          cap(3, "Le geste du maalem", 30, "Précision et rythme.", "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?auto=format&fit=crop&w=600&q=80"),
          cap(4, "Formes de base — carré, triangle, losange", 24, "Répertoire fondamental.", "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-4",
        order: 4,
        title: "Composition d'un panneau",
        capsules: [
          cap(5, "Motif de l'étoile à 8 branches", 36, "Le khatem sulaimani.", "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80"),
          cap(6, "Frises et bordures", 22, "Assembler un ensemble cohérent.", "https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-5",
        order: 5,
        title: "Projet final",
        capsules: [
          cap(7, "Réaliser une table basse en zellige", 40, "Du croquis à la pose.", "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80"),
        ],
      },
    ],
    instructor: INSTRUCTORS.hicham,
    createdAt: "2026-01-22T09:00:00.000Z",
  },
  {
    slug: "tapis-berbere",
    title: "Tissage du tapis berbère Beni Ourain",
    shortDescription:
      "Tissez votre premier tapis berbère à motifs symboliques du Moyen Atlas.",
    longDescription:
      "Chaque tapis berbère raconte une histoire. Apprenez à monter votre métier, préparer la laine et tisser un authentique Beni Ourain aux motifs ancestraux.",
    category: "Tissage",
    level: "Intermédiaire",
    language: "Français",
    price: 780,
    coverImage:
      "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?auto=format&fit=crop&w=1200&q=80",
    totalDuration: 420,
    studentsCount: 275,
    averageRating: 4.9,
    reviewsCount: 102,
    objectives: [
      "Monter un métier à tisser vertical",
      "Filer et teindre la laine naturellement",
      "Tisser un motif berbère authentique",
    ],
    skills: ["Filage", "Teinture végétale", "Tissage à noeuds"],
    prerequisites: ["Aucun prérequis"],
    chapters: [
      {
        id: "ch-1",
        order: 1,
        title: "Introduction",
        capsules: [
          cap(1, "L'univers du tapis berbère", 14, "Beni Ourain, Boucherouite, Azilal.", "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-2",
        order: 2,
        title: "Matériaux",
        capsules: [
          cap(2, "Choisir sa laine", 16, "Laine de mouton du Moyen Atlas.", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"),
          cap(3, "Teinture végétale", 22, "Henné, safran, indigo.", "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-3",
        order: 3,
        title: "Le métier à tisser",
        capsules: [
          cap(4, "Monter le métier vertical", 28, "Structure, tension et chaîne.", "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-4",
        order: 4,
        title: "Tissage",
        capsules: [
          cap(5, "Nœud berbère et rangée simple", 32, "Le geste fondamental.", "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?auto=format&fit=crop&w=600&q=80"),
          cap(6, "Motifs et symboles", 26, "Losanges, chevrons et étoiles.", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-5",
        order: 5,
        title: "Projet final",
        capsules: [
          cap(7, "Votre premier tapis (60×90 cm)", 42, "Du projet aux finitions.", "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?auto=format&fit=crop&w=600&q=80"),
        ],
      },
    ],
    instructor: INSTRUCTORS.aicha,
    createdAt: "2026-02-01T09:00:00.000Z",
  },
  {
    slug: "poterie-de-safi",
    title: "Poterie émaillée de Safi",
    shortDescription:
      "De l'argile brute à la pièce émaillée : maîtrisez les gestes du potier de Safi.",
    longDescription:
      "Safi est la capitale marocaine de la poterie émaillée. Cette formation vous initie au tournage, à la cuisson et aux célèbres émaux polychromes de la colline des potiers.",
    category: "Poterie",
    level: "Débutant",
    language: "Français",
    price: 690,
    coverImage:
      "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=1200&q=80",
    totalDuration: 360,
    studentsCount: 189,
    averageRating: 4.7,
    reviewsCount: 74,
    objectives: [
      "Préparer et centrer l'argile",
      "Tourner un vase et un plat",
      "Émailler avec les couleurs de Safi",
    ],
    skills: ["Tournage", "Émaillage", "Cuisson"],
    prerequisites: ["Aucun prérequis"],
    chapters: [
      {
        id: "ch-1",
        order: 1,
        title: "Introduction",
        capsules: [
          cap(1, "Bienvenue sur la colline des potiers", 10, "Découverte de Safi.", "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-2",
        order: 2,
        title: "Matériaux",
        capsules: [
          cap(2, "L'argile rouge de Safi", 14, "Extraction et préparation.", "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-3",
        order: 3,
        title: "Outils du potier",
        capsules: [
          cap(3, "Le tour, les mirettes, les éponges", 12, "Tour d'horizon.", "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-4",
        order: 4,
        title: "Démonstration",
        capsules: [
          cap(4, "Centrer et monter un bol", 28, "Le premier geste.", "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=600&q=80"),
          cap(5, "Émaillage aux couleurs de Safi", 24, "Bleu, jaune, vert.", "https://images.unsplash.com/photo-1567538096631-e0c55bd6374c?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-5",
        order: 5,
        title: "Projet final",
        capsules: [
          cap(6, "Un plat traditionnel Safi", 36, "Du tournage à la cuisson.", "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=600&q=80"),
        ],
      },
    ],
    instructor: INSTRUCTORS.brahim,
    createdAt: "2026-02-08T09:00:00.000Z",
  },
  {
    slug: "calligraphie-arabe",
    title: "Calligraphie arabe — style Maghrébi",
    shortDescription:
      "Découvrez le style calligraphique Maghrébi, unique par ses courbes rondes et son rythme.",
    longDescription:
      "La calligraphie Maghrébi est l'un des huit grands styles de la calligraphie arabe. Cette formation vous mène de la préparation des roseaux (qalam) à la composition de vos propres œuvres.",
    category: "Calligraphie",
    level: "Débutant",
    language: "Français",
    price: 590,
    coverImage:
      "https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=1200&q=80",
    totalDuration: 300,
    studentsCount: 512,
    averageRating: 4.9,
    reviewsCount: 189,
    objectives: [
      "Tailler et préparer le qalam",
      "Tracer les lettres du style Maghrébi",
      "Composer une œuvre calligraphique",
    ],
    skills: ["Taille du qalam", "Ductus des lettres", "Composition"],
    prerequisites: ["Aucun — parfait pour débuter"],
    chapters: [
      {
        id: "ch-1",
        order: 1,
        title: "Introduction",
        capsules: [
          cap(1, "Histoire de la calligraphie arabe", 15, "Des huit styles au Maghrébi.", "https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-2",
        order: 2,
        title: "Matériaux",
        capsules: [
          cap(2, "Papier, encre et qalam", 18, "Le trio du calligraphe.", "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-3",
        order: 3,
        title: "Les lettres isolées",
        capsules: [
          cap(3, "Les 6 lettres de base", 26, "Alif, Bâ', Râ'…", "https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=600&q=80"),
          cap(4, "Les lettres à boucle", 22, "Wâw, Nûn, Yâ'.", "https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-4",
        order: 4,
        title: "Démonstration",
        capsules: [
          cap(5, "Liaison des lettres et rythme", 24, "Fluidité et cadence.", "https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-5",
        order: 5,
        title: "Projet final",
        capsules: [
          cap(6, "Composer votre propre calligramme", 30, "De l'idée au tableau.", "https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=600&q=80"),
        ],
      },
    ],
    instructor: INSTRUCTORS.youssef,
    createdAt: "2026-02-14T09:00:00.000Z",
  },
  {
    slug: "cuisine-marocaine",
    title: "Cuisine traditionnelle marocaine — les classiques",
    shortDescription:
      "Tajine, couscous, pastilla, harira, msemen : maîtrisez les grandes recettes qui font la renommée du Maroc, guidé pas à pas par Chef Nadia.",
    longDescription:
      "Cette formation vous plonge au cœur de la cuisine marocaine authentique, celle qui se transmet de mère en fille dans les cuisines de Fès, Chefchaouen et Marrakech. En 15 capsules vidéo filmées en cuisine réelle, Chef Nadia Bouchentouf vous partage les tours de main, les dosages précis et les astuces d'une cuisine 100% maison — du choix du safran d'Ouarzazate à la cuisson lente du tajine, en passant par le geste ancestral du couscous roulé à la main.\n\nVous apprendrez à composer votre propre ras el hanout, à équilibrer les épices douces et chaudes, à réussir une pastilla croustillante et à dresser vos plats comme dans les grands riads. Chaque recette est expliquée avec ses variantes régionales, ses accords et son histoire. À la fin, vous serez capable de recevoir vos invités avec un menu marocain complet et raffiné.",
    category: "Cuisine",
    level: "Débutant",
    language: "Français",
    price: 490,
    coverImage:
      "https://images.unsplash.com/photo-1541544181051-e46607bc22a4?auto=format&fit=crop&w=1600&q=80",
    totalDuration: 420,
    studentsCount: 987,
    averageRating: 4.8,
    reviewsCount: 342,
    objectives: [
      "Identifier, doser et associer les épices essentielles de la cuisine marocaine",
      "Réussir un tajine fondant à la cuisson parfaitement maîtrisée",
      "Rouler, cuire à la vapeur et présenter un couscous du vendredi",
      "Réaliser une pastilla au poulet croustillante et bien équilibrée",
      "Préparer les pains marocains classiques : khobz, msemen, batbout",
      "Composer et dresser un menu marocain complet (entrée, plat, dessert)",
    ],
    skills: [
      "Maîtrise des épices et du ras el hanout maison",
      "Techniques de cuisson lente au tajine",
      "Roulage et cuisson vapeur du couscous",
      "Feuilletage et pliage de la pastilla",
      "Pâtisserie marocaine (cornes de gazelle, chebakia)",
      "Dressage traditionnel et service à la marocaine",
    ],
    prerequisites: [
      "Aucun prérequis — accessible à tous les niveaux",
      "Un tajine, un couscoussier et une plaque de cuisson recommandés",
    ],
    chapters: [
      {
        id: "ch-1",
        order: 1,
        title: "Introduction & culture culinaire",
        capsules: [
          cap(1, "Bienvenue dans la cuisine de Chef Nadia", 8, "Présentation du parcours, du matériel et de l'esprit de la formation.", "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80"),
          cap(2, "Histoire de la cuisine marocaine", 14, "Des influences berbères, andalouses, arabes et juives qui ont façonné la gastronomie du Royaume.", "https://images.unsplash.com/photo-1541544181051-e46607bc22a4?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-2",
        order: 2,
        title: "Les épices & le garde-manger",
        capsules: [
          cap(3, "Le tour des 12 épices essentielles", 22, "Cumin, gingembre, curcuma, safran, cannelle : identifier, sentir, doser.", "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80"),
          cap(4, "Composer son ras el hanout maison", 18, "La recette de famille de Chef Nadia, avec ses 27 épices équilibrées.", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80"),
          cap(5, "Herbes fraîches et condiments", 14, "Coriandre, persil plat, olives, citrons confits, smen.", "https://images.unsplash.com/photo-1615485500704-8e990f9900e3?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-3",
        order: 3,
        title: "Les outils traditionnels",
        capsules: [
          cap(6, "Le tajine : choix, culottage, entretien", 16, "En terre de Salé, en fonte ou émaillé : lequel choisir ?", "https://images.unsplash.com/photo-1547573854-74d2a71d0826?auto=format&fit=crop&w=600&q=80"),
          cap(7, "Le couscoussier et la gsaa", 12, "Les ustensiles incontournables du couscous du vendredi.", "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-4",
        order: 4,
        title: "Démonstrations des grandes recettes",
        capsules: [
          cap(8, "Tajine poulet - citron confit - olives", 32, "La recette étoile, expliquée geste par geste.", "https://images.unsplash.com/photo-1541544181051-e46607bc22a4?auto=format&fit=crop&w=600&q=80"),
          cap(9, "Tajine kefta aux œufs", 24, "Une variante rapide et savoureuse pour les soirs de semaine.", "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"),
          cap(10, "Couscous du vendredi aux 7 légumes", 38, "La recette familiale, avec le roulage traditionnel de la semoule.", "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=600&q=80"),
          cap(11, "Pastilla au poulet aux amandes", 34, "Le sucré-salé raffiné hérité d'Al-Andalus.", "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80"),
          cap(12, "Harira — la soupe du Ramadan", 22, "La soupe onctueuse aux légumineuses et à la coriandre.", "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80"),
          cap(13, "Msemen & thé à la menthe", 26, "Le pain feuilleté du petit-déjeuner, servi avec le rituel du thé.", "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      {
        id: "ch-5",
        order: 5,
        title: "Projet final — recevoir à la marocaine",
        capsules: [
          cap(14, "Composer un menu complet en 3 services", 28, "Entrée, plat principal, dessert : équilibre et harmonie.", "https://images.unsplash.com/photo-1541544181051-e46607bc22a4?auto=format&fit=crop&w=600&q=80"),
          cap(15, "Dressage & art de la table marocaine", 22, "De la nappe brodée au service du thé, l'accueil à la marocaine.", "https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=600&q=80"),
        ],
      },
    ],
    instructor: {
      ...INSTRUCTORS.nadia,
      bio: "Ancienne cheffe d'un riad étoilé à Marrakech pendant 12 ans, Nadia Bouchentouf a été formée dès l'enfance par sa grand-mère à Chefchaouen. Diplômée de l'Institut Paul Bocuse à Lyon, elle a ensuite passé plusieurs années à documenter les recettes régionales du Maroc, du Rif au Sahara. Elle a publié deux livres de cuisine (dont « Le Maroc dans mon tajine ») et anime régulièrement des ateliers à Paris, Casablanca et Dubaï. Sa mission : transmettre une cuisine marocaine authentique, joyeuse et accessible à tous.",
    },
    createdAt: "2026-02-20T09:00:00.000Z",
  },
  {
    slug: "cuir-de-fes",
    title: "Cuir de Fès — maroquinerie traditionnelle",
    shortDescription:
      "Du tannage végétal à la couture main, apprenez le savoir-faire des tanneries Chouara.",
    longDescription:
      "Découvrez les secrets du cuir de Fès : tannage naturel, teinture aux pigments végétaux et couture au fil de lin.",
    category: "Cuir",
    level: "Intermédiaire",
    language: "Français",
    price: 850,
    coverImage:
      "https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=1200&q=80",
    totalDuration: 400,
    studentsCount: 156,
    averageRating: 4.7,
    reviewsCount: 63,
    objectives: [
      "Comprendre le tannage végétal",
      "Teindre le cuir naturellement",
      "Coudre à la main un article de maroquinerie",
    ],
    skills: ["Tannage", "Teinture", "Couture main"],
    prerequisites: ["Aucun"],
    chapters: [
      { id: "ch-1", order: 1, title: "Introduction",
        capsules: [ cap(1, "Les tanneries Chouara", 14, "Un patrimoine vivant.", "https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=600&q=80") ],
      },
      { id: "ch-2", order: 2, title: "Matériaux",
        capsules: [ cap(2, "Cuirs et fils de lin", 18, "Sélection et découpe.", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80") ],
      },
      { id: "ch-3", order: 3, title: "Outils",
        capsules: [ cap(3, "Alêne, tranchet, rifloir", 12, "L'atelier du maalem.", "https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=600&q=80") ],
      },
      { id: "ch-4", order: 4, title: "Démonstration",
        capsules: [
          cap(4, "Teinture aux pigments végétaux", 24, "Grenade, indigo, safran.", "https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=600&q=80"),
          cap(5, "Couture sellier au fil de lin", 30, "La couture inaltérable.", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      { id: "ch-5", order: 5, title: "Projet final",
        capsules: [ cap(6, "Réaliser un porte-monnaie en cuir de Fès", 36, "Du patron au produit fini.", "https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=600&q=80") ],
      },
    ],
    instructor: INSTRUCTORS.omar,
    createdAt: "2026-03-01T09:00:00.000Z",
  },
  {
    slug: "caftan-marocain",
    title: "Couture du caftan marocain moderne",
    shortDescription:
      "Créez un caftan sur mesure — patronage, montage, broderie et finitions.",
    longDescription:
      "Le caftan marocain est l'un des plus beaux vêtements du monde. Cette formation vous accompagne dans la création complète d'un caftan sur mesure.",
    category: "Couture",
    level: "Avancé",
    language: "Français",
    price: 1490,
    coverImage:
      "https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=1200&q=80",
    totalDuration: 620,
    studentsCount: 143,
    averageRating: 4.9,
    reviewsCount: 58,
    objectives: [
      "Prendre les mesures pour un caftan sur mesure",
      "Tracer et couper le patron",
      "Monter et broder le caftan",
      "Ajouter la sfifa et les akaad",
    ],
    skills: ["Patronage", "Montage", "Sfifa", "Broderie main"],
    prerequisites: ["Bases de couture machine et main"],
    chapters: [
      { id: "ch-1", order: 1, title: "Introduction",
        capsules: [ cap(1, "L'univers du caftan", 12, "Du Takchita au caftan moderne.", "https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=600&q=80") ],
      },
      { id: "ch-2", order: 2, title: "Matériaux",
        capsules: [ cap(2, "Tissus, doublures et akaad", 20, "Sélection premium.", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80") ],
      },
      { id: "ch-3", order: 3, title: "Patronage",
        capsules: [
          cap(3, "Prendre les mesures", 18, "Précision et confort.", "https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=600&q=80"),
          cap(4, "Tracer le patron", 26, "Buste, manches, jupe.", "https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      { id: "ch-4", order: 4, title: "Démonstration",
        capsules: [
          cap(5, "Montage du caftan", 40, "Assemblage étape par étape.", "https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=600&q=80"),
          cap(6, "Sfifa et akaad — les finitions", 30, "L'identité du caftan.", "https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=600&q=80"),
        ],
      },
      { id: "ch-5", order: 5, title: "Projet final",
        capsules: [ cap(7, "Votre caftan personnel", 50, "De la coupe au défilé.", "https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=600&q=80") ],
      },
    ],
    instructor: INSTRUCTORS.saida,
    createdAt: "2026-03-10T09:00:00.000Z",
  },
];

// ---- purchase + progress storage ------------------------------------------

const PURCHASES_KEY = "lbf.v2.formation.purchases";
const PROGRESS_KEY = "lbf.v2.formation.progress";
const FAVORITES_KEY = "lbf.v2.formation.favorites";

type Purchases = string[]; // formation slugs
type ProgressMap = Record<string, string[]>; // slug -> completed capsule ids

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export const getPurchases = (): Purchases => readLS<Purchases>(PURCHASES_KEY, []);
export const isPurchased = (slug: string) => getPurchases().includes(slug);
export const purchaseFormation = (slug: string) => {
  const current = getPurchases();
  if (!current.includes(slug)) writeLS(PURCHASES_KEY, [...current, slug]);
};

export const getProgress = (slug: string): string[] =>
  readLS<ProgressMap>(PROGRESS_KEY, {})[slug] ?? [];

export const toggleCapsuleCompletion = (slug: string, capsuleId: string) => {
  const all = readLS<ProgressMap>(PROGRESS_KEY, {});
  const done = new Set(all[slug] ?? []);
  if (done.has(capsuleId)) done.delete(capsuleId);
  else done.add(capsuleId);
  writeLS(PROGRESS_KEY, { ...all, [slug]: Array.from(done) });
};

export const getFavorites = (): string[] => readLS<string[]>(FAVORITES_KEY, []);
export const toggleFavorite = (slug: string) => {
  const list = getFavorites();
  const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
  writeLS(FAVORITES_KEY, next);
};

export const totalCapsules = (f: Formation) =>
  f.chapters.reduce((sum, ch) => sum + ch.capsules.length, 0);

export const totalChapters = (f: Formation) => f.chapters.length;

export const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m.toString().padStart(2, "0")}`;
};

// ---- Admin CRUD persistence -----------------------------------------------

const FORMATIONS_KEY = "lbf.v2.formations.catalog";

/** Returns the catalog, hydrating localStorage with the seed on first read. */
export function getFormations(): Formation[] {
  if (typeof window === "undefined") return FORMATIONS;
  try {
    const raw = window.localStorage.getItem(FORMATIONS_KEY);
    if (!raw) {
      window.localStorage.setItem(FORMATIONS_KEY, JSON.stringify(FORMATIONS));
      return FORMATIONS;
    }
    return JSON.parse(raw) as Formation[];
  } catch {
    return FORMATIONS;
  }
}

export function saveFormations(list: Formation[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FORMATIONS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export const findFormation = (slug: string) =>
  getFormations().find((f) => f.slug === slug);

export const CATEGORIES = Array.from(new Set(FORMATIONS.map((f) => f.category))).sort();
export const LEVELS: Level[] = ["Débutant", "Intermédiaire", "Avancé"];
export const LANGUAGES: Language[] = ["Français", "Arabe", "Anglais", "Espagnol"];

export function emptyFormation(): Formation {
  return {
    slug: `formation-${Date.now()}`,
    title: "",
    shortDescription: "",
    longDescription: "",
    category: CATEGORIES[0] ?? "Artisanat",
    level: "Débutant",
    language: "Français",
    price: 500,
    coverImage:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80",
    totalDuration: 60,
    studentsCount: 0,
    averageRating: 0,
    reviewsCount: 0,
    objectives: [],
    skills: [],
    prerequisites: [],
    chapters: [],
    instructor: {
      id: `i-${Date.now()}`,
      name: "",
      specialty: "",
      experienceYears: 1,
      bio: "",
      photo:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      totalFormations: 1,
      averageRating: 0,
      studentsTrained: 0,
    },
    createdAt: new Date().toISOString(),
  };
}

