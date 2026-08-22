package ma.lbledfirst.backend.repository;

import java.util.List;
import java.util.Optional;

import ma.lbledfirst.backend.domain.ExperienceFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExperienceFavoriteRepository extends JpaRepository<ExperienceFavorite, Long> {
    Optional<ExperienceFavorite> findByUserIdAndExperienceId(Long userId, Long experienceId);
    List<ExperienceFavorite> findByUserId(Long userId);
    void deleteByExperienceId(Long experienceId);
    void deleteByUserId(Long userId);

    @Query("SELECT COUNT(ef) FROM ExperienceFavorite ef WHERE ef.experience.id = :experienceId")
    long countByExperienceId(@Param("experienceId") Long experienceId);
}
