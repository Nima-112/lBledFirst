package ma.lbledfirst.backend.seed;

import java.math.BigDecimal;
import java.util.List;

import lombok.RequiredArgsConstructor;
import ma.lbledfirst.backend.domain.Capsule;
import ma.lbledfirst.backend.domain.Chapter;
import ma.lbledfirst.backend.domain.Formation;
import ma.lbledfirst.backend.domain.FormationLanguage;
import ma.lbledfirst.backend.domain.FormationLevel;
import ma.lbledfirst.backend.domain.Instructor;
import ma.lbledfirst.backend.repository.FormationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(2)
@RequiredArgsConstructor
public class FormationSeeder implements CommandLineRunner {

    private final FormationRepository formationRepository;

    @Override
    public void run(String... args) {
        if (formationRepository.count() > 0) return;

        formationRepository.save(tarzFassi());
        formationRepository.save(zellige());
        formationRepository.save(tapisBerbere());
        formationRepository.save(poterieSafi());
        formationRepository.save(calligraphieArabe());
        formationRepository.save(cuisineMarocaine());
        formationRepository.save(cuirDeFes());
        formationRepository.save(caftanMarocain());
    }

    // ── helpers ─────────────────────────────────────────────────────────────

    private Capsule capsule(int order, String title, int duration, String desc, String thumb, Chapter ch) {
        return Capsule.builder()
                .order(order).title(title).duration(duration)
                .description(desc).thumbnail(thumb).chapter(ch)
                .build();
    }

    private Instructor instructor(String name, String specialty, int years, String bio, String photo,
                                  int formations, double rating, int trained) {
        return Instructor.builder()
                .name(name).specialty(specialty).experienceYears(years)
                .bio(bio).photo(photo)
                .totalFormations(formations).averageRating(rating).studentsTrained(trained)
                .build();
    }

    // ── 1. Tarz Fassi ──────────────────────────────────────────────────────

