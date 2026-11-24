package ma.lbledfirst.backend.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import ma.lbledfirst.backend.security.JwtFilter;
import ma.lbledfirst.backend.security.VideoAccessFilter;
import ma.lbledfirst.backend.security.OAuth2LoginFailureHandler;
import ma.lbledfirst.backend.security.OAuth2LoginSuccessHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
// active @PreAuthorize sur les contrôleurs/services (utilisé par FormationController
// pour réserver la création/modification/suppression des formations aux admins)
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final VideoAccessFilter videoAccessFilter;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;

    @Value("${springdoc.api-docs.enabled:false}")
    private boolean apiDocsEnabled;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults()) // utilise le bean CorsConfigurationSource (WebConfig)
                // IF_REQUIRED (et non STATELESS) : le flux OAuth2 de Spring Security a besoin
                // d'une session le temps du handshake avec Google (stockage du "state" anti-CSRF
                // entre la redirection vers Google et le retour sur /login/oauth2/code/google).
                // Le reste de l'API (JwtFilter) ne s'appuie jamais sur la session : aucune session
                // n'est créée pour les appels authentifiés par cookie JWT classiques.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();
                    auth.requestMatchers("/uploads/avatars/**", "/uploads/images/**").permitAll();
                    auth.requestMatchers("/uploads/videos/**").authenticated();
                    auth.requestMatchers("/api/health").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/api/formations", "/api/formations/*").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/api/experiences/me/favorites").authenticated();
                    auth.requestMatchers(HttpMethod.GET, "/api/experiences", "/api/experiences/**").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/api/regions", "/api/regions/**").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/api/activities", "/api/activities/**").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/api/reviews/me").authenticated();
                    auth.requestMatchers(HttpMethod.GET, "/api/reviews", "/api/reviews/**").permitAll();
                    auth.requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/logout").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/api/auth/verify-email").permitAll();
                    auth.requestMatchers("/api/auth/forgot-password", "/api/auth/reset-password").permitAll();
                    auth.requestMatchers("/api/auth/resend-verification").permitAll();
                    if (apiDocsEnabled) {
                        auth.requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll();
                    }
                    auth.requestMatchers("/actuator/health").permitAll();
                    auth.requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll();
                    auth.requestMatchers("/error").permitAll();
                    auth.anyRequest().authenticated();
                })
                .exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, authException) ->
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED)))
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureHandler(oAuth2LoginFailureHandler))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(videoAccessFilter, JwtFilter.class);
        return http.build();
    }
}
