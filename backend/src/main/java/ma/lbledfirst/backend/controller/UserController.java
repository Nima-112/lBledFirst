package ma.lbledfirst.backend.controller;

import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;
import ma.lbledfirst.backend.dto.UserResponse;
import ma.lbledfirst.backend.dto.UserRequest;
import ma.lbledfirst.backend.dto.UserUpdateMeRequest;
import ma.lbledfirst.backend.dto.ChangePasswordRequest;
import ma.lbledfirst.backend.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<UserResponse> findAll() {
        return service.findAllDto();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public UserResponse findById(@PathVariable Long id) {
        return service.findByIdDto(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public UserResponse create(@Valid @RequestBody UserRequest req) {
        return service.createDto(req);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UserRequest req) {
        return service.updateDto(id, req);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // Self-update: any authenticated user can update their own profile
    @PatchMapping("/me")
    public UserResponse updateMe(@Valid @RequestBody UserUpdateMeRequest patch, Authentication authentication) {
        String email = (authentication != null) ? authentication.getName() : null;
        return service.updateMe(email, patch);
    }

    // Change password: any authenticated user can change their own password
    @PatchMapping("/me/password")
    public Map<String, String> changePassword(@Valid @RequestBody ChangePasswordRequest body, Authentication authentication) {
        String email = (authentication != null) ? authentication.getName() : null;
        service.changePassword(email, body);
        return Map.of("message", "Password updated");
    }
}
