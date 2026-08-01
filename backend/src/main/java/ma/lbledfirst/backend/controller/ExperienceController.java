package ma.lbledfirst.backend.controller;

import java.util.List;

import ma.lbledfirst.backend.domain.Experience;
import ma.lbledfirst.backend.service.ExperienceService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/experiences")
public class ExperienceController {

    private final ExperienceService service;

    public ExperienceController(ExperienceService service) {
        this.service = service;
    }

    @GetMapping
    public List<Experience> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Experience findById(@PathVariable Long id) {
        return service.findById(id);
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
}
