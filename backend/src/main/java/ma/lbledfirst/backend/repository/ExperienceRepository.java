package ma.lbledfirst.backend.repository;

import ma.lbledfirst.backend.domain.Experience;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExperienceRepository extends JpaRepository<Experience, Long> {
    List<Experience> findByDeletedFalse();

    Page<Experience> findByDeletedFalse(Pageable pageable);

    Page<Experience> findByDeletedFalseAndStatus(ma.lbledfirst.backend.domain.ExperienceStatus status, Pageable pageable);
}
