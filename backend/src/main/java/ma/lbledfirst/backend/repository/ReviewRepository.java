package ma.lbledfirst.backend.repository;

import java.util.List;
import java.util.Optional;

import ma.lbledfirst.backend.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByFormationId(Long formationId);
    List<Review> findByExperienceId(Long experienceId);
    List<Review> findByTouristId(Long touristId);
    Optional<Review> findByTouristIdAndFormationId(Long touristId, Long formationId);
    Optional<Review> findByTouristIdAndExperienceId(Long touristId, Long experienceId);
    void deleteByFormationId(Long formationId);
    void deleteByTouristId(Long touristId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.formation.id = :formationId")
    long countByFormationId(@Param("formationId") Long formationId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.experience.id = :experienceId")
    long countByExperienceId(@Param("experienceId") Long experienceId);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.formation.id = :formationId")
    double averageRatingByFormationId(@Param("formationId") Long formationId);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.experience.id = :experienceId")
    double averageRatingByExperienceId(@Param("experienceId") Long experienceId);
}
