package ma.lbledfirst.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import ma.lbledfirst.backend.domain.Experience;
import ma.lbledfirst.backend.domain.Formation;
import ma.lbledfirst.backend.domain.Review;
import ma.lbledfirst.backend.domain.User;
import ma.lbledfirst.backend.dto.ReviewRequest;
import ma.lbledfirst.backend.dto.ReviewResponse;
import ma.lbledfirst.backend.dto.UserResponse;
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

    private UserResponse mapToUserResponse(User user) {
        if (user == null) return null;
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().name() : null,
                user.getPhone(),
                user.getCountry(),
                user.getLanguage(),
                user.getAvatar(),
                user.isEmailVerified()
        );
    }

    private ReviewResponse mapToResponse(Review r) {
        if (r == null) return null;
        return new ReviewResponse(
                r.getId(),
                mapToUserResponse(r.getTourist()),
                r.getExperience(),
                r.getFormation(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> findAllDto() {
        return reviewRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReviewResponse findByIdDto(Long id) {
        Review r = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Review not found"));
        return mapToResponse(r);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> findByFormationIdDto(Long formationId) {
        return reviewRepository.findByFormationId(formationId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> findByExperienceIdDto(Long experienceId) {
        return reviewRepository.findByExperienceId(experienceId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> findMineDto(String email) {
        User tourist = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Utilisateur introuvable"));
        return reviewRepository.findByTouristId(tourist.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponse createDto(ReviewRequest req, String touristEmail) {
        User tourist = userRepository.findByEmail(touristEmail)
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Utilisateur introuvable"));
        
        Review review = new Review();
        review.setTourist(tourist);
        review.setRating(req.getRating());
        review.setComment(req.getComment());

        Formation formation = resolveTargetAndValidate(req, review, tourist);

        Review saved = reviewRepository.save(review);
        recomputeFormationRating(formation);
        return mapToResponse(saved);
    }

    @Transactional
    public ReviewResponse updateDto(Long id, ReviewRequest req) {
        Review existing = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Review not found"));

        if (req.getRating() != null) existing.setRating(req.getRating());
        if (req.getComment() != null) existing.setComment(req.getComment());

        Review saved = reviewRepository.save(existing);
        recomputeFormationRating(saved.getFormation());
        return mapToResponse(saved);
    }

    // ---- Helpers --------------------------------------------------------------

    private Formation resolveTargetAndValidate(ReviewRequest req, Review review, User tourist) {
        boolean hasFormation = req.getFormation() != null && req.getFormation().getId() != null;
        boolean hasExperience = req.getExperience() != null && req.getExperience().getId() != null;

        if (hasFormation == hasExperience) {
            throw new ResponseStatusException(BAD_REQUEST,
                    "Un avis doit concerner soit une formation, soit une expérience (pas les deux)");
        }

        if (hasFormation) {
            Formation formation = formationRepository.findById(req.getFormation().getId())
                    .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Formation introuvable"));

            ensureFormationCompleted(formation, tourist);

            if (reviewRepository.findByTouristIdAndFormationId(tourist.getId(), formation.getId()).isPresent()) {
                throw new ResponseStatusException(CONFLICT, "Vous avez déjà laissé un avis pour cette formation");
            }

            review.setFormation(formation);
            review.setExperience(null);
            return formation;
        } else {
            Experience experience = experienceRepository.findById(req.getExperience().getId())
                    .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Expérience introuvable"));

            if (reviewRepository.findByTouristIdAndExperienceId(tourist.getId(), experience.getId()).isPresent()) {
                throw new ResponseStatusException(CONFLICT, "Vous avez déjà laissé un avis pour cette expérience");
            }

            review.setExperience(experience);
            review.setFormation(null);
            return null;
        }
    }

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
