package ma.lbledfirst.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class WebConfig {

    // Liste (YAML) résolue en tableau — voir application.yml: cors.allowed-origins
    @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:8081}")
    private String[] allowedOrigins;

    // Bean explicite utilisé directement par SecurityConfig (http.cors(...)).
    // Spring Security passe en amont du DispatcherServlet : sans ce bean branché
    // dans la chaîne de filtres, les requêtes preflight OPTIONS vers les
    // endpoints protégés étaient bloquées avant d'atteindre la config CORS MVC.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(allowedOrigins));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
