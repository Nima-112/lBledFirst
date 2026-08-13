package ma.lbledfirst.backend.repository;

import java.util.Optional;

import ma.lbledfirst.backend.domain.Formation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormationRepository extends JpaRepository<Formation, Long> {
    Optional<Formation> findBySlug(String slug);
    boolean existsBySlug(String slug);
    long countByFormateurId(Long formateurId);
}
