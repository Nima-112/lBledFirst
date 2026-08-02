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
    }

    private Formation tarzFassi() {
        Formation formation = Formation.builder()
                .slug("tarz-fassi")
                .title("Tarz Fassi — l'art de la broderie de Fès")
                .shortDescription("Maîtrisez les points, motifs et symboles du célèbre Tarz Fassi.")
                .longDescription("Le Tarz Fassi est l'un des plus prestigieux savoir-faire de la médina de Fès. Cette formation vous guide pas à pas dans la maîtrise du point de croix marocain et de la composition d'une pièce complète.")
                .category("Broderie")
                .level(FormationLevel.intermediaire)
                .language(FormationLanguage.francais)
                .price(new BigDecimal("890"))
                .coverImage("https://images.unsplash.com/photo-1610030006870-cbc4d1cca3c6?auto=format&fit=crop&w=1200&q=80")
                .studentsCount(342)
                // averageRating / reviewsCount : ne plus les figer ici, ils sont
                // recalculés à partir des vrais avis (cf. ReviewTestDataSeeder).
                .objectives(List.of(
                        "Comprendre l'histoire et les symboles du Tarz Fassi",
                        "Maîtriser les 5 points de base de la broderie fassie",
                        "Réaliser une composition complète et harmonieuse"))
                .skills(List.of("Points fondamentaux du Tarz Fassi", "Lecture et création de motifs géométriques"))
                .prerequisites(List.of("Notions de couture main", "Patience et minutie"))
                .instructor(Instructor.builder()
                        .name("Lalla Fatima Zahra Bennani")
                        .specialty("Maalema — Tarz Fassi")
                        .experienceYears(32)
                        .bio("Héritière d'une lignée de brodeuses de la médina de Fès, elle transmet depuis trois décennies l'art du Tarz Fassi.")
                        .photo("https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80")
                        .totalFormations(3)
                        .averageRating(4.9)
                        .studentsTrained(1240)
                        .build())
                .build();

        Chapter ch1 = Chapter.builder().order(1).title("Introduction & histoire").formation(formation).build();
        ch1.setCapsules(List.of(
                capsule(1, "Bienvenue et présentation de la formation", 8,
                        "Découverte du parcours et du matériel.",
                        "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=600&q=80", ch1),
                capsule(2, "Histoire du Tarz Fassi", 14,
                        "Des palais andalous à la médina de Fès.",
                        "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=600&q=80", ch1)));

        Chapter ch2 = Chapter.builder().order(2).title("Les 5 points fondamentaux").formation(formation).build();
        ch2.setCapsules(List.of(
                capsule(1, "Le point de croix marocain", 22,
                        "La base de toutes les compositions.",
                        "https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=600&q=80", ch2),
                capsule(2, "Le point de tige", 16,
                        "Contours nets et courbes fluides.",
                        "https://images.unsplash.com/photo-1610030006870-cbc4d1cca3c6?auto=format&fit=crop&w=600&q=80", ch2)));

        formation.setChapters(List.of(ch1, ch2));
        return formation;
    }

    private Formation zellige() {
        Formation formation = Formation.builder()
                .slug("zellige-de-fes")
                .title("Zellige de Fès — mosaïque traditionnelle")
                .shortDescription("Apprenez à tailler, poser et composer les mosaïques en zellige.")
                .longDescription("Le zellige est l'âme géométrique de l'architecture marocaine. Cette formation couvre la taille des tesselles, la lecture des motifs classiques et la composition d'un panneau complet.")
                .category("Zellige")
                .level(FormationLevel.avance)
                .language(FormationLanguage.francais)
                .price(new BigDecimal("1290"))
                .coverImage("https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80")
                .studentsCount(218)
                // averageRating / reviewsCount : idem, plus de valeur figée.
                .objectives(List.of(
                        "Reconnaître les motifs classiques du zellige",
                        "Tailler les tesselles à la main",
                        "Composer un panneau complet"))
                .skills(List.of("Taille manuelle", "Lecture des motifs", "Pose et jointoiement"))
                .prerequisites(List.of("Aucun — accessible aux débutants motivés"))
                .instructor(Instructor.builder()
                        .name("Maalem Hicham El Fassi")
                        .specialty("Maître Zelligeur")
                        .experienceYears(25)
                        .bio("Maalem zelligeur de la médina de Fès, formé à l'école traditionnelle depuis l'âge de 12 ans.")
                        .photo("https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80")
                        .totalFormations(2)
                        .averageRating(4.8)
                        .studentsTrained(860)
                        .build())
                .build();

        Chapter ch1 = Chapter.builder().order(1).title("Introduction au zellige").formation(formation).build();
        ch1.setCapsules(List.of(
                capsule(1, "Histoire et symbolique", 12, "Des Mérinides à aujourd'hui.",
                        "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80", ch1)));

        Chapter ch2 = Chapter.builder().order(2).title("Taille des tesselles").formation(formation).build();
        ch2.setCapsules(List.of(
                capsule(1, "Le geste du maalem", 30, "Précision et rythme.",
                        "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?auto=format&fit=crop&w=600&q=80", ch2)));

        formation.setChapters(List.of(ch1, ch2));
        return formation;
    }

    private Capsule capsule(int order, String title, int duration, String description, String thumbnail, Chapter chapter) {
        return Capsule.builder()
                .order(order)
                .title(title)
                .duration(duration)
                .description(description)
                .thumbnail(thumbnail)
                .chapter(chapter)
                .build();
    }
}
