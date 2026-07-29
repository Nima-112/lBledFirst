package ma.lbledfirst.backend.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

import ma.lbledfirst.backend.dto.AuthResponse;
import ma.lbledfirst.backend.dto.LoginRequest;
import ma.lbledfirst.backend.dto.RegisterRequest;
import ma.lbledfirst.backend.dto.UserResponse;
import ma.lbledfirst.backend.service.AuthService;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String COOKIE_NAME = "access_token";
    // Doit rester alignée sur l'expiration du JWT (JwtUtil.EXPIRATION = 24h)
    private static final Duration COOKIE_MAX_AGE = Duration.ofHours(24);

    private final AuthService authService;

    @Value("${cookie.secure:false}")
    private boolean cookieSecure;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest req,
            HttpServletResponse response) {

        AuthResponse auth = authService.register(req);
        setAuthCookie(response, auth.getToken());

        return ResponseEntity.ok(toUserResponse(auth));
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(
            @Valid @RequestBody LoginRequest req,
            HttpServletResponse response) {

        AuthResponse auth = authService.login(req);
        setAuthCookie(response, auth.getToken());

        return ResponseEntity.ok(toUserResponse(auth));
    }

    // Lit la session depuis le cookie httpOnly (via JwtFilter) : permet au
    // frontend de récupérer l'utilisateur courant sans jamais lire le token en JS.
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentUser(authentication.getName()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {

        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.noContent().build();
    }

    private void setAuthCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, token)
                .httpOnly(true)
                .secure(cookieSecure) // true en production (HTTPS) — voir application.yml
                .sameSite("Lax")
                .path("/")
                .maxAge(COOKIE_MAX_AGE)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private UserResponse toUserResponse(AuthResponse auth) {
        return new UserResponse(auth.getId(), auth.getName(), auth.getEmail(), auth.getRole());
    }
}