package ma.lbledfirst.backend.service;

import ma.lbledfirst.backend.domain.Experience;
import ma.lbledfirst.backend.domain.Review;
import ma.lbledfirst.backend.domain.User;
import ma.lbledfirst.backend.repository.ExperienceRepository;
import ma.lbledfirst.backend.repository.ReviewRepository;
import ma.lbledfirst.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class ReviewService extends AbstractCrudService<Review, Long> {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ExperienceRepository experienceRepository;

    public ReviewService(ReviewRepository repository,
                         UserRepository userRepository,
                         ExperienceRepository experienceRepository) {
        super(repository);
        this.reviewRepository = repository;
        this.userRepository = userRepository;
        this.experienceRepository = experienceRepository;
    }

    @Override
    public Review save(Review review) {
        resolveReferences(review);
        return super.save(review);
    }

    @Override
    public Review update(Long id, Review review) {
        Review existing = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Review not found"));

        if (review.getTourist() != null && review.getTourist().getId() != null
                && !existing.getTourist().getId().equals(review.getTourist().getId())) {
            User t = userRepository.findById(review.getTourist().getId())
                    .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Tourist not found"));
            existing.setTourist(t);
        }
        if (review.getExperience() != null && review.getExperience().getId() != null
                && !existing.getExperience().getId().equals(review.getExperience().getId())) {
            Experience e = experienceRepository.findById(review.getExperience().getId())
                    .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Experience not found"));
            existing.setExperience(e);
        }
        if (review.getRating() != null) existing.setRating(review.getRating());
        existing.setComment(review.getComment());

        return reviewRepository.save(existing);
    }

    private void resolveReferences(Review review) {
        if (review.getTourist() == null || review.getTourist().getId() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Tourist is required");
        }
        if (review.getExperience() == null || review.getExperience().getId() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Experience is required");
        }
        User tourist = userRepository.findById(review.getTourist().getId())
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Tourist not found"));
        Experience experience = experienceRepository.findById(review.getExperience().getId())
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Experience not found"));
        review.setTourist(tourist);
        review.setExperience(experience);
    }
}
