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
                "+212 661-112233", "Morocco", "Amazigh",
                "Mountain guide for 15 years in the High Atlas.");

        User khadija = findOrCreateHost(
                "khadija@host.ma", "Khadija El Merzougi",
                "+212 662-445566", "Morocco", "Arabic",
                "Nomadic family, bivouacs and dinners under the stars.");

        User youssef = findOrCreateHost(
                "youssef@host.ma", "Youssef Ouzoud",
                "+212 663-778899", "Morocco", "Amazigh",
                "Passionate about waterfalls and local cuisine.");

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
                .description("Three days of hiking in the High Atlas with a Berber guide. Hidden trails, villages clinging to the mountainside, overnight stays with locals, and breakfasts facing the peaks.")
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
                        ExperienceDayProgram.builder().dayNumber(1).title("Arrival in Imlil & gentle climb")
                                .description("Welcome to the village, mint tea, warming up towards Aroumd and overnight in a family lodge.")
                                .build(),
                        ExperienceDayProgram.builder().dayNumber(2).title("Ascent to the Toubkal refuge")
                                .description("High altitude trek between scree and waterfalls. Berber meal at the refuge, starry sky.")
                                .build(),
                        ExperienceDayProgram.builder().dayNumber(3).title("Return via the Imenane valley")
                                .description("Panoramic descent through a secret valley, lunch with a family, return to Marrakech.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 1, 8, 0))
                .build());

        // ── 2. Tea Ceremonies with Village Elders ──────────────────────────
        experienceRepository.save(Experience.builder()
                .host(youssef)
                .title("Tea Ceremonies with Village Elders")
                .description("A day of immersion in the mint tea ritual: picking, pouring gestures, pouring height, the tradition of the three glasses.")
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
                        ExperienceDayProgram.builder().dayNumber(1).title("Tea ritual, from garden to cup")
                                .description("Mint picking, traditional preparation, learning the three glasses (bitter, sweet, tender) with an elder.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 4, 8, 0))
                .build());

        // ── 3. Artisan Workshops — Argan Cooperative ───────────────────────
        experienceRepository.save(Experience.builder()
                .host(youssef)
                .title("Artisan Workshops — Argan Cooperative")
                .description("Two days in a Berber women's cooperative: crushing, roasting, and pressing argan oil, weaving workshop.")
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
                        ExperienceDayProgram.builder().dayNumber(1).title("Making argan oil")
                                .description("Discovering the fruit, hands-on workshops, tastings.")
                                .build(),
                        ExperienceDayProgram.builder().dayNumber(2).title("Berber weaving")
                                .description("Patterns, symbols, a small weaving to take away.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 6, 8, 0))
                .build());

        // ── 4. Desert Camps under the Stars ────────────────────────────────
        experienceRepository.save(Experience.builder()
                .host(khadija)
                .title("Desert Camps under the Stars")
                .description("Two nights in Erg Chebbi: sunset camel ride, nomadic dinner under the stars, Gnawa drums and sunrise over the dunes.")
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
                        ExperienceDayProgram.builder().dayNumber(1).title("Arrival & camel ride at sunset")
                                .description("Camel trek in the dunes, dinner and Gnawa music around the fire.")
                                .build(),
                        ExperienceDayProgram.builder().dayNumber(2).title("Sunrise & return")
                                .description("Silence of the desert, breakfast in the shade of the bivouac, return to the village.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 9, 8, 0))
                .build());

        // ── 5. Cooking with Locals — Tagine & Msemen ───────────────────────
        experienceRepository.save(Experience.builder()
                .host(brahim)
                .title("Cooking with Locals — Tagine & Msemen")
                .description("A day in a family kitchen: morning market, slow tagine preparation, msemen on a Berber griddle and a shared meal.")
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
                        ExperienceDayProgram.builder().dayNumber(1).title("From the souk to the table")
                                .description("Market, cooking together, tasting around a large common dish.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 12, 8, 0))
                .build());

        // ── 6. Valley Walks — Aït Bouguemez ────────────────────────────────
        experienceRepository.save(Experience.builder()
                .host(youssef)
                .title("Valley Walks — Aït Bouguemez")
                .description("Two days of gentle walks in the Happy Valley: palm groves, collective granaries and lunch with a family.")
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
                        ExperienceDayProgram.builder().dayNumber(1).title("Village loop")
                                .description("Crossing perched hamlets, cultivated terraces, Berber meal.")
                                .build(),
                        ExperienceDayProgram.builder().dayNumber(2).title("Collective granary & sacred spring")
                                .description("Walk to a millennial agadir, time of sharing with the locals.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 15, 8, 0))
                .build());

        // ── 7. Citrus Orchards & Cliff Roads — L'Oriental ──────────────────
        experienceRepository.save(Experience.builder()
                .host(brahim)
                .title("Citrus Orchards & Cliff Roads")
                .description("A day among the citrus orchards of the Oujda region and the winding roads along the cliffs, with a stop at a local producer.")
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
                        ExperienceDayProgram.builder().dayNumber(1).title("Orchards and cliff roads")
                                .description("Citrus picking, picnic facing the gorges, return at sunset.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 18, 8, 0))
                .build());

        // ── 8. Craft Workshops & Mountain Treks — Fès-Meknès ───────────────
        experienceRepository.save(Experience.builder()
                .host(youssef)
                .title("Craft Workshops & Mountain Treks")
                .description("A day between the pottery and leather workshops of Fes and a short hike in the hills of the Middle Atlas.")
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
                        ExperienceDayProgram.builder().dayNumber(1).title("Medina and hills")
                                .description("Workshop with a master tanner, lunch, panoramic walk on the heights of Fes.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 20, 8, 0))
                .build());

        // ── 9. Thermal Springs & Plateau Hikes — Rabat-Salé-Kénitra ────────
        experienceRepository.save(Experience.builder()
                .host(khadija)
                .title("Thermal Springs & Plateau Hikes")
                .description("Relaxation around the region's thermal springs and a gentle walk on the agricultural plateau, among olive groves and family farms.")
                .price(new BigDecimal("240"))
                .duration(1)
                .category("Relaxation")
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
                        ExperienceDayProgram.builder().dayNumber(1).title("Springs and plateau")
                                .description("Thermal bath, lunch at the farm, walk among the olive trees.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 22, 8, 0))
                .build());

        // ── 10. Coastal Heritage & Medina Walks — Casablanca-Settat ────────
        experienceRepository.save(Experience.builder()
                .host(brahim)
                .title("Coastal Heritage & Medina Walks")
                .description("Discovery of the fortified medina of El Jadida and its seafront, with a guide passionate about Portuguese and Moroccan history.")
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
                        ExperienceDayProgram.builder().dayNumber(1).title("Portuguese city & medina")
                                .description("Portuguese cistern, ramparts, alleys of the medina and lunch facing the ocean.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 24, 8, 0))
                .build());

        // ── 11. Saffron Harvest — Souss-Massa ──────────────────────────────
        experienceRepository.save(Experience.builder()
                .host(youssef)
                .title("Saffron Harvest with Cooperatives")
                .description("A morning harvesting saffron flowers at dawn alongside a women's cooperative, followed by a pruning workshop and tasting.")
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
                        ExperienceDayProgram.builder().dayNumber(1).title("Harvest at dawn")
                                .description("Harvesting flowers, pruning pistils, saffron tea with the cooperative.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 26, 8, 0))
                .build());

        // ── 12. Red Sandstone Arches — Guelmim-Oued Noun ───────────────────
        experienceRepository.save(Experience.builder()
                .host(khadija)
                .title("Red Sandstone Arches at Sunset")
                .description("Easy hike to the region's red sandstone arches, with a picnic and sunset over the pre-Saharan desert.")
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
                        ExperienceDayProgram.builder().dayNumber(1).title("Arches and sunset")
                                .description("Walk to the arches, picnic and sunset observation over the dunes.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 28, 8, 0))
                .build());

        // ── 13. Desert-meets-Ocean Dunes & Kitesurf — Laâyoune-Sakia El Hamra
        experienceRepository.save(Experience.builder()
                .host(brahim)
                .title("Ocean-Desert Dunes & Kitesurf")
                .description("Introduction to kitesurfing on the Laayoune lagoon then a sunset walk on the dunes where the desert meets the Atlantic Ocean.")
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
                                .description("Introductory lesson on the lagoon, then a walk on the dunes at sunset.")
                                .build()))
                .createdAt(LocalDateTime.of(2026, 3, 30, 8, 0))
                .build());

        // ── 14. World-class Kitesurf Lagoon — Dakhla-Oued Ed-Dahab ─────────
        experienceRepository.save(Experience.builder()
                .host(youssef)
                .title("World-Class Lagoon Kitesurfing")
                .description("Two days of kitesurfing on the flat and protected lagoon of Dakhla, renowned among the best spots in the world, supervised by a local instructor.")
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
                        ExperienceDayProgram.builder().dayNumber(1).title("Getting started on the lagoon")
                                .description("Theory, safety and first glides on the flat water of the lagoon.")
                                .build(),
                        ExperienceDayProgram.builder().dayNumber(2).title("Free sessions & bivouac")
                                .description("Supervised autonomous improvement, dinner and night in a tent facing the lagoon.")
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
