package ma.lbledfirst.backend.repository;

import ma.lbledfirst.backend.domain.Region;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegionRepository extends JpaRepository<Region, Long> {
}
