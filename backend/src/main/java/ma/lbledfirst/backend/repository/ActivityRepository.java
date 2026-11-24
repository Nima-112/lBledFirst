package ma.lbledfirst.backend.repository;

import ma.lbledfirst.backend.domain.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    boolean existsByName(String name);
    Optional<Activity> findByName(String name);
}
