package ma.lbledfirst.backend.security;

import java.io.IOException;
import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.lbledfirst.backend.domain.User;
import ma.lbledfirst.backend.domain.UserRole;
import ma.lbledfirst.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

// Déclenché une fois que Spring Security a validé l'utilisateur auprès de Google.
// Rôle : faire le pont entre l'identité Google et notre propre système d'auth
// (JWT en cookie httpOnly), pour que /api/auth/me fonctionne ensuite exactement
// comme après un login classique.
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final CookieUtil cookieUtil;

    @Value("${cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.oauth2.success-redirect-uri:http://localhost:3000/me}")
    private String successRedirectUri;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                         Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        if (email == null) {
            log.warn("Connexion Google sans email dans les attributs OAuth2 — abandon");
            response.sendRedirect(request.getContextPath() + "/oauth2/error");
            return;
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            log.info("Création d'un compte via Google pour {}", email);
            User created = User.builder()
                    .name(name != null ? name : email)
                    .email(email)
                    // Compte créé via Google : personne ne connaît ce mot de passe, la
                    // connexion classique par email/mot de passe restera donc impossible
                    // tant que l'utilisateur n'en définit pas un explicitement (fonctionnalité
                    // à prévoir séparément si besoin).
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(UserRole.tourist)
                    .avatar(picture)
                    // Google a déjà vérifié cette adresse — pas besoin de repasser par
                    // l'email de confirmation utilisé pour les inscriptions classiques.
                    .emailVerified(true)
                    .build();
            return userRepository.save(created);
        });

        if (user.getAvatar() == null && picture != null) {
            user.setAvatar(picture);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        response.addHeader(HttpHeaders.SET_COOKIE, cookieUtil.buildAuthCookie(token, cookieSecure).toString());

        response.sendRedirect(successRedirectUri);
    }
}
