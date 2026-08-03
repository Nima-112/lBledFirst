package ma.lbledfirst.backend.seed;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.RequiredArgsConstructor;
import ma.lbledfirst.backend.domain.Experience;
import ma.lbledfirst.backend.domain.ExperienceDayProgram;
import ma.lbledfirst.backend.domain.ExperienceStatus;
import ma.lbledfirst.backend.domain.Region;
import ma.lbledfirst.backend.domain.RegionName;
import ma.lbledfirst.backend.domain.User;
import ma.lbledfirst.backend.domain.UserRole;
import ma.lbledfirst.backend.repository.ExperienceRepository;
import ma.lbledfirst.backend.repository.RegionRepository;
import ma.lbledfirst.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(3)
@RequiredArgsConstructor
public class ExperienceSeeder implements CommandLineRunner {

    private final ExperienceRepository experienceRepository;
    private final RegionRepository regionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (experienceRepository.count() > 0) return;

        // ── Host users ─────────────────────────────────────────────────────
        User brahim = findOrCreateHost(
                "brahim@host.ma", "Brahim Aït Toubkal",
                "+212 661-112233", "Maroc", "Amazigh",
                "Guide de montagne depuis 15 ans dans le Haut Atlas.");

        User khadija = findOrCreateHost(
                "khadija@host.ma", "Khadija El Merzougi",
                "+212 662-445566", "Maroc", "Arabe",
                "Famille nomade, bivouacs et dîners sous les étoiles.");

        User youssef = findOrCreateHost(
                "youssef@host.ma", "Youssef Ouzoud",
                "+212 663-778899", "Maroc", "Amazigh",
                "Passionné des cascades et de la cuisine du terroir.");

        // ── Regions ────────────────────────────────────────────────────────
        Region marrakechSafi = regionRepository.findByName(RegionName.MARRAKECH_SAFI).orElse(null);
        Region tangerTetouan = regionRepository.findByName(RegionName.TANGER_TETOUAN_AL_HOCEIMA).orElse(null);
        Region beniMellal = regionRepository.findByName(RegionName.BENI_MELLAL_KHENIFRA).orElse(null);
        Region draaTafilalet = regionRepository.findByName(RegionName.DRAA_TAFILALET).orElse(null);

