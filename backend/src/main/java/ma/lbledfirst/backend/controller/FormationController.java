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

    /**
     * Variante authentifiée du détail de formation : garantit que l'email est
     * connu (Spring Security renvoie 401 si JWT/cookie invalide). Celle-ci est
     * utilisée par le frontend quand un utilisateur est connecté : cela évite
     * tout problème lié au permitAll + cookie SameSite qui ferait que
     * Authentication.getName() serait null malgré un cookie valide.
     */
    @GetMapping("/{slug}/for-me")
    public FormationDetailResponse getFormationForCurrentUser(@PathVariable String slug,
            Authentication authentication) {
        return formationService.getFormationBySlug(slug, authentication.getName());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{slug}/edit")
    public FormationDetailResponse getFormationForEdit(@PathVariable String slug) {
        return formationService.getFormationForEdit(slug);
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

    @GetMapping("/{slug}/capsules/{capsuleId}/captions")
    public ResponseEntity<com.fasterxml.jackson.databind.JsonNode> getCapsuleCaptions(
            @PathVariable String slug,
            @PathVariable Long capsuleId,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(formationService.getCapsuleCaptions(slug, capsuleId, email));
    }

    /**
     * Forcer le retraitement IA d'une capsule (admin) — utile quand :
     *   - une capsule était FAILED/SKIPPED_NO_KEY
     *   - l'utilisateur vient enfin de renseigner sa clé OPENAI_API_KEY
     *   - on a corrigé un bug de pipeline
     * Retourne simplement le nouveau processingStatus "PENDING" + async démarre.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{slug}/capsules/{capsuleId}/reprocess")
    public ResponseEntity<Map<String, Object>> reprocessCapsule(
            @PathVariable String slug,
            @PathVariable Long capsuleId) {
        formationService.reprocessCapsule(slug, capsuleId);
        return ResponseEntity.ok(Map.of(
                "ok", true,
                "processingStatus", "PENDING",
                "message", "Traitement IA relancé en arrière-plan"));
    }

    // ---- Favoris (utilisateur courant) ----------------------------------------

    @PostMapping("/{slug}/favorite")
    public ResponseEntity<Map<String, Boolean>> toggleFavorite(@PathVariable String slug,
            Authentication authentication) {
        boolean favorited = formationService.toggleFavorite(slug, authentication.getName());
        return ResponseEntity.ok(Map.of("favorited", favorited));
    }

    @GetMapping("/me/favorites")
    public List<FormationSummaryResponse> getMyFavorites(Authentication authentication) {
        return formationService.getFavoriteFormations(authentication.getName());
    }
}