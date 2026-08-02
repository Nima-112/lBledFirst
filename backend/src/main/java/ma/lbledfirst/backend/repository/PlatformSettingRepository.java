package ma.lbledfirst.backend.repository;

import ma.lbledfirst.backend.domain.PlatformSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatformSettingRepository extends JpaRepository<PlatformSetting, String> {
}
