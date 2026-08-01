package ma.lbledfirst.backend.repository;

import java.util.List;
import java.util.Optional;

import ma.lbledfirst.backend.domain.FormationCapsuleProgress;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormationCapsuleProgressRepository extends JpaRepository<FormationCapsuleProgress, Long> {
    Optional<FormationCapsuleProgress> findByUserIdAndCapsuleId(Long userId, Long capsuleId);
    List<FormationCapsuleProgress> findByUserIdAndCapsule_Chapter_Formation_Id(Long userId, Long formationId);
}
