package ma.lbledfirst.backend.controller;

import java.util.List;

import ma.lbledfirst.backend.domain.Video;
import ma.lbledfirst.backend.service.VideoService;
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
@RequestMapping("/api/videos")
@PreAuthorize("hasRole('ADMIN')")
public class VideoController {

    private final VideoService service;

    public VideoController(VideoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Video> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Video findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Video create(@RequestBody Video video) {
        return service.save(video);
    }

    @PutMapping("/{id}")
    public Video update(@PathVariable Long id, @RequestBody Video video) {
        video.setId(id);
        return service.update(id, video);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
