package ma.lbledfirst.backend.seed;

import java.util.List;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.lbledfirst.backend.domain.Capsule;
import ma.lbledfirst.backend.domain.Formation;
import ma.lbledfirst.backend.domain.FormationCapsuleProgress;
import ma.lbledfirst.backend.domain.FormationPurchase;
import ma.lbledfirst.backend.domain.Review;
import ma.lbledfirst.backend.domain.User;
import ma.lbledfirst.backend.domain.UserRole;
import ma.lbledfirst.backend.repository.FormationCapsuleProgressRepository;
import ma.lbledfirst.backend.repository.FormationPurchaseRepository;
import ma.lbledfirst.backend.repository.FormationRepository;
import ma.lbledfirst.backend.repository.ReviewRepository;
import ma.lbledfirst.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Données de test pour vérifier le flux "avis de formation" de bout en bout
 * (achat -> progression -> complétion -> avis -> recalcul de la note).
 * Ne tourne qu'en dev/local, jamais en prod, et est idempotent (skip si déjà seedé).
 *
 * Comptes créés (mot de passe identique pour tous : {@code Test1234!}) :
 *
 *  - test.pret@lbledfirst.ma      → a acheté "Tarz Fassi" et terminé toutes les
 *                                    capsules, mais n'a PAS encore laissé d'avis.
 *                                    -> vérifie que le formulaire est ACTIVABLE.
 *  - test.deja-note@lbledfirst.ma → a acheté "Tarz Fassi", tout terminé, ET déjà
 *                                    laissé un avis (5★).
 *                                    -> vérifie le message "avis déjà laissé".
 *  - test.encours@lbledfirst.ma   → a acheté "Zellige de Fès" mais n'a terminé
 *                                    qu'une capsule sur deux.
 *                                    -> vérifie le message "formation non terminée".
 *  - test.non-achete@lbledfirst.ma → aucun achat.
 *                                    -> vérifie l'état "achetez pour noter" / login.
 *
 * En plus, 2 avis supplémentaires (autres utilisateurs fictifs) sont ajoutés sur
 * "Tarz Fassi" pour que la liste d'avis et la moyenne affichent des données
 * réalistes dès le premier lancement.
 */
@Slf4j
@Component
@Order(3) // après RegionSeeder/FormationSeeder (qui créent formations + capsules)
@RequiredArgsConstructor
@Profile({"dev", "local"})
public class ReviewTestDataSeeder implements CommandLineRunner {

    private static final String PASSWORD = "Test1234!";

    private final UserRepository userRepository;
    private final FormationRepository formationRepository;
    private final FormationPurchaseRepository purchaseRepository;
    private final FormationCapsuleProgressRepository progressRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;
    private final TransactionTemplate txTemplate;

    @Override
    public void run(String... args) {
        txTemplate.executeWithoutResult(status -> doSeed());
    }

