package ma.lbledfirst.backend.service;

import lombok.RequiredArgsConstructor;
import ma.lbledfirst.backend.dto.*;
import ma.lbledfirst.backend.domain.User;
import ma.lbledfirst.backend.domain.UserRole;
import ma.lbledfirst.backend.exception.EmailAlreadyExistsException;
import ma.lbledfirst.backend.exception.InvalidCredentialsException;
import ma.lbledfirst.backend.exception.PasswordMismatchException;
import ma.lbledfirst.backend.repository.UserRepository;
import ma.lbledfirst.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

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
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(user.getId(), token, user.getRole().name(), user.getName(), user.getEmail(), user.getPhone(), user.getCountry(), user.getLanguage(), user.getAvatar());
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

        return new AuthResponse(user.getId(), token, user.getRole().name(), user.getName(), user.getEmail(), user.getPhone(), user.getCountry(), user.getLanguage(), user.getAvatar());
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Utilisateur introuvable"));

        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.getPhone(), user.getCountry(), user.getLanguage(), user.getAvatar());
    }

}