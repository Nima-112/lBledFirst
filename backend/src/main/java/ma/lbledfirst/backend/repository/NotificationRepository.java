package ma.lbledfirst.backend.repository;

import ma.lbledfirst.backend.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    void deleteByUserId(Long userId);
}
