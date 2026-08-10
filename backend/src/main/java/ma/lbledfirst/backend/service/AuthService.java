package ma.lbledfirst.backend.service;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import ma.lbledfirst.backend.dto.*;
import ma.lbledfirst.backend.domain.EmailVerificationToken;
import ma.lbledfirst.backend.domain.PasswordResetToken;
import ma.lbledfirst.backend.domain.User;
import ma.lbledfirst.backend.domain.UserRole;
import ma.lbledfirst.backend.exception.EmailAlreadyExistsException;
import ma.lbledfirst.backend.exception.InvalidCredentialsException;
import ma.lbledfirst.backend.exception.InvalidOrExpiredTokenException;
import ma.lbledfirst.backend.exception.PasswordMismatchException;
import ma.lbledfirst.backend.repository.EmailVerificationTokenRepository;
import ma.lbledfirst.backend.repository.PasswordResetTokenRepository;
import ma.lbledfirst.backend.repository.UserRepository;
import ma.lbledfirst.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int VERIFICATION_TOKEN_HOURS = 24;
    private static final int RESET_TOKEN_HOURS = 1;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final EmailVerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository resetTokenRepository;

    @Transactional
    public AuthResponse register(RegisterRequest req) {

        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Cet email est déjà utilisé");
        }

        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new PasswordMismatchException("Les mots de passe ne correspondent pas");
        }


        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(UserRole.tourist)
                .country(req.getCountry())
                .language(req.getLanguage())
                .emailVerified(false)
                .build();

        userRepository.save(user);
        sendVerificationEmail(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(user.getId(), token, user.getRole().name(), user.getName(), user.getEmail(), user.getPhone(), user.getCountry(), user.getLanguage(), user.getAvatar(), user.isEmailVerified());
    }

    public AuthResponse login(LoginRequest req) {

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> {
                    return new InvalidCredentialsException("Identifiants invalides");
                });

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Identifiants invalides");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(user.getId(), token, user.getRole().name(), user.getName(), user.getEmail(), user.getPhone(), user.getCountry(), user.getLanguage(), user.getAvatar(), user.isEmailVerified());
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Utilisateur introuvable"));

        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.getPhone(), user.getCountry(), user.getLanguage(), user.getAvatar(), user.isEmailVerified());
    }

    // ---- Vérification d'email --------------------------------------------------

    @Transactional
    public void sendVerificationEmail(User user) {
        verificationTokenRepository.deleteAllByUserId(user.getId());
        String token = UUID.randomUUID().toString();
        verificationTokenRepository.save(EmailVerificationToken.builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(VERIFICATION_TOKEN_HOURS))
                .build());
        emailService.sendVerificationEmail(user.getEmail(), user.getName(), token);
    }

    // Utilisé par l'utilisateur connecté qui n'a pas reçu/retrouvé l'email initial
    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Utilisateur introuvable"));
        if (user.isEmailVerified()) return; // rien à faire, silencieux
        sendVerificationEmail(user);
    }

    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken verification = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidOrExpiredTokenException("Lien de vérification invalide"));

        if (verification.isExpired()) {
            verificationTokenRepository.delete(verification);
            throw new InvalidOrExpiredTokenException("Ce lien de vérification a expiré, redemandez-en un");
        }

        User user = verification.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        verificationTokenRepository.delete(verification);
    }

    // ---- Mot de passe oublié ----------------------------------------------------

    @Transactional
    public void forgotPassword(String email) {
        // Toujours un comportement identique, que l'email existe ou non
        // (évite de révéler quels emails sont enregistrés — énumération de comptes).
        userRepository.findByEmail(email).ifPresent(user -> {
            resetTokenRepository.deleteAllByUserId(user.getId());
            String token = UUID.randomUUID().toString();
            resetTokenRepository.save(PasswordResetToken.builder()
                    .token(token)
                    .user(user)
                    .expiresAt(LocalDateTime.now().plusHours(RESET_TOKEN_HOURS))
                    .build());
            emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), token);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        if (!req.getNewPassword().equals(req.getConfirmNewPassword())) {
            throw new PasswordMismatchException("Les mots de passe ne correspondent pas");
        }

        PasswordResetToken reset = resetTokenRepository.findByToken(req.getToken())
                .orElseThrow(() -> new InvalidOrExpiredTokenException("Lien de réinitialisation invalide"));

        if (reset.isExpired()) {
            resetTokenRepository.delete(reset);
            throw new InvalidOrExpiredTokenException("Ce lien de réinitialisation a expiré, refaites une demande");
        }

        User user = reset.getUser();
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        // Un seul lien utilisable : on invalide tout token restant pour cet utilisateur
        resetTokenRepository.deleteAllByUserId(user.getId());
    }
}