        // ── 1. Mountain Treks — High Atlas ─────────────────────────────────
        experienceRepository.save(Experience.builder()
                .host(brahim)
                .title("Mountain Treks — High Atlas")
                .description("Trois jours de randonnée dans le Haut Atlas avec un guide berbère. Sentiers cachés, villages accrochés à la montagne, nuits chez l'habitant et petits-déjeuners face aux sommets.")
                .price(new BigDecimal("1200"))
                .duration(3)
                .category("Hiking")
                .status(ExperienceStatus.published)
                .city("Imlil")
                .region(marrakechSafi)
                .latitude(new BigDecimal("31.1400"))
                .longitude(new BigDecimal("-7.9200"))
                .coverImages(List.of(
                        "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"))
                .dayPrograms(List.of(
                        ExperienceDayProgram.builder().dayNumber(1).title("Arrivée à Imlil & montée douce")
                                .description("Accueil au village, thé à la menthe, mise en jambes vers Aroumd et nuit dans un gîte familial.")
                                .build(),
                        ExperienceDayProgram.builder().dayNumber(2).title("Ascension vers le refuge du Toubkal")
                                .description("Marche d'altitude entre pierriers et cascades. Repas berbère au refuge, ciel étoilé.")
                                .build(),
                        ExperienceDayProgram.builder().dayNumber(3).title("Retour par la vallée d'Imenane")
                                .description("Descente panoramique par un vallon secret, déjeuner chez une famille, retour à Marrakech.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 1, 8, 0))
                .build());

        // ── 2. Tea Ceremonies with Village Elders ──────────────────────────
        experienceRepository.save(Experience.builder()
                .host(youssef)
                .title("Tea Ceremonies with Village Elders")
                .description("Une journée d'immersion dans le rituel du thé à la menthe : cueillette, gestes du service, hauteur du versé, tradition des trois verres.")
                .price(new BigDecimal("220"))
                .duration(1)
                .category("Cuisine")
                .status(ExperienceStatus.published)
                .city("Chefchaouen")
                .region(tangerTetouan)
                .latitude(new BigDecimal("35.1700"))
                .longitude(new BigDecimal("-5.2700"))
                .coverImages(List.of(
                        "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=1200&q=80"))
                .dayPrograms(List.of(
                        ExperienceDayProgram.builder().dayNumber(1).title("Rituel du thé, du jardin à la tasse")
                                .description("Cueillette de la menthe, préparation traditionnelle, apprentissage des trois verres (amer, doux, tendre) chez un ancien.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 4, 8, 0))
                .build());

        // ── 3. Artisan Workshops — Argan Cooperative ───────────────────────
        experienceRepository.save(Experience.builder()
                .host(youssef)
                .title("Artisan Workshops — Argan Cooperative")
                .description("Deux jours dans une coopérative de femmes berbères : concassage, torréfaction et pressage de l'huile d'argan, atelier de tissage.")
                .price(new BigDecimal("640"))
                .duration(2)
                .category("Crafts")
                .status(ExperienceStatus.published)
                .city("Ouzoud")
                .region(beniMellal)
                .latitude(new BigDecimal("32.0200"))
                .longitude(new BigDecimal("-6.7200"))
                .coverImages(List.of(
                        "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1615485500704-8e990f9900e3?auto=format&fit=crop&w=1200&q=80"))
                .dayPrograms(List.of(
                        ExperienceDayProgram.builder().dayNumber(1).title("Fabrication de l'huile d'argan")
                                .description("Découverte du fruit, ateliers pratiques, dégustations.")
                                .build(),
                        ExperienceDayProgram.builder().dayNumber(2).title("Tissage berbère")
                                .description("Motifs, symboles, un petit tissage à emporter.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 6, 8, 0))
                .build());

        // ── 4. Desert Camps under the Stars ────────────────────────────────
        experienceRepository.save(Experience.builder()
                .host(khadija)
                .title("Desert Camps under the Stars")
                .description("Deux nuits à Erg Chebbi : méharée au coucher du soleil, dîner nomade sous les étoiles, tambours Gnawa et lever de soleil sur les dunes.")
                .price(new BigDecimal("1400"))
                .duration(2)
                .category("Homestays")
                .status(ExperienceStatus.published)
                .city("Merzouga")
                .region(draaTafilalet)
                .latitude(new BigDecimal("31.1000"))
                .longitude(new BigDecimal("-4.0100"))
                .coverImages(List.of(
                        "https://images.unsplash.com/photo-1549221987-25a490f65d34?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1511633479497-6158b31fd2b5?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?auto=format&fit=crop&w=1200&q=80"))
                .dayPrograms(List.of(
                        ExperienceDayProgram.builder().dayNumber(1).title("Arrivée & coucher de soleil à dos de dromadaire")
                                .description("Méharée dans les dunes, dîner et musique Gnawa autour du feu.")
                                .build(),
                        ExperienceDayProgram.builder().dayNumber(2).title("Lever de soleil & retour")
                                .description("Silence du désert, petit-déjeuner à l'ombre du bivouac, retour au village.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 9, 8, 0))
                .build());

        // ── 5. Cooking with Locals — Tagine & Msemen ───────────────────────
        experienceRepository.save(Experience.builder()
                .host(brahim)
                .title("Cooking with Locals — Tagine & Msemen")
                .description("Une journée en cuisine familiale : marché du matin, préparation d'un tagine lent, msemen à la plancha berbère et repas partagé.")
                .price(new BigDecimal("280"))
                .duration(1)
                .category("Cuisine")
                .status(ExperienceStatus.published)
                .city("Aït Bouguemez")
                .region(beniMellal)
                .latitude(new BigDecimal("31.6300"))
                .longitude(new BigDecimal("-6.4000"))
                .coverImages(List.of(
                        "https://images.unsplash.com/photo-1541544181051-e46607bc22a4?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1547573854-74d2a71d0826?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200&q=80"))
                .dayPrograms(List.of(
                        ExperienceDayProgram.builder().dayNumber(1).title("Du souk à la table")
                                .description("Marché, cuisine à quatre mains, dégustation autour d'un grand plat commun.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 12, 8, 0))
                .build());

        // ── 6. Valley Walks — Aït Bouguemez ────────────────────────────────
        experienceRepository.save(Experience.builder()
                .host(youssef)
                .title("Valley Walks — Aït Bouguemez")
                .description("Deux jours de balades douces dans la Vallée Heureuse : palmeraies, greniers collectifs et déjeuner chez une famille.")
                .price(new BigDecimal("520"))
                .duration(2)
                .category("Hiking")
                .status(ExperienceStatus.published)
                .city("Aït Bouguemez")
                .region(beniMellal)
                .latitude(new BigDecimal("31.6600"))
                .longitude(new BigDecimal("-6.4400"))
                .coverImages(List.of(
                        "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80"))
                .dayPrograms(List.of(
                        ExperienceDayProgram.builder().dayNumber(1).title("Boucle des villages")
                                .description("Traversée de hameaux perchés, terrasses cultivées, repas berbère.")
                                .build(),
                        ExperienceDayProgram.builder().dayNumber(2).title("Grenier collectif & source sacrée")
                                .description("Marche vers un agadir millénaire, temps de partage avec les habitants.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 15, 8, 0))
                .build());
    }

    // ── helpers ─────────────────────────────────────────────────────────────

    private User findOrCreateHost(String email, String name, String phone,
                                   String country, String language, String bio) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User host = User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode("host123"))
                    .role(UserRole.tourist)
                    .phone(phone)
                    .country(country)
                    .language(language)
                    .createdAt(LocalDateTime.now())
                    .build();
            return userRepository.save(host);
        });
    }
}
