package ma.lbledfirst.backend.service;

import java.util.List;

import ma.lbledfirst.backend.domain.Experience;
import ma.lbledfirst.backend.domain.Formation;
import ma.lbledfirst.backend.domain.Review;
import ma.lbledfirst.backend.domain.User;
import ma.lbledfirst.backend.repository.ExperienceRepository;
import ma.lbledfirst.backend.repository.FormationCapsuleProgressRepository;
import ma.lbledfirst.backend.repository.FormationPurchaseRepository;
import ma.lbledfirst.backend.repository.FormationRepository;
import ma.lbledfirst.backend.repository.ReviewRepository;
import ma.lbledfirst.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ReviewService extends AbstractCrudService<Review, Long> {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ExperienceRepository experienceRepository;
    private final FormationRepository formationRepository;
    private final FormationPurchaseRepository formationPurchaseRepository;
    private final FormationCapsuleProgressRepository progressRepository;

    public ReviewService(ReviewRepository repository,
                         UserRepository userRepository,
                         ExperienceRepository experienceRepository,
                         FormationRepository formationRepository,
                         FormationPurchaseRepository formationPurchaseRepository,
                         FormationCapsuleProgressRepository progressRepository) {
        super(repository);
        this.reviewRepository = repository;
        this.userRepository = userRepository;
        this.experienceRepository = experienceRepository;
        this.formationRepository = formationRepository;
        this.formationPurchaseRepository = formationPurchaseRepository;
        this.progressRepository = progressRepository;
    }

    /**
     * Crée un avis pour l'utilisateur actuellement authentifié (déduit du JWT,
     * jamais du corps de la requête, pour éviter qu'un utilisateur poste un
     * avis au nom d'un autre).
     */
    @Transactional
    public Review createForCurrentUser(Review review, String touristEmail) {
        User tourist = userRepository.findByEmail(touristEmail)
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Utilisateur introuvable"));
        review.setId(null);
        review.setTourist(tourist);

        Formation formation = resolveTargetAndValidate(review, tourist);

        Review saved = reviewRepository.save(review);
        recomputeFormationRating(formation);
        return saved;
    }

    @Override
    @Transactional
    public Review update(Long id, Review review) {
        Review existing = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Review not found"));

        if (review.getRating() != null) existing.setRating(review.getRating());
        if (review.getComment() != null) existing.setComment(review.getComment());

        Review saved = reviewRepository.save(existing);
        recomputeFormationRating(saved.getFormation());
        return saved;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Review existing = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Review not found"));
        Formation formation = existing.getFormation();
        reviewRepository.deleteById(id);
        recomputeFormationRating(formation);
    }

    @Transactional(readOnly = true)
    public List<Review> findByFormationId(Long formationId) {
        return reviewRepository.findByFormationId(formationId);
    }

    @Transactional(readOnly = true)
    public List<Review> findByExperienceId(Long experienceId) {
        return reviewRepository.findByExperienceId(experienceId);
    }

    @Transactional(readOnly = true)
    public List<Review> findByTouristEmail(String email) {
        User tourist = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Utilisateur introuvable"));
        return reviewRepository.findByTouristId(tourist.getId());
    }

    // ---- Helpers --------------------------------------------------------------

    /**
     * Vérifie qu'un avis cible exactement une formation OU une expérience (jamais
     * les deux, jamais aucune des deux), applique les règles métier associées
     * (formation terminée + achetée, un seul avis par utilisateur et par cible)
     * et renvoie la formation concernée si applicable (pour recalcul de note).
     */
    private Formation resolveTargetAndValidate(Review review, User tourist) {
        boolean hasFormation = review.getFormation() != null && review.getFormation().getId() != null;
        boolean hasExperience = review.getExperience() != null && review.getExperience().getId() != null;

        if (hasFormation == hasExperience) {
            throw new ResponseStatusException(BAD_REQUEST,
                    "Un avis doit concerner soit une formation, soit une expérience (pas les deux)");
        }

        if (hasFormation) {
            Formation formation = formationRepository.findById(review.getFormation().getId())
                    .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Formation introuvable"));

            ensureFormationCompleted(formation, tourist);

            if (reviewRepository.findByTouristIdAndFormationId(tourist.getId(), formation.getId()).isPresent()) {
                throw new ResponseStatusException(CONFLICT, "Vous avez déjà laissé un avis pour cette formation");
            }

            review.setFormation(formation);
            review.setExperience(null);
            return formation;
        } else {
            Experience experience = experienceRepository.findById(review.getExperience().getId())
                    .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Expérience introuvable"));

            if (reviewRepository.findByTouristIdAndExperienceId(tourist.getId(), experience.getId()).isPresent()) {
                throw new ResponseStatusException(CONFLICT, "Vous avez déjà laissé un avis pour cette expérience");
            }

            review.setExperience(experience);
            review.setFormation(null);
            return null;
        }
    }

    /**
     * Une formation est considérée "terminée" par un utilisateur quand il l'a
     * achetée et que toutes ses capsules sont marquées comme complétées
     * (cf. FormationService#toggleCapsuleCompletion).
     */
    private void ensureFormationCompleted(Formation formation, User tourist) {
        boolean purchased = formationPurchaseRepository
                .existsByUserIdAndFormationId(tourist.getId(), formation.getId());
        if (!purchased) {
            throw new ResponseStatusException(FORBIDDEN,
                    "Vous devez avoir acheté cette formation pour la noter");
        }

        int totalCapsules = formation.getChapters().stream()
                .mapToInt(ch -> ch.getCapsules().size())
                .sum();
        long completedCapsules = progressRepository
                .findByUserIdAndCapsule_Chapter_Formation_Id(tourist.getId(), formation.getId())
                .size();

        if (totalCapsules == 0 || completedCapsules < totalCapsules) {
            throw new ResponseStatusException(FORBIDDEN,
                    "Vous devez terminer toutes les capsules de cette formation avant de la noter");
        }
    }

    /**
     * Recalcule averageRating/reviewsCount d'une formation à partir des avis
     * réels — ces champs ne sont plus jamais saisis manuellement par l'admin.
     */
    private void recomputeFormationRating(Formation formation) {
        if (formation == null) return;

        List<Review> reviews = reviewRepository.findByFormationId(formation.getId());
        int count = reviews.size();
        double average = count == 0
                ? 0.0
                : reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);

        formation.setReviewsCount(count);
        formation.setAverageRating(Math.round(average * 10) / 10.0);
        formationRepository.save(formation);
    }
}
