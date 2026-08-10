package ma.lbledfirst.backend.repository;

import java.util.Optional;

import ma.lbledfirst.backend.domain.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    Optional<EmailVerificationToken> findByToken(String token);

    @Modifying
    @Query("delete from EmailVerificationToken t where t.user.id = :userId")
    void deleteAllByUserId(Long userId);
}
