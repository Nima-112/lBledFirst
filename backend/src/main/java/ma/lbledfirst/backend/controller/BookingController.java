package ma.lbledfirst.backend.controller;

import java.util.List;

import ma.lbledfirst.backend.domain.Booking;
import ma.lbledfirst.backend.domain.BookingStatus;
import ma.lbledfirst.backend.repository.BookingRepository;
import ma.lbledfirst.backend.repository.UserRepository;
import ma.lbledfirst.backend.service.BookingService;
import org.springframework.http.HttpStatus;
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
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService service;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public BookingController(BookingService service, BookingRepository bookingRepository, UserRepository userRepository) {
        this.service = service;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<Booking> findAll() {
        return service.findAll();
    }

    @GetMapping("/my-bookings")
    public List<Booking> findMyBookings() {
        return service.findMyBookings();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public Booking findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Booking create(@RequestBody Booking booking, Authentication authentication) {
        // Ensure the tourist is set to the currently authenticated user
        if (authentication != null && authentication.getName() != null) {
            var currentUser = userRepository.findByEmail(authentication.getName())
                    .orElse(null);
            if (currentUser != null) {
                booking.setTourist(currentUser);
            }
        }
        return service.save(booking);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Booking update(@PathVariable Long id, @RequestBody Booking booking) {
        booking.setId(id);
        return service.update(id, booking);
    }

    // Allow any authenticated user to cancel their own booking
    @PostMapping("/{id}/cancel")
    public Booking cancel(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        var currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(g -> "ROLE_ADMIN".equals(g.getAuthority()));
        if (!isAdmin && !booking.getTourist().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own bookings");
        }
        if (booking.getStatus() == BookingStatus.completed) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot cancel a completed booking");
        }
        if (booking.getStatus() == BookingStatus.cancelled) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.cancelled);
        return bookingRepository.save(booking);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
