package ma.lbledfirst.backend.controller;

import java.util.List;

import ma.lbledfirst.backend.domain.Media;
import ma.lbledfirst.backend.service.MediaService;
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
@RequestMapping("/api/media")
@PreAuthorize("hasRole('ADMIN')")
public class MediaController {

    private final MediaService service;

    public MediaController(MediaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Media> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Media findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Media create(@RequestBody Media media) {
        return service.save(media);
    }

    @PutMapping("/{id}")
    public Media update(@PathVariable Long id, @RequestBody Media media) {
        media.setId(id);
        return service.update(id, media);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
