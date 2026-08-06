package ma.lbledfirst.backend.controller;

import java.util.List;
import java.util.Map;

import ma.lbledfirst.backend.domain.User;
import ma.lbledfirst.backend.repository.UserRepository;
import ma.lbledfirst.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserService service, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.service = service;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<User> findAll() {
        return service.findAll();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public User findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public User create(@RequestBody User user) {
        return service.save(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public User update(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        return service.update(id, user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // Self-update: any authenticated user can update their own profile
    @PatchMapping("/me")
    public User updateMe(@RequestBody User patch, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        User current = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (patch.getName() != null && !patch.getName().isBlank()) current.setName(patch.getName());
        if (patch.getPhone() != null) current.setPhone(patch.getPhone());
        if (patch.getCountry() != null) current.setCountry(patch.getCountry());
        if (patch.getLanguage() != null) current.setLanguage(patch.getLanguage());
        if (patch.getAvatar() != null) current.setAvatar(patch.getAvatar());

        return userRepository.save(current);
    }

    // Change password: any authenticated user can change their own password
    @PatchMapping("/me/password")
    public Map<String, String> changePassword(@RequestBody Map<String, String> body, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        String newPassword = body.get("newPassword");
        if (newPassword == null || newPassword.isBlank() || newPassword.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters");
        }
        User current = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        current.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(current);
        return Map.of("message", "Password updated");
    }
}
