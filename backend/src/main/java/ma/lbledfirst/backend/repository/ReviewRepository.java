package ma.lbledfirst.backend.repository;

import java.util.List;
import java.util.Optional;

import ma.lbledfirst.backend.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByFormationId(Long formationId);
    List<Review> findByExperienceId(Long experienceId);
    List<Review> findByTouristId(Long touristId);
    Optional<Review> findByTouristIdAndFormationId(Long touristId, Long formationId);
    Optional<Review> findByTouristIdAndExperienceId(Long touristId, Long experienceId);
}
