package ma.lbledfirst.backend.repository;

import ma.lbledfirst.backend.domain.Video;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VideoRepository extends JpaRepository<Video, Long> {
    List<Video> findByHostId(Long hostId);
}
