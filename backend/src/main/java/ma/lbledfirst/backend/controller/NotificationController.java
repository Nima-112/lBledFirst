package ma.lbledfirst.backend.controller;

import java.util.List;

import ma.lbledfirst.backend.domain.Notification;
import ma.lbledfirst.backend.service.NotificationService;
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
@RequestMapping("/api/notifications")
@PreAuthorize("hasRole('ADMIN')")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping
    public List<Notification> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Notification findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Notification create(@RequestBody Notification notification) {
        return service.save(notification);
    }

    @PutMapping("/{id}")
    public Notification update(@PathVariable Long id, @RequestBody Notification notification) {
        notification.setId(id);
        return service.update(id, notification);
    }

    @PutMapping("/{id}/read")
public Notification markAsRead(@PathVariable Long id) {
    return service.markAsRead(id);
}

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
