package ma.lbledfirst.backend.controller;

import java.util.List;

import ma.lbledfirst.backend.domain.Message;
import ma.lbledfirst.backend.service.MessageService;
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
@RequestMapping("/api/messages")
@PreAuthorize("hasRole('ADMIN')")
public class MessageController {

    private final MessageService service;

    public MessageController(MessageService service) {
        this.service = service;
    }

    @GetMapping
    public List<Message> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Message findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Message create(@RequestBody Message message) {
        return service.save(message);
    }

    @PutMapping("/{id}")
    public Message update(@PathVariable Long id, @RequestBody Message message) {
        message.setId(id);
        return service.update(id, message);
    }

    @PutMapping("/{id}/read")
public Message markAsRead(@PathVariable Long id) {
    return service.markAsRead(id);
}

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
