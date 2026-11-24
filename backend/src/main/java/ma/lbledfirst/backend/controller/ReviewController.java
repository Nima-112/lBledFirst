package ma.lbledfirst.backend.controller;

import java.util.List;

import jakarta.validation.Valid;
import ma.lbledfirst.backend.dto.ReviewRequest;
import ma.lbledfirst.backend.dto.ReviewResponse;
import ma.lbledfirst.backend.service.ReviewService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    @GetMapping
    public List<ReviewResponse> findAll() {
        return service.findAllDto();
    }

    @GetMapping("/{id}")
    public ReviewResponse findById(@PathVariable Long id) {
        return service.findByIdDto(id);
    }

    @GetMapping("/formation/{formationId}")
    public List<ReviewResponse> findByFormation(@PathVariable Long formationId) {
        return service.findByFormationIdDto(formationId);
    }

    @GetMapping("/experience/{experienceId}")
    public List<ReviewResponse> findByExperience(@PathVariable Long experienceId) {
        return service.findByExperienceIdDto(experienceId);
    }

    @GetMapping("/me")
    public List<ReviewResponse> findMine(Authentication authentication) {
        String email = (authentication != null) ? authentication.getName() : null;
        return service.findMineDto(email);
    }

    @PostMapping
    public ReviewResponse create(@Valid @RequestBody ReviewRequest review, Authentication authentication) {
        String email = (authentication != null) ? authentication.getName() : null;
        return service.createDto(review, email);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ReviewResponse update(@PathVariable Long id, @Valid @RequestBody ReviewRequest review) {
        return service.updateDto(id, review);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
