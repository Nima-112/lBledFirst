package ma.lbledfirst.backend.repository;

import ma.lbledfirst.backend.domain.Region;
import ma.lbledfirst.backend.domain.RegionName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RegionRepository extends JpaRepository<Region, Long> {
    Optional<Region> findByName(RegionName name);
}
