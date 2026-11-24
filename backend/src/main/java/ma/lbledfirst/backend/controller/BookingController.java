package ma.lbledfirst.backend.controller;

import java.util.List;

import jakarta.validation.Valid;
import ma.lbledfirst.backend.dto.BookingRequest;
import ma.lbledfirst.backend.dto.BookingResponse;
import ma.lbledfirst.backend.service.BookingService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<BookingResponse> findAll() {
        return service.findAllDto();
    }

    @GetMapping("/my-bookings")
    public List<BookingResponse> findMyBookings(Authentication authentication) {
        String email = (authentication != null) ? authentication.getName() : null;
        return service.findMyBookingsDto(email);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public BookingResponse findById(@PathVariable Long id) {
        return service.findByIdDto(id);
    }

    @PostMapping
    public BookingResponse create(@Valid @RequestBody BookingRequest booking, Authentication authentication) {
        String email = (authentication != null) ? authentication.getName() : null;
        return service.createDto(booking, email);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public BookingResponse update(@PathVariable Long id, @Valid @RequestBody BookingRequest booking) {
        return service.updateDto(id, booking);
    }

    // Allow any authenticated user to cancel their own booking
    @PostMapping("/{id}/cancel")
    public BookingResponse cancel(@PathVariable Long id, Authentication authentication) {
        String email = (authentication != null) ? authentication.getName() : null;
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(g -> "ROLE_ADMIN".equals(g.getAuthority()));
        return service.cancelDto(id, email, isAdmin);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
