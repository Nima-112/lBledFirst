package ma.lbledfirst.backend.controller;

import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.lbledfirst.backend.dto.FormationDetailResponse;
import ma.lbledfirst.backend.dto.FormationRequest;
import ma.lbledfirst.backend.dto.FormationSummaryResponse;
import ma.lbledfirst.backend.service.FormationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/formations")
@RequiredArgsConstructor
public class FormationController {

    private final FormationService formationService;

    // ---- Catalogue (accessible à tout utilisateur authentifié) -------------

    @GetMapping
    public List<FormationSummaryResponse> getAllFormations() {
        return formationService.getAllFormations();
    }

    @GetMapping("/{slug}")
    public FormationDetailResponse getFormation(@PathVariable String slug, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        return formationService.getFormationBySlug(slug, email);
    }

    // ---- Administration (admin uniquement) ----------------------------------

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<FormationDetailResponse> createFormation(@Valid @RequestBody FormationRequest req) {
        return ResponseEntity.ok(formationService.createFormation(req));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{slug}")
    public ResponseEntity<FormationDetailResponse> updateFormation(
            @PathVariable String slug,
            @Valid @RequestBody FormationRequest req) {
        return ResponseEntity.ok(formationService.updateFormation(slug, req));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{slug}")
    public ResponseEntity<Void> deleteFormation(@PathVariable String slug) {
        formationService.deleteFormation(slug);
        return ResponseEntity.noContent().build();
    }

    // ---- Achat (utilisateur courant) -----------------------------------------

    @PostMapping("/{slug}/purchase")
    public ResponseEntity<Void> purchase(@PathVariable String slug, Authentication authentication) {
        formationService.purchase(slug, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/purchased")
    public List<FormationSummaryResponse> getMyPurchases(Authentication authentication) {
        return formationService.getPurchasedFormations(authentication.getName());
    }

    // ---- Progression (utilisateur courant, nécessite l'achat) ----------------

    @GetMapping("/{slug}/progress")
    public List<Long> getProgress(@PathVariable String slug, Authentication authentication) {
        return formationService.getProgress(slug, authentication.getName());
    }

    @PostMapping("/{slug}/capsules/{capsuleId}/toggle")
    public ResponseEntity<Map<String, Boolean>> toggleCapsule(
            @PathVariable String slug,
            @PathVariable Long capsuleId,
            Authentication authentication) {
        boolean completed = formationService.toggleCapsuleCompletion(slug, capsuleId, authentication.getName());
        return ResponseEntity.ok(Map.of("completed", completed));
    }

    // ---- Favoris (utilisateur courant) ----------------------------------------

    @PostMapping("/{slug}/favorite")
    public ResponseEntity<Map<String, Boolean>> toggleFavorite(@PathVariable String slug, Authentication authentication) {
        boolean favorited = formationService.toggleFavorite(slug, authentication.getName());
        return ResponseEntity.ok(Map.of("favorited", favorited));
    }

    @GetMapping("/me/favorites")
    public List<FormationSummaryResponse> getMyFavorites(Authentication authentication) {
        return formationService.getFavoriteFormations(authentication.getName());
    }
}
