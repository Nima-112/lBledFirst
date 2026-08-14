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
        Region lOriental = regionRepository.findByName(RegionName.LORIENTAL).orElse(null);
        Region fesMeknes = regionRepository.findByName(RegionName.FES_MEKNES).orElse(null);
        Region rabatSaleKenitra = regionRepository.findByName(RegionName.RABAT_SALE_KENITRA).orElse(null);
        Region casablancaSettat = regionRepository.findByName(RegionName.CASABLANCA_SETTAT).orElse(null);
        Region soussMassa = regionRepository.findByName(RegionName.SOUSS_MASSA).orElse(null);
        Region guelmimOuedNoun = regionRepository.findByName(RegionName.GUELMIM_OUED_NOUN).orElse(null);
        Region laayouneSakiaElHamra = regionRepository.findByName(RegionName.LAAYOUNE_SAKIA_EL_HAMRA).orElse(null);
        Region dakhlaOuedEdDahab = regionRepository.findByName(RegionName.DAKHLA_OUED_ED_DAHAB).orElse(null);

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

        // ── 7. Citrus Orchards & Cliff Roads — L'Oriental ──────────────────
        experienceRepository.save(Experience.builder()
                .host(brahim)
                .title("Vergers d'Agrumes & Route des Falaises")
                .description("Une journée entre les vergers d'agrumes de la région d'Oujda et les routes sinueuses qui longent les falaises, avec halte chez un producteur local.")
                .price(new BigDecimal("310"))
                .duration(1)
                .category("Nature")
                .status(ExperienceStatus.published)
                .city("Oujda")
                .region(lOriental)
                .latitude(new BigDecimal("34.6805"))
                .longitude(new BigDecimal("-1.9076"))
                .coverImages(List.of(
                        "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=1200&q=80"))
                .dayPrograms(List.of(
                        ExperienceDayProgram.builder().dayNumber(1).title("Vergers et routes de falaise")
                                .description("Cueillette d'agrumes, pique-nique face aux gorges, retour au coucher du soleil.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 18, 8, 0))
                .build());

        // ── 8. Craft Workshops & Mountain Treks — Fès-Meknès ───────────────
        experienceRepository.save(Experience.builder()
                .host(youssef)
                .title("Ateliers d'Artisanat & Randonnée en Moyen Atlas")
                .description("Une journée entre les ateliers de poterie et de cuir de Fès et une courte randonnée dans les collines du Moyen Atlas.")
                .price(new BigDecimal("360"))
                .duration(1)
                .category("Crafts")
                .status(ExperienceStatus.published)
                .city("Fès")
                .region(fesMeknes)
                .latitude(new BigDecimal("34.0331"))
                .longitude(new BigDecimal("-5.0003"))
                .coverImages(List.of(
                        "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1615485500704-8e990f9900e3?auto=format&fit=crop&w=1200&q=80"))
                .dayPrograms(List.of(
                        ExperienceDayProgram.builder().dayNumber(1).title("Médina et collines")
                                .description("Atelier chez un artisan tanneur, déjeuner, marche panoramique sur les hauteurs de Fès.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 20, 8, 0))
                .build());

        // ── 9. Thermal Springs & Plateau Hikes — Rabat-Salé-Kénitra ────────
        experienceRepository.save(Experience.builder()
                .host(khadija)
                .title("Sources Thermales & Balades sur le Plateau")
                .description("Détente autour des sources thermales de la région et balade douce sur le plateau agricole, entre oliveraies et fermes familiales.")
                .price(new BigDecimal("240"))
                .duration(1)
                .category("Détente")
                .status(ExperienceStatus.published)
                .city("Sidi Kacem")
                .region(rabatSaleKenitra)
                .latitude(new BigDecimal("34.2260"))
                .longitude(new BigDecimal("-5.7060"))
                .coverImages(List.of(
                        "https://images.unsplash.com/photo-1549221987-25a490f65d34?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1511633479497-6158b31fd2b5?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?auto=format&fit=crop&w=1200&q=80"))
                .dayPrograms(List.of(
                        ExperienceDayProgram.builder().dayNumber(1).title("Sources et plateau")
                                .description("Bain thermal, déjeuner à la ferme, marche parmi les oliviers.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 22, 8, 0))
                .build());

        // ── 10. Coastal Heritage & Medina Walks — Casablanca-Settat ────────
        experienceRepository.save(Experience.builder()
                .host(brahim)
                .title("Patrimoine Côtier & Balades en Médina")
                .description("Découverte de la médina fortifiée d'El Jadida et de son front de mer, avec un guide passionné d'histoire portugaise et marocaine.")
                .price(new BigDecimal("260"))
                .duration(1)
                .category("Culture")
                .status(ExperienceStatus.published)
                .city("El Jadida")
                .region(casablancaSettat)
                .latitude(new BigDecimal("33.2549"))
                .longitude(new BigDecimal("-8.5058"))
                .coverImages(List.of(
                        "https://images.unsplash.com/photo-1541544181051-e46607bc22a4?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1547573854-74d2a71d0826?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200&q=80"))
                .dayPrograms(List.of(
                        ExperienceDayProgram.builder().dayNumber(1).title("Cité portugaise & médina")
                                .description("Citerne portugaise, remparts, ruelles de la médina et déjeuner face à l'océan.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 24, 8, 0))
                .build());

        // ── 11. Saffron Harvest — Souss-Massa ──────────────────────────────
        experienceRepository.save(Experience.builder()
                .host(youssef)
                .title("Récolte du Safran avec les Coopératives")
                .description("Une matinée à récolter les fleurs de safran à l'aube aux côtés d'une coopérative de femmes, suivie d'un atelier d'émondage et de dégustation.")
                .price(new BigDecimal("420"))
                .duration(1)
                .category("Crafts")
                .status(ExperienceStatus.published)
                .city("Taliouine")
                .region(soussMassa)
                .latitude(new BigDecimal("30.5350"))
                .longitude(new BigDecimal("-7.9280"))
                .coverImages(List.of(
                        "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1615485500704-8e990f9900e3?auto=format&fit=crop&w=1200&q=80"))
                .dayPrograms(List.of(
                        ExperienceDayProgram.builder().dayNumber(1).title("Cueillette à l'aube")
                                .description("Récolte des fleurs, émondage des pistils, thé au safran avec la coopérative.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 26, 8, 0))
                .build());

        // ── 12. Red Sandstone Arches — Guelmim-Oued Noun ───────────────────
        experienceRepository.save(Experience.builder()
                .host(khadija)
                .title("Arches de Grès Rouge au Coucher du Soleil")
                .description("Randonnée facile jusqu'aux arches de grès rouge de la région, avec pique-nique et coucher de soleil sur le désert présaharien.")
                .price(new BigDecimal("330"))
                .duration(1)
                .category("Nature")
                .status(ExperienceStatus.published)
                .city("Guelmim")
                .region(guelmimOuedNoun)
                .latitude(new BigDecimal("28.9870"))
                .longitude(new BigDecimal("-10.0604"))
                .coverImages(List.of(
                        "https://images.unsplash.com/photo-1549221987-25a490f65d34?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1511633479497-6158b31fd2b5?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?auto=format&fit=crop&w=1200&q=80"))
                .dayPrograms(List.of(
                        ExperienceDayProgram.builder().dayNumber(1).title("Arches et coucher de soleil")
                                .description("Marche jusqu'aux arches, pique-nique et observation du coucher de soleil sur les dunes.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 28, 8, 0))
                .build());

        // ── 13. Desert-meets-Ocean Dunes & Kitesurf — Laâyoune-Sakia El Hamra
        experienceRepository.save(Experience.builder()
                .host(brahim)
                .title("Dunes Océan-Désert & Kitesurf")
                .description("Initiation au kitesurf sur la lagune de Laâyoune puis balade au coucher du soleil sur les dunes qui rencontrent l'océan Atlantique.")
                .price(new BigDecimal("650"))
                .duration(1)
                .category("Nature")
                .status(ExperienceStatus.published)
                .city("Laâyoune")
                .region(laayouneSakiaElHamra)
                .latitude(new BigDecimal("27.1500"))
                .longitude(new BigDecimal("-13.2000"))
                .coverImages(List.of(
                        "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=1200&q=80"))
                .dayPrograms(List.of(
                        ExperienceDayProgram.builder().dayNumber(1).title("Kitesurf & dunes")
                                .description("Cours d'initiation sur la lagune, puis marche sur les dunes au coucher du soleil.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 30, 8, 0))
                .build());

        // ── 14. World-class Kitesurf Lagoon — Dakhla-Oued Ed-Dahab ─────────
        experienceRepository.save(Experience.builder()
                .host(youssef)
                .title("Kitesurf de Classe Mondiale sur Lagune")
                .description("Deux jours de kitesurf sur la lagune plate et protégée de Dakhla, réputée parmi les meilleurs spots au monde, encadrés par un moniteur local.")
                .price(new BigDecimal("980"))
                .duration(2)
                .category("Nature")
                .status(ExperienceStatus.published)
                .city("Dakhla")
                .region(dakhlaOuedEdDahab)
                .latitude(new BigDecimal("23.6848"))
                .longitude(new BigDecimal("-15.9570"))
                .coverImages(List.of(
                        "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80"))
                .dayPrograms(List.of(
                        ExperienceDayProgram.builder().dayNumber(1).title("Prise en main sur la lagune")
                                .description("Théorie, sécurité et premiers glissements sur l'eau plate de la lagune.")
                                .build(),
                        ExperienceDayProgram.builder().dayNumber(2).title("Sessions libres & bivouac")
                                .description("Perfectionnement en autonomie encadrée, dîner et nuit sous tente face à la lagune.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 4, 1, 8, 0))
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
                    .role(UserRole.host)
                    .phone(phone)
                    .country(country)
                    .language(language)
                    .bio(bio)
                    .emailVerified(true)
                    .createdAt(LocalDateTime.now())
                    .build();
            return userRepository.save(host);
        });
    }
}
