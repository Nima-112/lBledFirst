package ma.lbledfirst.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

// Isolé de SecurityConfig volontairement : OAuth2LoginSuccessHandler dépend de
// PasswordEncoder, et SecurityConfig dépend (par constructeur) de
// OAuth2LoginSuccessHandler. Si passwordEncoder() restait défini dans
// SecurityConfig, Spring devrait instancier SecurityConfig pour appeler cette
// méthode @Bean — mais son constructeur exige déjà OAuth2LoginSuccessHandler,
// qui exige déjà PasswordEncoder : cycle impossible à résoudre. En sortant ce
// bean dans sa propre classe, sans lien avec SecurityConfig, le cycle disparaît.
@Configuration
public class PasswordEncoderConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
