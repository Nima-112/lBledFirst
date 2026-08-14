package ma.lbledfirst.backend.repository;

import ma.lbledfirst.backend.domain.Capsule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CapsuleRepository extends JpaRepository<Capsule, Long> {
    Optional<Capsule> findByVideoUrl(String videoUrl);
}
