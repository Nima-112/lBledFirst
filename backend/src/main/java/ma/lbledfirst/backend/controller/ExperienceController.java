package ma.lbledfirst.backend.controller;

import java.util.List;

import ma.lbledfirst.backend.domain.Experience;
import ma.lbledfirst.backend.dto.ExperienceResponse;
import ma.lbledfirst.backend.service.ExperienceService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/experiences")
public class ExperienceController {

    private final ExperienceService service;

    public ExperienceController(ExperienceService service) {
        this.service = service;
    }

    @GetMapping
    public List<ExperienceResponse> findAll() {
        return service.findAllResponses();
    }

    @GetMapping("/paged")
    public Page<ExperienceResponse> findAllPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return service.findPublishedPagedResponses(pageable);
    }

    @GetMapping("/{id}")
    public ExperienceResponse findById(@PathVariable Long id) {
        return service.findResponseById(id);
    }

    @GetMapping("/by-region/{regionId}")
    public List<ExperienceResponse> findByRegion(@PathVariable Long regionId) {
        return service.findPublishedByRegionResponses(regionId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Experience create(@RequestBody Experience experience) {
        return service.save(experience);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Experience update(@PathVariable Long id, @RequestBody Experience experience) {
        experience.setId(id);
        return service.update(id, experience);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/publish")
    public Experience publish(@PathVariable Long id) {
    return service.publish(id);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<Map<String, Boolean>> toggleFavorite(@PathVariable Long id,
            Authentication authentication) {
        boolean favorited = service.toggleFavorite(id, authentication.getName());
        return ResponseEntity.ok(Map.of("favorited", favorited));
    }

    @GetMapping("/me/favorites")
    public List<ExperienceResponse> getMyFavorites(Authentication authentication) {
        return service.getFavoriteExperiencesResponses(authentication.getName());
    }
}