    private Formation tarzFassi() {
        Formation f = Formation.builder()
                .slug("tarz-fassi")
                .title("Tarz Fassi — l'art de la broderie de Fès")
                .shortDescription("Maîtrisez les points, motifs et symboles du célèbre Tarz Fassi transmis depuis le XIVᵉ siècle.")
                .longDescription("Le Tarz Fassi est l'un des plus prestigieux savoir-faire de la médina de Fès. Cette formation vous guide pas à pas dans la maîtrise du point de croix marocain, des motifs géométriques inspirés de l'architecture andalouse et de la composition d'une pièce complète — nappe, coussin ou caftan brodé.")
                .category("Broderie").level(FormationLevel.intermediaire).language(FormationLanguage.francais)
                .price(new BigDecimal("890"))
                .coverImage("https://images.unsplash.com/photo-1610030006870-cbc4d1cca3c6?auto=format&fit=crop&w=1200&q=80")
                .studentsCount(342)
                .objectives(List.of("Comprendre l'histoire et les symboles du Tarz Fassi","Maîtriser les 5 points de base de la broderie fassie","Réaliser une composition complète et harmonieuse","Choisir les fils, tissus et couleurs traditionnels"))
                .skills(List.of("Points fondamentaux du Tarz Fassi","Lecture et création de motifs géométriques","Assortiment de couleurs traditionnelles","Finitions professionnelles"))
                .prerequisites(List.of("Notions de couture main","Patience et minutie"))
                .instructor(instructor("Lalla Fatima Zahra Bennani","Maalema — Tarz Fassi",32,"Héritière d'une lignée de brodeuses de la médina de Fès, elle transmet depuis trois décennies l'art du Tarz Fassi.","https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",3,4.9,1240))
                .build();

        Chapter ch1 = Chapter.builder().order(1).title("Introduction & histoire").formation(f).build();
        ch1.setCapsules(List.of(
                capsule(1,"Bienvenue et présentation de la formation",8,"Découverte du parcours et du matériel.","https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=600&q=80",ch1),
                capsule(2,"Histoire du Tarz Fassi",14,"Des palais andalous à la médina de Fès.","https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=600&q=80",ch1)));
        Chapter ch2 = Chapter.builder().order(2).title("Matériaux & outils").formation(f).build();
        ch2.setCapsules(List.of(
                capsule(3,"Choisir son tissu et ses fils",18,"Toile, coton égyptien et soie naturelle.","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80",ch2),
                capsule(4,"Préparer le tambour et l'aiguille",12,"Tension parfaite pour un point régulier.","https://images.unsplash.com/photo-1610030006870-cbc4d1cca3c6?auto=format&fit=crop&w=600&q=80",ch2)));
        Chapter ch3 = Chapter.builder().order(3).title("Les 5 points fondamentaux").formation(f).build();
        ch3.setCapsules(List.of(
                capsule(5,"Le point de croix marocain",22,"La base de toutes les compositions.","https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=600&q=80",ch3),
                capsule(6,"Le point de tige",16,"Contours nets et courbes fluides.","https://images.unsplash.com/photo-1610030006870-cbc4d1cca3c6?auto=format&fit=crop&w=600&q=80",ch3),
                capsule(7,"Le remplissage plat",20,"Aplats colorés et surfaces régulières.","https://images.unsplash.com/photo-1591129841117-3adfd313e34f?auto=format&fit=crop&w=600&q=80",ch3)));
        Chapter ch4 = Chapter.builder().order(4).title("Démonstration guidée").formation(f).build();
        ch4.setCapsules(List.of(
                capsule(8,"Réaliser un motif étoile complet",32,"Suivez la maalema pas à pas.","https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(9,"Composition d'une bordure",28,"Assembler plusieurs motifs.","https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=600&q=80",ch4)));
        Chapter ch5 = Chapter.builder().order(5).title("Projet final").formation(f).build();
        ch5.setCapsules(List.of(
                capsule(10,"Concevoir votre pièce personnelle",24,"Croquis, palette et plan de broderie.","https://images.unsplash.com/photo-1610030006870-cbc4d1cca3c6?auto=format&fit=crop&w=600&q=80",ch5),
                capsule(11,"Finitions et présentation",20,"Repassage, doublure, encadrement.","https://images.unsplash.com/photo-1594736797933-d0a501ba2fe6?auto=format&fit=crop&w=600&q=80",ch5)));
        f.setChapters(List.of(ch1,ch2,ch3,ch4,ch5));
        return f;
    }

    // ── 2. Zellige ─────────────────────────────────────────────────────────

    private Formation zellige() {
        Formation f = Formation.builder()
                .slug("zellige-de-fes")
                .title("Zellige de Fès — mosaïque traditionnelle")
                .shortDescription("Apprenez à tailler, poser et composer les mosaïques en zellige qui ornent les riads.")
                .longDescription("Le zellige est l'âme géométrique de l'architecture marocaine. Cette formation couvre la taille des tesselles, la lecture des motifs classiques (khatem, safifa, zouwaqa) et la composition d'un panneau complet.")
                .category("Zellige").level(FormationLevel.avance).language(FormationLanguage.francais)
                .price(new BigDecimal("1290"))
                .coverImage("https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80")
                .studentsCount(218)
                .objectives(List.of("Reconnaître les motifs classiques du zellige","Tailler les tesselles à la main","Composer un panneau complet","Poser le zellige sur un support"))
                .skills(List.of("Taille manuelle","Lecture des motifs","Pose et jointoiement"))
                .prerequisites(List.of("Aucun — accessible aux débutants motivés"))
                .instructor(instructor("Maalem Hicham El Fassi","Maître Zelligeur",25,"Maalem zelligeur de la médina de Fès, formé à l'école traditionnelle depuis l'âge de 12 ans.","https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",2,4.8,860))
                .build();

        Chapter ch1 = Chapter.builder().order(1).title("Introduction au zellige").formation(f).build();
        ch1.setCapsules(List.of(capsule(1,"Histoire et symbolique",12,"Des Mérinides à aujourd'hui.","https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80",ch1)));
        Chapter ch2 = Chapter.builder().order(2).title("Matériaux et outils").formation(f).build();
        ch2.setCapsules(List.of(capsule(2,"Argile, émaux et menqach",20,"Le matériel du maalem.","https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&w=600&q=80",ch2)));
        Chapter ch3 = Chapter.builder().order(3).title("Taille des tesselles").formation(f).build();
        ch3.setCapsules(List.of(
                capsule(3,"Le geste du maalem",30,"Précision et rythme.","https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?auto=format&fit=crop&w=600&q=80",ch3),
                capsule(4,"Formes de base — carré, triangle, losange",24,"Répertoire fondamental.","https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80",ch3)));
        Chapter ch4 = Chapter.builder().order(4).title("Composition d'un panneau").formation(f).build();
        ch4.setCapsules(List.of(
                capsule(5,"Motif de l'étoile à 8 branches",36,"Le khatem sulaimani.","https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(6,"Frises et bordures",22,"Assembler un ensemble cohérent.","https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&w=600&q=80",ch4)));
        Chapter ch5 = Chapter.builder().order(5).title("Projet final").formation(f).build();
        ch5.setCapsules(List.of(capsule(7,"Réaliser une table basse en zellige",40,"Du croquis à la pose.","https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80",ch5)));
        f.setChapters(List.of(ch1,ch2,ch3,ch4,ch5));
        return f;
    }

    // ── 3. Tapis berbère ───────────────────────────────────────────────────

    private Formation tapisBerbere() {
        Formation f = Formation.builder()
                .slug("tapis-berbere")
                .title("Tissage du tapis berbère Beni Ourain")
                .shortDescription("Tissez votre premier tapis berbère à motifs symboliques du Moyen Atlas.")
                .longDescription("Chaque tapis berbère raconte une histoire. Apprenez à monter votre métier, préparer la laine et tisser un authentique Beni Ourain aux motifs ancestraux.")
                .category("Tissage").level(FormationLevel.intermediaire).language(FormationLanguage.francais)
                .price(new BigDecimal("780"))
                .coverImage("https://images.unsplash.com/photo-1600298881974-6be191ceeda1?auto=format&fit=crop&w=1200&q=80")
                .studentsCount(275)
                .objectives(List.of("Monter un métier à tisser vertical","Filer et teindre la laine naturellement","Tisser un motif berbère authentique"))
                .skills(List.of("Filage","Teinture végétale","Tissage à noeuds"))
                .prerequisites(List.of("Aucun prérequis"))
                .instructor(instructor("Aïcha Ait Ouyahia","Tisseuse de tapis berbères",28,"Membre d'une coopérative féminine du Moyen Atlas, Aïcha maîtrise les motifs Beni Ourain et Boucherouite.","https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80",2,4.9,920))
                .build();

        Chapter ch1 = Chapter.builder().order(1).title("Introduction").formation(f).build();
        ch1.setCapsules(List.of(capsule(1,"L'univers du tapis berbère",14,"Beni Ourain, Boucherouite, Azilal.","https://images.unsplash.com/photo-1600298881974-6be191ceeda1?auto=format&fit=crop&w=600&q=80",ch1)));
        Chapter ch2 = Chapter.builder().order(2).title("Matériaux").formation(f).build();
        ch2.setCapsules(List.of(
                capsule(2,"Choisir sa laine",16,"Laine de mouton du Moyen Atlas.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",ch2),
                capsule(3,"Teinture végétale",22,"Henné, safran, indigo.","https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=600&q=80",ch2)));
        Chapter ch3 = Chapter.builder().order(3).title("Le métier à tisser").formation(f).build();
        ch3.setCapsules(List.of(capsule(4,"Monter le métier vertical",28,"Structure, tension et chaîne.","https://images.unsplash.com/photo-1600298881974-6be191ceeda1?auto=format&fit=crop&w=600&q=80",ch3)));
        Chapter ch4 = Chapter.builder().order(4).title("Tissage").formation(f).build();
        ch4.setCapsules(List.of(
                capsule(5,"Nœud berbère et rangée simple",32,"Le geste fondamental.","https://images.unsplash.com/photo-1600298881974-6be191ceeda1?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(6,"Motifs et symboles",26,"Losanges, chevrons et étoiles.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",ch4)));
        Chapter ch5 = Chapter.builder().order(5).title("Projet final").formation(f).build();
        ch5.setCapsules(List.of(capsule(7,"Votre premier tapis (60×90 cm)",42,"Du projet aux finitions.","https://images.unsplash.com/photo-1600298881974-6be191ceeda1?auto=format&fit=crop&w=600&q=80",ch5)));
        f.setChapters(List.of(ch1,ch2,ch3,ch4,ch5));
        return f;
    }

    // ── 4. Poterie de Safi ─────────────────────────────────────────────────

    private Formation poterieSafi() {
        Formation f = Formation.builder()
                .slug("poterie-de-safi")
                .title("Poterie émaillée de Safi")
                .shortDescription("De l'argile brute à la pièce émaillée : maîtrisez les gestes du potier de Safi.")
                .longDescription("Safi est la capitale marocaine de la poterie émaillée. Cette formation vous initie au tournage, à la cuisson et aux célèbres émaux polychromes de la colline des potiers.")
                .category("Poterie").level(FormationLevel.debutant).language(FormationLanguage.francais)
                .price(new BigDecimal("690"))
                .coverImage("https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=1200&q=80")
                .studentsCount(189)
                .objectives(List.of("Préparer et centrer l'argile","Tourner un vase et un plat","Émailler avec les couleurs de Safi"))
                .skills(List.of("Tournage","Émaillage","Cuisson"))
                .prerequisites(List.of("Aucun prérequis"))
                .instructor(instructor("Maalem Brahim Tazi","Potier de Safi",30,"Potier de la colline des potiers de Safi, spécialiste des émaux polychromes traditionnels marocains.","https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80",2,4.7,610))
                .build();

        Chapter ch1 = Chapter.builder().order(1).title("Introduction").formation(f).build();
        ch1.setCapsules(List.of(capsule(1,"Bienvenue sur la colline des potiers",10,"Découverte de Safi.","https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=600&q=80",ch1)));
        Chapter ch2 = Chapter.builder().order(2).title("Matériaux").formation(f).build();
        ch2.setCapsules(List.of(capsule(2,"L'argile rouge de Safi",14,"Extraction et préparation.","https://images.unsplash.com/photo-1516534775068-ba3e7458af70?auto=format&fit=crop&w=600&q=80",ch2)));
        Chapter ch3 = Chapter.builder().order(3).title("Outils du potier").formation(f).build();
        ch3.setCapsules(List.of(capsule(3,"Le tour, les mirettes, les éponges",12,"Tour d'horizon.","https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=600&q=80",ch3)));
        Chapter ch4 = Chapter.builder().order(4).title("Démonstration").formation(f).build();
        ch4.setCapsules(List.of(
                capsule(4,"Centrer et monter un bol",28,"Le premier geste.","https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(5,"Émaillage aux couleurs de Safi",24,"Bleu, jaune, vert.","https://images.unsplash.com/photo-1567538096631-e0c55bd6374c?auto=format&fit=crop&w=600&q=80",ch4)));
        Chapter ch5 = Chapter.builder().order(5).title("Projet final").formation(f).build();
        ch5.setCapsules(List.of(capsule(6,"Un plat traditionnel Safi",36,"Du tournage à la cuisson.","https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=600&q=80",ch5)));
        f.setChapters(List.of(ch1,ch2,ch3,ch4,ch5));
        return f;
    }

    // ── 5. Calligraphie arabe ──────────────────────────────────────────────

    private Formation calligraphieArabe() {
        Formation f = Formation.builder()
                .slug("calligraphie-arabe")
                .title("Calligraphie arabe — style Maghrébi")
                .shortDescription("Découvrez le style calligraphique Maghrébi, unique par ses courbes rondes et son rythme.")
                .longDescription("La calligraphie Maghrébi est l'un des huit grands styles de la calligraphie arabe. Cette formation vous mène de la préparation des roseaux (qalam) à la composition de vos propres œuvres.")
                .category("Calligraphie").level(FormationLevel.debutant).language(FormationLanguage.francais)
                .price(new BigDecimal("590"))
                .coverImage("https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=1200&q=80")
                .studentsCount(512)
                .objectives(List.of("Tailler et préparer le qalam","Tracer les lettres du style Maghrébi","Composer une œuvre calligraphique"))
                .skills(List.of("Taille du qalam","Ductus des lettres","Composition"))
                .prerequisites(List.of("Aucun — parfait pour débuter"))
                .instructor(instructor("Youssef Skalli","Maître calligraphe",22,"Calligraphe diplômé de l'Académie de calligraphie arabe d'Istanbul. Il enseigne les styles Maghrébi, Thuluth et Diwani.","https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",4,4.9,1580))
                .build();

        Chapter ch1 = Chapter.builder().order(1).title("Introduction").formation(f).build();
        ch1.setCapsules(List.of(capsule(1,"Histoire de la calligraphie arabe",15,"Des huit styles au Maghrébi.","https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=600&q=80",ch1)));
        Chapter ch2 = Chapter.builder().order(2).title("Matériaux").formation(f).build();
        ch2.setCapsules(List.of(capsule(2,"Papier, encre et qalam",18,"Le trio du calligraphe.","https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&w=600&q=80",ch2)));
        Chapter ch3 = Chapter.builder().order(3).title("Les lettres isolées").formation(f).build();
        ch3.setCapsules(List.of(
                capsule(3,"Les 6 lettres de base",26,"Alif, Bâ', Râ'…","https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=600&q=80",ch3),
                capsule(4,"Les lettres à boucle",22,"Wâw, Nûn, Yâ'.","https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=600&q=80",ch3)));
        Chapter ch4 = Chapter.builder().order(4).title("Démonstration").formation(f).build();
        ch4.setCapsules(List.of(capsule(5,"Liaison des lettres et rythme",24,"Fluidité et cadence.","https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=600&q=80",ch4)));
        Chapter ch5 = Chapter.builder().order(5).title("Projet final").formation(f).build();
        ch5.setCapsules(List.of(capsule(6,"Composer votre propre calligramme",30,"De l'idée au tableau.","https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=600&q=80",ch5)));
        f.setChapters(List.of(ch1,ch2,ch3,ch4,ch5));
        return f;
    }

    // ── 6. Cuisine marocaine ───────────────────────────────────────────────

    private Formation cuisineMarocaine() {
        Formation f = Formation.builder()
                .slug("cuisine-marocaine")
                .title("Cuisine traditionnelle marocaine — les classiques")
                .shortDescription("Tajine, couscous, pastilla, harira, msemen : maîtrisez les grandes recettes qui font la renommée du Maroc.")
                .longDescription("Cette formation vous plonge au cœur de la cuisine marocaine authentique, celle qui se transmet de mère en fille dans les cuisines de Fès, Chefchaouen et Marrakech. En 15 capsules vidéo filmées en cuisine réelle, Chef Nadia Bouchentouf vous partage les tours de main, les dosages précis et les astuces d'une cuisine 100% maison.")
                .category("Cuisine").level(FormationLevel.debutant).language(FormationLanguage.francais)
                .price(new BigDecimal("490"))
                .coverImage("https://images.unsplash.com/photo-1541544181051-e46607bc22a4?auto=format&fit=crop&w=1600&q=80")
                .studentsCount(987)
                .objectives(List.of("Identifier, doser et associer les épices essentielles","Réussir un tajine fondant","Rouler et cuire un couscous du vendredi","Réaliser une pastilla croustillante","Préparer les pains marocains classiques","Composer un menu marocain complet"))
                .skills(List.of("Maîtrise des épices et du ras el hanout maison","Techniques de cuisson lente au tajine","Roulage et cuisson vapeur du couscous","Feuilletage et pliage de la pastilla","Pâtisserie marocaine","Dressage traditionnel"))
                .prerequisites(List.of("Aucun prérequis — accessible à tous les niveaux"))
                .instructor(instructor("Chef Nadia Bouchentouf","Cuisine traditionnelle marocaine",18,"Ancienne cheffe d'un riad étoilé à Marrakech, Nadia partage les recettes de sa grand-mère de Chefchaouen.","https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",5,4.8,2340))
                .build();

        Chapter ch1 = Chapter.builder().order(1).title("Introduction & culture culinaire").formation(f).build();
        ch1.setCapsules(List.of(
                capsule(1,"Bienvenue dans la cuisine de Chef Nadia",8,"Présentation du parcours et du matériel.","https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80",ch1),
                capsule(2,"Histoire de la cuisine marocaine",14,"Influences berbères, andalouses, arabes et juives.","https://images.unsplash.com/photo-1541544181051-e46607bc22a4?auto=format&fit=crop&w=600&q=80",ch1)));
        Chapter ch2 = Chapter.builder().order(2).title("Les épices & le garde-manger").formation(f).build();
        ch2.setCapsules(List.of(
                capsule(3,"Le tour des 12 épices essentielles",22,"Cumin, gingembre, curcuma, safran, cannelle.","https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",ch2),
                capsule(4,"Composer son ras el hanout maison",18,"La recette aux 27 épices équilibrées.","https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",ch2),
                capsule(5,"Herbes fraîches et condiments",14,"Coriandre, persil plat, olives, citrons confits.","https://images.unsplash.com/photo-1615485500704-8e990f9900e3?auto=format&fit=crop&w=600&q=80",ch2)));
        Chapter ch3 = Chapter.builder().order(3).title("Les outils traditionnels").formation(f).build();
        ch3.setCapsules(List.of(
                capsule(6,"Le tajine : choix, culottage, entretien",16,"En terre de Salé, en fonte ou émaillé.","https://images.unsplash.com/photo-1547573854-74d2a71d0826?auto=format&fit=crop&w=600&q=80",ch3),
                capsule(7,"Le couscoussier et la gsaa",12,"Les ustensiles du couscous du vendredi.","https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=600&q=80",ch3)));
        Chapter ch4 = Chapter.builder().order(4).title("Démonstrations des grandes recettes").formation(f).build();
        ch4.setCapsules(List.of(
                capsule(8,"Tajine poulet - citron confit - olives",32,"La recette étoile.","https://images.unsplash.com/photo-1541544181051-e46607bc22a4?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(9,"Tajine kefta aux œufs",24,"Variante rapide et savoureuse.","https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(10,"Couscous du vendredi aux 7 légumes",38,"Roulage traditionnel de la semoule.","https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(11,"Pastilla au poulet aux amandes",34,"Le sucré-salé d'Al-Andalus.","https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(12,"Harira — la soupe du Ramadan",22,"La soupe onctueuse aux légumineuses.","https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(13,"Msemen & thé à la menthe",26,"Le pain feuilleté du petit-déjeuner.","https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80",ch4)));
        Chapter ch5 = Chapter.builder().order(5).title("Projet final — recevoir à la marocaine").formation(f).build();
        ch5.setCapsules(List.of(
                capsule(14,"Composer un menu complet en 3 services",28,"Entrée, plat principal, dessert.","https://images.unsplash.com/photo-1541544181051-e46607bc22a4?auto=format&fit=crop&w=600&q=80",ch5),
                capsule(15,"Dressage & art de la table marocaine",22,"De la nappe brodée au service du thé.","https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=600&q=80",ch5)));
        f.setChapters(List.of(ch1,ch2,ch3,ch4,ch5));
        return f;
    }

    // ── 7. Cuir de Fès ─────────────────────────────────────────────────────

    private Formation cuirDeFes() {
        Formation f = Formation.builder()
                .slug("cuir-de-fes")
                .title("Cuir de Fès — maroquinerie traditionnelle")
                .shortDescription("Du tannage végétal à la couture main, apprenez le savoir-faire des tanneries Chouara.")
                .longDescription("Découvrez les secrets du cuir de Fès : tannage naturel, teinture aux pigments végétaux et couture au fil de lin.")
                .category("Cuir").level(FormationLevel.intermediaire).language(FormationLanguage.francais)
                .price(new BigDecimal("850"))
                .coverImage("https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=1200&q=80")
                .studentsCount(156)
                .objectives(List.of("Comprendre le tannage végétal","Teindre le cuir naturellement","Coudre à la main un article de maroquinerie"))
                .skills(List.of("Tannage","Teinture","Couture main"))
                .prerequisites(List.of("Aucun"))
                .instructor(instructor("Maalem Omar Chaouni","Maroquinier de Fès",27,"Artisan des tanneries Chouara, il perpétue le tannage végétal traditionnel et la couture main du cuir marocain.","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",2,4.7,540))
                .build();

        Chapter ch1 = Chapter.builder().order(1).title("Introduction").formation(f).build();
        ch1.setCapsules(List.of(capsule(1,"Les tanneries Chouara",14,"Un patrimoine vivant.","https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=600&q=80",ch1)));
        Chapter ch2 = Chapter.builder().order(2).title("Matériaux").formation(f).build();
        ch2.setCapsules(List.of(capsule(2,"Cuirs et fils de lin",18,"Sélection et découpe.","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",ch2)));
        Chapter ch3 = Chapter.builder().order(3).title("Outils").formation(f).build();
        ch3.setCapsules(List.of(capsule(3,"Alêne, tranchet, rifloir",12,"L'atelier du maalem.","https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=600&q=80",ch3)));
        Chapter ch4 = Chapter.builder().order(4).title("Démonstration").formation(f).build();
        ch4.setCapsules(List.of(
                capsule(4,"Teinture aux pigments végétaux",24,"Grenade, indigo, safran.","https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(5,"Couture sellier au fil de lin",30,"La couture inaltérable.","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",ch4)));
        Chapter ch5 = Chapter.builder().order(5).title("Projet final").formation(f).build();
        ch5.setCapsules(List.of(capsule(6,"Réaliser un porte-monnaie en cuir de Fès",36,"Du patron au produit fini.","https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=600&q=80",ch5)));
        f.setChapters(List.of(ch1,ch2,ch3,ch4,ch5));
        return f;
    }

    // ── 8. Caftan marocain ─────────────────────────────────────────────────

    private Formation caftanMarocain() {
        Formation f = Formation.builder()
                .slug("caftan-marocain")
                .title("Couture du caftan marocain moderne")
                .shortDescription("Créez un caftan sur mesure — patronage, montage, broderie et finitions.")
                .longDescription("Le caftan marocain est l'un des plus beaux vêtements du monde. Cette formation vous accompagne dans la création complète d'un caftan sur mesure.")
                .category("Couture").level(FormationLevel.avance).language(FormationLanguage.francais)
                .price(new BigDecimal("1490"))
                .coverImage("https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=1200&q=80")
                .studentsCount(143)
                .objectives(List.of("Prendre les mesures pour un caftan sur mesure","Tracer et couper le patron","Monter et broder le caftan","Ajouter la sfifa et les akaad"))
                .skills(List.of("Patronage","Montage","Sfifa","Broderie main"))
                .prerequisites(List.of("Bases de couture machine et main"))
                .instructor(instructor("Saida El Alaoui","Couturière de caftans",24,"Styliste-couturière basée à Rabat, Saida a habillé plusieurs stars pour la Semaine du Caftan.","https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",3,4.9,1120))
                .build();

        Chapter ch1 = Chapter.builder().order(1).title("Introduction").formation(f).build();
        ch1.setCapsules(List.of(capsule(1,"L'univers du caftan",12,"Du Takchita au caftan moderne.","https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=600&q=80",ch1)));
        Chapter ch2 = Chapter.builder().order(2).title("Matériaux").formation(f).build();
        ch2.setCapsules(List.of(capsule(2,"Tissus, doublures et akaad",20,"Sélection premium.","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80",ch2)));
        Chapter ch3 = Chapter.builder().order(3).title("Patronage").formation(f).build();
        ch3.setCapsules(List.of(
                capsule(3,"Prendre les mesures",18,"Précision et confort.","https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=600&q=80",ch3),
                capsule(4,"Tracer le patron",26,"Buste, manches, jupe.","https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=600&q=80",ch3)));
        Chapter ch4 = Chapter.builder().order(4).title("Démonstration").formation(f).build();
        ch4.setCapsules(List.of(
                capsule(5,"Montage du caftan",40,"Assemblage étape par étape.","https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(6,"Sfifa et akaad — les finitions",30,"L'identité du caftan.","https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=600&q=80",ch4)));
        Chapter ch5 = Chapter.builder().order(5).title("Projet final").formation(f).build();
        ch5.setCapsules(List.of(capsule(7,"Votre caftan personnel",50,"De la coupe au défilé.","https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=600&q=80",ch5)));
        f.setChapters(List.of(ch1,ch2,ch3,ch4,ch5));
        return f;
    }
}
