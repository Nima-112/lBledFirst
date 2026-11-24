package ma.lbledfirst.backend.repository;

import java.util.List;
import java.util.Optional;

import ma.lbledfirst.backend.domain.FormationPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FormationPurchaseRepository extends JpaRepository<FormationPurchase, Long> {
    boolean existsByUserIdAndFormationId(Long userId, Long formationId);
    Optional<FormationPurchase> findByUserIdAndFormationId(Long userId, Long formationId);
    List<FormationPurchase> findByUserId(Long userId);
    void deleteByFormationId(Long formationId);
    void deleteByUserId(Long userId);

    @Query("SELECT COUNT(fp) FROM FormationPurchase fp WHERE fp.formation.id = :formationId")
    long countByFormationId(@Param("formationId") Long formationId);
}
