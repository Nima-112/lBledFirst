package ma.lbledfirst.backend.repository;

import java.util.List;
import java.util.Optional;

import ma.lbledfirst.backend.domain.FormationFavorite;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormationFavoriteRepository extends JpaRepository<FormationFavorite, Long> {
    Optional<FormationFavorite> findByUserIdAndFormationId(Long userId, Long formationId);
    List<FormationFavorite> findByUserId(Long userId);
    void deleteByFormationId(Long formationId);
    void deleteByUserId(Long userId);
}
