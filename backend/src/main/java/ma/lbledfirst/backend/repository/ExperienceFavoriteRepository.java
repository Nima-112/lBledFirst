package ma.lbledfirst.backend.repository;

import java.util.List;
import java.util.Optional;

import ma.lbledfirst.backend.domain.ExperienceFavorite;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExperienceFavoriteRepository extends JpaRepository<ExperienceFavorite, Long> {
    Optional<ExperienceFavorite> findByUserIdAndExperienceId(Long userId, Long experienceId);
    List<ExperienceFavorite> findByUserId(Long userId);
    void deleteByExperienceId(Long experienceId);
    void deleteByUserId(Long userId);
}
