package ma.lbledfirst.backend.controller;

import java.util.List;

import ma.lbledfirst.backend.domain.Review;
import ma.lbledfirst.backend.service.ReviewService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    @GetMapping
    public List<Review> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Review findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping("/formation/{formationId}")
    public List<Review> findByFormation(@PathVariable Long formationId) {
        return service.findByFormationId(formationId);
    }

    @GetMapping("/experience/{experienceId}")
    public List<Review> findByExperience(@PathVariable Long experienceId) {
        return service.findByExperienceId(experienceId);
    }

    // Avis de l'utilisateur connecté (toutes cibles confondues) — protégé
    // explicitement dans SecurityConfig car /api/reviews/** est public par ailleurs.
    @GetMapping("/me")
    public List<Review> findMine(Authentication authentication) {
        return service.findByTouristEmail(authentication.getName());
    }

    // Le tourist est déduit du JWT, jamais du corps de la requête.
    @PostMapping
    public Review create(@Valid @RequestBody Review review, Authentication authentication) {
        return service.createForCurrentUser(review, authentication.getName());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Review update(@PathVariable Long id, @RequestBody Review review) {
        return service.update(id, review);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
