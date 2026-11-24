package ma.lbledfirst.backend.security;

import java.time.Duration;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

// Centralise la construction du cookie httpOnly "access_token" pour que le
// login classique (AuthController) et le login Google (OAuth2LoginSuccessHandler)
// posent exactement le même cookie, avec les mêmes réglages.
@Component
public class CookieUtil {

    public static final String COOKIE_NAME = "access_token";
    // Doit rester alignée sur l'expiration du JWT (JwtUtil.EXPIRATION = 24h)
    private static final Duration COOKIE_MAX_AGE = Duration.ofHours(24);

    public ResponseCookie buildAuthCookie(String token, boolean secure) {
        return ResponseCookie.from(COOKIE_NAME, token)
                .httpOnly(true)
                .secure(secure) // true en production (HTTPS) — voir application.yml
                .sameSite("Lax")
                .path("/")
                .maxAge(COOKIE_MAX_AGE)
                .build();
    }

    public ResponseCookie buildLogoutCookie(boolean secure) {
        return ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
    }
}
