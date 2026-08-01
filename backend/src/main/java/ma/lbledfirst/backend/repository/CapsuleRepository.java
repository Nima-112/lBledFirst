package ma.lbledfirst.backend.repository;

import ma.lbledfirst.backend.domain.Capsule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CapsuleRepository extends JpaRepository<Capsule, Long> {
}
