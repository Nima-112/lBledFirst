package ma.lbledfirst.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

import ma.lbledfirst.backend.dto.AuthResponse;
import ma.lbledfirst.backend.dto.ForgotPasswordRequest;
import ma.lbledfirst.backend.dto.LoginRequest;
import ma.lbledfirst.backend.dto.RegisterRequest;
import ma.lbledfirst.backend.dto.ResetPasswordRequest;
import ma.lbledfirst.backend.dto.UserResponse;
import ma.lbledfirst.backend.security.CookieUtil;
import ma.lbledfirst.backend.security.HttpSessionCleaner;
import ma.lbledfirst.backend.service.AuthService;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CookieUtil cookieUtil;
    private final HttpSessionCleaner sessionCleaner;

    @Value("${cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest req) {
        AuthResponse auth = authService.register(req);

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

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentUser(authentication.getName()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        SecurityContextHolder.clearContext();
        sessionCleaner.invalidateIfPresent(request);
        response.addHeader(HttpHeaders.SET_COOKIE, cookieUtil.buildLogoutCookie(cookieSecure).toString());
        return ResponseEntity.noContent().build();
    }

    private void setAuthCookie(HttpServletResponse response, String token) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookieUtil.buildAuthCookie(token, cookieSecure).toString());
    }

    private UserResponse toUserResponse(AuthResponse auth) {
        return new UserResponse(auth.getId(), auth.getName(), auth.getEmail(), auth.getRole(), auth.getPhone(),
                auth.getCountry(), auth.getLanguage(), auth.getAvatar(), auth.isEmailVerified());
    }

    @GetMapping("/verify-email")
    public void verifyEmail(@RequestParam String token, HttpServletResponse response) throws IOException {
        try {
            authService.verifyEmail(token);
            response.sendRedirect(frontendBaseUrl + "/auth?verified=1");
        } catch (RuntimeException e) {
            response.sendRedirect(frontendBaseUrl + "/auth?verified=0");
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Void> resendVerification(@Valid @RequestBody ForgotPasswordRequest req) {
        authService.resendVerificationEmail(req.getEmail());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        authService.forgotPassword(req.getEmail());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req);
        return ResponseEntity.noContent().build();
    }
}
