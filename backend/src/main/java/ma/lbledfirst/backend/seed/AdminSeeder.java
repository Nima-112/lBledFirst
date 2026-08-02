package ma.lbledfirst.backend.seed;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.lbledfirst.backend.domain.User;
import ma.lbledfirst.backend.domain.UserRole;
import ma.lbledfirst.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
@Profile({"dev", "local"})
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        repo.findByEmail(adminEmail).ifPresentOrElse(
            existing -> {
                if (!encoder.matches(adminPassword, existing.getPassword())) {
                    existing.setPassword(encoder.encode(adminPassword));
                    repo.save(existing);
                    log.info("🔑 Mot de passe admin mis à jour : {}", adminEmail);
                } else {
                    log.info("ℹ️ Admin déjà existant : {}", adminEmail);
                }
            },
            () -> {
                User admin = User.builder()
                        .name("Admin")
                        .email(adminEmail)
                        .password(encoder.encode(adminPassword))
                        .role(UserRole.admin)
                        .createdAt(LocalDateTime.now())
                        .build();

                repo.save(admin);
                log.info("✅ Compte admin créé avec succès : {}", adminEmail);
                log.warn("⚠️ PENSE À CHANGER LE MOT DE PASSE PAR DÉFAUT !");
            }
        );
    }
}