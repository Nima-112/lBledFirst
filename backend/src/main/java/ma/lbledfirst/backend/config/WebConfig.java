package ma.lbledfirst.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:8081}")
    private String[] allowedOrigins;

    @Value("${app.upload.dir:/app/uploads/videos}")
    private String uploadDir;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(allowedOrigins));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        source.registerCorsConfiguration("/uploads/**", configuration);
        return source;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String location = "file:" + uploadPath.toString().replace("\\", "/") + "/";
        registry.addResourceHandler("/uploads/videos/**")
                .addResourceLocations(location)
                .setCachePeriod(31536000);
        Path avatarPath = Paths.get("/app/uploads/avatars").toAbsolutePath().normalize();
        String avatarLocation = "file:" + avatarPath.toString().replace("\\", "/") + "/";
        registry.addResourceHandler("/uploads/avatars/**")
                .addResourceLocations(avatarLocation)
                .setCachePeriod(31536000);
        Path imagesPath = Paths.get("/app/uploads/images").toAbsolutePath().normalize();
        String imagesLocation = "file:" + imagesPath.toString().replace("\\", "/") + "/";
        registry.addResourceHandler("/uploads/images/**")
                .addResourceLocations(imagesLocation)
                .setCachePeriod(31536000);
    }
}