    private void doSeed() {
        // Idempotent : si le compte "prêt à noter" existe déjà, on ne reseed rien.
        if (userRepository.findByEmail("test.pret@lbledfirst.ma").isPresent()) {
            log.info("ℹ️ Données de test avis déjà présentes, seed ignoré.");
            return;
        }

        Formation tarzFassi = formationRepository.findBySlug("tarz-fassi").orElse(null);
        Formation zellige = formationRepository.findBySlug("zellige-de-fes").orElse(null);
        if (tarzFassi == null || zellige == null) {
            log.warn("⚠️ Formations de seed introuvables (tarz-fassi / zellige-de-fes) — ReviewTestDataSeeder ignoré.");
            return;
        }

        User pret = createUser("Test Prêt À Noter", "test.pret@lbledfirst.ma");
        User dejaNote = createUser("Test Déjà Noté", "test.deja-note@lbledfirst.ma");
        User enCours = createUser("Test En Cours", "test.encours@lbledfirst.ma");
        createUser("Test Non Acheté", "test.non-achete@lbledfirst.ma"); // aucun achat, volontairement inutilisé ci-dessous

        User graduate1 = createUser("Yasmine Alaoui", "yasmine.alaoui@lbledfirst.ma");
        User graduate2 = createUser("Omar Benjelloun", "omar.benjelloun@lbledfirst.ma");

        // ---- test.pret : achète + termine tout, mais ne note pas -----------
        purchaseAndComplete(pret, tarzFassi);

        // ---- test.deja-note : achète + termine tout + note déjà -----------
        purchaseAndComplete(dejaNote, tarzFassi);
        saveReview(dejaNote, tarzFassi, 5, "Exceptional course, the maalema explains every point with great patience!");

        // ---- test.encours : achète mais ne termine qu'une partie ----------
        purchase(enCours, zellige);
        List<Capsule> zelligeCapsules = allCapsules(zellige);
        if (!zelligeCapsules.isEmpty()) {
            markCapsuleCompleted(enCours, zelligeCapsules.get(0));
        }

        // ---- avis supplémentaires pour peupler la liste sur Tarz Fassi ----
        purchaseAndComplete(graduate1, tarzFassi);
        saveReview(graduate1, tarzFassi, 4, "Very comprehensive, I just would have liked more examples of complex patterns.");

        purchaseAndComplete(graduate2, tarzFassi);
        saveReview(graduate2, tarzFassi, 5, "The best craft course I have taken online, top notch!");

        recomputeFormationRating(tarzFassi);

        log.info("✅ Données de test 'avis de formation' créées (mot de passe pour tous : {})", PASSWORD);
        log.info("   - test.pret@lbledfirst.ma      : Tarz Fassi terminée, pas encore d'avis → formulaire activable");
        log.info("   - test.deja-note@lbledfirst.ma : Tarz Fassi terminée + déjà notée → message 'avis déjà laissé'");
        log.info("   - test.encours@lbledfirst.ma   : Zellige de Fès entamée (1/2 capsules) → formulaire désactivé");
        log.info("   - test.non-achete@lbledfirst.ma: aucun achat → invite à acheter / se connecter");
    }

    // ---- Helpers --------------------------------------------------------------

    private User createUser(String name, String email) {
        return userRepository.findByEmail(email).orElseGet(() ->
                userRepository.save(User.builder()
                        .name(name)
                        .email(email)
                        .password(passwordEncoder.encode(PASSWORD))
                        .role(UserRole.tourist)
                        .build()));
    }

    private void purchase(User user, Formation formation) {
        if (purchaseRepository.existsByUserIdAndFormationId(user.getId(), formation.getId())) return;
        purchaseRepository.save(FormationPurchase.builder().user(user).formation(formation).build());
        formation.setStudentsCount(formation.getStudentsCount() + 1);
        formationRepository.save(formation);
    }

    private void purchaseAndComplete(User user, Formation formation) {
        purchase(user, formation);
        allCapsules(formation).forEach(c -> markCapsuleCompleted(user, c));
    }

    private void markCapsuleCompleted(User user, Capsule capsule) {
        if (progressRepository.findByUserIdAndCapsuleId(user.getId(), capsule.getId()).isPresent()) return;
        progressRepository.save(FormationCapsuleProgress.builder().user(user).capsule(capsule).build());
    }

    private List<Capsule> allCapsules(Formation formation) {
        return formation.getChapters().stream()
                .flatMap(ch -> ch.getCapsules().stream())
                .toList();
    }

    private void saveReview(User tourist, Formation formation, int rating, String comment) {
        if (reviewRepository.findByTouristIdAndFormationId(tourist.getId(), formation.getId()).isPresent()) return;
        reviewRepository.save(Review.builder()
                .tourist(tourist)
                .formation(formation)
                .rating(rating)
                .comment(comment)
                .build());
    }

    private void recomputeFormationRating(Formation formation) {
        List<Review> reviews = reviewRepository.findByFormationId(formation.getId());
        int count = reviews.size();
        double average = count == 0 ? 0.0 : reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        formation.setReviewsCount(count);
        formation.setAverageRating(Math.round(average * 10) / 10.0);
        formationRepository.save(formation);
    }
}
