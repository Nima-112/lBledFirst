package ma.lbledfirst.backend.repository;

import ma.lbledfirst.backend.domain.Experience;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExperienceRepository extends JpaRepository<Experience, Long> {
    List<Experience> findByDeletedFalse();
}
