package ma.lbledfirst.backend.repository;

import java.util.List;
import java.util.Optional;

import ma.lbledfirst.backend.domain.FormationPurchase;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormationPurchaseRepository extends JpaRepository<FormationPurchase, Long> {
    boolean existsByUserIdAndFormationId(Long userId, Long formationId);
    Optional<FormationPurchase> findByUserIdAndFormationId(Long userId, Long formationId);
    List<FormationPurchase> findByUserId(Long userId);
}
